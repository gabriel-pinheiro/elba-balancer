import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import * as Hoek from '@hapi/hoek';
import { Upstream } from "../upstream/upstream";
import { ILogger } from '../utils/logger';
import { Attempt } from './attempt';

// Loop prevention
const HARD_LIMIT = 20;

export class RequestHandler {
    private readonly attempts: Attempt[] = [];
    private readonly startTime = new Date();

    constructor(
        private readonly req: Hapi.Request,
        private readonly h: Hapi.ResponseToolkit,
        private readonly upstream: Upstream,
        private readonly logger: ILogger,
    ) { }

    async send(): Promise<Hapi.ResponseObject> {
        this.logger.info(`got request on ${this.req.url}`, { topic: 'downstream-request' });

        for(let limit = 0; limit < HARD_LIMIT; limit++) {
            let error = null;
            const response = await this.attempt()
                    .catch(e => error = e);

            // Downstream response
            if(!error) {
                this.logger.info(`request completed`, {
                    delay: new Date().getTime() - this.startTime.getTime(),
                    topic: 'downstream-response',
                    target: this.attempts[this.attempts.length - 1].target,
                    attempt: this.attempts.length,
                });
                return response;
            }

            // Downstream error
            if(!this.mustRetryError(error)) {
                this.logger.error(`downstream request failed with error: ${error}`, {
                    delay: new Date().getTime() - this.startTime.getTime(),
                    topic: 'downstream-error',
                    target: this.attempts[this.attempts.length - 1].target,
                    attempt: this.attempts.length,
                });
                throw error;
            }

            // Retry
            this.logger.warn(`upstream request failed with error: ${error}`, {
                delay: new Date().getTime() - this.startTime.getTime(),
                topic: 'upstream-error'
            });
            await this.delay();
        }
        
        // Should not happen
        throw Boom.serverUnavailable('All attempts failed');
    }

    private async attempt(): Promise<Hapi.ResponseObject> {
        const target = await this.getSuitableTarget();
        await this.cooldown(target);
        this.attempts.push(Attempt.of(target));

        this.logger.debug(`attempting to proxy to ${target}`, {
            attempt: this.attempts.length,
            delay: new Date().getTime() - this.startTime.getTime(),
            topic: 'upstream-request',
        });
        
        const response = await this.h.proxy({
            uri: this.buildEntrypointPath(target) + this.req.url.search,
            passThrough: true,
            xforward: true,
            timeout: this.upstream.config.timeout.target * 1000,
        });

        if(this.mustRetryResponse(response)) {
            throw new Error('retrying due to response code ' + response.statusCode);
        }

        return response;
    }

    private async getSuitableTarget(): Promise<string> {
        let targets = this.upstream.availableTargets;

        if(targets.length === 0) {
            if(this.upstream.config.health.none_healthy_is_all_healthy) {
                this.logger.debug(`no healthy targets but health.none_healthy_is_all_healthy is true, choosing an unavailable one`);
                targets = this.upstream.targets;
            } else {
                throw Boom.serverUnavailable("request failed because all the targets are unhealthy and health.none_healthy_is_all_healthy is unset or false", {
                    options: {
                        data: { isRetryable: false },   
                    }
                });
            }
        }

        const attemptedTargets = this.attempts.map(a => a.target);
        return targets.reduce((a, b) => attemptedTargets.lastIndexOf(a) <= attemptedTargets.lastIndexOf(b) ? a : b);
    }

    private mustRetryError(error: any): boolean {
        if(this.isRetryLimitReached()) {
            return false;
        }

        const isRetryable = error?.data?.options?.data?.isRetryable;
        if(isRetryable !== void 0) {
            return isRetryable;
        }

        if(!error.isBoom) {
            return true;
        }

        return this.mustProxyStatus(error.output.statusCode);
    }

    private mustRetryResponse(response: Hapi.ResponseObject): boolean {
        if(this.isRetryLimitReached()) {
            return false;
        }

        return this.mustProxyStatus(response.statusCode);
    }

    private isRetryLimitReached(): boolean {
        return this.attempts.length >= this.upstream.retryLimit;
    }

    private mustProxyStatus(status: number): boolean {
        const retryableErrors = this.upstream.config.retry.retryable_errors;
        if(status < 500 && status >= 400 && retryableErrors.includes('CODE_4XX')) {
            return true;
        }
        if(status >= 500 && retryableErrors.includes('CODE_5XX')) {
            return true;
        }
        if(retryableErrors.includes(`CODE_${status}`)) {
            return true;
        }

        return false;
    }

    private async cooldown(target: string): Promise<void> {
        if(this.upstream.config.retry.cooldown === 0) {
            return;
        }
        const lastAttempts = this.attempts.filter(a => a.target === target);
        if(lastAttempts.length === 0) {
            return;
        }

        const lastAttempt = lastAttempts[lastAttempts.length - 1];
        const timeSinceLastAttempt = new Date().getTime() - lastAttempt.date.getTime();
        const timeToWait = this.upstream.config.retry.cooldown - timeSinceLastAttempt;
        if(timeToWait <= 0) {
            this.logger.debug(`attempting ${target} again without waiting because the last attempt was ${timeSinceLastAttempt}ms ago and the cooldown is ${this.upstream.config.retry.cooldown}ms`);
            return;
        }

        this.logger.debug(`waiting ${timeToWait}ms before attempting ${target} again`, { topic: 'cooldown' });
        await Hoek.wait(timeToWait);
    }

    private async delay(): Promise<void> {
        const delay = this.upstream.config.retry.delay;
        if(delay > 0) {
            this.logger.debug(`waiting ${delay}ms before next attempt`, { topic: 'delay' });
            await Hoek.wait(delay);
        }
    }

    private buildEntrypointPath(path: string): string {
        return this.removeLeadingSlash(path) + '/{path}';
    }

    private removeLeadingSlash(uri: string): string {
        let path = uri;
        if(path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        return path;
    }
}

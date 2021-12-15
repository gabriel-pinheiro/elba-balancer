import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import * as Bounce from '@hapi/bounce';
import * as Hoek from '@hapi/hoek';
import * as Podium from '@hapi/podium';
import { Upstream } from "../upstream/upstream";
import { ILogger } from '../utils/logger';
import { Attempt } from './attempt';
import { ServiceTargetConfig } from '../config/data/config';
import { MetricsService } from '../metrics/metrics.service';
import { returnError } from '../utils/utils';
import { logSteps } from './decorators/log-steps.decorator';
import { trackHealth } from './decorators/track-health.decorator';
import { trackMetrics } from './decorators/track-metrics.decorator';

const ATTEMPT_HEADER = 'x-elba-attempts';
const TARGET_HEADER = 'x-elba-target';

@logSteps
@trackHealth
@trackMetrics
export class DownstreamRequestHandler extends Podium {
    protected readonly attempts: Attempt[] = [];
    protected readonly startTime = new Date();

    constructor(
        protected readonly req: Hapi.Request,
        private readonly h: Hapi.ResponseToolkit,
        protected readonly upstream: Upstream,
        protected readonly metricsService: MetricsService,
        protected readonly logger: ILogger,
    ) {
        super([
            'downstream-request', 'downstream-response', 'downstream-error',
            'upstream-request', 'upstream-error', // upstream-response not needed because its the same as downstream response
        ]);
    }

    async send(): Promise<Hapi.ResponseObject> {
        this.emit('downstream-request');

        try {
            do {
                var response = await this.attempt();
            } while(!response);

            return response;
        } catch(error) {
            this.emit('downstream-error', { error });
            throw error;
        }
    }

    private async attempt(): Promise<null | Hapi.ResponseObject> {
        const target = this.getSuitableTarget();
        await this.cooldown(target);
        this.attempts.push(Attempt.of(target));
        this.emit('upstream-request', target);
        const [error, response] = await returnError<Boom.Boom, Hapi.ResponseObject>(this.sendUpstreamRequest(target));

        const shouldRetry = this.shouldRetryStatus(response?.statusCode ?? error?.output?.statusCode ?? 502);

        if(shouldRetry && !this.isRetryLimitReached()) {
            this.emit('upstream-error', { error, response });
            await this.delay();
            return null;
        }

        if(shouldRetry) {
            this.emit('downstream-error', { error, response }); // Should retry but can't
        } else {
            this.emit('downstream-response');                   // Shouldn't retry
        }

        return this.withElbaHeaders(error ?? response);
    }

    private async sendUpstreamRequest(target: ServiceTargetConfig): Promise<Hapi.ResponseObject> {
        try {
            const response = await this.h.proxy({
                uri: this.buildEndpointPath(target.url) + this.req.url.search,
                // @ts-ignore
                proxyHost: this.upstream.config.proxy_host,
                passThrough: true,
                xforward: true,
                timeout: this.upstream.config.timeout.target * 1000,
                // @ts-ignore
                connectTimeout: this.upstream.config.timeout.connect * 1000,
            });

            return response;
        } catch(e) {
            Bounce.rethrow(e, 'boom');
            throw Boom.badGateway(e.message || 'Failed to proxy to upstream');
        }
    }

    private getSuitableTarget(): ServiceTargetConfig {
        const targets = this.getAvailableTargets();
        const attemptedTargetNames = this.attempts.map(a => a.target.name);
        const unattemptedTargets = targets.filter(t => !attemptedTargetNames.includes(t.name));

        // Balancing between unattempted targets
        if(unattemptedTargets.length > 0) {
            return unattemptedTargets[Math.floor(Math.random() * unattemptedTargets.length)];
        }

        // Sending request to the target that has been attempted the farthest from now
        return targets.reduce((a, b) => attemptedTargetNames.lastIndexOf(a.name) <= attemptedTargetNames.lastIndexOf(b.name) ? a : b);
    }

    private getAvailableTargets(): ServiceTargetConfig[] {
        const targets = this.upstream.availableTargets;
        if(targets.length > 0) {
            return targets;
        }

        if(this.upstream.config.health.none_healthy_is_all_healthy) {
            this.logger.debug(`no healthy targets but health.none_healthy_is_all_healthy is true, choosing an unavailable one`);
            return this.upstream.targets;
        }

        throw Boom.serverUnavailable("request failed because all the targets are unhealthy and health.none_healthy_is_all_healthy is unset or false");
    }

    private isRetryLimitReached(): boolean {
        return this.attempts.length >= this.upstream.retryLimit;
    }

    private shouldRetryStatus(status: number): boolean {
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

    private async cooldown(target: ServiceTargetConfig): Promise<void> {
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
            this.logger.debug(`attempting ${target.name} again without waiting because the last attempt was ${timeSinceLastAttempt}ms ago and the cooldown is ${this.upstream.config.retry.cooldown}ms`);
            return;
        }

        this.logger.debug(`waiting ${timeToWait}ms before attempting ${target.name} again`, { topic: 'cooldown' });
        await Hoek.wait(timeToWait);
    }

    private async delay(): Promise<void> {
        const delay = this.upstream.config.retry.delay;
        if(delay > 0) {
            this.logger.debug(`waiting ${delay}ms before next attempt`, { topic: 'delay' });
            await Hoek.wait(delay);
        }
    }

    private withElbaHeaders(obj: any): any {
        if(typeof obj.header === 'function') {
            return obj.header(ATTEMPT_HEADER, this.attempts.length)
                      .header(TARGET_HEADER, this.lastTargetName);
        }

        if(obj.isBoom) {
            obj.output.headers[ATTEMPT_HEADER] = this.attempts.length;
            obj.output.headers[TARGET_HEADER] = this.lastTargetName;
        }

        return obj;
    }

    protected get lastTargetName(): string {
        return this.attempts[this.attempts.length - 1]?.target?.name || 'elba';
    }

    private buildEndpointPath(path: string): string {
        return this.removeLeadingSlash(path) + '{path}';
    }

    private removeLeadingSlash(uri: string): string {
        let path = uri;
        if(path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        return path;
    }
}

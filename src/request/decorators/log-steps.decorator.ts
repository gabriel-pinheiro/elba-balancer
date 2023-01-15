import * as Hapi from '@hapi/hapi';
import { ServiceTargetConfig } from '../../config/data/config';
import { DownstreamRequestHandler } from '../downstream-request.handler';

export function logSteps<C extends { new (...args: any[]): DownstreamRequestHandler }>(clazz: C) {
    return class extends clazz {
        constructor(...args: any[]) {
            super(...args);

            this.once('downstream-request',  this._logSteps_onDownstreamRequest.bind(this));
            this.once('downstream-response', this._logSteps_onDownstreamResponse.bind(this));
            this.once('downstream-error',    this._logSteps_onDownstreamError.bind(this));
            this.on('upstream-request',      this._logSteps_onUpstreamRequest.bind(this));
            this.on('upstream-error',        this._logSteps_onUpstreamError.bind(this));
        }

        private _logSteps_onDownstreamRequest(): void {
            this.logger.info(`got request on ${this.req.url}`, {
                topic: 'downstream-request',
                service: this.upstream.config.host || '*',
            });
        }

        private _logSteps_onDownstreamResponse(): void {
            this.logStep('info', 'request completed', 'downstream-response');
        }

        private _logSteps_onDownstreamError({ error, response }: { error: any, response: Hapi.ResponseObject }): void {
            this.logStep('error', `downstream request failed after limit with ${error ? `error: ${error}` : `status ${response.statusCode}`}`, 'downstream-error');
        }

        private _logSteps_onUpstreamRequest(target: ServiceTargetConfig): void {
            this.logStep('debug', `attempting to proxy to ${target.name}`, 'upstream-request');
        }

        private _logSteps_onUpstreamError({ error, response }: { error: any, response: Hapi.ResponseObject }): void {
            this.logStep('warn', `upstream request failed with ${error ? `error: ${error}` : `status ${response.statusCode}`}`, 'upstream-error');
        }

        private logStep(severity: 'debug' | 'info' | 'warn' | 'error', message: string, topic: string) {
            this.logger[severity](message, {
                delay: new Date().getTime() - this.startTime.getTime(),
                topic,
                service: this.upstream.config.host || '*',
                target: this.lastTargetName,
                attempt: this.attempts.length,
            });
        }
    }
}

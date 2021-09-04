import { DownstreamRequestHandler } from '../downstream-request.handler';

export function trackHealth<C extends { new (...args: any[]): DownstreamRequestHandler }>(clazz: C) {
    return class extends clazz {
        constructor(...args: any[]) {
            super(...args);

            this.once('downstream-response', () => this.upstream.markTargetSuccess(this.lastTargetName));
            this.once('downstream-error',    () => this.upstream.markTargetFailure(this.lastTargetName));
            this.on('upstream-error',        () => this.upstream.markTargetFailure(this.lastTargetName));
        }
    }
}

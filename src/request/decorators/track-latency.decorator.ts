import { DownstreamRequestHandler } from '../downstream-request.handler';

export function trackLatency<C extends { new (...args: any[]): DownstreamRequestHandler }>(clazz: C) {
    return class extends clazz {
        constructor(...args: any[]) {
            super(...args);

            this.once('downstream-response', () => this._trackLatency_onResponse());
        }

        private _trackLatency_onResponse() {
            const delay = new Date().getTime() - this.startTime.getTime();
            const delayBucket = Math.ceil(Math.log2(delay));
            const delayBucketMs = 2 ** delayBucket;

            this.metricsService.getDownstreamLatencyValue(this.upstream.config.host,
                    delayBucketMs.toString()).add(1);
        }
    }
}

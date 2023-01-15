import { bucket } from '../../utils/utils';
import { DownstreamRequestHandler } from '../downstream-request.handler';

const FIRST_BUCKET = 10;
const MIN_BUCKETS: Map<string, number> = new Map();
const MAX_BUCKETS: Map<string, number> = new Map();

const seconds = (v: number): string => (v / 1e3).toFixed(2).padStart(6, '0');

export function trackDuration<C extends { new (...args: any[]): DownstreamRequestHandler }>(clazz: C) {
    return class extends clazz {

        constructor(...args: any[]) {
            super(...args);

            this.once('downstream-response', () => {
                const delay = new Date().getTime() - this.startTime.getTime();
                const bucketMs = bucket(delay, FIRST_BUCKET);

                this.metricsService.getDownstreamLatencyValue(this.upstream.config.host, seconds(bucketMs)).add(1);
                this.assertBucketsInBetween(bucketMs);
            });
        }

        private assertBucketsInBetween(ms: number) {
            const host = this.upstream.config.host;

            if(!MIN_BUCKETS.has(host)) {
                MIN_BUCKETS.set(host, ms);
                MAX_BUCKETS.set(host, ms);
                return;
            }

            const minBucket = MIN_BUCKETS.get(host);
            const maxBucket = MAX_BUCKETS.get(host);

            if(minBucket <= ms && ms <= maxBucket) {
                return;
            }

            for(let value = ms * 2; value < minBucket; value *= 2) {
                this.metricsService.getDownstreamLatencyValue(this.upstream.config.host, seconds(value)).add(0);
            }

            for(let value = ms / 2; value > maxBucket; value /= 2) {
                this.metricsService.getDownstreamLatencyValue(this.upstream.config.host, seconds(value)).add(0);
            }

            MIN_BUCKETS.set(host, Math.min(minBucket, ms));
            MAX_BUCKETS.set(host, Math.max(maxBucket, ms));
        }
    }
}

import { DownstreamRequestHandler } from '../downstream-request.handler';

export function trackMetrics<C extends { new (...args: any[]): DownstreamRequestHandler }>(clazz: C) {
    return class extends clazz {
        constructor(...args: any[]) {
            super(...args);

            this.on('upstream-error', () => {
                this.metricsService.getUpstreamValue('upstream_error',
                    this.upstream.config.host, this.lastTargetName).add(1);
            });

            this.once('downstream-response', () => {
                this.metricsService.getDownstreamValue('downstream_success', this.upstream.config.host)
                    .add(1);
                // Marking upstream_success on downstream-reponse because they mean the same thing
                // Downstream responds if and only if upstream had a successful response
                this.metricsService.getUpstreamValue('upstream_success',
                    this.upstream.config.host, this.lastTargetName).add(1);
            });

            this.once('downstream-error', () => {
                this.metricsService.getDownstreamValue('downstream_error', this.upstream.config.host)
                    .add(1);

                // Tracking this twice because upstream-error isn't emitted when downstream-error is
                this.metricsService.getUpstreamValue('upstream_error',
                    this.upstream.config.host, this.lastTargetName).add(1);
            });
        }
    }
}

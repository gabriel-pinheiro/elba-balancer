import { ServiceConfig, ServiceTargetConfig } from "../config/data/config";
import { MetricsService } from "../metrics/metrics.service";
import { ILogger } from "../utils/logger";

export class Upstream {
    private readonly targetConsecutiveFailures: Map<string, number> = new Map();
    private readonly targetLastFailure: Map<string, Date> = new Map();

    constructor(
        public readonly config: ServiceConfig,
        private readonly metricsService: MetricsService,
        private readonly logger: ILogger,
    ) {
        this.config.target.forEach(t => {
            this.targetConsecutiveFailures.set(t.name, 0);
            this.metricsService.getUpstreamValue('target_status', this.config.host, t.name).set(1);
            this.metricsService.getUpstreamValue('upstream_success', this.config.host, t.name).set(0);
            this.metricsService.getUpstreamValue('upstream_error', this.config.host, t.name).set(0);
        });

        this.metricsService.getDownstreamValue('downstream_success', this.config.host).set(0);
        this.metricsService.getDownstreamValue('downstream_error', this.config.host).set(0);
    }

    get retryLimit(): number {
        return this.config.retry.limit || this.config.target.length*2;
    }

    get availableTargets(): ServiceTargetConfig[] {
        return this.config.target
            .filter(t => this.isTargetHealhty(t));
    }

    get targets(): ServiceTargetConfig[] {
        return this.config.target;
    }

    markTargetSuccess(targetName: string): void {
        const failures = this.targetConsecutiveFailures.get(targetName);
        if(failures >= this.config.health.threshold) {
            this.metricsService.getUpstreamValue('target_status', this.config.host, targetName).set(1);
            this.logger.info(`target ${targetName} is healthy`, { topic: 'target-health' });
        }

        this.targetConsecutiveFailures.set(targetName, 0);
    }

    markTargetFailure(targetName: string): void {
        const failures = this.targetConsecutiveFailures.get(targetName);
        this.targetConsecutiveFailures.set(targetName, failures + 1);
        this.targetLastFailure.set(targetName, new Date());

        if(failures + 1 >= this.config.health.threshold) {
            this.metricsService.getUpstreamValue('target_status', this.config.host, targetName).set(0);
            this.logger.warn(`target ${targetName} is unhealthy`, { topic: 'target-health' });
        }
    }

    private isTargetHealhty(target: ServiceTargetConfig): boolean {
        const failures = this.targetConsecutiveFailures.get(target.name);
        if (failures < this.config.health.threshold) {
            return true;
        }

        const lastFailure = this.targetLastFailure.get(target.name);
        const diff = new Date().getTime() - lastFailure.getTime();

        return diff > this.config.health.timeout * 1000;
    }
}

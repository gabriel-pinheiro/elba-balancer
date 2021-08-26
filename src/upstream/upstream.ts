import { ServiceConfig } from "../config/data/config";
import { ILogger } from "../utils/logger";

export class Upstream {
    private readonly targetConsecutiveFailures: Map<string, number> = new Map();
    private readonly targetLastFailure: Map<string, Date> = new Map();

    constructor(
        public readonly config: ServiceConfig,
        private readonly logger: ILogger,
    ) {
        this.config.targets.forEach(t => this.targetConsecutiveFailures.set(t, 0));
    }

    get retryLimit(): number {
        return this.config.retry.limit || this.config.targets.length*2;
    }

    get availableTargets(): string[] {
        return this.config.targets
            .filter(t => this.isTargetHealhty(t));
    }

    get targets(): string[] {
        return this.config.targets;
    }

    markTargetSuccess(target: string): void {
        const failures = this.targetConsecutiveFailures.get(target);
        if(failures >= this.config.health.threshold) {
            this.logger.info(`target ${target} is healthy`, { topic: 'target-health' });
        }

        this.targetConsecutiveFailures.set(target, 0);
    }

    markTargetFailure(target: string): void {
        const failures = this.targetConsecutiveFailures.get(target);
        this.targetConsecutiveFailures.set(target, failures + 1);
        this.targetLastFailure.set(target, new Date());

        if(failures + 1 >= this.config.health.threshold) {
            this.logger.warn(`target ${target} is unhealthy`, { topic: 'target-health' });
        }
    }

    private isTargetHealhty(target: string): boolean {
        const failures = this.targetConsecutiveFailures.get(target);
        if (failures < this.config.health.threshold) {
            return true;
        }

        const lastFailure = this.targetLastFailure.get(target);
        const diff = new Date().getTime() - lastFailure.getTime();

        return diff > this.config.health.timeout * 1000;
    }
}

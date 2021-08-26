import { ServiceConfig } from "../config/data/config";

export class Upstream {
    constructor(
        public readonly config: ServiceConfig,
    ) { }

    static of(config: ServiceConfig): Upstream {
        return new Upstream(config);
    }

    get retryLimit(): number {
        return this.config.retry.limit || this.config.targets.length*2;
    }

    get availableTargets(): string[] {
        return this.config.targets;
    }

    get targets(): string[] {
        return this.config.targets;
    }
}

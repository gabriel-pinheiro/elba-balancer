import { ServiceTargetConfig } from "../config/data/config";

export class Attempt {
    constructor(
        public readonly target: ServiceTargetConfig,
        public readonly date: Date,
    ) { }

    static of(target: ServiceTargetConfig): Attempt {
        return new Attempt(target, new Date());
    }
}

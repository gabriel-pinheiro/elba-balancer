import { inject } from "inversify";
import { ConfigProvider } from "../config/config.service";
import { MetricsService } from "../metrics/metrics.service";
import { Service } from "../utils/decorators/service";
import { ILogger, Logger } from "../utils/logger";
import { Upstream } from "./upstream";

@Service()
export class UpstreamService {
    public readonly upstreams: Upstream[] = [];

    constructor(config: ConfigProvider, metricsService: MetricsService, @inject(Logger) logger: ILogger) {
        this.upstreams = config.config.service.map(u => new Upstream(u, metricsService, logger));
    }
}

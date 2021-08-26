import { inject } from "inversify";
import { ConfigProvider } from "../config/config.service";
import { Service } from "../utils/decorators/service";
import { ILogger, Logger } from "../utils/logger";
import { Upstream } from "./upstream";

@Service()
export class UpstreamService {
    public readonly upstreams: Upstream[] = [];

    constructor(config: ConfigProvider, @inject(Logger) logger: ILogger) {
        this.upstreams = config.config.service.map(u => new Upstream(u, logger));
    }
}

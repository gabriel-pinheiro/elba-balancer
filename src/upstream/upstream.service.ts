import { ConfigProvider } from "../config/config.service";
import { Service } from "../utils/decorators/service";
import { Upstream } from "./upstream";

@Service()
export class UpstreamService {
    public readonly upstreams: Upstream[] = [];

    constructor(config: ConfigProvider){
        this.upstreams = config.config.service.map(Upstream.of);
    }
}

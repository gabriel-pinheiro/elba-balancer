import * as Boom from "@hapi/boom";
import { Upstream } from "../upstream/upstream";
import { UpstreamService } from "../upstream/upstream.service";
import { Service } from "../utils/decorators/service";
import { ElbaHealth, UpstreamHealth } from "./data/health";

@Service()
export class ElbaService {
    constructor(
        private readonly upstreamService: UpstreamService,
    ) { }

    async notFound(host: string): Promise<void> {
        throw Boom.notFound(`No service defined for host '${host}'. You can define a global service by leaving the host empty or removing it from a service's config`);
    }

    async health(): Promise<ElbaHealth> {
        const upstreams = this.upstreamService.upstreams
                .map(u => this.upstreamToHealth(u));
        return {
            status: 'ok',
            upstreams,
        };
    }

    private upstreamToHealth(upstream: Upstream): UpstreamHealth {
        const healthyTargets = upstream.availableTargets.map(t => t.name);

        return {
            host: upstream.config.host || '*',
            healthyTargets,
            unhealthyTargets: upstream.targets
                    .map(t => t.name)
                    .filter(t => !healthyTargets.includes(t)),
        };
    }
}

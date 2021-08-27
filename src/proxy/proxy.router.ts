import { ServerRoute } from "@hapi/hapi";
import { Upstream } from "../upstream/upstream";
import { UpstreamService } from "../upstream/upstream.service";
import {Provider} from "../utils/decorators/provider";
import {IRouter} from "../utils/router";
import { ProxyService } from "./proxy.service";

@Provider()
export class ProxyRouter implements IRouter {
    constructor(
        private readonly upstreamService: UpstreamService,
        private readonly service: ProxyService,
    ) { }

    async getRoutes() {
        const upstreams = this.upstreamService.upstreams;
        return upstreams.map(upstream => this.serviceToRoute(upstream));
    }

    private serviceToRoute(upstream: Upstream): ServerRoute {
        const route: ServerRoute & {config: any} = {
            method: '*',
            path: '/{any*}',
            handler: (req, h) => this.service.proxy(req, h, upstream),
            config: {
                payload: {
                    output: 'data',
                    parse: false,
                },
            },
            rules: {
                mapSilently: true,
            },
        };

        if(upstream.config.host && upstream.config.host !== '*') {
            route.vhost = upstream.config.host;
        }

        return route;
    }
}

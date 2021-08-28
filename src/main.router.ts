import {IRouter} from "./utils/router";
import {Provider} from "./utils/decorators/provider";
import { ProxyRouter } from "./proxy/proxy.router";
import { ElbaRouter } from "./elba/elba.router";
import { MetricsRouter } from "./metrics/metrics.router";

@Provider()
export class MainRouter implements IRouter {
    constructor(
        private readonly proxyRouter: ProxyRouter,
        private readonly elbaRouter: ElbaRouter,
        private readonly metricsRouter: MetricsRouter,
    ) { }

    async getRoutes() {
        const routes = await Promise.all([
            this.proxyRouter.getRoutes(),
            this.elbaRouter.getRoutes(),
            this.metricsRouter.getRoutes(),
        ]);

        return routes.flat();
    }
}

import {IRouter} from "./utils/router";
import {Provider} from "./utils/decorators/provider";
import { ProxyRouter } from "./proxy/proxy.router";
import { ElbaRouter } from "./elba/elba.router";

@Provider()
export class MainRouter implements IRouter {
    constructor(
        private proxyRouter: ProxyRouter,
        private elbaRouter: ElbaRouter,
    ) { }

    async getRoutes() {
        const routes = await Promise.all([
            this.proxyRouter.getRoutes(),
            this.elbaRouter.getRoutes(),
        ]);

        return routes.flat();
    }
}

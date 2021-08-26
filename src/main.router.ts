import {IRouter} from "./utils/router";
import {Provider} from "./utils/decorators/provider";
import { ProxyRouter } from "./proxy/proxy.router";

@Provider()
export class MainRouter implements IRouter {
    constructor(
        private proxyRouter: ProxyRouter,
    ) { }

    async getRoutes() {
        const routes = await Promise.all([
            this.proxyRouter.getRoutes(),
        ]);

        return routes.flat();
    }
}

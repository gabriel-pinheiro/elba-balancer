import { ServerRoute } from "@hapi/hapi";
import { configProvider } from "../config/config.service";
import { Provider } from "../utils/decorators/provider";
import { IRouter } from "../utils/router";
import { ElbaController } from "./elba.controller";

@Provider()
export class ElbaRouter implements IRouter {
    constructor(
        private readonly controller: ElbaController,
    ) { }

    async getRoutes(): Promise<ServerRoute[]> {
        const generic404Route = {
            method: "*",
            path: "/{any*}",
            handler: (req, h) => this.controller.notFound(req, h),
            rules: {
                mapSilently: true,
            },
        };
        const routes: ServerRoute[] = [{
            method: "GET",
            path: "/__elba__/health",
            handler: (req, h) => this.controller.health(req, h),
            rules: {
                mapSilently: true,
            },
        }];

        if(!configProvider.config.service.some(s => ['', '*'].includes(s.host))) {
            routes.push(generic404Route);
        }

        return routes;
    }
}

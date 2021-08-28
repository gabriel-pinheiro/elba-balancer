import { ServerRoute } from "@hapi/hapi";
import { Provider } from "../utils/decorators/provider";
import { IRouter } from "../utils/router";
import { ElbaController } from "./elba.controller";

@Provider()
export class ElbaRouter implements IRouter {
    constructor(
        private readonly controller: ElbaController,
    ) { }

    async getRoutes(): Promise<ServerRoute[]> {
        return [{
            method: "GET",
            path: "/__elba__/health",
            handler: (req, h) => this.controller.health(req, h),
            rules: {
                mapSilently: true,
            },
        }, {
            method: "*",
            path: "/{any*}",
            handler: (req, h) => this.controller.notFound(req, h),
            rules: {
                mapSilently: true,
            },
        }];
    }
}

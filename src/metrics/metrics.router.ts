import { ServerRoute } from "@hapi/hapi";
import { Provider } from "../utils/decorators/provider";
import { IRouter } from "../utils/router";
import { MetricsController } from "./metrics.controller";

@Provider()
export class MetricsRouter implements IRouter {
    constructor(
        private readonly controller: MetricsController,
    ) { }

    async getRoutes(): Promise<ServerRoute[]> {
        return [{
            method: "GET",
            path: "/__elba__/metrics",
            handler: (req, h) => this.controller.getMetrics(req, h),
            rules: {
                mapSilently: true,
            },
        }];
    }
}

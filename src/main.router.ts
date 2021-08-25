import {IRouter} from "./utils/router";
import {Provider} from "./utils/decorators/provider";
import {CatRouter} from "./api/cat/cat.router";

@Provider()
export class MainRouter implements IRouter {
    constructor(
        private readonly catRouter: CatRouter,
    ) { }

    async getRoutes() {
        const routes = await Promise.all([
            this.catRouter.getRoutes(),
        ]);

        return routes.flat();
    }
}

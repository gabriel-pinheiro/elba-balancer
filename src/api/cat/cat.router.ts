import {Provider} from "../../utils/decorators/provider";
import {IRouter} from "../../utils/router";
import {CatController} from "./cat.controller";

@Provider()
export class CatRouter implements IRouter{
    constructor(
        private readonly controller: CatController,
    ) { }

    async getRoutes() {
        return [{
            method: 'GET',
            path: '/cats',
            handler: this.controller.listAll.bind(this.controller),
        }];
    }
}

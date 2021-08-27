import { Provider } from "../utils/decorators/provider";
import * as Hapi from '@hapi/hapi';
import { ElbaService } from "./elba.service";

@Provider()
export class ElbaController {
    constructor(
        private readonly service: ElbaService,
    ) { }

    async health(_request: Hapi.Request, _h: Hapi.ResponseToolkit) {
        return await this.service.health();
    }
}

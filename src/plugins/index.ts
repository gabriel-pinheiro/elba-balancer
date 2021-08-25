import {Provider} from "../utils/decorators/provider";
import {LoggerPlugin} from "./logger";
import {IPlugin} from "../utils/plugin";

@Provider()
export class PluginProvider {
    constructor(
        private readonly logger: LoggerPlugin,
    ) { }

    readonly plugins: IPlugin[] = [this.logger];
}

import {Provider} from "../utils/decorators/provider";
import {IPlugin} from "../utils/plugin";
import { H2o2Plugin } from "./h2o2";
import { TracerPlugin } from "./tracer";

@Provider()
export class PluginProvider {
    constructor(
        private readonly tracer: TracerPlugin,
        private readonly h2o2: H2o2Plugin,
    ) { }

    readonly plugins: IPlugin[] = [
        this.tracer,
        this.h2o2,
    ];
}

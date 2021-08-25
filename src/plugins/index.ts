import {Provider} from "../utils/decorators/provider";
import {IPlugin} from "../utils/plugin";
import { TracerPlugin } from "./tracer";

@Provider()
export class PluginProvider {
    constructor(
        private readonly tracer: TracerPlugin,
    ) { }

    readonly plugins: IPlugin[] = [
        this.tracer,
    ];
}

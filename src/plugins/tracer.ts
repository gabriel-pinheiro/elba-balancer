import {IPlugin} from "../utils/plugin";
import {Provider} from "../utils/decorators/provider";
import * as rTracer from 'cls-rtracer';
import * as crypto from 'crypto';

@Provider()
export class TracerPlugin implements IPlugin {
    readonly plugin = rTracer.hapiPlugin;
    readonly options = {
        echoHeader: true,
        requestIdFactory: this.generateId,
    };

    private generateId(_req: unknown): string {
        return crypto.randomBytes(6).toString('hex');
    }
}

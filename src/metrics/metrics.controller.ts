import * as Hapi from '@hapi/hapi';
import { Provider } from "../utils/decorators/provider";
import { MetricsService } from './metrics.service';

@Provider()
export class MetricsController {
    constructor(
        private readonly service: MetricsService,
    ) { }

    async getMetrics(_request: Hapi.Request, _h: Hapi.ResponseToolkit): Promise<string> {
        const metrics = await this.service.getMetrics();
        return metrics.map(m => m.stringify()).join('');
    }
}

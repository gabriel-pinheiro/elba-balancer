import * as Hapi from '@hapi/hapi';
import { inject } from 'inversify';
import { MetricsService } from '../metrics/metrics.service';
import { DownstreamRequestHandler } from '../request/downstream-request.handler';
import { Upstream } from '../upstream/upstream';
import { Service } from '../utils/decorators/service';
import { ILogger, Logger } from '../utils/logger';

@Service()
export class ProxyService {
    constructor(
        @inject(Logger)
        private readonly logger: ILogger,
        private readonly metricsService: MetricsService,
    ) { }

    async proxy(req: Hapi.Request,
                h: Hapi.ResponseToolkit,
                upstream: Upstream): Promise<Hapi.ResponseObject> {
        const request = new DownstreamRequestHandler(req, h, upstream, this.metricsService, this.logger);
        return await request.send();
    }
}

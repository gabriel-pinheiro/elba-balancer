import * as Hapi from '@hapi/hapi';
import { inject } from 'inversify';
import { RequestHandler } from '../request/request.handler';
import { Upstream } from '../upstream/upstream';
import { Service } from '../utils/decorators/service';
import { ILogger, Logger } from '../utils/logger';

@Service()
export class ProxyService {
    constructor(
        @inject(Logger)
        private readonly logger: ILogger,
    ) { }

    async proxy(req: Hapi.Request,
                h: Hapi.ResponseToolkit,
                upstream: Upstream): Promise<Hapi.ResponseObject> {
        const request = new RequestHandler(req, h, upstream, this.logger);
        return await request.send();
    }
}

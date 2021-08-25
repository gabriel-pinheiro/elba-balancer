import 'reflect-metadata';
import { Container } from 'inversify';
import { Server } from './server';
import { ILogger, Logger, logger } from './utils/logger';
import {configProvider, ConfigProvider} from "./config/config.service";

async function bootstrap() {
    logger.debug('resolving dependencies');
    const container = new Container({
        autoBindInjectable: true,
        defaultScope: 'Singleton',
    });

    container.bind<ILogger>(Logger).toConstantValue(logger);
    container.bind<ConfigProvider>(ConfigProvider).toConstantValue(configProvider);

    const server = await container
        .resolve<Server>(Server)
        .start();

    process.on('SIGINT',  () => server.stop());
    process.on('SIGTERM', () => server.stop());

    return server;
}

export const server = bootstrap();

import * as fs from 'fs';
import * as toml from '@iarna/toml';
import {Provider} from "../utils/decorators/provider";
import { Config, configSchema } from './data/config';
import { logger } from '../utils/logger';

@Provider()
export class ConfigProvider {
    public readonly config: Config;

    constructor(configPath: string) {
        try {
            const config = this.fromFile(configPath);
            const validation = configSchema.validate(config);
            if(validation.error) {
                throw validation.error;
            }

            this.config = validation.value;
        } catch (e) {
            logger.error(`Failed to load config at ${configPath}:`);
            logger.fatal(e);
        }
    }

    private fromFile(path: string): Config {
        return toml.parse(fs.readFileSync(path).toString()) as Config;
    }
}

export const configProvider = new ConfigProvider(process.env.CONFIG_PATH || './elba.toml');

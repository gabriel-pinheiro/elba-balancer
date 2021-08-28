import * as fs from 'fs';
import * as toml from '@iarna/toml';
import {Provider} from "../utils/decorators/provider";
import { Config, configSchema } from './data/config';

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
            console.error(`Failed to load config at ${configPath}:`);
            console.error(e.details?.[0]?.message || e);
            process.exit(1);
        }
    }

    private fromFile(path: string): Config {
        return toml.parse(fs.readFileSync(path).toString()) as Config;
    }
}

export const configProvider = new ConfigProvider(process.env.CONFIG_PATH || './elba.toml');

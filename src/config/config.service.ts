import * as fs from 'fs';
import * as toml from '@iarna/toml';
import {Provider} from "../utils/decorators/provider";
import { Config, configSchema, ServiceConfig } from './data/config';

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
            this.validateConfig();
        } catch (e) {
            console.error(`Failed to load config at ${configPath}:`);
            console.error(e.details?.[0]?.message || e);
            process.exit(1);
        }
    }

    private fromFile(path: string): Config {
        return toml.parse(fs.readFileSync(path).toString()) as Config;
    }

    private validateConfig(): void {
        const hosts = this.config.service
            .map(s => s.host)
            .map(h => h === '' ? '*' : h);
        const hostDuplicates = this.findDuplicates(hosts);

        if(hostDuplicates.length > 0) {
            throw new Error(`Duplicate hosts found: ${hostDuplicates.join(', ')}`);
        }

        this.config.service.forEach(s => this.validateService(s));
    }

    private validateService(service: ServiceConfig): void {
        const targets = service.target
            .map(t => t.name);
        const targetDuplicates = this.findDuplicates(targets);

        if(targetDuplicates.length > 0) {
            throw new Error(`Duplicate targets found on host ${service.host || '*'}: ${targetDuplicates.join(', ')}`);
        }
    }

    private findDuplicates(array: string[]): string[] {
        return array.filter((item, index) => array.indexOf(item) !== index);
    }
}

export const configProvider = new ConfigProvider(process.env.CONFIG_PATH || './elba.toml');

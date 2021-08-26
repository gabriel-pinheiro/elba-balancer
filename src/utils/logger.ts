import * as logfmt from 'logfmt';
import * as rTracer from 'cls-rtracer';
import { configProvider } from '../config/config.service';

export type LogOptions = Record<string, string | number | boolean>;
export type ILogger = Record<'debug' | 'info' | 'warn' | 'error' | 'fatal', (log: string, options?: LogOptions) => void>;
export const Logger = Symbol('Logger');

const VERBOSITIES = {
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
};
const VERBOSITY = VERBOSITIES[configProvider.config.server.verbosity];

export class LogfmtLogger {
    debug(log: string, options?: LogOptions) {
        this.log(log, 'debug', options);
    }

    info(log: string, options?: LogOptions) {
        this.log(log, 'info', options);
    }

    warn(log: string, options?: LogOptions) {
        this.log(log, 'warn', options);
    }

    error(log: string, options?: LogOptions) {
        this.log(log, 'error', options);
    }

    fatal(log: string, options?: LogOptions) {
        this.log(log, 'fatal', options);
        process.exit(1);
    }

    private log(log: string, level: string, options: LogOptions = {}) {
        if(VERBOSITY < VERBOSITIES[level]) {
            return;
        }

        const trace = rTracer.id() || '000000000000';
        logfmt.log({
            trace,
            date: new Date().toISOString(),
            level, log,
            ...options,
        });
    }
}

export const logger: ILogger = new LogfmtLogger();

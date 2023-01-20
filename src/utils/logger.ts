import * as logfmt from 'logfmt';
import * as rTracer from 'cls-rtracer';

export type Verbosity = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogOptions = Record<string, string | number | boolean>;
export type ILogger = Record<Verbosity, (log: string, options?: LogOptions) => void>;
export const Logger = Symbol('Logger');

const VERBOSITIES = {
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
};

export class LogfmtLogger {
    private _verbosity = VERBOSITIES['debug'];

    set verbosity(verbosity: Verbosity) {
        this._verbosity = VERBOSITIES[verbosity];
    }

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
        if(this._verbosity < VERBOSITIES[level]) {
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

export const logger = new LogfmtLogger();

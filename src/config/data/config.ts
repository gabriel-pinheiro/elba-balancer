import * as Joi from 'joi';

export type ServerConfig = {
    host: string;
    port: number;
    verbosity: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
};

export const serverSchema = Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    verbosity: Joi.string().valid('debug', 'info', 'warn', 'error', 'fatal').required(),
});

export type ServiceTimeoutConfig = {
    target: number;
    global: number;
};

export const serviceTimeoutSchema = Joi.object({
    target: Joi.number().min(1).default(30),
    global: Joi.number().min(1).default(120),
}).default({
    target: 30,
    global: 120,
});

export type ServiceHealthConfig = {
    threshold: number;
    timeout: number;
    none_healthy_is_all_healthy: boolean;
};

export const serviceHealthSchema = Joi.object({
    threshold: Joi.number().min(1).default(3),
    timeout: Joi.number().min(1).default(10),
    none_healthy_is_all_healthy: Joi.boolean().default(false),
}).default({
    threshold: 3,
    timeout: 10,
    none_healthy_is_all_healthy: false,
});

export type ServiceRetryConfig = {
    limit?: number;
    delay: number;
    cooldown: number;
    retryable_errors?: string[];
};

export const serviceRetrySchema = Joi.object({
    limit: Joi.number().min(0).optional(),
    delay: Joi.number().min(0).default(0),
    cooldown: Joi.number().min(0).default(3),
    retryable_errors: Joi.array().items(Joi
        .string()
        .valid('CONNECTION_ERROR', 'TIMEOUT', 'CODE_403',
            'CODE_404', 'CODE_429', 'CODE_500', 'CODE_502',
            'CODE_503', 'CODE_504', 'CODE_4XX', 'CODE_5XX')).default(["CONNECTION_ERROR", "TIMEOUT", "CODE_5XX"]),
}).default({
    limit: null,
    delay: 0,
    cooldown: 3,
    retryable_errors: ["CONNECTION_ERROR", "TIMEOUT", "CODE_5XX"],
});

export type ServiceConfig = {
    host: string;
    targets: string[];
    timeout: ServiceTimeoutConfig;
    health: ServiceHealthConfig;
    retry: ServiceRetryConfig;
};

export const serviceSchema = Joi.object({
    host: Joi.string().allow('').default(''),
    targets: Joi.array().items(Joi.string()).min(1).required(),
    timeout: serviceTimeoutSchema,
    health: serviceHealthSchema,
    retry: serviceRetrySchema,
});

export type Config = {
    server: ServerConfig;
    service: ServiceConfig[];
};

export const configSchema = Joi.object({
    server: serverSchema.required(),
    service: Joi.array().items(serviceSchema).default([]),
});

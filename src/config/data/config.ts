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
    connect: number;
    target: number;
};

export const serviceTimeoutSchema = Joi.object({
    connect: Joi.number().min(1).default(3),
    target: Joi.number().min(1).default(30),
}).default({
    connect: 3,
    target: 30,
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
    limit: Joi.number().min(1).optional(),
    delay: Joi.number().min(0).default(100),
    cooldown: Joi.number().min(0).default(3000),
    retryable_errors: Joi.array().items(Joi
        .string()
        .regex(/^CODE_(\d|X){3}$/)
        .default(["CODE_502", "CODE_503", "CODE_504"])),
}).default({
    limit: null,
    delay: 0,
    cooldown: 3,
    retryable_errors: ["CODE_502", "CODE_503", "CODE_504"],
});

export type ServiceTargetConfig = {
    name: string;
    url: string;
};

export const serviceTargetSchema = Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
});

export type ServiceConfig = {
    host: string;
    target: ServiceTargetConfig[];
    timeout: ServiceTimeoutConfig;
    health: ServiceHealthConfig;
    retry: ServiceRetryConfig;
};

export const serviceSchema = Joi.object({
    host: Joi.string().allow('').default(''),
    target: Joi.array().items(serviceTargetSchema).min(1).required(),
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

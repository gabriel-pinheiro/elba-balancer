export type UpstreamHealth = {
    host: string;
    healthyTargets: string[];
    unhealthyTargets: string[];
};

export type ElbaHealth = {
    status: 'ok';
    upstreams: UpstreamHealth[];
};

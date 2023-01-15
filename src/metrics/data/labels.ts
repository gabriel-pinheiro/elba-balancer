export type DownstreamLabels = {
    service: string;
};

export type DownstreamLatencyLabels = {
    service: string;
    latency: string;
};

export type UpstreamLabels = {
    service: string;
    target: string;
};

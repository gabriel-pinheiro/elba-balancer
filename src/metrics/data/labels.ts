export type DownstreamLabels = {
    service: string;
};

export type DownstreamDurationLabels = {
    service: string;
    le: string;
};

export type UpstreamLabels = {
    service: string;
    target: string;
};

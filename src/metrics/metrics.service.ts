import { Service } from "../utils/decorators/service";
import { Counter, Gauge, Metric, MetricValue } from "../utils/prometheus";
import { DownstreamLabels, UpstreamLabels } from "./data/labels";

export type UpstreamMetric = 'upstream_success' | 'upstream_error' | 'target_status';
export type DownstreamMetric = 'downstream_success' | 'downstream_error';

@Service()
export class MetricsService {
    private readonly downstreamMetrics: Record<DownstreamMetric, Metric<DownstreamLabels>> = {
        downstream_success: new Counter<DownstreamLabels>(
            'downstream_success', 'Successfully proxied responses from elba to downstream'),
        downstream_error: new Counter<DownstreamLabels>(
            'downstream_error', 'Proxy error responses from elba to downstream'),
    };
    private readonly upstreamMetrics: Record<UpstreamMetric, Metric<UpstreamLabels>> = {
        upstream_success: new Counter<UpstreamLabels>(
            'upstream_success', '2XX or non-retriable errors from upstream to elba'),
        upstream_error: new Counter<UpstreamLabels>(
            'upstream_error', 'Retriable errors from upstream to elba'),
        target_status: new Gauge<UpstreamLabels>('target_status',
            'Status of upstream targets. 0 is down, 1 is up'),
    };


    private readonly downstreamMetricValues: Map<DownstreamMetric,
            Map<string, MetricValue<DownstreamLabels>>> = new Map();
    private readonly upstreamMetricValues: Map<UpstreamMetric,
            Map<string, Map<string, MetricValue<UpstreamLabels>>>> = new Map();

    async getMetrics(): Promise<Metric<any>[]> {
        return [...Object.values(this.downstreamMetrics), ...Object.values(this.upstreamMetrics)];
    }

    getDownstreamValue(metric: DownstreamMetric, host: string): MetricValue<DownstreamLabels> {
        const hostMap = this.getWithDefault(this.downstreamMetricValues, metric,
                () => new Map<string, MetricValue<DownstreamLabels>>());
        const metricValue = this.getWithDefault(hostMap, host, () => this.downstreamMetrics[metric].createValue({
            service: host,
        }));

        return metricValue;
    }

    getUpstreamValue(metric: UpstreamMetric, host: string, target: string): MetricValue<UpstreamLabels> {
        const hostMap = this.getWithDefault(this.upstreamMetricValues, metric,
                () => new Map<string, Map<string, MetricValue<UpstreamLabels>>>());
        const targetMap = this.getWithDefault(hostMap, host,
                () => new Map<string, MetricValue<UpstreamLabels>>());
        const metricValue = this.getWithDefault(targetMap, target, () => this.upstreamMetrics[metric].createValue({
            service: host,
            target,
        }));

        return metricValue;
    }

    private getWithDefault<K, V>(map: Map<K, V>, key: K, defaultValueFactory: () => V): V {
        const value = map.get(key);
        if(typeof value !== 'undefined') {
            return value;
        }
        const defaultValue = defaultValueFactory();
        map.set(key, defaultValue);
        return defaultValue;
    }
}

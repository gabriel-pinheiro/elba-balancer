import { Service } from "../utils/decorators/service";
import { Counter, Gauge, Metric, MetricValue } from "../utils/prometheus";
import { DownstreamLabels, UpstreamLabels } from "./data/labels";
import { performance } from "perf_hooks";
import { memoryUsage } from "process";

export type UpstreamMetric = 'upstream_success' | 'upstream_error' | 'target_status';
export type DownstreamMetric = 'downstream_success' | 'downstream_error' |
    'targets_up' | 'targets_down';

@Service()
export class MetricsService {
    private readonly downstreamMetrics: Record<DownstreamMetric, Metric<DownstreamLabels>> = {
        downstream_success: new Counter<DownstreamLabels>(
            'downstream_success', 'Successfully proxied responses from elba to downstream'),
        downstream_error: new Counter<DownstreamLabels>(
            'downstream_error', 'Proxy error responses from elba to downstream'),
        targets_up: new Gauge<DownstreamLabels>('targets_up',
            'Shows how many targets for each service are up'),
        targets_down: new Gauge<DownstreamLabels>('targets_down',
            'Shows how many targets for each service are down'),
    };
    private readonly upstreamMetrics: Record<UpstreamMetric, Metric<UpstreamLabels>> = {
        upstream_success: new Counter<UpstreamLabels>(
            'upstream_success', '2XX or non-retriable errors from upstream to elba'),
        upstream_error: new Counter<UpstreamLabels>(
            'upstream_error', 'Retriable errors from upstream to elba'),
        target_status: new Gauge<UpstreamLabels>('target_status',
            'Status of upstream targets. 0 is down, 1 is up'),
    };
    private readonly eventLoopActive = new Counter('event_loop_active', 'Number of milliseconds the event loop was active').createValue({});
    private readonly eventLoopIdle = new Counter('event_loop_idle', 'Number of milliseconds the event loop was idle').createValue({});
    private readonly memoryMetric = new Gauge('memory_usage', 'Memory usage in bytes');
    private readonly memoryHeapTotal = this.memoryMetric.createValue({type: 'heap_total'});
    private readonly memoryHeapUsed = this.memoryMetric.createValue({type: 'heap_used'});
    private readonly memoryRss = this.memoryMetric.createValue({type: 'rss'});


    private readonly downstreamMetricValues: Map<DownstreamMetric,
            Map<string, MetricValue<DownstreamLabels>>> = new Map();
    private readonly upstreamMetricValues: Map<UpstreamMetric,
            Map<string, Map<string, MetricValue<UpstreamLabels>>>> = new Map();

    async getMetrics(): Promise<Metric<any>[]> {
        await this.updatePerformanceMetrics();
        return [
            ...Object.values(this.downstreamMetrics),
            ...Object.values(this.upstreamMetrics),
            this.eventLoopActive.metric,
            this.eventLoopIdle.metric,
            this.memoryMetric,
        ];
    }

    getDownstreamValue(metric: DownstreamMetric, rawHost: string): MetricValue<DownstreamLabels> {
        const host = rawHost || '*';
        const hostMap = this.getWithDefault(this.downstreamMetricValues, metric,
                () => new Map<string, MetricValue<DownstreamLabels>>());
        const metricValue = this.getWithDefault(hostMap, host, () => this.downstreamMetrics[metric].createValue({
            service: host,
        }));

        return metricValue;
    }

    getUpstreamValue(metric: UpstreamMetric, rawHost: string, target: string): MetricValue<UpstreamLabels> {
        const host = rawHost || '*';
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

    private async updatePerformanceMetrics(): Promise<void> {
        const { active, idle } = performance.eventLoopUtilization();
        this.eventLoopActive.set(active);
        this.eventLoopIdle.set(idle);

        const { rss, heapTotal, heapUsed } = memoryUsage();
        this.memoryHeapTotal.set(heapTotal);
        this.memoryHeapUsed.set(heapUsed);
        this.memoryRss.set(rss);
    }
}

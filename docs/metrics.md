# Elba Metrics Module

## Prometheus metrics
Elba exposes Prometheus metrics on `/__elba__/metrics`
```shell
$ curl http://localhost:8080/__elba__/metrics

# HELP downstream_success Successfully proxied responses from elba to downstream
# TYPE downstream_success counter
downstream_success{service="api.default.svc.cluster.local"} 0
downstream_success{service="*"} 0
# HELP downstream_error Proxy error responses from elba to downstream
# TYPE downstream_error counter
downstream_error{service="api.default.svc.cluster.local"} 0
downstream_error{service="*"} 0
# HELP targets_up Shows how many targets for each service are up
# TYPE targets_up gauge
targets_up{service="api.default.svc.cluster.local"} 0
targets_up{service="*"} 0
# HELP targets_down Shows how many targets for each service are down
# TYPE targets_down gauge
targets_down{service="api.default.svc.cluster.local"} 3
targets_down{service="*"} 3
# HELP upstream_success 2XX or non-retriable errors from upstream to elba
# TYPE upstream_success counter
upstream_success{service="api.default.svc.cluster.local",target="instance001"} 0
upstream_success{service="api.default.svc.cluster.local",target="instance002"} 0
upstream_success{service="api.default.svc.cluster.local",target="instance003"} 0
upstream_success{service="*",target="instance001"} 0
upstream_success{service="*",target="instance002"} 0
upstream_success{service="*",target="instance003"} 0
# HELP upstream_error Retriable errors from upstream to elba
# TYPE upstream_error counter
upstream_error{service="api.default.svc.cluster.local",target="instance001"} 0
upstream_error{service="api.default.svc.cluster.local",target="instance002"} 0
upstream_error{service="api.default.svc.cluster.local",target="instance003"} 0
upstream_error{service="*",target="instance001"} 0
upstream_error{service="*",target="instance002"} 0
upstream_error{service="*",target="instance003"} 0
# HELP target_status Status of upstream targets. 0 is down, 1 is up
# TYPE target_status gauge
target_status{service="api.default.svc.cluster.local",target="instance001"} 1
target_status{service="api.default.svc.cluster.local",target="instance002"} 1
target_status{service="api.default.svc.cluster.local",target="instance003"} 1
target_status{service="*",target="instance001"} 1
target_status{service="*",target="instance002"} 1
target_status{service="*",target="instance003"} 1
# HELP elba_downstream_request_duration_seconds_bucket Number of responses that took less than "le" seconds
# TYPE elba_downstream_request_duration_seconds_bucket counter
elba_downstream_request_duration_seconds_bucket{service="api.default.svc.cluster.local",le="000.64"} 0
elba_downstream_request_duration_seconds_bucket{service="api.default.svc.cluster.local",le="001.28"} 0
elba_downstream_request_duration_seconds_bucket{service="api.default.svc.cluster.local",le="002.56"} 0
elba_downstream_request_duration_seconds_bucket{service="*",le="000.64"} 0
elba_downstream_request_duration_seconds_bucket{service="*",le="001.28"} 0
elba_downstream_request_duration_seconds_bucket{service="*",le="002.56"} 0
# HELP event_loop_active Number of milliseconds the event loop was active
# TYPE event_loop_active counter
event_loop_active{} 84.89516399976128
# HELP event_loop_idle Number of milliseconds the event loop was idle
# TYPE event_loop_idle counter
event_loop_idle{} 59451.823004
# HELP memory_usage Memory usage in bytes
# TYPE memory_usage gauge
memory_usage{type="heap_total"} 13766656
memory_usage{type="heap_used"} 11503048
memory_usage{type="rss"} 56487936
```


Here are some examples of how to query the metrics:
Which targets are healthy for a service:
```promql
min(target_status{service="$service"}) by (target)
```

Number of successful requests per minute to each target:
```promql
sum(rate(upstream_success{service="$service"}[$__interval])*60) by (target)
```

Number of failed requests per minute to each target:
```promql
sum(rate(upstream_error{service="$service"}[$__interval])*60) by (target)
```

Number of failed downstream requests per minute:
```promql
sum(rate(downstream_error{service="$service"}[$__interval])*60) by (service)
```

Memory usage:
```promql
memory_usage
```

Elba load percentage (event loop usage):
```promql
100 * rate(event_loop_active[$__interval]) / (rate(event_loop_active[$__interval]) + rate(event_loop_idle[$__interval]))
```

Heatmap of request duration:
```promql
sum (increase(elba_downstream_request_duration_seconds_bucket[$__interval])) by (le) / ignoring(le) group_left sum(increase(downstream_success[$__interval]))
```

# Elba - Load balancer with retries
Elba is a highly customizable HTTP load balancer with many retry options and exported metrics. It's ideal for integrations that aren't very stable or integrations behind VPNs or networks that aren't stable.

## Installation

### Using Docker
First download [the default configuration file](https://raw.githubusercontent.com/gabriel-pinheiro/elba-balancer/main/elba.toml):
```shell
$ wget https://raw.githubusercontent.com/gabriel-pinheiro/elba-balancer/main/elba.toml
```

Now run elba's Docker image with the configuration file:
```shell
$ docker run -v /path/to/elba.toml:/etc/elba/elba.toml -p 8080:8080 -d gabrielctpinheiro/elba
```

And that's it! Elba is now running on port 8080:
```shell
$ curl http://localhost:8080/

{
  "message": "Hello from instance 03!"
}
```

### Using Helm
First pull the chart to your machine so you can edit the configuration file:
```shell
$ helm repo add elba https://cdn.codetunnel.net/elba
$ helm pull elba/elba
$ tar xzf elba*.tgz
$ cd elba
```

Edit the file `elba.toml` and install it:
```shell
$ helm install elba ./
```

## Settings
These are the supported options for your `elba.toml` configuration file:

```toml
[server]
host      = "0.0.0.0" # Interface to bind
port      = 8080      # Port to listen
verbosity = "debug"   # Minimum verbosity to log: debug,info,warn,error,fatal


#
# You can define as many [[service]]s as you'd like, here is an example with
# all parameters (note that only the "targets" param is required, you can omit
# anything else)
#
[[service]]
# This service will be chosen when the Host header is equal to this value
# Leave this blank or remove/comment it to match any host:
# host = "api.default.svc.cluster.local"

  # These are the URLs that will be balanced
  [[service.target]]
  name = "instance001"                  # Alias to show in the logs and metrics
  url  = "https://elba.mockoapp.net/s1" # URL to proxy to

  [[service.target]]
  name = "instance002"
  url  = "https://elba.mockoapp.net/s2"

  [[service.target]]
  name = "instance003"
  url  = "https://elba.mockoapp.net/s3"

  [service.timeout]
  connect = 3   # Maximum seconds to wait for a connection to be established, default: 3
  target  = 30  # Maximum seconds to wait for a target's response, default: 30

  [service.health]
  # Consecutive retriable errors to consider a target to be down, default: 3
  threshold = 3
  # Time to wait to mark a target as UP again, default: 10
  timeout   = 10
  # If all targets are down, balance between all of them instead of failing with 503
  # This can greatly increase the load in the upstream services because each request
  # received might go to all of them several times deppending on the configs above
  # default: false
  none_healthy_is_all_healthy = false

  [service.retry]
  # Attempts limit, defaults to the amount of targets times two. First attempt is also
  # counted, a limit of 6 means the first attempt and five retries.
  limit    = 6
  delay    = 100 # Millis to wait between retries, default: 100
  # Millis to wait before retrying in a target that previously failed for
  # a request, default: 3000
  cooldown = 3000

  # Errors that will trigger a retry, options available:
  #
  # CODE_502
  # Connection errors, like a connection refused, broken pipe, etc
  #
  # CODE_504
  # Timeout errors, like a timeout on a socket read
  #
  # CODE_404
  # CODE_429
  # CODE_500
  # CODE_503
  # ...and so on
  # Consider that response code from the upstream as a retryable error, you can pick any code
  #
  # CODE_4XX
  # Consider any code < 500 and >= 400 to be retryable
  #
  # CODE_5XX
  # Consider any code >= 500 to be retryable
  #
  # This setting defaults to ["CODE_502", "CODE_503", "CODE_504"]
  retryable_errors = ["CODE_502", "CODE_503", "CODE_504"]

#
# You can define more services by repeating the above section from [[service]] to the end
#

```

## Healthcheck
Elba has a built-in healthcheck endpoint that can be used to check if it's running:
```shell
$ curl http://localhost:8080/__elba__/health

{
  "status": "ok",
  "upstreams": [
    {
      "host": "api.default.svc.cluster.local",
      "healthyTargets": [
        "instance001",
        "instance002",
        "instance003"
      ],
      "unhealthyTargets": []
    },
    {
      "host": "*",
      "healthyTargets": [
        "instance001",
        "instance002",
        "instance003"
      ],
      "unhealthyTargets": []
    }
  ]
}
```

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

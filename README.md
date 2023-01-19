# Elba - Load balancer with retries
Elba is a highly customizable HTTP load balancer with many retry options and exported metrics. It's ideal for integrations that aren't very stable or integrations behind VPNs or networks that aren't stable. It'll give you insights on whats happening in your integrations via its advanced metrics.

## Installation
### Linux
To install Elba on Linux, run the following command:
```shell
$ curl -sfL https://cdt.one/elba.sh | sh -
```

It'll create Elba's service, start and enable it.

You can check Elba status with:
```shell
$ sudo systemctl status elba
```

Check its logs with:
```shell
$ sudo journalctl -u elba
```

Edit the configuration file on `/etc/elba/elba.toml` and restart it with:
```shell
$ sudo systemctl restart elba
```

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
These are some of the supported options for your `elba.toml` configuration file:

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
## This service will be chosen when the Host header is equal to this value
## Leave this blank or remove/comment it to match any host:
# host = "api.default.svc.cluster.local"

## The default is to set the upstream Host header from its URL, if you want to
## proxy the Host header from the downstream request, uncomment this line:
# proxy_host = true

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
  # Seconds to wait to mark a target as UP again, default: 10
  timeout   = 10
  # If all targets are down, balance between all of them instead of failing with 503
  # This can greatly increase the load in the upstream services because each request
  # received might go to all of them several times deppending on the retry settings
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

# Elba Modules

Elba provides you with many options to balance your requests, retry in case of failures, monitor the health of your upstream services, monitor your requests, troubleshoot issues with your integrations and a lot more. Check our [base concepts](./docs/concepts.md) and more about each module:
- **[Load Balance Module](./docs/load-balance.md)**: Balance the requests between your targets, define multiple services going through Elba, and choose how they will appear in the logs and monitoring.
- **[Retry Module](./docs/retry.md)**: Retry failed requests, choose when a request is retried, how many times, define cooldowns, delays.
- **[Health Module](./docs/health.md)**: Keep track of the health of each upstream target, remove unhealthy targets from the load balancing, define the rules to mark a target as UP or DOWN.
- **[Metrics Module](./docs/metrics.md)**: Elba exposes many advanced metrics that will let you monitor the status of your environments and integrations.
- **[Logs Module](./docs/logs.md)**: Understand how Elba logs the actions, downstream and upstream requests and responses to help you with troubleshooting issues with your integrations.
- **[Headers Module](./docs/headers.md)**: Elba adds headers to the downstream responses to help with troubleshooting. Check how to use them.

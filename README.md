# Elba - Load balancer with retries
Elba is an HTTP load balancer with very customizable retry options. It's ideal for integrations that aren't very stable or integrations behind VPNs or networks that aren't stable.

# Settings
```toml
[server]
host      = "0.0.0.0" # Interface to bind
port      = 8080      # Port to listen
verbosity = "info"    # Minimum verbosity to log: debug,info,warn,error,fatal


#
# You can define as many [[service]]s as you'd like, here is an example with
# all parameters (note that only the "targets" param is required, you can omit
# anything else)
#
[[service]]
# This service will be chosen when the Host header is equal to this value
# Leave this blank or remove it to match any host
# Only one service can have a blank host
host    = "api.default.svc.cluster.local"

targets = [
  "https://www.foo.bar/api/v1",
  "https://ww2.foo.bar/api/v1",
  "https://ww3.foo.bar/api/v1"
]

  [service.timeout]
  connect = 3  # Maximum seconds to wait for a connection to be established, default: 3
  target  = 30  # Maximum seconds to wait for a target's response, default: 30
  global  = 120 # Time limit for incoming requests, default: 120

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
  limit    = 6   # Retry amount limit, defaults to the amount of targets times two
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
# And here is a similar service without the comments in case you need it :)
#
[[service]]
targets = [
  "https://www.foo.bar/api/v1",
  "https://ww2.foo.bar/api/v1",
  "https://ww3.foo.bar/api/v1"
]

  [service.timeout]
  connect = 3
  target  = 30
  global  = 120

  [service.health]
  threshold = 3
  timeout   = 10
  none_healthy_is_all_healthy = false

  [service.retry]
  limit    = 6
  delay    = 100
  cooldown = 3000
  retryable_errors = ["CODE_502", "CODE_503", "CODE_504"]

```



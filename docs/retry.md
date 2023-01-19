# Elba Retry Module

## Settings
You can set the retry settings for each service you create:

```toml
[server]
host      = "0.0.0.0"
port      = 8080
verbosity = "debug"

[[service]]
  [[service.target]]
  name = "instance001"
  url  = "https://elba.mockoapp.net/s1"

  [[service.target]]
  name = "instance002"
  url  = "https://elba.mockoapp.net/s2"

  [[service.target]]
  name = "instance003"
  url  = "https://elba.mockoapp.net/s3"

  [service.timeout]
  connect = 3   # Maximum seconds to wait for a connection to be established, default: 3
  target  = 30  # Maximum seconds to wait for a target's response, default: 30

  ##################
  # Retry Settings #
  ##################
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
```

## How retries work
- `service.retry.delay` is the amount of time in millis to wait between retries. Defaults to `100`ms.
- `service.retry.limit` is the maximum amount of retries before failing.
  - The first attempt is also counted, a limit of 6 means the first attempt and five retries.
  - When the retry limit is reached, the last error elba received/generated will be sent in the downstream response.
  - Defaults to the amount of targets times two.
- `service.retry.cooldown` is the amount of time in millis wanted before retrying in a target that previously failed for that request.
  - A cooldown of 3000 doesn't mean that extra 3 seconds will be waited, it means that the time between the last retry and the next one will be at least 3000 millis.
  - This only applies when retrying in a target that was previously used for that downstream request.
  - Defaults to `3000`ms.
- An upstream request is considered failed if the response code is in the list of `service.retry.retryable_errors`.
  - `CODE_502` means that either the upstream returned a response with the 502 status code or that Elba encountered a connection error, like a connection refused, broken pipe, etc.
  - `CODE_504` means that either the upstream returned a response with the 504 status code or that Elba encountered a timeout error, like a timeout on a socket read, connection timeout, response timeout.
  - You can pick different timeout times using `service.timeout.connect` and `service.timeout.target`.
  - You can pick any `CODE_<status code>` as a retryable error, if the upstream target returns that response, elba will retry.
  - You can also use `CODE_4XX` to match any code `<` 500 and `>=` 400.
  - You can also use `CODE_5XX` to match any code `<` 600 and `>=` 500.
  - This setting defaults to `["CODE_502", "CODE_503", "CODE_504"]`.
- Failed requests are retried until `service.retry.limit` is reached, until all targets are down (if `service.health.none_healthy_is_all_healthy` is set to false), until a successful response is received, or until the request is aborted by the client.
- If no targets are available and `service.health.none_healthy_is_all_healthy` is set to false, elba will not retry and return a `503` code error.
- For chosing an available target, the following algorithm is used:
  - If there are healthy targets not chosen yet for the current downstream request, a random one is chosen.
  - If all healthy targets were already attempted for the current downstream request, the one that has been attempted the farthest from now is chosen.
  - If all targets are down and `service.health.none_healthy_is_all_healthy` is set to true, the same two rules above are applied for all targets.
  - These rules are evaluated at upstream-request time.
- To troubleshoot retries, check the [logs module documentation](logs.md) for more information on tracing.
- To monitor retries, check the [metrics module documentation](metrics.md).

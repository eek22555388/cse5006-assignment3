# JMeter load test results

Test plan: `rss-load-test.jmx` — GET /api/items against the RSS Server API.
Run from a Windows client in Melbourne against EC2 in us-east-1.

| Tier   | Threads | Ramp-up | Samples | Avg    | Min   | Max    | Error % | Throughput |
|--------|---------|---------|---------|--------|-------|--------|---------|------------|
| x1     | 1       | 1s      | 10      | —      | —     | —      | 0%      | —          |
| x10    | 10      | 5s      | 100     | 297ms  | 234ms | 749ms  | 0%      | 13.4/s     |
| x100   | 100     | 30s     | 500     | 372ms  | 230ms | 1951ms | 0%      | 15.9/s     |
| x1000  | 1000    | 60s     | 1000    | 700ms  | 666ms | 1681ms | 0%      | 16.5/s     |
| x10000 | 10000   | 120s    | 10000   | 697ms  | 1ms   | 1679ms | 0.01%   | 82.8/s     |

## Interpretation

Throughput appeared to plateau at ~16/s through the first three tiers while latency
climbed, which initially looked like server saturation. The x10000 run disproved
that: throughput rose to 82.8/s with latency unchanged at ~700ms.

The explanation is in the `Active` thread counts — 12 concurrent at x1000 versus
~58 at x10000. Because each request completed faster than the ramp introduced new
threads, the earlier tiers were limited by arrival rate, not by server capacity.
They measured the test configuration rather than the system under test.

Actual sustained capacity is therefore at least 83 requests/second at ~700ms mean
latency with a 0.01% error rate. The server was not driven to saturation by any
tier run here.

## Limitations

- ~230ms of every response is network round-trip Melbourne to us-east-1; the
  700ms floor is not all application time.
- Load was generated from a single client machine over a residential connection,
  which may itself constrain concurrency.
- The single error recorded (1ms response) is consistent with a client-side
  socket failure rather than a server error; no 5xx responses were logged
  server-side, which the dashboard's status-code breakdown confirms.
- Only GET /api/items was exercised. Write paths were not load tested.

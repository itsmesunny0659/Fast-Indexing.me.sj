# Production-Grade k6 Load-Testing Worker

Scalable Grafana k6 load-testing worker configured to benchmark HTTP throughput and capacity for `https://ai-fast-indexing-engine.vercel.app`.

## Architecture
- **Engine**: Grafana k6
- **Deployment**: Docker & Docker Compose
- **Configuration**: Environment variables via `.env` file

## Multi-Stage Load Profile
- **Stage 1**: 100 req/sec (15s)
- **Stage 2**: 500 req/sec (15s)
- **Stage 3**: 1,000 req/sec (15s)
- **Stage 4**: 2,500 req/sec (15s)
- **Stage 5**: 5,000 req/sec (15s)

## Quick Start
```bash
cd load-test
./start.sh
```

## Stop Worker
```bash
./stop.sh
```

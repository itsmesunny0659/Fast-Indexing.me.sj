import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom k6 metrics
export const errorRate = new Rate('errors');
export const latencyTrend = new Trend('latency_ms');

export const options = {
    scenarios: {
        adaptive_load_profile: {
            executor: 'ramping-arrival-rate',
            startRate: 100,
            timeUnit: '1s',
            preAllocatedVUs: 50,
            maxVUs: 1000,
            stages: [
                { target: 100, duration: '15s' },   // Stage 1: 100 req/sec
                { target: 500, duration: '15s' },   // Stage 2: 500 req/sec
                { target: 1000, duration: '15s' },  // Stage 3: 1000 req/sec
                { target: 2500, duration: '15s' },  // Stage 4: 2500 req/sec
                { target: 5000, duration: '15s' },  // Stage 5: 5000 req/sec
            ],
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],  // Error rate < 1%
        http_req_duration: ['p(95)<1500', 'p(99)<3000'], // Latency bounds
    },
};

export default function () {
    const url = __ENV.TARGET_URL || 'https://ai-fast-indexing-engine.vercel.app/fui-api/api/indexing/analytics';
    let headers = {
        'User-Agent': 'k6-load-testing-worker/1.0',
        'Accept': 'application/json',
    };

    if (__ENV.HEADERS) {
        try {
            headers = Object.assign({}, headers, JSON.parse(__ENV.HEADERS));
        } catch (e) {}
    }

    const res = http.get(url, { headers: headers });

    const result = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    errorRate.add(!result);
    latencyTrend.add(res.timings.duration);

    sleep(0.1);
}

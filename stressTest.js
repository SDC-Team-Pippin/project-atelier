import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check, sleep } from 'k6';

export const TrendRTT = new Trend('RTT');

export const options = {
  thresholds: {
    RTT: ['p(100)<2000'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(100)<2000'],
  },
  scenarios: {
    ramping: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1s', target: 1 },
        { duration: '2s', target: 10 },
        { duration: '5s', target: 100 },
        { duration: '10s', target: 1000 },
        { duration: '200s', target: 1000 },
      ],
      gracefulRampDown: '30s',
    },
  },
};

export default function () {
  // const answer = 6943264;
  // const res = http.put(`http://localhost:3456/qa/answers/${answer}/helpful`);
  // check(res, {
  //   'status was 204': (r) => r.status === 204,
  //   'response less than 2000ms': (r) => r.timings.duration < 2000,
  // });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const body = JSON.stringify({
    body: `new question ${__VU}: ${__ITER}`,
    name: 'aleceche',
    email: 'alec@ech.com',
    product_id: 1000000,
  });
  // const question = 3619877;
  const res = http.post(`http://localhost:3456/qa/questions`, body, params);
  check(res, {
    'status was 201': (r) => r.status === 201,
    'response less than 2000ms': (r) => r.timings.duration < 2000,
  });
  // const BASE_URL = 'http://localhost:3456/qa/questions';
  // const res = http.batch([
  //   [
  //     'GET',
  //     `${BASE_URL}?product_id=1&count=5`,
  //     null,
  //     { tags: { name: 'First 10%' } },
  //   ],
  //   [
  //     'GET',
  //     `${BASE_URL}?product_id=500000&count=5`,
  //     null,
  //     { tags: { name: 'Middle 10%' } },
  //   ],
  //   [
  //     'GET',
  //     `${BASE_URL}?product_id=1000000&count=5`,
  //     null,
  //     { tags: { name: 'Last 10%' } },
  //   ],
  // ]);

  sleep(1);
}

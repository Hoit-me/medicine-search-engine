import { check, sleep } from 'k6';
import http from 'k6/http';
/**
 * 해당 스크립트는 k6를 이용하여 성능 테스트를 진행하기 위한 스크립트입니다.
 *
 * 시나리오 유저: 100명
 * 1. 검색엔진이 없는 경우 (SEARCH_ENGINE: false)
 *  1.1 검색어가 없는 경우
 *  1.2 검색어가 있는 경우
 * 2. 검색엔진이 있는 경우 (SEARCH_ENGINE: true)
 *  2.1 검색어가 없는 경우
 *  2.2 검색어가 있는 경우
 */

export const options = {
  scenarios: {
    no_search_NoEngine: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10s',
      exec: 'no_search_NoEngine',
      env: {
        SEARCH_ENGINE: 'false',
      },
    },

    // search_NoEngine: {
    //   executor: 'constant-vus',
    //   vus: 50,
    //   duration: '30s',
    //   exec: 'search_NoEngine',
    //   env: {
    //     SEARCH_ENGINE: 'false',
    //     SEARCH_KEYWORD: '자나', // 검색어
    //   },
    // },
  },
};

export function no_search_NoEngine() {
  // const page = Math.floor(Math.random() * 10) + 1; //1~10
  const page = Math.floor(Math.random() * 10) + 1;

  const limit = 10;
  // const url = `http://localhost:8000/api/medicine/search?page=${page}&limit=${limit}`;
  const url = `https://dev.search.ho-it.me/api/medicine/?page=${page}&limit=${limit}`;
  //   const url = 'http://localhost:8000/api/health-check';
  const res = http.get(url);

  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}

export function search_NoEngine() {
  const page = Math.floor(Math.random() * 10) + 1;
  const limit = 10;
  const url = `http://localhost:8000/api/medicine/search?page=${page}&limit=${limit}&search=${__ENV.SEARCH_KEYWORD}`;
  //   const url = `https://dev.search.ho-it.me/api/medicine/search?page=${page}&limit=${limit}&search=${__ENV.SEARCH_KEYWORD}`;
  const res = http.get(url);

  check(res, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(1);
}

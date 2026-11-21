// ===== Cloudflare Worker 입구 =====
// 이 사이트는 Cloudflare "Worker(정적 자산)" 로 배포됩니다. 보통 파일(html·css·js·이미지)은 Cloudflare 가 바로 보내고,
// 아래 두 경로만 이 코드가 처리합니다 (wrangler.jsonc 의 run_worker_first).
//   /api/showday · /api/photos  →  functions/api/*.js   (공연 종료 · 현장 사진)
//   /photos/<id>.jpg            →  functions/photos/[name].js
//
// 무료 한도(KV 읽기 하루 10만 번) 대비 : Cloudflare 서버에 잠깐 기억해 두고 같은 답을 줌
//   - 공연 상태 · 사진 목록(GET /api/showday) : 15초 동안 기억 → 관객이 몇 명이든 KV 읽기는 15초에 한 번 정도
//     (공연 종료 · 사진 올리기 같은 변경이 있으면 바로 지움. 다른 지역 서버는 최대 15초 늦게 바뀜)
//   - 사진 파일(/photos/…) : 한 번 올린 사진은 안 바뀌므로 계속 기억
import * as showday from '../functions/api/showday.js';
import * as photos from '../functions/api/photos.js';
import * as photoFile from '../functions/photos/[name].js';

const routes = { '/api/showday': showday, '/api/photos': photos };
const notAllowed = () => new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });
const STATE_TTL = 15;   // 초

function pick(mod, method) {
  return mod['onRequest' + method[0] + method.slice(1).toLowerCase()] || mod.onRequest;
}
const edge = () => (typeof caches !== 'undefined' ? caches.default : null);
const stateKey = (url) => new Request(new URL('/api/showday', url).toString());
// 방문자 브라우저에는 계속 '저장하지 마세요'로 (새로고침하면 늘 서버에 물어보게)
function noStore(res, hit) {
  const r = new Response(res.body, res);
  r.headers.set('cache-control', 'no-store');
  r.headers.set('x-edge-cache', hit);
  return r;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    const context = { request, env, params: {}, waitUntil: (p) => ctx.waitUntil(p) };
    const cache = edge();

    if (routes[path]) {
      const fn = pick(routes[path], request.method);
      if (!fn) return notAllowed();
      // 방문자 화면이 부르는 공연 상태 · 사진 목록 : 15초 기억
      if (cache && path === '/api/showday' && request.method === 'GET') {
        const key = stateKey(url);
        const hit = await cache.match(key);
        if (hit) return noStore(hit, 'HIT');
        const res = await fn(context);
        if (res.ok) {
          const keep = new Response(res.clone().body, res);
          keep.headers.set('cache-control', `public, max-age=${STATE_TTL}`);
          ctx.waitUntil(cache.put(key, keep));
        }
        return noStore(res, 'MISS');
      }
      const res = await fn(context);
      // 운영진이 바꾼 것(공연 종료 · 사진 올리기 · 숨기기 등)이 있으면 기억해 둔 답을 바로 지움
      if (cache && request.method === 'POST' && res.ok) ctx.waitUntil(cache.delete(stateKey(url)));
      return res;
    }
    if (path.startsWith('/photos/')) {
      const fn = pick(photoFile, request.method);
      if (!fn) return notAllowed();
      const key = new Request(new URL(path, url).toString());
      if (cache && request.method === 'GET') {
        const hit = await cache.match(key);
        if (hit) return hit;
      }
      context.params = { name: decodeURIComponent(path.slice('/photos/'.length)) };
      const res = await fn(context);
      if (cache && request.method === 'GET' && res.ok) ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    }
    return env.ASSETS.fetch(request);
  },
};

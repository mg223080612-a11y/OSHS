// ===== Cloudflare Worker 입구 =====
// 이 사이트는 Cloudflare "Worker(정적 자산)" 로 배포됩니다. 보통 파일(html·css·js·이미지)은 Cloudflare 가 바로 보내고,
// 아래 두 경로만 이 코드가 처리합니다 (wrangler.jsonc 의 run_worker_first).
//   /api/showday · /api/photos  →  functions/api/*.js   (공연 종료 · 현장 사진)
//   /photos/<id>.jpg            →  functions/photos/[name].js
import * as showday from '../functions/api/showday.js';
import * as photos from '../functions/api/photos.js';
import * as photoFile from '../functions/photos/[name].js';

const routes = { '/api/showday': showday, '/api/photos': photos };
const notAllowed = () => new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });

function pick(mod, method) {
  return mod['onRequest' + method[0] + method.slice(1).toLowerCase()] || mod.onRequest;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    const context = { request, env, params: {}, waitUntil: (p) => ctx.waitUntil(p) };

    if (routes[path]) {
      const fn = pick(routes[path], request.method);
      return fn ? fn(context) : notAllowed();
    }
    if (path.startsWith('/photos/')) {
      const fn = pick(photoFile, request.method);
      if (!fn) return notAllowed();
      context.params = { name: decodeURIComponent(path.slice('/photos/'.length)) };
      return fn(context);
    }
    return env.ASSETS.fetch(request);
  },
};

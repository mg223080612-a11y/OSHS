// ===== 공연 상태 API : GET /api/showday · POST /api/showday =====
// Cloudflare 설정이 필요합니다 (README 의 "공연 종료 버튼 · 현장 사진" 참고)
//   - KV 저장소를 SHOWDAY 라는 이름으로 연결
//   - 관리자 비밀번호 ADMIN_KEY (공연 종료 + 사진), 사진 담당 비밀번호 PHOTO_KEY (사진만) 를 비밀 값(Secret)으로 등록
// GET 은 방문자 화면이 30초마다 부릅니다 : 공연 종료 여부 + 현장 사진 목록을 한 번에 돌려줌

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

async function sameKey(given, expected) {
  if (typeof given !== 'string' || !given || typeof expected !== 'string' || !expected) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, expected].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
async function roleOf(key, env) {
  if (await sameKey(key, env.ADMIN_KEY)) return 'admin';
  if (await sameKey(key, env.PHOTO_KEY)) return 'photo';
  return null;
}

async function readState(env) {
  const v = await env.SHOWDAY.get('state', { type: 'json' });
  return { ended: !!(v && v.ended), at: (v && v.at) || null };
}
// 방문자에게 보내는 사진 수 상한 : 올릴 수 있는 한도(functions/api/photos.js 의 MAX_PHOTOS)와 같게.
// 예전에는 최근에 올린 80장만 보내서, 먼저 올린 무대 뒤 · 리허설 사진이 사진 모음에서 빠졌음
const MAX_PUBLIC = 400;
async function publicPhotos(env) {
  const list = (await env.SHOWDAY.get('photos', { type: 'json' })) || [];
  const shown = list.filter((p) => !p.hidden);
  return {
    photos: shown.slice(-MAX_PUBLIC).map(({ id, w, h, cap, at, taken, kind }) => ({ id, w, h, cap, at, taken, kind })),
    hero: (shown.find((p) => p.hero) || {}).id || null,
  };
}

export async function onRequestGet({ env }) {
  if (!env.SHOWDAY) return json({ error: 'not-configured' }, 503);
  const [state, photos] = await Promise.all([readState(env), publicPhotos(env)]);
  return json({ ...state, ...photos });
}

export async function onRequestPost({ request, env }) {
  if (!env.SHOWDAY || !env.ADMIN_KEY) return json({ error: 'not-configured' }, 503);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad-request' }, 400); }
  const role = await roleOf(body && body.key, env);
  if (!role) return json({ error: 'wrong-key' }, 401);
  if (typeof body.ended !== 'boolean') return json({ ...(await readState(env)), role });   // 비밀번호 확인만
  if (role !== 'admin') return json({ error: 'not-allowed' }, 403);
  const state = { ended: body.ended, at: Date.now() };
  await env.SHOWDAY.put('state', JSON.stringify(state));
  return json({ ...state, role });
}

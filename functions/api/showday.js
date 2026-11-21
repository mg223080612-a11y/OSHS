// ===== 공연 종료 상태 API : GET /api/showday · POST /api/showday =====
// Cloudflare 설정이 필요합니다 (README 의 "공연 종료 버튼" 참고)
//   - KV 저장소를 SHOWDAY 라는 이름으로 연결
//   - 비밀번호를 ADMIN_KEY 라는 이름의 비밀 값(Secret)으로 등록
// 상태는 { ended: true/false, at: 바꾼 시각 } 하나뿐입니다.

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

async function sameKey(given, expected) {
  if (typeof given !== 'string' || !given) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, expected].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function readState(env) {
  const v = await env.SHOWDAY.get('state', { type: 'json' });
  return { ended: !!(v && v.ended), at: (v && v.at) || null };
}

export async function onRequestGet({ env }) {
  if (!env.SHOWDAY) return json({ error: 'not-configured' }, 503);
  return json(await readState(env));
}

export async function onRequestPost({ request, env }) {
  if (!env.SHOWDAY || !env.ADMIN_KEY) return json({ error: 'not-configured' }, 503);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad-request' }, 400); }
  if (!(await sameKey(body && body.key, env.ADMIN_KEY))) return json({ error: 'wrong-key' }, 401);
  if (typeof body.ended !== 'boolean') return json(await readState(env));   // 비밀번호 확인만
  const state = { ended: body.ended, at: Date.now() };
  await env.SHOWDAY.put('state', JSON.stringify(state));
  return json(state);
}

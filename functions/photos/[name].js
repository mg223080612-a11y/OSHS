// ===== 현장 사진 파일 : GET /photos/<id>.jpg (큰 사진) · /photos/<id>-t.jpg (작은 사진) =====
// 한 번 올린 사진은 바뀌지 않으므로 브라우저가 오래 기억하게 함
export async function onRequestGet({ params, env }) {
  const m = /^([a-z0-9]{6,20})(-t)?\.jpg$/.exec(params.name || '');
  if (!m || !env.SHOWDAY) return new Response('Not found', { status: 404 });
  const buf = await env.SHOWDAY.get(`${m[2] ? 'th' : 'img'}:${m[1]}`, { type: 'arrayBuffer', cacheTtl: 86400 });
  if (!buf) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(buf, {
    headers: {
      'content-type': 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}

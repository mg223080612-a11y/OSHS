// ===== 현장 사진 API : POST /api/photos =====
// 사진 올리기 : multipart/form-data — key · full(긴 변 1600px JPEG) · thumb(480px JPEG) · w · h · cap(설명, 선택) · taken(촬영 시각, 선택)
//   · cam(카메라 표시 : 제조사 · 기종 · 일련번호를 섞은 16자리, 선택) · camName(기종 이름, 선택)
//   (사진은 올리는 폰에서 미리 줄이고 위치정보를 지운 뒤 보냄 — js/admin.js)
// 관리 : JSON — { key, action: 'list' | 'hide' | 'show' | 'hero' | 'unhero' | 'delete' | 'kind', id, value }
//   kind : value 'show'(공연) · 'rehearsal'(리허설) · 'auto'(촬영 시각으로 자동)
// 촬영 시각 옮기기 : { key, action: 'shift', ids: [사진 id …], value: 옮길 분(더하기 + · 빼기 −, 24시간 이내), learn: true|false }
//   카메라 시계가 틀린 사진들을 한꺼번에 고칠 때. 되돌리려면 같은 만큼 반대로
//   learn 이면 그 사진들을 찍은 카메라의 시계 차이를 기억 → 같은 카메라로 찍은 사진은 올라올 때 자동으로 고침
//   기억을 지우기 : { key, action: 'forget', id: 카메라 표시 }
// 저장 : KV SHOWDAY 의 img:<id> · th:<id> (사진), photos (목록 하나), cams (카메라별 시계 차이 { 카메라 표시: { name, offset(분), at } })
// 비밀번호 : ADMIN_KEY 또는 PHOTO_KEY

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const MAX_FULL = 4 * 1024 * 1024;
const MAX_THUMB = 700 * 1024;
const MAX_PHOTOS = 400;
const MAX_SHIFT_MIN = 24 * 60;

async function sameKey(given, expected) {
  if (typeof given !== 'string' || !given || typeof expected !== 'string' || !expected) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, expected].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
const allowed = async (key, env) => (await sameKey(key, env.ADMIN_KEY)) || (await sameKey(key, env.PHOTO_KEY));
const isJpeg = (buf) => { const u = new Uint8Array(buf, 0, 3); return u[0] === 0xff && u[1] === 0xd8 && u[2] === 0xff; };
const readList = async (env) => (await env.SHOWDAY.get('photos', { type: 'json', cacheTtl: 30 })) || [];
const saveList = (env, list) => env.SHOWDAY.put('photos', JSON.stringify(list));
const readCams = async (env) => (await env.SHOWDAY.get('cams', { type: 'json' })) || {};
const saveCams = (env, cams) => env.SHOWDAY.put('cams', JSON.stringify(cams));
const camOf = (v) => (typeof v === 'string' && /^[a-f0-9]{16}$/.test(v) ? v : '');
const camNameOf = (v) => String(v || '').replace(/[^\x20-\x7e]/g, '').trim().slice(0, 40);
const DAY = 86400000;

export async function onRequestPost({ request, env }) {
  if (!env.SHOWDAY || !env.ADMIN_KEY) return json({ error: 'not-configured' }, 503);
  const type = request.headers.get('content-type') || '';

  // --- 사진 올리기 ---
  if (type.startsWith('multipart/form-data')) {
    let form;
    try { form = await request.formData(); } catch (e) { return json({ error: 'bad-request' }, 400); }
    if (!(await allowed(form.get('key'), env))) return json({ error: 'wrong-key' }, 401);
    const full = form.get('full'), thumb = form.get('thumb');
    if (!full || !thumb || typeof full === 'string' || typeof thumb === 'string') return json({ error: 'no-photo' }, 400);
    if (full.size > MAX_FULL || thumb.size > MAX_THUMB) return json({ error: 'too-big' }, 413);
    const [fullBuf, thumbBuf] = await Promise.all([full.arrayBuffer(), thumb.arrayBuffer()]);
    if (!isJpeg(fullBuf) || !isJpeg(thumbBuf)) return json({ error: 'not-jpeg' }, 415);
    const list = await readList(env);
    if (list.length >= MAX_PHOTOS) return json({ error: 'full' }, 409);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    // 촬영 시각 : 폰이 사진 파일에서 읽어 보낸 값. 60일 전 ~ 하루 뒤 사이만 믿음
    // (카메라 시계가 앞서 있으면 '미래'로 찍혀 오므로 하루 뒤까지는 그대로 받아 둠 → 관리 페이지에서 보고 고칠 수 있게)
    const taken = Number(form.get('taken'));
    const takenOk = Number.isFinite(taken) && taken > Date.now() - 60 * DAY && taken < Date.now() + DAY;
    const meta = {
      id,
      w: Math.max(1, Math.min(4000, Number(form.get('w')) || 1600)),
      h: Math.max(1, Math.min(4000, Number(form.get('h')) || 1067)),
      cap: String(form.get('cap') || '').trim().slice(0, 60),
      at: Date.now(),
    };
    if (takenOk) meta.taken = taken;
    // 카메라 : 시계 차이를 기억해 둔 카메라면 촬영 시각을 자동으로 고침 (adj = 고친 분)
    const cam = camOf(form.get('cam'));
    if (cam) {
      meta.cam = cam;
      const name = camNameOf(form.get('camName'));
      if (name) meta.camName = name;
      const known = (await readCams(env))[cam];
      if (known && meta.taken && known.offset) { meta.taken += known.offset * 60000; meta.adj = known.offset; }
    }
    await Promise.all([env.SHOWDAY.put(`img:${id}`, fullBuf), env.SHOWDAY.put(`th:${id}`, thumbBuf)]);
    // 목록은 가장 최신을 다시 읽어서 추가 (동시에 두 장이 올라와도 덜 겹치게)
    const fresh = await env.SHOWDAY.get('photos', { type: 'json' }) || [];
    fresh.push(meta);
    await saveList(env, fresh);
    return json({ ok: true, photo: meta });
  }

  // --- 목록 · 숨기기 · 대표 · 삭제 ---
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad-request' }, 400); }
  if (!(await allowed(body && body.key, env))) return json({ error: 'wrong-key' }, 401);
  const list = await env.SHOWDAY.get('photos', { type: 'json' }) || [];
  if (body.action === 'list') return json({ photos: list, cams: await readCams(env) });
  if (body.action === 'shift') {
    const minutes = Number(body.value);
    const ids = new Set(Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string').slice(0, MAX_PHOTOS) : []);
    if (!Number.isInteger(minutes) || minutes === 0 || Math.abs(minutes) > MAX_SHIFT_MIN || !ids.size) return json({ error: 'bad-request' }, 400);
    const hit = list.filter((x) => ids.has(x.id));
    if (!hit.length) return json({ error: 'not-found' }, 404);
    // 시계 차이를 배울 카메라 : 사진 속 촬영 시각이 있던 사진의 카메라만 (올린 시각으로 대신한 사진은 카메라 시계와 상관없음)
    const learnCams = new Map();
    if (body.learn === true) hit.forEach((x) => { if (x.cam && x.taken) learnCams.set(x.cam, x.camName || ''); });
    hit.forEach((x) => { x.taken = (x.taken || x.at) + minutes * 60000; });   // 촬영 시각이 없던 사진은 올린 시각에서
    await saveList(env, list);
    const cams = await readCams(env);
    if (learnCams.size) {
      learnCams.forEach((name, cam) => {
        const offset = ((cams[cam] && cams[cam].offset) || 0) + minutes;   // 카메라마다 한 번만 더함
        if (offset && Math.abs(offset) <= MAX_SHIFT_MIN) cams[cam] = { name: name || (cams[cam] && cams[cam].name) || '', offset, at: Date.now() };
        else delete cams[cam];
      });
      await saveCams(env, cams);
    }
    return json({ photos: list, shifted: hit.length, cams });
  }
  if (body.action === 'forget') {
    const cams = await readCams(env);
    if (!camOf(body.id) || !cams[body.id]) return json({ error: 'not-found' }, 404);
    delete cams[body.id];
    await saveCams(env, cams);
    return json({ photos: list, cams });
  }
  const p = list.find((x) => x.id === body.id);
  if (!p) return json({ error: 'not-found' }, 404);
  if (body.action === 'hide') p.hidden = true;
  else if (body.action === 'show') delete p.hidden;
  else if (body.action === 'hero') { list.forEach((x) => delete x.hero); p.hero = true; delete p.hidden; }
  else if (body.action === 'unhero') delete p.hero;
  else if (body.action === 'kind') {
    if (body.value === 'show' || body.value === 'rehearsal') p.kind = body.value;
    else delete p.kind;
  }
  else if (body.action === 'delete') {
    list.splice(list.indexOf(p), 1);
    await Promise.all([env.SHOWDAY.delete(`img:${p.id}`), env.SHOWDAY.delete(`th:${p.id}`)]);
  } else return json({ error: 'bad-action' }, 400);
  await saveList(env, list);
  return json({ photos: list });
}

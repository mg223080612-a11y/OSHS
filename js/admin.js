// ===== 공연 관리 (admin.html) =====
// 비밀번호 확인 → 현장 사진 올리기 · 관리 / (관리자만) 공연 종료 · 되돌리기
// 서버 쪽은 functions/api/showday.js · functions/api/photos.js. 비밀번호는 이 탭을 닫으면 잊어버립니다 (sessionStorage).
(() => {
  const SHOW_START = Date.parse('2026-11-21T17:00:00+09:00');   // js/showday.js 와 같은 시각
  const HOLD_MS = 1500;
  const FULL_PX = 1600, FULL_Q = 0.82, THUMB_PX = 480, THUMB_Q = 0.75;
  const $ = (s, el = document) => el.querySelector(s);
  const login = $('.ad-login'), msg = $('.ad-msg'), tabs = $('.ad-tabs');
  const panels = { photos: $('#panel-photos'), show: $('#panel-show') };
  const endBtn = $('[data-end]'), undoBtn = $('[data-undo]');
  let key = '', role = null, current = 'photos';
  try { key = sessionStorage.getItem('sd-admin') || ''; } catch (e) { /* 저장이 막혀 있으면 매번 입력 */ }

  async function call(url, body) {
    const res = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || res.status), { status: res.status, code: data.error });
    return data;
  }
  const hhmm = (t) => new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });

  // ---------- 들어가기 · 탭 ----------
  function enter(r) {
    role = r;
    login.hidden = true;
    $('[data-logout]').hidden = false;
    tabs.hidden = role !== 'admin';
    select('photos');
    loadList();
    refreshShow();
  }
  function select(name) {
    current = name;
    Object.entries(panels).forEach(([n, p]) => { p.hidden = n !== name; });
    tabs.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute('aria-selected', String(t.getAttribute('aria-controls') === `panel-${name}`)));
  }
  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) select(t.getAttribute('aria-controls').replace('panel-', ''));
  });
  // 들어가기 : 양식 전송이 막힌 환경(앱 안 미리보기 등)에서도 되도록 버튼 · Enter 를 직접 처리
  login.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
  $('button', login).addEventListener('click', (e) => { e.preventDefault(); doLogin(); });
  $('#ad-key').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); doLogin(); } });
  let loggingIn = false;
  async function doLogin() {
    if (loggingIn) return;
    loggingIn = true;
    msg.textContent = '';
    const k = $('#ad-key').value.trim();   // 앞뒤 공백은 무시
    try {
      const data = await call('/api/showday', { key: k });
      key = k;
      try { sessionStorage.setItem('sd-admin', k); } catch (err) { /* 무시 */ }
      enter(data.role);
    } catch (err) {
      msg.textContent = err.status === 401 ? '비밀번호가 맞지 않아요.' : err.code === 'not-configured' ? 'Cloudflare 설정(KV · 비밀번호)이 아직 안 돼 있어요.' : '연결이 안 돼요. 잠시 뒤 다시 해 주세요.';
    } finally {
      loggingIn = false;
    }
  }
  function logout(note) {
    key = ''; role = null;
    try { sessionStorage.removeItem('sd-admin'); } catch (e) { /* 무시 */ }
    Object.values(panels).forEach((p) => { p.hidden = true; });
    tabs.hidden = true;
    $('[data-logout]').hidden = true;
    login.hidden = false;
    $('#ad-key').value = '';
    msg.textContent = note || '';
  }
  $('[data-logout]').addEventListener('click', () => logout());

  // ---------- 현장 사진 : 고르기 → 줄이기 → 올리기 ----------
  const queueEl = $('.ad-queue');
  const queue = [];
  let working = false;

  // 사진을 긴 변 max px 의 JPEG 로 다시 그림 (회전 정보 반영 · 위치정보 등은 남지 않음)
  async function decode(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { /* 아래 방법으로 */ }
    const url = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  }
  function draw(src, max) {
    const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
    const s = Math.min(1, max / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.round(w0 * s); c.height = Math.round(h0 * s);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  const toBlob = (c, q) => new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error('encode'))), 'image/jpeg', q));

  // 사진 파일 안의 촬영 시각(EXIF DateTimeOriginal)만 읽음. 없거나 못 읽으면 null → 서버는 올린 시각을 씀
  // (위치정보 등 나머지 정보는 다시 그리면서 모두 사라짐)
  async function shotTime(file) {
    try {
      const v = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
      if (v.getUint16(0) !== 0xffd8) return null;
      let o = 2;
      while (o + 4 < v.byteLength) {
        const marker = v.getUint16(o), size = v.getUint16(o + 2);
        if (marker === 0xffe1 && v.getUint32(o + 4) === 0x45786966) return readExif(v, o + 10);
        if ((marker & 0xff00) !== 0xff00) return null;
        o += 2 + size;
      }
    } catch (e) { /* 읽을 수 없는 형식 */ }
    return null;
  }
  function readExif(v, t) {
    const le = v.getUint16(t) === 0x4949;
    const u16 = (p) => v.getUint16(t + p, le), u32 = (p) => v.getUint32(t + p, le);
    const str = (p, n) => { let r = ''; for (let i = 0; i < n; i++) { const c = v.getUint8(t + p + i); if (!c) break; r += String.fromCharCode(c); } return r; };
    const tags = (ifd) => { const out = {}; const n = u16(ifd); for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; out[u16(e)] = { count: u32(e + 4), at: e + 8 }; } return out; };
    const ascii = (tag) => (tag ? str(tag.count > 4 ? u32(tag.at) : tag.at, tag.count) : '');
    const ifd0 = tags(u32(4));
    const exif = ifd0[0x8769] ? tags(u32(ifd0[0x8769].at)) : {};
    const when = ascii(exif[0x9003]) || ascii(ifd0[0x0132]);   // 촬영 시각, 없으면 수정 시각
    const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(when);
    if (!m) return null;
    const zone = /^[+-]\d{2}:\d{2}$/.test(ascii(exif[0x9011])) ? ascii(exif[0x9011]) : '+09:00';   // 시간대가 없으면 한국 시간
    const ms = Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${zone}`);
    return Number.isFinite(ms) && ms > Date.now() - 3 * 86400000 && ms < Date.now() + 10 * 60000 ? ms : null;
  }

  function paintItem(item) {
    const text = { shrink: '줄이는 중…', wait: '기다리는 중', up: `올리는 중 ${item.pct || 0}%`, done: '올렸어요', fail: item.err || '못 올렸어요' }[item.state];
    item.el.className = `ad-q is-${item.state}`;
    $('.ad-q-state', item.el).textContent = text;
    $('.ad-q-bar', item.el).style.setProperty('--p', item.state === 'done' ? 1 : (item.pct || 0) / 100);
    $('.ad-q-retry', item.el).hidden = item.state !== 'fail';
  }
  function addFiles(files) {
    const cap = $('#ad-cap').value.trim();
    [...files].forEach((file) => {
      const el = document.createElement('li');
      el.innerHTML = '<span class="ad-q-thumb"></span><span class="ad-q-body"><span class="ad-q-state"></span><span class="ad-q-cap"></span><span class="ad-q-bar"></span></span><button type="button" class="ad-q-retry" hidden>다시</button>';
      $('.ad-q-cap', el).textContent = cap;
      const item = { file, cap, el, state: 'shrink', tries: 0 };
      $('.ad-q-retry', el).addEventListener('click', () => { item.tries = 0; item.state = 'wait'; paintItem(item); queue.push(item); work(); });
      queueEl.prepend(el);
      paintItem(item);
      queue.push(item);
    });
    $('#ad-cap').value = '';   // 설명은 이번에 고른 사진에만
    work();
  }
  document.querySelectorAll('[data-pick]').forEach((input) => input.addEventListener('change', () => {
    if (input.files.length) addFiles(input.files);
    input.value = '';
  }));

  function send(item) {
    return new Promise((ok, no) => {
      const fd = new FormData();
      fd.append('key', key);
      fd.append('w', item.w); fd.append('h', item.h);
      fd.append('cap', item.cap);
      if (item.taken) fd.append('taken', item.taken);
      fd.append('full', item.full, 'full.jpg');
      fd.append('thumb', item.thumb, 'thumb.jpg');
      const x = new XMLHttpRequest();
      x.open('POST', '/api/photos');
      x.timeout = 60000;
      x.upload.onprogress = (e) => { if (e.lengthComputable) { item.pct = Math.round((e.loaded / e.total) * 100); paintItem(item); } };
      x.onload = () => {
        let data = {};
        try { data = JSON.parse(x.responseText); } catch (e) { /* 무시 */ }
        if (x.status >= 200 && x.status < 300) ok(data); else no(Object.assign(new Error(data.error || x.status), { status: x.status, code: data.error }));
      };
      x.onerror = x.ontimeout = () => no(new Error('network'));
      x.send(fd);
    });
  }
  async function work() {
    if (working) return;
    working = true;
    while (queue.length) {
      const item = queue.shift();
      try {
        if (!item.full) {
          item.state = 'shrink'; paintItem(item);
          item.taken = await shotTime(item.file);
          const src = await decode(item.file);
          const big = draw(src, FULL_PX), small = draw(src, THUMB_PX);
          if (src.close) src.close();
          [item.full, item.thumb] = await Promise.all([toBlob(big, FULL_Q), toBlob(small, THUMB_Q)]);
          item.w = big.width; item.h = big.height;
          const prev = document.createElement('img');
          prev.alt = '';
          prev.src = draw(small, 120).toDataURL('image/jpeg', 0.7);
          $('.ad-q-thumb', item.el).replaceChildren(prev);
        }
        item.state = 'up'; item.pct = 0; paintItem(item);
        await send(item);
        item.state = 'done'; paintItem(item);
        loadList();
        setTimeout(() => item.el.remove(), 4000);
      } catch (err) {
        if (err.status === 401) { logout('비밀번호가 바뀌었어요. 다시 들어와 주세요.'); working = false; return; }
        if (!item.full) { item.state = 'fail'; item.err = '이 사진 형식은 올릴 수 없어요'; paintItem(item); continue; }
        item.tries += 1;
        if (item.tries < 3 && !err.status) {   // 인터넷이 잠깐 끊긴 경우 : 조금 뒤 자동으로 다시
          item.state = 'wait'; paintItem(item);
          await new Promise((r) => setTimeout(r, 2500 * item.tries));
          queue.unshift(item);
          continue;
        }
        item.state = 'fail';
        item.err = err.code === 'too-big' ? '사진이 너무 커요' : err.code === 'full' ? '사진 칸이 다 찼어요' : '못 올렸어요 · 다시 눌러 주세요';
        paintItem(item);
      }
    }
    working = false;
  }

  // ---------- 올린 사진 목록 : 대표 · 숨기기 · 삭제 ----------
  const grid = $('[data-grid]');
  async function loadList() {
    try { renderList((await call('/api/photos', { key, action: 'list' })).photos); } catch (e) { /* 다음에 다시 */ }
  }
  // 공연 / 리허설 : 직접 고른 게 있으면 그대로, 아니면 촬영 시각(없으면 올린 시각)이 17:00 이후인지로 (js/showday.js 와 같은 규칙)
  const kindOf = (p) => p.kind || ((p.taken || p.at) >= SHOW_START ? 'show' : 'rehearsal');
  function renderList(list) {
    const items = [...list].reverse();
    $('[data-count]').textContent = items.length ? `${items.length}장` : '';
    $('[data-empty]').hidden = items.length > 0;
    grid.replaceChildren(...items.map((p) => {
      const li = document.createElement('li');
      const kind = kindOf(p);
      li.className = `ad-ph${p.hidden ? ' is-hidden' : ''}${p.hero ? ' is-hero' : ''}`;
      li.dataset.id = p.id;
      li.innerHTML = `<img src="/photos/${p.id}-t.jpg" alt="" loading="lazy" width="${p.w}" height="${p.h}" />
        <span class="ad-ph-meta"><b>${hhmm(p.taken || p.at)}<small>${p.taken ? ' 촬영' : ' 올림'}</small></b><span class="ad-ph-cap"></span></span>
        <span class="ad-ph-tags"><i class="t-kind t-${kind}">${kind === 'show' ? '공연' : '리허설'}${p.kind ? '' : ' · 자동'}</i>${p.hero ? '<i class="t-hero">대표</i>' : ''}${p.hidden ? '<i class="t-hidden">숨김</i>' : ''}</span>
        <span class="ad-ph-acts">
          <button type="button" data-act="kind" data-value="${kind === 'show' ? 'rehearsal' : 'show'}">${kind === 'show' ? '리허설로' : '공연으로'}</button>
          <button type="button" data-act="${p.hero ? 'unhero' : 'hero'}">${p.hero ? '대표 해제' : '대표로'}</button>
          <button type="button" data-act="${p.hidden ? 'show' : 'hide'}">${p.hidden ? '보이기' : '숨기기'}</button>
          <button type="button" data-act="delete" class="danger">삭제</button>
        </span>`;
      $('.ad-ph-cap', li).textContent = p.cap || '';
      return li;
    }));
  }
  grid.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('[data-id]').dataset.id;
    const act = b.dataset.act;
    if (act === 'delete' && !confirm('이 사진을 지울까요? 홈 화면에서도 사라져요.')) return;
    b.disabled = true;
    try { renderList((await call('/api/photos', { key, action: act, id, value: b.dataset.value })).photos); }
    catch (err) { b.disabled = false; if (err.status === 401) logout('비밀번호가 바뀌었어요. 다시 들어와 주세요.'); }
  });

  // ---------- 공연 종료 (관리자만) ----------
  function showState(state) {
    const phase = Date.now() < SHOW_START ? 'before' : state.ended ? 'after' : 'onair';
    panels.show.dataset.state = phase;
    $('[data-now]').textContent = { before: '공연 전', onair: '공연 중 (ON AIR)', after: '공연 종료 · THE END' }[phase];
    let sub = '';
    if (phase === 'before') sub = state.ended
      ? '종료가 눌려 있지만, 17:00 전이라 방문자에게는 아직 공연 전 화면이 보여요. 테스트였다면 되돌리기를 눌러 주세요.'
      : '17:00이 되면 방문자 화면이 자동으로 ON AIR 로 바뀌어요.';
    if (phase === 'after') sub = `${hhmm(state.at)}에 종료했어요. 방문자 화면은 1~2분 안에 모두 바뀌어요.`;
    $('[data-sub]').textContent = sub;
    endBtn.disabled = !!state.ended;
    undoBtn.hidden = !state.ended;
  }
  async function refreshShow() {
    if (role !== 'admin') return;
    try { showState(await call('/api/showday')); }
    catch (e) { $('[data-now]').textContent = '상태를 불러오지 못했어요'; $('[data-sub]').textContent = '인터넷 연결을 확인하고 새로고침해 주세요.'; }
  }
  async function setEnded(ended) {
    try { showState(await call('/api/showday', { key, ended })); }
    catch (err) {
      if (err.status === 401) { logout('비밀번호가 바뀌었어요. 다시 들어와 주세요.'); return; }
      $('[data-sub]').textContent = '저장하지 못했어요. 다시 눌러 주세요.';
    }
  }
  let start = 0, raf = 0;
  const reset = () => { cancelAnimationFrame(raf); start = 0; endBtn.classList.remove('is-holding'); endBtn.style.setProperty('--p', 0); };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / HOLD_MS);
    endBtn.style.setProperty('--p', p);
    if (p >= 1) { reset(); setEnded(true); return; }
    raf = requestAnimationFrame(tick);
  };
  const begin = () => { start = performance.now(); endBtn.classList.add('is-holding'); raf = requestAnimationFrame(tick); };
  endBtn.addEventListener('pointerdown', (e) => { if (endBtn.disabled) return; endBtn.setPointerCapture(e.pointerId); begin(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => endBtn.addEventListener(t, () => { if (start) reset(); }));
  endBtn.addEventListener('contextmenu', (e) => e.preventDefault());
  endBtn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !endBtn.disabled) { e.preventDefault(); begin(); } });
  endBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') reset(); });
  undoBtn.addEventListener('click', () => { if (confirm('다시 공연 중 화면으로 되돌릴까요?')) setEnded(false); });

  if (key) call('/api/showday', { key }).then((d) => enter(d.role)).catch(() => logout());
  setInterval(() => { if (role && !document.hidden) { refreshShow(); if (current === 'photos' && !working) loadList(); } }, 15000);
})();

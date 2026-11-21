// ===== 공연 관리 (admin.html) =====
// 비밀번호 확인 → 지금 상태 표시 → '공연 종료'(1.5초 꾹) / '되돌리기'
// 서버 쪽은 functions/api/showday.js. 비밀번호는 이 탭을 닫으면 잊어버립니다 (sessionStorage).
(() => {
  const API = '/api/showday';
  const SHOW_START = Date.parse('2026-11-21T17:00:00+09:00');   // js/showday.js 와 같은 시각
  const HOLD_MS = 1500;
  const $ = (s) => document.querySelector(s);
  const login = $('.ad-login'), panel = $('.ad-panel'), msg = $('.ad-msg');
  const endBtn = $('[data-end]'), undoBtn = $('[data-undo]');
  let key = '';
  try { key = sessionStorage.getItem('sd-admin') || ''; } catch (e) { /* 저장이 막혀 있으면 매번 입력 */ }

  async function call(body) {
    const res = await fetch(API, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || res.status), { status: res.status, code: data.error });
    return data;
  }
  const time = (t) => new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' });

  function show(state) {
    const now = Date.now();
    const phase = now < SHOW_START ? 'before' : state.ended ? 'after' : 'onair';
    panel.dataset.state = phase;
    $('[data-now]').textContent = { before: '공연 전', onair: '공연 중 (ON AIR)', after: '공연 종료 · THE END' }[phase];
    let sub = '';
    if (phase === 'before') sub = state.ended
      ? '종료가 눌려 있지만, 17:00 전이라 방문자에게는 아직 공연 전 화면이 보여요. 테스트였다면 되돌리기를 눌러 주세요.'
      : '17:00이 되면 방문자 화면이 자동으로 ON AIR 로 바뀌어요.';
    if (phase === 'after') sub = `${time(state.at)}에 종료했어요. 방문자 화면은 1~2분 안에 모두 바뀌어요.`;
    $('[data-sub]').textContent = sub;
    endBtn.disabled = !!state.ended;
    undoBtn.hidden = !state.ended;
  }

  function enter() {
    login.hidden = true;
    panel.hidden = false;
    refresh();
  }
  async function refresh() {
    try { show(await call()); } catch (e) { $('[data-now]').textContent = '상태를 불러오지 못했어요'; $('[data-sub]').textContent = e.code === 'not-configured' ? 'Cloudflare 설정(KV · 비밀번호)이 아직 안 돼 있어요.' : '인터넷 연결을 확인하고 새로고침해 주세요.'; }
  }

  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const k = $('#ad-key').value;
    try {
      await call({ key: k });
      key = k;
      try { sessionStorage.setItem('sd-admin', k); } catch (err) { /* 무시 */ }
      enter();
    } catch (err) {
      msg.textContent = err.status === 401 ? '비밀번호가 맞지 않아요.' : err.code === 'not-configured' ? 'Cloudflare 설정(KV · 비밀번호)이 아직 안 돼 있어요.' : '연결이 안 돼요. 잠시 뒤 다시 해 주세요.';
    }
  });

  async function setEnded(ended) {
    try { show(await call({ key, ended })); }
    catch (err) {
      if (err.status === 401) { logout(); msg.textContent = '비밀번호가 바뀌었어요. 다시 들어와 주세요.'; return; }
      $('[data-sub]').textContent = '저장하지 못했어요. 다시 눌러 주세요.';
    }
  }

  // 1.5초 꾹 누르기
  let start = 0, raf = 0;
  const reset = () => { cancelAnimationFrame(raf); start = 0; endBtn.classList.remove('is-holding'); endBtn.style.setProperty('--p', 0); };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / HOLD_MS);
    endBtn.style.setProperty('--p', p);
    if (p >= 1) { reset(); setEnded(true); return; }
    raf = requestAnimationFrame(tick);
  };
  endBtn.addEventListener('pointerdown', (e) => {
    if (endBtn.disabled) return;
    endBtn.setPointerCapture(e.pointerId);
    start = performance.now();
    endBtn.classList.add('is-holding');
    raf = requestAnimationFrame(tick);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => endBtn.addEventListener(t, () => { if (start) reset(); }));
  endBtn.addEventListener('contextmenu', (e) => e.preventDefault());
  // 키보드 : Enter · Space 를 누른 채로 1.5초
  endBtn.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !endBtn.disabled) { e.preventDefault(); start = performance.now(); endBtn.classList.add('is-holding'); raf = requestAnimationFrame(tick); }
  });
  endBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') reset(); });

  undoBtn.addEventListener('click', () => { if (confirm('다시 공연 중 화면으로 되돌릴까요?')) setEnded(false); });

  function logout() {
    key = '';
    try { sessionStorage.removeItem('sd-admin'); } catch (e) { /* 무시 */ }
    panel.hidden = true;
    login.hidden = false;
    $('#ad-key').value = '';
  }
  $('[data-logout]').addEventListener('click', logout);

  if (key) call({ key }).then(enter).catch(logout);
  setInterval(() => { if (!panel.hidden && !document.hidden) refresh(); }, 15000);
})();

// ===== 공연 당일 Home : 공연 전 → 공연 중(ON AIR) → 공연 후(THE END 커튼 · History · 엔딩 크레딧) =====
// 공연 후 커튼의 그림과 움직임은 js/curtain.js (이 파일보다 먼저 불러와야 함)
// 공연 중 → 공연 후 는 운영진이 admin.html 에서 '공연 종료'를 누르면 바뀝니다 (functions/api/showday.js).
//   - 17:00 전에는 종료가 눌려 있어도 공연 전 화면 그대로
//   - 관리자 기능(Cloudflare 설정)이 아직 없으면 FALLBACK_END 시각에 자동으로
//   - 아무도 안 눌러도 HARD_END(다음 날 0시)가 지나면 공연 후
// 주소 끝에 ?preview=onair 또는 ?preview=after 를 붙이면 그 화면을 미리 볼 수 있습니다.
(() => {
  const SHOW_START = Date.parse('2026-11-21T17:00:00+09:00');
  const FALLBACK_END = Date.parse('2026-11-21T19:30:00+09:00');   // 관리자 기능이 설정되지 않았을 때만 쓰는 예비 시각
  const HARD_END = Date.parse('2026-11-22T00:00:00+09:00');
  const PHOTOS_FROM = Date.parse('2026-11-21T00:00:00+09:00');   // 이때부터 현장 사진을 확인 (공연 전 '지금 무대 뒤')
  const API = '/api/showday';
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petals = (...a) => window.throwPetals?.(...a);
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* 막혀 있으면 매번 커튼부터 */ } },
  };

  // ---------- 지금이 어느 때인지 ----------
  const params = new URLSearchParams(location.search);
  const asked = params.get('preview');
  let preview = ['before', 'onair', 'after'].includes(asked) ? asked : null;
  let previewStart = Date.now() - 42 * 60 * 1000;   // 미리보기에서는 막이 오른 지 42분째로
  // 운영진이 누른 '공연 종료' 상태. api: 'unknown'(아직 못 물어봄) · 'ok' · 'none'(관리자 기능 없음)
  const server = { api: 'unknown', ended: false, photos: [], hero: null };
  async function checkServer() {
    try {
      const res = await fetch(API, { cache: 'no-store' });
      const isJson = (res.headers.get('content-type') || '').includes('json');
      if (res.ok && isJson) {
        const data = await res.json();
        server.api = 'ok';
        server.ended = !!data.ended;
        server.photos = Array.isArray(data.photos) ? data.photos : [];
        server.hero = data.hero || null;
        renderPhotos();
        // 다음에 열 때 js/phase-early.js 가 바로 쓰도록 기억
        // (대표 사진도 기억 → 새로고침했을 때 기본 사진이 떴다가 바뀌지 않게)
        const heroPhoto = server.photos.find((p) => p.id === server.hero);
        const hero = heroPhoto ? { id: heroPhoto.id, w: heroPhoto.w, h: heroPhoto.h, cap: heroPhoto.cap || '' } : null;
        try { localStorage.setItem('oshs-showday', JSON.stringify({ ended: server.ended, photos: server.photos.length, hero })); } catch (e) { /* 막혀 있으면 생략 */ }
      } else if (res.ok) {
        server.api = 'none';   // API 대신 일반 페이지가 돌아옴 = 관리자 기능이 배포되지 않음
      } else if (res.status === 404 || res.status === 503 || res.status === 405) {
        server.api = 'none';
      }
    } catch (e) { /* 잠깐 끊긴 것은 무시하고 지난 상태 유지 */ }
    if (server.api !== 'ok') paintHeroIfEmpty();   // 사진 목록을 못 받았으면 단체 사진 자리에 기본 사진이라도
  }
  function phaseAt(t) {
    if (t < SHOW_START) return 'before';
    if (t >= HARD_END) return 'after';
    if (server.api === 'ok') return server.ended ? 'after' : 'onair';
    if (server.api === 'none') return t < FALLBACK_END ? 'onair' : 'after';
    return 'onair';
  }
  // 공연 다음 날부터 : '오늘'이 들어간 문구를 data-after-day 에 적어 둔 글로 바꿈 (비어 있으면 그 말만 뺌)
  // 미리 보려면 주소 끝에 ?preview=after&day=later
  const forcedLater = !!preview && params.get('day') === 'later';
  function applyAfterDay(root) {
    if (Date.now() < HARD_END && !forcedLater) return;
    root.querySelectorAll('[data-after-day]').forEach((e) => { e.textContent = e.dataset.afterDay; delete e.dataset.afterDay; });
  }
  let phaseTimer, pollTimer, applied = false;
  function applyPhase() {
    clearTimeout(phaseTimer);
    applyAfterDay(document);
    const phase = preview || phaseAt(Date.now());
    // 처음 한 번은 꼭 (js/phase-early.js 가 미리 정해 둔 화면이어도 시계 · 사진을 시작해야 함)
    if (!applied || body.dataset.phase !== phase) {
      applied = true;
      body.dataset.phase = phase;
      onPhase(phase);
      renderPhotos();   // 공연 전 ↔ 공연 중 : 사진 칸 문구 · 순서가 달라짐
    }
    if (preview) { schedulePoll(); return; }
    const now = Date.now();
    const edges = [SHOW_START, HARD_END, server.api === 'none' ? FALLBACK_END : 0].filter((t) => t > now);
    if (edges.length) phaseTimer = setTimeout(applyPhase, Math.min(Math.min(...edges) - now + 50, 2147483647));
    schedulePoll();
  }
  // 공연 중에는 30초마다, 그 밖의 공연 날에는 1분마다 상태 · 새 사진 확인. 화면이 꺼져 있을 때는 쉼
  function schedulePoll() {
    clearTimeout(pollTimer);
    const now = Date.now();
    if (server.api === 'none' || now >= HARD_END || (!preview && now < PHOTOS_FROM)) return;
    const wait = (body.dataset.phase === 'onair' || preview ? 30000 : 60000) + Math.random() * 5000;
    pollTimer = setTimeout(async () => {
      if (!document.hidden) { await checkServer(); applyPhase(); } else schedulePoll();
    }, wait);
  }

  // ---------- 공연 중 : 막이 오른 뒤 지난 시간 ----------
  const elapsedEl = document.querySelector('[data-elapsed]');
  const pad = (n) => String(n).padStart(2, '0');
  let elapsedTimer;
  function tickElapsed() {
    const s = Math.max(0, Math.floor((Date.now() - (preview ? previewStart : SHOW_START)) / 1000));
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    elapsedEl.textContent = h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
  }

  // ---------- 공연 전 : 막이 오르기까지 남은 시간 (DAYS · HOURS · MINUTES · SECONDS 네 칸) ----------
  // 미리보기(?preview=before)에서는 5시간 12분 남은 것처럼
  const countBoxes = [...document.querySelectorAll('[data-countdown]')].map((box) => {
    const cells = {};
    box.querySelectorAll('[data-unit]').forEach((e) => { cells[e.dataset.unit] = e; });
    return cells;
  });
  let previewCdTarget = Date.now() + (5 * 3600 + 12 * 60 + 43) * 1000;
  function tickCount() {
    const s = Math.max(0, Math.floor(((preview ? previewCdTarget : SHOW_START) - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    countBoxes.forEach((cells) => { for (const k in v) if (cells[k]) cells[k].textContent = pad(v[k]); });
  }
  if (countBoxes.length) { tickCount(); setInterval(() => { if (body.dataset.phase === 'before') tickCount(); }, 1000); }

  // ---------- 공연 후 : THE END 커튼 + History ----------
  // 막 그림과 움직임은 js/curtain.js (WebGL). 못 쓰는 기기는 css/showday.css 의 단순 커튼(.no-gl)
  const curtain = document.querySelector('.sd-curtain');
  const heroInner = document.querySelector('.hero-inner');
  const title = document.querySelector('.hero-script');
  const tassel = curtain.querySelector('.sd-tassel');
  const cloth = window.createStageCurtain?.(curtain.querySelector('.sd-cloth'), {
    reduce,
    onProgress: (open) => curtain.style.setProperty('--sd-open', open.toFixed(3)),   // 막을 밀수록 가운데 글이 흐려짐
    // 막이 다 열린 뒤 한 박자 쉬고 제목이 History 로 바뀌기 시작
    onArrive: (open) => { if (open && curtain.classList.contains('is-open') && !title.classList.contains('is-history')) becomeHistory(HISTORY_BEAT_MS); },
    // 브라우저가 그리기 기능을 거둬 가면 단순 커튼으로, 되찾으면 다시 실사 커튼으로
    onLost: () => curtain.classList.replace('has-gl', 'no-gl'),
    onRestored: () => curtain.classList.replace('no-gl', 'has-gl'),
  }) || null;
  curtain.classList.add(cloth ? 'has-gl' : 'no-gl');
  // 가운데 글 · 당김 줄 누르는 자리를 막 그림에 맞춤
  function placeCurtain() {
    if (!cloth) return;
    cloth.refresh();
    const g = cloth.geometry();
    if (!g) return;
    curtain.classList.toggle('no-tassel', !g.tassel);
    curtain.style.setProperty('--sd-center', `${g.centerY}px`);
    curtain.style.setProperty('--sd-tx', `${g.tasselX}px`);
    curtain.style.setProperty('--sd-ty', `${g.tasselY}px`);
  }
  window.addEventListener('resize', placeCurtain);
  // His Story → History : 막이 다 열린 뒤에 시작 (바뀌는 속도는 css/showday.css 의 '공연 후 : His Story → History')
  const HISTORY_BEAT_MS = 500;        // 막이 다 열린 뒤 쉬는 시간
  const HISTORY_NO_GL_MS = 2700;      // 단순 커튼(2.2초에 열림)일 때
  const HISTORY_FALLBACK_MS = 4500;   // 막이 다 열렸다는 신호가 안 올 때를 위한 예비 시각
  let historyTimer;
  function becomeHistory(delay) {
    clearTimeout(historyTimer);
    const change = () => {
      title.classList.add('is-history');
      title.setAttribute('aria-label', 'Our Story, His Story — History');
    };
    if (delay > 0) historyTimer = setTimeout(change, delay); else change();
  }
  // 막이 열렸는지에 따라 : 첫 화면 높이(body.sd-opened) · 닫혀 있는 동안 막 뒤 내용에 키보드 · 낭독기가 닿지 않게(inert)
  function setOpened(open) {
    curtain.classList.toggle('is-open', open);
    curtain.setAttribute('aria-hidden', String(open));
    body.classList.toggle('sd-opened', open);
    heroInner.inert = !open && body.dataset.phase === 'after';
  }
  // instant : 이미 연 적이 있어 바로 열린 화면으로 / dragged : 손으로 밀던 자리에서 이어서 열림
  function openCurtain({ instant = false, dragged = false } = {}) {
    if (curtain.classList.contains('is-open')) return;
    const hadFocus = document.activeElement && curtain.contains(document.activeElement);
    setOpened(true);
    if (dragged) cloth?.release(true); else cloth?.open({ instant });
    session.set('sd-curtain', 'open');
    becomeHistory(reduce || instant ? 0 : cloth ? HISTORY_FALLBACK_MS : HISTORY_NO_GL_MS);   // 실사 커튼은 보통 onArrive 가 먼저 와서 앞당김
    if (!reduce && !instant) for (let k = 0; k < 7; k++) setTimeout(() => petals(Math.random() * innerWidth, 90, 14, 1.4), 500 + k * 170);
    // 키보드로 커튼을 열었으면 바로 아래 엔딩 크레딧으로 (커튼은 aria-hidden 이 되므로)
    if (hadFocus) document.querySelector('#credits .sd-roll')?.focus({ preventScroll: true });
  }
  function closeCurtain() {
    clearTimeout(historyTimer);
    setOpened(false);
    body.classList.remove('sd-reopened');
    cloth?.close({ instant: true });
    title.classList.remove('is-history');
    title.setAttribute('aria-label', 'Our Story, His Story');
  }
  curtain.querySelector('.sd-open').addEventListener('click', () => openCurtain());

  // 끌기 공통 : 한번 누르면 그 손가락 · 마우스가 요소 밖으로 나가도 놓을 때까지 따라감
  // 첫 손가락 · 마우스 왼쪽 버튼만 받음 (오른쪽 버튼은 메뉴가 떠서 '놓음'이 안 올 수 있음). 받았으면 true
  // onEnd(마지막 이벤트, 취소됨) — 취소됨 = 브라우저가 스크롤 등으로 가져간 경우
  function track(down, onMove, onEnd) {
    if (!down.isPrimary || down.button > 0) return false;
    const mine = (e) => e.pointerId === down.pointerId;
    const move = (e) => { if (mine(e)) onMove(e); };
    const stop = (e) => {
      if (!mine(e)) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      onEnd(e, e.type === 'pointercancel');
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return true;
  }

  // 술을 아래로 당기기 (그냥 눌러도 열림)
  const MAX_PULL_PX = 140;
  tassel.addEventListener('pointerdown', (down) => {
    const tracking = track(
      down,
      (e) => cloth?.pull(Math.max(0, Math.min(MAX_PULL_PX, e.clientY - down.clientY))),
      (e, cancelled) => {
        curtain.classList.remove('is-pulling');
        cloth?.letGo();
        if (!cancelled) openCurtain();
      },
    );
    if (tracking) curtain.classList.add('is-pulling');   // 당기는 동안 '당겨서 열기' 글은 숨김 (술이 그 위로 내려오므로)
  });
  tassel.addEventListener('click', (e) => { if (e.detail === 0) openCurtain(); });   // 키보드

  // 커튼을 양옆으로 밀어서 열기 : 민 만큼 막이 따라오고, 70px 넘게 밀고 놓으면 끝까지 열림
  const OPEN_AFTER_PX = 70;
  curtain.addEventListener('pointerdown', (down) => {
    if (down.target.closest('button') || curtain.classList.contains('is-open')) return;
    const pushed = (e) => Math.abs(e.clientX - down.clientX);
    track(
      down,
      (e) => cloth?.drag(pushed(e) / (innerWidth / 2)),
      (e, cancelled) => {
        if (!cancelled && pushed(e) > OPEN_AFTER_PX) openCurtain({ dragged: true });
        else cloth?.release(false);
      },
    );
  });

  // ---------- 엔딩 크레딧 : pages/crew.html 의 명단을 읽어서 만듦 ----------
  const credits = document.getElementById('credits');
  const roll = credits.querySelector('.sd-roll');
  const inner = credits.querySelector('.sd-roll-inner');
  const nameBtn = (text) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cr-name';
    b.textContent = text;
    return b;
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  function buildCredits(doc) {
    inner.textContent = '';
    inner.append(el('p', 'cr-title', 'Our Story,<em>His Story</em>'), el('p', 'cr-sub', '2026 GVCS 문경 청소년예술제'));
    doc.querySelectorAll('.lu-part').forEach((part) => {
      const block = el('div', 'cr-block');
      const label = part.querySelector('.lu-name');
      const isCast = part.querySelector('.lu-roles-inline');
      block.append(el('p', 'cr-part', isCast ? 'CAST' : label.innerHTML));
      const subs = part.querySelectorAll('.lu-sub');
      if (subs.length) {
        subs.forEach((sub) => {
          block.append(el('p', 'cr-subpart', sub.querySelector('.lu-sub-name').innerHTML));
          const box = el('div', 'cr-names');
          sub.querySelectorAll('li').forEach((li) => box.append(nameBtn(li.textContent.trim())));
          block.append(box);
        });
      } else if (part.querySelector('li small')) {
        const dl = el('dl', 'cr-roles');
        part.querySelectorAll('li').forEach((li) => {
          const small = li.querySelector('small');
          const name = [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
          const dd = el('dd');
          dd.append(nameBtn(name));
          dl.append(el('dt', '', small ? small.innerHTML : ''), dd);
        });
        block.append(dl);
      } else {
        const box = el('div', 'cr-names');
        part.querySelectorAll('li').forEach((li) => box.append(nameBtn(li.textContent.trim())));
        block.append(box);
      }
      inner.append(block);
    });
    const rows = doc.querySelectorAll('.th-row');
    if (rows.length) {
      const block = el('div', 'cr-block');
      block.append(el('p', 'cr-part', 'SPECIAL THANKS'));
      const dl = el('dl', 'cr-thanks');
      rows.forEach((row) => {
        const dd = el('dd');
        row.querySelectorAll('dd > span').forEach((s) => {
          const name = [...s.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
          dd.append(nameBtn(name));
        });
        dl.append(el('dt', '', row.querySelector('dt').innerHTML), dd);
      });
      block.append(dl);
      inner.append(block);
    }
    inner.append(el('p', 'cr-made', 'website made by <b>GVCS MG coding club Sync</b>'));
    inner.append(el('p', 'cr-you', '그리고 <span data-after-day="">오늘 </span>객석을 함께 채운 당신까지<b lang="en">Our Story</b>'));
    applyAfterDay(inner);
    // 파트 이름(밴드 · 합창 …)도 지금 고른 언어로
    if (typeof applyLang === 'function' && document.documentElement.lang !== 'ko') applyLang(document.documentElement.lang);
  }
  let creditsLoaded = false;
  function loadCredits() {
    if (creditsLoaded) return;
    creditsLoaded = true;
    fetch('pages/crew.html')
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((html) => { buildCredits(new DOMParser().parseFromString(html, 'text/html')); startRoll(); })
      .catch(() => { credits.hidden = true; });
  }

  let offset = 0, userPaused = false, holdUntil = 0, last = 0, running = false, visible = false;
  const SPEED = 42;   // 1초에 올라가는 px
  const maxOffset = () => Math.max(0, inner.scrollHeight - roll.clientHeight);
  function place() {
    if (reduce) { roll.scrollTop = offset; return; }
    inner.style.transform = `translateY(${-offset}px)`;
  }
  function frame(t) {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    // 크레딧이 첫 화면(커튼 바로 뒤)에 있으므로, 커튼이 열린 뒤부터 올라가게
    const curtainOpen = curtain.classList.contains('is-open');
    if (body.dataset.phase === 'after' && curtainOpen && !userPaused && Date.now() > holdUntil && visible && !document.hidden) {
      offset += SPEED * dt;
      if (offset >= maxOffset()) {
        offset = maxOffset();
        holdUntil = Date.now() + 3500;
        setTimeout(() => { if (offset >= maxOffset() - 1) { offset = 0; place(); } }, 3400);
      }
      place();
    }
    requestAnimationFrame(frame);
  }
  function startRoll() { if (running || reduce) return; running = true; requestAnimationFrame(frame); }
  function setUserPaused(p) { userPaused = p; credits.classList.toggle('is-paused', p); }   // 스페이스 키로 멈춤 · 다시 움직임
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe(roll);
  // 손으로 올리고 내리기 (휠 · 끌기 · 방향키). 잠시 뒤 다시 자동으로
  const nudge = (d) => { offset = Math.max(0, Math.min(maxOffset(), offset + d)); holdUntil = Date.now() + 2500; place(); };
  let moved = 0;
  if (!reduce) {
    roll.addEventListener('wheel', (e) => { e.preventDefault(); nudge(e.deltaY); }, { passive: false });
    let dragY = null;
    roll.addEventListener('pointerdown', (e) => { dragY = e.clientY; moved = 0; });
    roll.addEventListener('pointermove', (e) => { if (dragY === null) return; const d = dragY - e.clientY; moved += Math.abs(d); dragY = e.clientY; if (moved > 4) nudge(d); });
    roll.addEventListener('pointerup', () => { dragY = null; });
    roll.addEventListener('pointercancel', () => { dragY = null; });
  } else {
    roll.addEventListener('scroll', () => { offset = roll.scrollTop; });
  }
  roll.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); nudge(e.key === 'ArrowDown' ? 60 : -60); }
    if (e.key === ' ' && e.target === roll) { e.preventDefault(); setUserPaused(!userPaused); }
  });
  // 이름을 누르면 꽃잎 (끌다가 놓은 경우는 제외)
  inner.addEventListener('click', (e) => {
    const n = e.target.closest('.cr-name');
    if (!n || moved > 6) return;
    const r = n.getBoundingClientRect();
    petals(e.clientX || r.left + r.width / 2, e.clientY || r.top, 14);
  });

  // ---------- 현장 사진 (admin.html 에서 올린 사진) ----------
  // 공연 전 : '지금 무대 뒤' 띠 / 공연 중 : LIVE 대표 사진 + 넘겨 보는 작은 사진 줄 / 공연 후 : 대표 사진 + 사진 모음
  const liveBox = document.querySelector('[data-snaps="live"]');
  const stripBox = document.querySelector('[data-snaps="strip"]');
  const galleryBox = document.querySelector('[data-snaps="gallery"]');
  const heroImg = document.querySelector('.sd-photo img');
  // HTML 에는 투명한 그림 한 점만 있고(다른 사진이 잠깐 보였다 바뀌지 않게), 기본 사진 주소는 data-default 에 있음
  const heroDefault = { src: heroImg?.dataset.default, alt: heroImg?.getAttribute('alt') };
  // 아직 아무 사진도 못 넣었을 때만 기본 사진을 넣음
  function paintHeroIfEmpty() { if (heroImg && heroImg.getAttribute('src').startsWith('data:')) paintHero(null); }
  // 공연 후 단체 사진 자리 : 운영진이 고른 대표 사진(없으면 기본 사진). 같은 사진이면 다시 받지 않음
  function paintHero(hero) {
    if (!heroImg) return;
    const src = hero ? `/photos/${hero.id}.jpg` : heroDefault.src;
    if (heroImg.getAttribute('src') !== src) heroImg.src = src;
    heroImg.alt = hero ? (hero.cap || '오늘 공연 사진') : heroDefault.alt;
    if (hero) { heroImg.width = hero.w; heroImg.height = hero.h; }
  }
  // 지난번에 받아 둔 대표 사진을 먼저 보여 줌 (서버 답이 오면 renderPhotos 가 다시 맞춤)
  function paintSavedHero() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('oshs-showday') || 'null'); } catch (e) { saved = null; }
    const hero = saved && saved.hero;
    if (hero && /^[a-z0-9]+$/i.test(String(hero.id)) && hero.w > 0 && hero.h > 0) paintHero(hero);
  }
  const seen = new Set();
  let photoSig = '', shown = [];
  const NEW_MS = 3 * 60 * 1000;
  const hhmm = (t) => new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
  // 사진에 적는 시각 : 공연 날 사진은 '17:01', 다른 날 사진(전날 리허설 등)은 날짜까지 '11/20 19:14' (시각만 보면 순서가 뒤섞여 보이므로)
  const monthDay = (t) => new Date(t).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul' });
  const SHOW_DAY = monthDay(SHOW_START);
  const stamp = (t) => (monthDay(t) === SHOW_DAY ? hhmm(t) : `${monthDay(t)} ${hhmm(t)}`);
  function pola(p, big = false, badge = true, tag = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sd-pola';
    b.dataset.id = p.id;
    b.dataset.at = p.at;
    b.setAttribute('aria-label', `${stamp(p.taken || p.at)} 현장 사진${p.cap ? ` · ${p.cap}` : ''} 크게 보기`);
    const img = document.createElement('img');
    img.alt = '';
    img.width = p.w; img.height = p.h;
    img.decoding = 'async';
    img.loading = big ? 'eager' : 'lazy';
    img.src = `/photos/${p.id}-t.jpg`;
    if (big) { img.srcset = `/photos/${p.id}-t.jpg 480w, /photos/${p.id}.jpg ${p.w}w`; img.sizes = '(max-width: 860px) 92vw, 40vw'; }
    const foot = el('span', 'sd-pola-foot');
    const time = el('span', 'sd-pola-time'); time.textContent = stamp(p.taken || p.at);   // 찍은 시각 (없으면 올린 시각)
    const cap = el('span', 'sd-pola-cap'); cap.textContent = p.cap || '';
    foot.append(cap, time);
    b.append(img, foot);
    if (badge && Date.now() - p.at < NEW_MS) b.append(el('span', 'sd-pola-new', 'NEW'));
    if (tag) b.append(el('span', 'sd-pola-tag', tag));
    return b;
  }
  function flash() {
    if (reduce) return;
    const f = el('div', 'sd-flash');
    body.append(f);
    setTimeout(() => f.remove(), 600);
  }
  // 공연 사진 / 리허설 사진 : 운영진이 직접 고른 게 있으면 그대로, 아니면 찍은 시각(없으면 올린 시각)이 막이 오른 뒤인지로
  // (미리보기에서는 '막이 오른 지 42분' 기준)
  const showStartAt = () => (preview ? previewStart : SHOW_START);
  const isShowPhoto = (p, start) => (p.kind ? p.kind === 'show' : (p.taken || p.at) >= start);
  // 공연 중 LIVE : 위에 대표 사진 크게 + 아래 작은 사진 줄. 작은 사진 줄을 옆으로 넘기면 가운데(금색 테두리) 사진이 대표 사진이 됨
  // 처음엔 가장 최근 공연 사진. 작은 사진을 누르면 그 사진이 가운데로 오고, 대표 사진을 누르면 크게 보기
  // 새 사진이 와도 보고 있던 사진을 그대로 지킴 (맨 앞을 보고 있었으면 새 사진으로 바뀜)
  let liveRow = null, liveMain = null, liveAt = -1, liveNudged = false, liveHiRes = 0;
  function renderLive(arrived) {
    const keepId = liveRow && liveAt > 0 ? shown[liveAt]?.id : null;
    const start = showStartAt();
    const pre = body.dataset.phase === 'before';
    // 공연 중에만 'LIVE · 현장에서 방금' 머리글 (공연 전 무대 뒤 사진은 머리글 없이)
    liveMain = el('div', 'sd-snaps-main');
    liveAt = -1;
    const parts = pre ? [liveMain] : [el('p', 'sd-snaps-head', '<span class="sd-rec" aria-hidden="true"></span>LIVE · 현장에서 방금'), liveMain];
    liveRow = null;
    if (shown.length > 1) {
      const rowhead = el('div', 'sd-snaps-rowhead');
      rowhead.append(el('span', 'sd-snaps-count', `<b>1</b> / ${shown.length}`),
        el('span', 'sd-snaps-hint', '<i class="sd-hint-x">밀어서 사진 넘기기 <b aria-hidden="true">→</b></i><i class="sd-hint-y">스크롤해서 넘기기 <b aria-hidden="true">↓</b></i>'));
      const row = el('div', 'sd-snaps-row');
      row.tabIndex = 0;
      row.setAttribute('aria-label', '현장 사진 고르기. 옆으로 넘기면 위의 큰 사진이 바뀜');
      shown.forEach((p) => row.append(pola(p, false, true, pre || isShowPhoto(p, start) ? '' : '무대 뒤')));
      parts.push(rowhead, row, el('div', 'sd-snaps-bar', '<span></span>'));
      liveRow = row;
    }
    liveBox.classList.remove('is-scrolled');
    liveBox.replaceChildren(...parts);
    let at = 0;
    if (keepId) at = Math.max(0, shown.findIndex((p) => p.id === keepId));
    setLiveMain(at, true);
    if (at === 0 && arrived) { liveMain.firstChild.classList.add('is-arriving'); flash(); }
    if (!liveRow) return;
    if (at > 0) { setPos(at * liveStep()); liveBox.classList.add('is-scrolled'); }
    liveRow.addEventListener('scroll', paintLive, { passive: true });
    paintLive();
    if (!liveNudged && !reduce && at === 0) nudgeLive(liveRow);
  }
  // 대표 사진 바꾸기 : 넘기는 동안은 작은 사진(이미 받아 둔 것)으로 바로 바꾸고, 멈추면 큰 사진으로
  function setLiveMain(i, first = false) {
    if (i === liveAt || !shown[i]) return;
    liveAt = i;
    const card = pola(shown[i], first);
    card.classList.add('sd-pola-main');
    if (!first) card.classList.add('is-swap');
    liveMain.replaceChildren(card);
    clearTimeout(liveHiRes);
    if (!first) liveHiRes = setTimeout(() => {
      const img = card.querySelector('img'), p = shown[i];
      img.srcset = `/photos/${p.id}-t.jpg 480w, /photos/${p.id}.jpg ${p.w}w`;
      img.sizes = '(max-width: 860px) 92vw, 40vw';
    }, 300);
    if (liveRow) {
      [...liveRow.children].forEach((c, k) => { c.classList.toggle('is-active', k === i); c.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      const count = liveBox.querySelector('.sd-snaps-count b');
      if (count) count.textContent = i + 1;
      const bar = liveBox.querySelector('.sd-snaps-bar span');
      if (bar) bar.style.width = `${((i + 1) / shown.length) * 100}%`;
    }
  }
  // 작은 사진 줄 방향 : 폰은 가로(아래 줄), 컴퓨터(1024px 이상)는 세로(대표 사진 오른쪽)
  const wide = matchMedia('(min-width: 1024px)');
  const pos = () => (wide.matches ? liveRow.scrollTop : liveRow.scrollLeft);
  function setPos(v, smooth = false) {
    liveRow.scrollTo({ [wide.matches ? 'top' : 'left']: v, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function liveStep() {
    const c = liveRow.children;
    if (c.length < 2) return 1;
    return wide.matches ? c[1].offsetTop - c[0].offsetTop : c[1].offsetLeft - c[0].offsetLeft;
  }
  // 화면 폭이 바뀌어 방향이 바뀌면 보던 사진 자리로 다시 맞춤
  wide.addEventListener('change', () => { if (liveRow && liveAt > 0) requestAnimationFrame(() => setPos(liveAt * liveStep())); });
  function paintLive() {
    if (!liveRow) return;
    const i = Math.max(0, Math.min(shown.length - 1, Math.round(pos() / liveStep())));
    if (!liveRow.dataset.nudging) setLiveMain(i);
    if (pos() > 20 && !liveRow.dataset.nudging) liveBox.classList.add('is-scrolled');
  }
  // 처음 화면에 보일 때 한 번 : 작은 사진 줄이 살짝 밀렸다 돌아와서 '옆으로 넘길 수 있다'는 걸 보여 줌
  function nudgeLive(row) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || liveNudged) return;
      liveNudged = true; io.disconnect();
      if (pos() > 0) return;
      row.dataset.nudging = '1';
      row.style.scrollSnapType = 'none';   // 딱 붙는 효과를 잠깐 끔 (안 끄면 바로 제자리로 튕김)
      setTimeout(() => setPos(liveStep() * .4, true), 500);
      setTimeout(() => setPos(0, true), 1150);
      setTimeout(() => { row.style.scrollSnapType = ''; delete row.dataset.nudging; }, 1900);
    }, { threshold: .9 });
    io.observe(row);
  }
  // 작은 사진을 누르면 크게 보기 대신 그 사진을 가운데로 (→ 대표 사진이 바뀜)
  liveBox.addEventListener('click', (e) => {
    const card = liveRow && e.target.closest('.sd-snaps-row .sd-pola');
    if (!card) return;
    e.stopPropagation();
    const i = [...liveRow.children].indexOf(card);
    setPos(i * liveStep(), true);
    liveBox.classList.add('is-scrolled');
  });

  function renderPhotos() {
    const list = (server.photos || []).slice().sort((a, b) => b.at - a.at);
    const start = showStartAt();
    const showList = list.filter((p) => isShowPhoto(p, start));
    const byShot = (a, b) => (b.taken || b.at) - (a.taken || a.at);   // 최근 것부터 (공연 전 · 공연 중)
    const byTime = (a, b) => (a.taken || a.at) - (b.taken || b.at);   // 시간 흐름대로, 빠른 것부터 (공연 후 사진 모음)
    const rehearsal = list.filter((p) => !isShowPhoto(p, start)).sort(byShot);
    const phase = body.dataset.phase;
    const pre = phase === 'before';
    const sig = `${list.map((p) => `${p.id}${p.kind || ''}`).join()}|${server.hero || ''}|${start}|${phase}`;
    document.querySelectorAll('.sd-pola-new').forEach((n) => { if (Date.now() - n.parentElement.dataset.at > NEW_MS) n.remove(); });
    if (sig === photoSig) return;
    const arrivedLive = photoSig !== '' && (pre ? list : showList).some((p) => !seen.has(p.id));
    photoSig = sig;
    // 크게 보기 · LIVE 순서 = 사진 모음 순서 (공연 전에는 올라온 사진 전부를 찍은 시각 순으로)
    // 공연 후에는 사진 모음과 같은 순서 (공연 → 무대 뒤 · 리허설, 각각 시간이 빠른 것부터)
    shown = pre ? list.slice().sort(byShot)
      : phase === 'after' ? [...showList.slice().sort(byTime), ...rehearsal.slice().sort(byTime)]
        : [...showList.slice().sort(byShot), ...rehearsal];
    // 위에 사진 + 아래 시계로 쌓는 화면 : 공연 중에는 늘, 공연 전에는 무대 뒤 사진이 올라오기 시작하면
    body.classList.toggle('sd-stack', phase === 'onair' || (pre && list.length > 0));
    list.forEach((p) => seen.add(p.id));

    // 공연 중 : LIVE — 옆으로 넘겨 보는 사진 띠. 맨 앞이 가장 최근 공연 사진, 뒤로 갈수록 이전 사진 → 끝에 무대 뒤 · 리허설
    // 아직 공연 사진이 없으면 '첫 장면을 기다리는 중'
    if (pre ? list.length : showList.length) renderLive(arrivedLive);
    else if (list.length) {
      liveBox.replaceChildren(
        el('p', 'sd-snaps-head', '<span class="sd-rec" aria-hidden="true"></span>LIVE · 현장 사진'),
        el('div', 'sd-pola-wait', '<span>첫 장면을 기다리는 중…</span><small>공연 사진이 올라오면 여기에 바로 떠요</small>'),
      );
    } else liveBox.replaceChildren();

    // 공연 전 : 지금 무대 뒤 + D-DAY 옆 '리허설 중' 표시
    stripBox.replaceChildren(...list.slice(0, 30).map((p) => pola(p)));
    document.querySelector('.sd-backstage').classList.toggle('is-empty', !list.length);
    const chip = document.querySelector('.sd-rehearsal');
    if (chip) {
      chip.hidden = !list.length;
      chip.querySelector('[data-rehearsal-count]').textContent = list.length ? `사진 ${list.length}장` : '';
    }

    // 공연 후 : 사진 모음 (공연 / 무대 뒤 · 리허설) + 대표 사진
    const groups = [['공연', showList], ['무대 뒤 · 리허설', rehearsal]].filter(([, g]) => g.length);
    galleryBox.replaceChildren(...groups.flatMap(([name, g]) => {
      const head = el('h3', 'sd-gallery-group', `${name} <span>${g.length}장</span>`);
      const grid = el('div', 'sd-gallery-grid');
      // 시간이 빠른 사진부터 왼쪽 → 오른쪽, 위 → 아래. 묶음의 첫 사진은 크게 보이므로 큰 파일도 고를 수 있게
      grid.append(...g.slice().sort(byTime).map((p, i) => {
        const card = pola(p, false, false);
        if (i === 0) {
          const img = card.querySelector('img');
          img.srcset = `/photos/${p.id}-t.jpg 480w, /photos/${p.id}.jpg ${p.w}w`;
          img.sizes = '(max-width: 600px) 66vw, 460px';
        }
        return card;
      }));
      return [head, grid];
    }));
    document.querySelector('.sd-gallery').classList.toggle('is-empty', !list.length);
    // 단체 사진 아래 '현장 사진 N장 보기' (사진이 있을 때만)
    const toGallery = document.querySelector('.sd-to-gallery');
    if (toGallery) {
      toGallery.hidden = !list.length;
      toGallery.querySelector('[data-gallery-n]').textContent = list.length;
    }
    paintHero(list.find((p) => p.id === server.hero));
  }

  // 홈 안에서 아래로 내려가는 링크 (리허설 중 → 지금 무대 뒤 · 현장 사진 보기 → 사진 모음) : 부드럽게 스크롤
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.sd-rehearsal, .sd-to-gallery');
    const target = a && document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // 크게 보기
  const lb = document.querySelector('.sd-lightbox');
  const lbImg = lb.querySelector('img');
  let lbAt = 0;
  function paintLb() {
    const p = shown[lbAt];
    lbImg.src = `/photos/${p.id}.jpg`;
    lbImg.alt = p.cap || `${stamp(p.taken || p.at)} 현장 사진`;
    lb.querySelector('[data-lb-time]').textContent = stamp(p.taken || p.at);
    lb.querySelector('[data-lb-cap]').textContent = p.cap || '';
    lb.classList.toggle('is-single', shown.length < 2);
  }
  function openLb(id) {
    lbAt = Math.max(0, shown.findIndex((p) => p.id === id));
    if (!shown.length) return;
    paintLb();
    if (!lb.open) lb.showModal();
  }
  const stepLb = (d) => { lbAt = (lbAt + d + shown.length) % shown.length; paintLb(); };
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.sd-pola');
    if (card) { openLb(card.dataset.id); return; }
  });
  lb.querySelector('.sd-lb-prev').addEventListener('click', () => stepLb(-1));
  lb.querySelector('.sd-lb-next').addEventListener('click', () => stepLb(1));
  lb.querySelector('.sd-lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
  lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') stepLb(-1); if (e.key === 'ArrowRight') stepLb(1); });
  let swipeX = null;
  lb.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
  lb.addEventListener('pointerup', (e) => { if (swipeX !== null && Math.abs(e.clientX - swipeX) > 60 && shown.length > 1) stepLb(e.clientX < swipeX ? 1 : -1); swipeX = null; });

  // ---------- 때가 바뀔 때 ----------
  function onPhase(phase) {
    clearInterval(elapsedTimer);
    if (phase === 'onair') { tickElapsed(); elapsedTimer = setInterval(tickElapsed, 1000); }
    if (phase === 'after') {
      loadCredits();
      if (session.get('sd-curtain') === 'open') openCurtain({ instant: true });
      else closeCurtain();
      placeCurtain();
      offset = 0; place();
    } else {
      closeCurtain();
    }
    paintPreviewBar();
  }

  // ---------- 미리보기 막대 (?preview= 로 열었을 때만) ----------
  let bar;
  function paintPreviewBar() {
    if (!bar) return;
    bar.querySelectorAll('[data-p]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === body.dataset.phase)));
    bar.querySelector('.sd-again').hidden = body.dataset.phase !== 'after';
  }
  if (preview) {
    bar = document.createElement('div');
    bar.className = 'sd-preview';
    bar.innerHTML = '<span>미리보기</span><button type="button" data-p="before">공연 전</button><button type="button" data-p="onair">공연 중</button><button type="button" data-p="after">공연 후</button><button type="button" class="sd-again">커튼 다시</button>';
    body.append(bar);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      session.set('sd-curtain', null);
      if (b.classList.contains('sd-again')) { closeCurtain(); placeCurtain(); scrollTo({ top: 0 }); return; }
      preview = b.dataset.p;
      previewStart = Date.now() - 42 * 60 * 1000;
      previewCdTarget = Date.now() + (5 * 3600 + 12 * 60 + 43) * 1000;
      body.dataset.phase = '';
      applyPhase();
      renderPhotos();
      scrollTo({ top: 0 });
    });
  }

  // 처음 열 때 : 공연 시작 뒤라면 운영진 상태를 먼저 물어보고 (최대 2.5초) 화면을 정함
  // 사진이 있을 수 있으면 위쪽을 잠깐 숨겨 둠(js/phase-early.js) → 서버 답이 오면 보여 줌 (공연 전 최대 1.5초 · 공연 중 최대 2.5초)
  const reveal = () => document.documentElement.classList.remove('sd-wait');
  const refresh = async () => {
    const now = Date.now();
    if (!preview && now >= SHOW_START && now < HARD_END) {
      await Promise.race([checkServer(), new Promise((r) => setTimeout(r, 2500))]);
    } else if (preview || now >= PHOTOS_FROM) {
      const ask = checkServer();   // 사진만 받아 옴 (화면 결정은 기다리지 않음)
      if (document.documentElement.classList.contains('sd-wait')) await Promise.race([ask, new Promise((r) => setTimeout(r, 1500))]);
    }
    applyPhase();
    reveal();
  };
  // js/phase-early.js 가 지난번 상태로 이미 '공연 후'로 정했으면, 서버 답을 기다리지 않고 커튼 · 크레딧 · 대표 사진부터 준비
  // (새로고침했을 때 크레딧 칸이 비어 있거나 사진 · 제목이 뒤늦게 바뀌지 않게). 서버 답이 다르면 applyPhase 가 다시 맞춤
  if (body.dataset.phase === 'after') {
    applied = true;
    paintSavedHero();
    onPhase('after');
  }
  refresh();
  window.addEventListener('pageshow', (e) => { if (e.persisted) refresh(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();

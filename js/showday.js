// ===== 공연 당일 Home : 공연 전 → 공연 중(ON AIR) → 공연 후(THE END 커튼 · History · 엔딩 크레딧) =====
// 공연 중 → 공연 후 는 운영진이 admin.html 에서 '공연 종료'를 누르면 바뀝니다 (functions/api/showday.js).
//   - 17:00 전에는 종료가 눌려 있어도 공연 전 화면 그대로
//   - 관리자 기능(Cloudflare 설정)이 아직 없으면 FALLBACK_END 시각에 자동으로
//   - 아무도 안 눌러도 HARD_END(다음 날 0시)가 지나면 공연 후
// 주소 끝에 ?preview=onair 또는 ?preview=after 를 붙이면 그 화면을 미리 볼 수 있습니다.
(() => {
  const SHOW_START = Date.parse('2026-11-21T17:00:00+09:00');
  const FALLBACK_END = Date.parse('2026-11-21T19:30:00+09:00');   // 관리자 기능이 설정되지 않았을 때만 쓰는 예비 시각
  const HARD_END = Date.parse('2026-11-22T00:00:00+09:00');
  const API = '/api/showday';
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const petals = (...a) => window.throwPetals?.(...a);
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* 막혀 있으면 매번 커튼부터 */ } },
  };

  // ---------- 지금이 어느 때인지 ----------
  const asked = new URLSearchParams(location.search).get('preview');
  let preview = ['before', 'onair', 'after'].includes(asked) ? asked : null;
  let previewStart = Date.now() - 42 * 60 * 1000;   // 미리보기에서는 막이 오른 지 42분째로
  // 운영진이 누른 '공연 종료' 상태. api: 'unknown'(아직 못 물어봄) · 'ok' · 'none'(관리자 기능 없음)
  const server = { api: 'unknown', ended: false };
  async function checkServer() {
    try {
      const res = await fetch(API, { cache: 'no-store' });
      const isJson = (res.headers.get('content-type') || '').includes('json');
      if (res.ok && isJson) {
        const data = await res.json();
        server.api = 'ok';
        server.ended = !!data.ended;
      } else if (res.ok) {
        server.api = 'none';   // API 대신 일반 페이지가 돌아옴 = 관리자 기능이 배포되지 않음
      } else if (res.status === 404 || res.status === 503 || res.status === 405) {
        server.api = 'none';
      }
    } catch (e) { /* 잠깐 끊긴 것은 무시하고 지난 상태 유지 */ }
  }
  function phaseAt(t) {
    if (t < SHOW_START) return 'before';
    if (t >= HARD_END) return 'after';
    if (server.api === 'ok') return server.ended ? 'after' : 'onair';
    if (server.api === 'none') return t < FALLBACK_END ? 'onair' : 'after';
    return 'onair';
  }
  let phaseTimer, pollTimer;
  function applyPhase() {
    clearTimeout(phaseTimer);
    const phase = preview || phaseAt(Date.now());
    if (body.dataset.phase !== phase) {
      body.dataset.phase = phase;
      onPhase(phase);
    }
    if (preview) return;
    const now = Date.now();
    const edges = [SHOW_START, HARD_END, server.api === 'none' ? FALLBACK_END : 0].filter((t) => t > now);
    if (edges.length) phaseTimer = setTimeout(applyPhase, Math.min(Math.min(...edges) - now + 50, 2147483647));
    schedulePoll();
  }
  // 공연 중에는 30초마다, 공연 후에도(되돌리기 대비) 1분마다 상태 확인. 화면이 꺼져 있을 때는 쉼
  function schedulePoll() {
    clearTimeout(pollTimer);
    const now = Date.now();
    if (preview || now < SHOW_START || now >= HARD_END || server.api === 'none') return;
    const wait = (body.dataset.phase === 'onair' ? 30000 : 60000) + Math.random() * 5000;
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

  // ---------- 공연 후 : THE END 커튼 + History ----------
  const curtain = document.querySelector('.sd-curtain');
  const title = document.querySelector('.hero-script');
  const drapes = [...curtain.querySelectorAll('.sd-drape')];
  const rope = curtain.querySelector('.sd-rope');
  const tassel = curtain.querySelector('.sd-tassel');
  let historyTimer;
  function becomeHistory(delay) {
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      title.classList.add('is-history');
      title.setAttribute('aria-label', 'Our Story, His Story — History');
    }, delay);
  }
  function openCurtain() {
    if (curtain.classList.contains('is-open')) return;
    drapes.forEach((d) => { d.style.transform = ''; });
    rope.style.height = '';
    curtain.classList.remove('is-dragging');
    curtain.classList.add('is-open');
    curtain.setAttribute('aria-hidden', 'true');
    session.set('sd-curtain', 'open');
    becomeHistory(reduce ? 0 : 1300);
    if (!reduce) for (let k = 0; k < 7; k++) setTimeout(() => petals(Math.random() * innerWidth, 90, 14, 1.4), 500 + k * 170);
    if (document.activeElement && curtain.contains(document.activeElement)) title.closest('.hero').querySelector('.sd-jump a')?.focus({ preventScroll: true });
  }
  function closeCurtain() {
    clearTimeout(historyTimer);
    curtain.classList.remove('is-open');
    curtain.setAttribute('aria-hidden', 'false');
    title.classList.remove('is-history');
    title.setAttribute('aria-label', 'Our Story, His Story');
  }
  curtain.querySelector('.sd-open').addEventListener('click', openCurtain);

  // 술을 아래로 당기기 (그냥 눌러도 열림)
  let pullY = null, pulled = 0;
  const ropeBase = () => rope.getBoundingClientRect().height;
  tassel.addEventListener('pointerdown', (e) => { pullY = e.clientY; pulled = 0; rope.dataset.base = ropeBase(); tassel.setPointerCapture(e.pointerId); });
  tassel.addEventListener('pointermove', (e) => {
    if (pullY === null) return;
    pulled = Math.max(0, Math.min(140, e.clientY - pullY));
    rope.style.height = `${Number(rope.dataset.base) + pulled}px`;
  });
  const letGo = () => {
    if (pullY === null) return;
    pullY = null;
    rope.style.height = '';
    openCurtain();
  };
  tassel.addEventListener('pointerup', letGo);
  tassel.addEventListener('pointercancel', () => { pullY = null; rope.style.height = ''; });
  tassel.addEventListener('click', (e) => { if (e.detail === 0) openCurtain(); });   // 키보드

  // 커튼을 양옆으로 밀어서 열기
  let dragX = null;
  curtain.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || curtain.classList.contains('is-open')) return;
    dragX = e.clientX;
    curtain.classList.add('is-dragging');
  });
  curtain.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    const d = Math.min(Math.abs(e.clientX - dragX), innerWidth / 2);
    drapes[0].style.transform = `translateX(${-d}px)`;
    drapes[1].style.transform = `translateX(${d}px)`;
  });
  const endDrag = (e) => {
    if (dragX === null) return;
    const d = Math.abs((e.clientX ?? dragX) - dragX);
    dragX = null;
    curtain.classList.remove('is-dragging');
    if (d > 70) openCurtain();
    else drapes.forEach((dr) => { dr.style.transform = ''; });
  };
  curtain.addEventListener('pointerup', endDrag);
  curtain.addEventListener('pointercancel', endDrag);

  // ---------- 엔딩 크레딧 : pages/crew.html 의 명단을 읽어서 만듦 ----------
  const credits = document.getElementById('credits');
  const roll = credits.querySelector('.sd-roll');
  const inner = credits.querySelector('.sd-roll-inner');
  let names = [];
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
      block.dataset.part = label.textContent.trim();
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
      block.dataset.part = 'Special Thanks';
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
    inner.append(el('p', 'cr-you', '그리고 오늘 객석을 함께 채운 당신까지<b lang="en">Our Story</b>'));
    names = [...inner.querySelectorAll('.cr-name')];
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
      .catch(() => { credits.hidden = true; document.querySelector('.sd-jump a[href="#credits"]')?.setAttribute('hidden', ''); });
  }

  let offset = 0, userPaused = false, holdUntil = 0, last = 0, running = false, visible = false, finding = false;
  const SPEED = 42;   // 1초에 올라가는 px
  const maxOffset = () => Math.max(0, inner.scrollHeight - roll.clientHeight);
  function place() {
    if (reduce) { roll.scrollTop = offset; return; }
    inner.style.transform = `translateY(${-offset}px)`;
  }
  function frame(t) {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (body.dataset.phase === 'after' && !userPaused && !finding && Date.now() > holdUntil && visible && !document.hidden) {
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
  function setUserPaused(p) { userPaused = p; credits.classList.toggle('is-paused', p); credits.querySelector('.sd-cr-play').setAttribute('aria-pressed', String(p)); }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe(roll);
  credits.querySelector('.sd-cr-play').addEventListener('click', () => setUserPaused(!userPaused));
  credits.querySelector('.sd-cr-restart').addEventListener('click', () => { offset = 0; place(); setUserPaused(false); });
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

  // ---------- 내 친구 찾기 ----------
  const input = document.getElementById('sd-find-input');
  const result = credits.querySelector('.sd-find-result');
  const prevBtn = credits.querySelector('.sd-find-prev');
  const nextBtn = credits.querySelector('.sd-find-next');
  let found = [], cur = 0;
  credits.querySelector('.sd-find').addEventListener('submit', (e) => { e.preventDefault(); if (found.length) go(cur + 1); });
  function go(i) {
    if (!found.length) return;
    cur = (i + found.length) % found.length;
    found.forEach((f, k) => f.classList.toggle('is-current', k === cur));
    const f = found[cur];
    offset = Math.max(0, Math.min(maxOffset(), f.offsetTop - roll.clientHeight / 2 + f.offsetHeight / 2));
    if (!reduce) inner.style.transition = 'transform .7s cubic-bezier(.3,.7,.2,1)';
    place();
    setTimeout(() => {
      inner.style.transition = '';
      const r = f.getBoundingClientRect();
      petals(r.left + r.width / 2, r.top, 10, 0.6);
    }, reduce ? 0 : 750);
  }
  function search() {
    const q = input.value.trim().toLowerCase();
    names.forEach((n) => n.classList.remove('is-found', 'is-current'));
    finding = q.length >= 2;
    found = finding ? names.filter((n) => n.textContent.toLowerCase().includes(q)) : [];
    roll.classList.toggle('has-find', finding);
    prevBtn.hidden = nextBtn.hidden = found.length < 2;
    if (!finding) { result.textContent = q ? '두 글자 이상 넣어 주세요' : ''; return; }
    if (!found.length) { result.textContent = `‘${input.value.trim()}’ 이름은 크레딧에 없어요`; return; }
    found.forEach((n) => n.classList.add('is-found'));
    const parts = [...new Set(found.map((n) => n.closest('.cr-block').dataset.part))];
    result.textContent = `${parts.join(' · ')}에서 ${found.length}번 찾았어요`;
    go(0);
  }
  let searchTimer;
  input.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(search, 180); });
  prevBtn.addEventListener('click', () => go(cur - 1));
  nextBtn.addEventListener('click', () => go(cur + 1));

  // ---------- 때가 바뀔 때 ----------
  function onPhase(phase) {
    clearInterval(elapsedTimer);
    if (phase === 'onair') { tickElapsed(); elapsedTimer = setInterval(tickElapsed, 1000); }
    if (phase === 'after') {
      loadCredits();
      if (session.get('sd-curtain') === 'open') {
        curtain.classList.add('is-open');
        curtain.setAttribute('aria-hidden', 'true');
        becomeHistory(reduce ? 0 : 400);
      } else closeCurtain();
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
      if (b.classList.contains('sd-again')) { closeCurtain(); scrollTo({ top: 0, behavior: 'smooth' }); return; }
      preview = b.dataset.p;
      previewStart = Date.now() - 42 * 60 * 1000;
      body.dataset.phase = '';
      applyPhase();
      scrollTo({ top: 0 });
    });
  }

  // 처음 열 때 : 공연 시작 뒤라면 운영진 상태를 먼저 물어보고 (최대 2.5초) 화면을 정함
  const refresh = async () => {
    if (!preview && Date.now() >= SHOW_START && Date.now() < HARD_END) {
      await Promise.race([checkServer(), new Promise((r) => setTimeout(r, 2500))]);
    }
    applyPhase();
  };
  refresh();
  window.addEventListener('pageshow', (e) => { if (e.persisted) refresh(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();

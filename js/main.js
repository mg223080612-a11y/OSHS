// ===== 공통 : 모든 페이지에서 씀 (상단바 · 메뉴) =====
// 페이지 전용 기능은 js/home.js (카운트다운), js/history.js (영상 재생) 에 있습니다.

// 상단바 배경 : Home 은 처음엔 투명했다가 스크롤하면 깔리고,
// 나머지 페이지는 처음부터 깔려 있습니다 (내용이 상단바 바로 밑에서 시작하므로)
const header = document.querySelector('.site-header');
const isHome = document.body.dataset.page === 'home';
const onScroll = () => header.classList.toggle('scrolled', !isHome || window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// 메뉴 열기/닫기 (오른쪽 ≡ 버튼)
// 메뉴 항목 · 국기를 누르거나, 메뉴 바깥을 누르거나, Esc 를 누르면 닫힙니다.
const toggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');
const setMenu = (open) => {
  gnb.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
};
toggle?.addEventListener('click', () => setMenu(!gnb.classList.contains('open')));
gnb?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('close-menu', () => setMenu(false));   // 국기를 눌렀을 때 (i18n.js)
document.addEventListener('click', (e) => {
  if (gnb.classList.contains('open') && !gnb.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && gnb.classList.contains('open')) { setMenu(false); toggle.focus(); }
});

// (상단 메뉴의 밑줄은 각 페이지 HTML 에 class="active" 로 직접 적혀 있습니다)

// ===== 휴대폰 : 화면 아래에 늘 떠 있는 페이지 이동 바 (Home · Production · Story · Cast · History) =====
// 상단 메뉴 링크를 그대로 복사해서 만듭니다. 그래서 메뉴를 고치면 이 바도 같이 바뀝니다. (860px 이하에서만 보임)
(() => {
  const bar = document.createElement('nav');
  bar.className = 'bottom-nav';
  bar.setAttribute('aria-label', '페이지 이동');
  document.querySelectorAll('.gnb > a').forEach((a) => {
    const b = document.createElement('a');
    b.href = a.getAttribute('href');
    b.textContent = a.textContent;
    if (a.classList.contains('active')) { b.className = 'active'; b.setAttribute('aria-current', 'page'); }
    bar.appendChild(b);
  });
  document.body.appendChild(bar);

  // 평소에는 숨어 있다가, 화면에 손가락을 대면 올라옴 → 손을 떼고 잠시 뒤 다시 내려감
  const HIDE_AFTER = 2500;   // 손을 뗀 뒤 숨기까지 (ms)
  let timer;
  const show = () => { clearTimeout(timer); bar.classList.add('show'); };
  const hideLater = () => { clearTimeout(timer); timer = setTimeout(() => bar.classList.remove('show'), HIDE_AFTER); };
  window.addEventListener('touchstart', show, { passive: true });
  window.addEventListener('touchend', hideLater, { passive: true });
  window.addEventListener('touchcancel', hideLater, { passive: true });
  bar.addEventListener('focusin', show);          // 키보드로 바에 들어오면 보이게
  bar.addEventListener('focusout', hideLater);
})();

// ===== 휴대폰 : 맨 아래에서 한 번 더 당기면 다음 페이지로 (Home → Production → Story → Cast → History) =====
// 화면이 860px 이하일 때만 작동. 맨 아래에 '다음 페이지' 안내가 생기고,
// 끝까지 내린 상태에서 손가락으로 더 끌어올리면 막대가 차오르다가, 다 차면 다음 페이지로 넘어갑니다.
(() => {
  const mobile = window.matchMedia('(max-width: 860px)');
  const links = [...document.querySelectorAll('.gnb > a')];
  const current = links.findIndex((a) => a.classList.contains('active'));
  const next = links[current + 1];
  if (!next) return;                                   // 마지막 페이지(History)는 다음이 없음

  // 맨 아래 안내 (푸터 아래)
  const hint = document.createElement('a');
  hint.className = 'next-page';
  hint.href = next.getAttribute('href');
  hint.innerHTML = `<span class="np-name">${next.textContent} <span aria-hidden="true">↓</span></span>
    <span class="np-bar" aria-hidden="true"><i></i></span>`;
  document.body.appendChild(hint);
  const fill = hint.querySelector('.np-bar i');

  const PULL = 120;                                    // 이만큼(px) 더 끌어올리면 넘어감
  const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  let startY = null, progress = 0, going = false;
  const setProgress = (p) => { progress = p; fill.style.transform = `scaleX(${p})`; hint.classList.toggle('ready', p >= 1); };
  const go = () => { going = true; document.body.classList.add('page-leaving'); setTimeout(() => { location.href = hint.href; }, 250); };

  window.addEventListener('touchstart', (e) => {
    startY = (mobile.matches && !going && atBottom()) ? e.touches[0].clientY : null;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (startY === null) return;
    if (!atBottom()) { startY = null; setProgress(0); return; }
    setProgress(Math.max(0, Math.min(1, (startY - e.touches[0].clientY) / PULL)));
  }, { passive: true });
  // 뒤로가기로 돌아왔을 때 흐려진 상태 그대로 남지 않게
  window.addEventListener('pageshow', () => { going = false; document.body.classList.remove('page-leaving'); setProgress(0); });
  window.addEventListener('touchend', () => {
    if (startY !== null && progress >= 1) go(); else setProgress(0);
    startY = null;
  });
})();

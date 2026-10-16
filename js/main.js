// 공연일까지 남은 시간 표시 (data-target 의 날짜를 바꾸면 기준이 바뀝니다)
// .countdown 이 여러 개 있어도 모두 같이 움직입니다.
const pad = (n) => String(n).padStart(2, '0');
document.querySelectorAll('.countdown').forEach((box) => {
  const target = new Date(box.dataset.target).getTime();
  const cells = {};
  box.querySelectorAll('[data-unit]').forEach((el) => { cells[el.dataset.unit] = el; });

  const tick = () => {
    const left = Math.max(0, target - Date.now());
    const s = Math.floor(left / 1000);
    cells.d.textContent = pad(Math.floor(s / 86400));
    cells.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.m.textContent = pad(Math.floor((s % 3600) / 60));
    cells.s.textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
});

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

// History 페이지 : 썸네일을 누르면 그 자리에서 유튜브 영상 재생
// (처음부터 영상을 여러 개 띄우면 페이지가 무거워져서, 누를 때만 불러옵니다)
document.querySelectorAll('.video[data-id]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
    frame.title = btn.getAttribute('aria-label').replace(' 재생', '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    const box = document.createElement('div');
    box.className = 'video';
    box.appendChild(frame);
    btn.replaceWith(box);
  });
});

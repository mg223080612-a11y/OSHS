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

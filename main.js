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

// 스크롤하면 투명했던 상단바에 배경을 깔아 줍니다
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
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

// 지금 보고 있는 섹션에 맞춰 상단 메뉴 밑줄을 옮깁니다
// (화면 위쪽 1/3 지점을 지나간 마지막 섹션이 '지금 섹션', 아무것도 안 지났으면 Home)
const navLinks = [...document.querySelectorAll('.gnb a[href^="#"]')];
const sections = navLinks
  .map((a) => a.getAttribute('href'))
  .filter((id) => id !== '#top')
  .map((id) => document.querySelector(id))
  .filter(Boolean);
const markActive = () => {
  const line = window.innerHeight / 3;
  let current = '#top';
  sections.forEach((sec) => { if (sec.getBoundingClientRect().top <= line) current = `#${sec.id}`; });
  // 맨 아래까지 내리면 마지막 섹션 (History 가 짧아 위쪽 1/3 에 닿지 못하는 경우 대비)
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    current = `#${sections[sections.length - 1].id}`;
  }
  navLinks.forEach((a) => {
    const on = a.getAttribute('href') === current;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
};
markActive();
window.addEventListener('scroll', markActive, { passive: true });
window.addEventListener('resize', markActive);

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

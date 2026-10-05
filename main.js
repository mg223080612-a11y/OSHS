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
const toggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');
toggle?.addEventListener('click', () => {
  const open = gnb.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
gnb?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    gnb.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
  }
});

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

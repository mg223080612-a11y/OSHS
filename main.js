// 공연일까지 남은 시간 표시 (data-target 의 날짜를 바꾸면 기준이 바뀝니다)
const countdown = document.querySelector('.countdown');
if (countdown) {
  const target = new Date(countdown.dataset.target).getTime();
  const cells = {};
  countdown.querySelectorAll('[data-unit]').forEach((el) => { cells[el.dataset.unit] = el; });
  const pad = (n) => String(n).padStart(2, '0');

  const tick = () => {
    const left = Math.max(0, target - Date.now());
    const s = Math.floor(left / 1000);
    cells.d.textContent = Math.floor(s / 86400);
    cells.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.m.textContent = pad(Math.floor((s % 3600) / 60));
    cells.s.textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}

// 모바일 메뉴 열기/닫기
const toggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');
toggle?.addEventListener('click', () => {
  const open = gnb.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
gnb?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') gnb.classList.remove('open');
});

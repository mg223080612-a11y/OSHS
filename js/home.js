// ===== Home (index.html) 전용 =====

// 공연일까지 남은 시간 표시 (index.html 의 data-target 날짜를 바꾸면 기준이 바뀝니다)
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

// 남은 날짜 배지 : D-2 · D-1 · D-DAY (한국 날짜 기준), 공연이 지나면 숨김
document.querySelectorAll('[data-dday]').forEach((badge) => {
  const box = document.querySelector('.countdown[data-target]');
  if (!box) return;
  const kstDay = (t) => Math.floor((t + 9 * 3600 * 1000) / 86400000);   // 한국 시간으로 며칠째인지
  const diff = kstDay(new Date(box.dataset.target).getTime()) - kstDay(Date.now());
  if (diff < 0) badge.hidden = true;
  else badge.textContent = diff === 0 ? 'D-DAY' : `D-${diff}`;
});

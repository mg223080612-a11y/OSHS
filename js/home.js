// ===== Home (index.html) 전용 =====

// 공연 시작은 data-target의 시각, D-DAY는 한국의 달력 날짜를 기준으로 합니다.
const dayMs = 24 * 60 * 60 * 1000;
const kstOffsetMs = 9 * 60 * 60 * 1000;
const kstDay = (time) => Math.floor((time + kstOffsetMs) / dayMs);
const pad = (n) => String(n).padStart(2, '0');
document.querySelectorAll('.countdown[data-target]').forEach((box) => {
  const target = Date.parse(box.dataset.target);
  if (!Number.isFinite(target)) return;
  const showDay = kstDay(target);
  const nextMidnight = (showDay + 1) * dayMs - kstOffsetMs;
  const hero = box.closest('.hero');
  const badge = hero.querySelector('[data-dday]');
  const soon = hero.querySelector('.soon');
  const cells = {};
  box.querySelectorAll('[data-unit]').forEach((el) => { cells[el.dataset.unit] = el; });
  let timer;

  const tick = () => {
    clearTimeout(timer);
    const now = Date.now();
    const daysLeft = showDay - kstDay(now);
    badge.hidden = daysLeft < 0;
    if (daysLeft >= 0) badge.textContent = daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`;

    const remaining = target - now;
    soon.hidden = remaining <= 0;
    box.hidden = remaining <= 0;
    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      cells.d.textContent = pad(Math.floor(seconds / 86400));
      cells.h.textContent = pad(Math.floor(seconds / 3600) % 24);
      cells.m.textContent = pad(Math.floor(seconds / 60) % 60);
      cells.s.textContent = pad(seconds % 60);
      timer = setTimeout(tick, remaining % 1000 || 1000);
    } else if (daysLeft === 0) {
      timer = setTimeout(tick, nextMidnight - now);
    }
  };
  tick();
  window.addEventListener('pageshow', tick);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
});

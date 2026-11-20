// ===== Home (index.html) 전용 =====

// D-DAY 배지 : data-target 의 공연 날짜를 한국 달력 날짜 기준으로 셉니다.
// 공연 전에는 D-n, 공연 당일에는 D-DAY, 다음 날부터는 숨깁니다. (카운트다운 타이머는 공연 당일을 맞아 뺐습니다)
const dayMs = 24 * 60 * 60 * 1000;
const kstOffsetMs = 9 * 60 * 60 * 1000;
const kstDay = (time) => Math.floor((time + kstOffsetMs) / dayMs);
document.querySelectorAll('[data-dday][data-target]').forEach((badge) => {
  const target = Date.parse(badge.dataset.target);
  if (!Number.isFinite(target)) return;
  const showDay = kstDay(target);
  let timer;

  const tick = () => {
    clearTimeout(timer);
    const now = Date.now();
    const daysLeft = showDay - kstDay(now);
    badge.hidden = daysLeft < 0;
    if (daysLeft < 0) return;
    badge.textContent = daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`;
    // 한국 시간 자정에 다시 계산 (열어 둔 탭도 날짜가 바뀌면 갱신)
    const nextMidnight = (kstDay(now) + 1) * dayMs - kstOffsetMs;
    timer = setTimeout(tick, Math.min(nextMidnight - now, 2147483647));
  };
  tick();
  window.addEventListener('pageshow', tick);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
});

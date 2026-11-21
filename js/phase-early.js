// ===== Home : 화면이 그려지기 전에 공연 전 · 중 · 후를 먼저 정함 (index.html 의 <body> 바로 다음에서 실행) =====
// 이게 없으면 '공연 전' 화면이 잠깐 보였다가 바뀌면서 반짝임.
// 지난번에 받아 둔 상태(공연 종료 여부 · 사진 수)를 기억했다가 씀. 사진이 있을 수 있으면 위쪽(제목 · 사진)을
// 잠깐 숨겼다가 서버 답을 받으면 보여 줌(공연 전 최대 1.5초 · 공연 중 최대 2.5초) — js/showday.js 가 마무리
(function () {
  var body = document.body;
  var START = Date.parse('2026-11-21T17:00:00+09:00');
  var HARD_END = Date.parse('2026-11-22T00:00:00+09:00');
  var now = Date.now();
  var asked = new URLSearchParams(location.search).get('preview');
  var preview = /^(before|onair|after)$/.test(asked || '') ? asked : null;
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('oshs-showday') || 'null'); } catch (e) { saved = null; }
  var phase = preview || (now < START ? 'before' : now >= HARD_END || (saved && saved.ended) ? 'after' : 'onair');
  body.dataset.phase = phase;
  // 공연 후 : 이번 방문에서 이미 커튼을 열었으면(새로고침 포함) 처음부터 열린 화면 + 제목은 바로 History
  // sd-opened = 막이 열림 / sd-reopened = 전에 이미 열었음 (바뀌는 움직임을 다시 보여 주지 않음)
  try { if (phase === 'after' && sessionStorage.getItem('sd-curtain') === 'open') body.classList.add('sd-opened', 'sd-reopened'); } catch (e) { /* 막혀 있으면 매번 커튼부터 */ }
  if (phase === 'onair' || (phase === 'before' && saved && saved.photos > 0)) body.classList.add('sd-stack');
  // 사진이 있을 수도 있으면(처음 왔거나 지난번에 사진이 있었으면) 사진을 받아 올 때까지 위쪽을 잠깐 숨김
  if (phase !== 'after' && (!saved || saved.photos > 0)) document.documentElement.classList.add('sd-wait');
})();

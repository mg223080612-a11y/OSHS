// 예전 한 페이지 시절 주소(story.gvcs.kr/#history 처럼)로 들어오면 새 페이지로 이동 (index.html 에서만 씀)
// (#story 는 줄거리가 다시 Home 맨 아래로 와서 그대로 둠. #production 은 줄거리로 보냄)
// 공연 당일에도 이 Home 을 그대로 보여 줍니다 (당일 시안 페이지로 자동 이동하지 않음).
(() => {
  if (location.hash === '#history') {
    location.replace('pages/history.html' + location.search);
    return;
  }
  if (location.hash === '#production') location.replace('#story');
})();

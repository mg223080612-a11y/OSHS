// 예전 한 페이지 시절 주소(story.gvcs.kr/#story 처럼)로 들어오면 새 페이지로 이동 (index.html 에서만 씀)
// (Production · Story 는 Synopsis 한 페이지로 합쳐짐)
const LEGACY = { '#production': 'pages/synopsis.html', '#story': 'pages/synopsis.html', '#history': 'pages/history.html' };
if (LEGACY[location.hash]) location.replace(LEGACY[location.hash]);

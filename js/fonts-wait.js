// http:// 로 들어오면 https:// 로 바로 옮김 (주소창에 http 로 쳤을 때 암호화 안 된 화면이 보이지 않게)
// (Cloudflare 설정의 Always Use HTTPS 를 켜면 서버에서 먼저 옮겨 주지만, 꺼져 있어도 여기서 한 번 더 막음)
if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  location.replace('https:' + location.href.slice(5));
}

// 새로고침할 때 제목이 다른 글꼴로 잠깐 보였다가 바뀌는 것 막기
// 제목에 쓰는 글꼴이 준비될 때까지 화면 내용을 잠깐 숨겼다가 한 번에 보여 줍니다.
// 인터넷이 느려도 최대 0.5초 뒤에는 무조건 보여 줍니다.
// (2초였을 때 휴대폰 첫 방문에서 제목이 늦게 떠서 줄임 — 2026-11-13 측정 : 느린 4G 첫 방문은 매번 2초를 다 기다렸음.
//  0.5초 안에 글꼴이 안 오면 제목이 잠깐 기본 글꼴로 보였다가 바뀜)
// (모든 페이지의 <head> 에서 css 바로 다음에 불러옵니다)
(function () {
  var MAX_WAIT_MS = 500;
  var root = document.documentElement;
  if (!document.fonts || !document.fonts.load) return;   // 오래된 브라우저는 그냥 표시
  root.classList.add('fonts-wait');
  var show = function () { root.classList.remove('fonts-wait'); };
  var KO = '줄거리 서로 다른 이야기가 만나 하나의 되다 청소년예술제';
  var fonts = [
    ['400 1em "Kaushan Script"', 'Our Story, His Story History'],
    ['500 1em Oswald', 'PRODUCTION'], ['600 1em Oswald', 'Our Story, His Story'],
    ['500 1em "Playfair Display"', 'D-DAY 11.21 Home'], ['600 1em "Playfair Display"', '11.21 2025'],
    ['700 1em "Noto Sans KR"', KO], ['300 1em "Noto Sans KR"', KO]
  ];
  Promise.all(fonts.map(function (f) { return document.fonts.load(f[0], f[1]); })).then(show, show);
  setTimeout(show, MAX_WAIT_MS);
})();

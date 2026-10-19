// 새로고침할 때 제목이 다른 글꼴로 잠깐 보였다가 바뀌는 것 막기
// 제목에 쓰는 글꼴이 준비될 때까지 화면 내용을 잠깐 숨겼다가 한 번에 보여 줍니다.
// 인터넷이 느려도 최대 2초 뒤에는 무조건 보여 줍니다.
// (모든 페이지의 <head> 에서 styles.css 바로 다음에 불러옵니다)
(function () {
  var root = document.documentElement;
  if (!document.fonts || !document.fonts.load) return;   // 오래된 브라우저는 그냥 표시
  root.classList.add('fonts-wait');
  var show = function () { root.classList.remove('fonts-wait'); };
  var KO = '줄거리 서로 다른 이야기가 만나 하나의 되다 청소년예술제';
  var fonts = [
    ['400 1em "Kaushan Script"', 'Our Story, His Story History'],
    ['400 1em "Great Vibes"', 'Our Story, His Story'],   // Story 페이지 제목 (다른 페이지에서는 바로 넘어감)
    ['500 1em Oswald', 'PRODUCTION'], ['600 1em Oswald', 'Our Story, His Story'],
    ['500 1em "Playfair Display"', 'D-DAY 11.21 Home'], ['600 1em "Playfair Display"', '11.21 2025'],
    ['700 1em "Noto Sans KR"', KO], ['300 1em "Noto Sans KR"', KO]
  ];
  Promise.all(fonts.map(function (f) { return document.fonts.load(f[0], f[1]); })).then(show, show);
  setTimeout(show, 2000);
})();

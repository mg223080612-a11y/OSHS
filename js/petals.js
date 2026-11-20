// 꽃잎 날리기 : Home 엔딩 크레딧 · Cast 꽃 던지기에서 같이 씀
// throwPetals(x, y, 개수, 퍼지는 정도) — x, y 는 화면 기준 좌표
window.throwPetals = (() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#f7a8c4', '#fbd3e0', '#fbe9c0', '#f0c46b', '#ffffff', '#e889ad'];
  let live = 0;
  return (x, y, n = 10, spread = 1) => {
    if (reduce.matches || typeof Element.prototype.animate !== 'function') return;
    for (let i = 0; i < n && live < 240; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.left = `${x - 6}px`;
      p.style.top = `${y - 8}px`;
      p.style.background = colors[(Math.random() * colors.length) | 0];
      const dx = (Math.random() - 0.5) * 260 * spread;
      const up = -(80 + Math.random() * 200) * spread;
      const fall = 220 + Math.random() * 380;
      const r = (Math.random() - 0.5) * 720;
      const s = 0.6 + Math.random() * 0.9;
      document.body.append(p);
      live++;
      p.animate([
        { transform: `translate(0,0) rotate(0) scale(${s})`, opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${up}px) rotate(${r * 0.5}deg) scale(${s})`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${up + fall}px) rotate(${r}deg) scale(${s})`, opacity: 0 },
      ], { duration: 1500 + Math.random() * 1100, easing: 'cubic-bezier(.25,.6,.35,1)' }).onfinish = () => { p.remove(); live--; };
    }
  };
})();

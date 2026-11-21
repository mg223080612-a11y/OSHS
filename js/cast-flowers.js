// ===== Cast : 배우에게 꽃 던지기 =====
// 카드 사진 오른쪽 위의 꽃 버튼 : 한 번 누르면 한 송이, 꾹 누르고 있으면 계속.
// 던진 수는 이 브라우저에만 저장됩니다 (다른 사람 수와 합치려면 서버가 필요).
// i18n.js 보다 먼저 불러와야 버튼 글자도 번역됩니다.
(() => {
  // ▼ 꽃 던지기 켜고 끄기 : true 로 바꾸면 버튼과 안내 문구가 나타남 (지금은 꺼 둠)
  const ENABLED = false;
  if (!ENABLED) return;
  document.querySelector('.fl-hint')?.removeAttribute('hidden');

  const KEY = 'cast-flowers';
  let counts = {};
  try { counts = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { counts = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(counts)); } catch (e) { /* 저장이 막혀도 던지기는 됩니다 */ } };
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><g class="fl-petals"><circle cx="12" cy="6.5" r="3.6"/><circle cx="6.8" cy="10.3" r="3.6"/><circle cx="17.2" cy="10.3" r="3.6"/><circle cx="8.8" cy="16.2" r="3.6"/><circle cx="15.2" cy="16.2" r="3.6"/></g><circle class="fl-core" cx="12" cy="11.6" r="3"/></svg>';

  document.querySelectorAll('.cast-card').forEach((card) => {
    const actor = card.querySelector('.cast-actor')?.textContent.trim();
    if (!actor) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fl-btn';
    b.dataset.actor = actor;
    b.innerHTML = `${icon}<span class="fl-n" aria-hidden="true"></span><span class="sr-only"><span data-i18n="flowerThrow">꽃 던지기</span> · ${actor}</span>`;
    card.querySelector('.cast-photo').after(b);
    paint(b);
  });

  function paint(b) {
    const n = counts[b.dataset.actor] || 0;
    b.classList.toggle('has', n > 0);
    b.querySelector('.fl-n').textContent = n > 999 ? '999+' : n || '';
  }
  function toss(b, x, y) {
    counts[b.dataset.actor] = (counts[b.dataset.actor] || 0) + 1;
    save();
    paint(b);
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    window.throwPetals?.(x, y, 10);
  }

  let hold, holdStart;
  const stop = () => clearInterval(hold);
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.fl-btn');
    if (!b) return;
    const pt = { x: e.clientX, y: e.clientY };
    toss(b, pt.x, pt.y);
    stop();
    holdStart = Date.now();
    hold = setInterval(() => { if (Date.now() - holdStart > 320) toss(b, pt.x, pt.y); }, 110);
  });
  ['pointerup', 'pointercancel'].forEach((t) => document.addEventListener(t, stop));
  document.addEventListener('pointerout', (e) => { if (e.target.closest?.('.fl-btn')) stop(); });
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('.fl-btn')) e.preventDefault(); });
  // 키보드(Enter · Space)로 누른 경우 (마우스 · 손가락은 pointerdown 에서 이미 처리)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.fl-btn');
    if (!b || e.detail !== 0) return;
    const r = b.getBoundingClientRect();
    toss(b, r.left + r.width / 2, r.top + r.height / 2);
  });
})();

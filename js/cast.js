// ===== Cast (pages/cast.html) 전용 =====

// 주연 카드를 누르면 사진 위에 배역 설명이 나타납니다. 다시 누르거나 Esc 를 누르면 닫힘.
const descCards = [...document.querySelectorAll('.cast-card.has-desc')];
const setOpen = (card, open) => {
  card.classList.toggle('open', open);
  card.querySelector('.cast-toggle').setAttribute('aria-expanded', open);
};
descCards.forEach((card) => {
  card.querySelector('.cast-toggle').addEventListener('click', () => setOpen(card, !card.classList.contains('open')));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') descCards.forEach((card) => setOpen(card, false));
});

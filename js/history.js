// ===== History (pages/history.html) 전용 =====

// 썸네일을 누르면 그 자리에서 유튜브 영상 재생
// (처음부터 영상을 여러 개 띄우면 페이지가 무거워져서, 누를 때만 불러옵니다)
document.querySelectorAll('.video[data-id]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
    frame.title = btn.getAttribute('aria-label').replace(' 재생', '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    const box = document.createElement('div');
    box.className = 'video';
    box.appendChild(frame);
    btn.replaceWith(box);
  });
});

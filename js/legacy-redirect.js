// 예전 한 페이지 시절 주소(story.gvcs.kr/#story 처럼)로 들어오면 새 페이지로 이동 (index.html 에서만 씀)
if (/^#(production|story|history)$/.test(location.hash)) location.replace('pages/' + location.hash.slice(1) + '.html');

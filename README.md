# OSHS

글로벌선진학교 문경캠퍼스 청소년예술제 — **Our Story, His Story** 웹사이트

- 공연일: 2026.11.21 (SAT) · Coming Soon
- 빌드 없이 동작하는 정적 사이트입니다. `index.html` 을 브라우저로 열면 바로 보입니다.
- 서비스 주소: https://story.gvcs.kr (Cloudflare Pages. `main` 에 push 하면 1~2분 뒤 반영)

## 파일 구조 : 페이지마다 HTML · CSS (필요하면 JS) 가 한 벌씩

| 탭 | HTML | CSS | JS | 주소 |
|---|---|---|---|---|
| Home | `index.html` | `css/home.css` | `js/home.js` (카운트다운) | story.gvcs.kr |
| Production | `pages/production.html` | `css/production.css` | | /pages/production |
| Story | `pages/story.html` | `css/story.css` | | /pages/story |
| Cast | `pages/cast.html` | `css/cast.css` | `js/cast.js` (주연 카드 누르면 배역 설명) | /pages/cast |
| History | `pages/history.html` | `css/history.css` | `js/history.js` (영상 재생) | /pages/history |

모든 페이지가 함께 쓰는 파일:

```
css/common.css     색 · 글꼴(맨 위 :root) · 상단바 · 메뉴 · 언어 버튼 · 페이지 제목 · 푸터
js/fonts-wait.js   글꼴이 준비될 때까지 화면을 잠깐 숨김 (새로고침 때 글꼴 바뀜 방지)
js/i18n.js         7개 언어 번역 · 국기 그림 · 언어 버튼
js/main.js         상단바 배경 · 메뉴 열기/닫기
images/            poster.jpg · hero.jpg(공유 미리보기) · logo-white.png · flag-ko.png
_redirects         예전 주소(/story, /production.html 등) → 새 주소로 이동 (Cloudflare Pages 규칙)
favicon.ico · favicon-16/32.png · apple-touch-icon.png   (브라우저가 맨 위 폴더에서 찾으므로 여기 둠)
```

## 고칠 때 알아둘 것

- **상단 메뉴 · 푸터는 5개 페이지에 똑같이 들어 있습니다.** 고칠 때는 5개 파일을 모두 고치세요.
  (지금 보고 있는 탭은 각 페이지의 메뉴 링크에 `class="active"` 로 표시)
- **새 페이지 추가**: `pages/` 에 HTML(기존 페이지 복사) + `css/새페이지.css` 를 만들고, 5개 페이지 메뉴에 링크를 넣으세요.
- **한국어 문장**은 각 페이지 HTML 에서, **다른 언어**는 `js/i18n.js` 에서 같은 이름(`data-i18n="s1"` → `s1`)을 찾아 고칩니다.
- **Cast 사진**: `images/cast/` 에 사진(세로 3:4 권장)을 올리고, `pages/cast.html` 의 각 카드 주석에 적힌 대로
  `<span class="cast-ph">` 줄을 `<img src="../images/cast/(이름).jpg">` 로 바꾸면 됩니다.
- **History 영상 추가**: `pages/history.html` 의 `<article class="past">` 한 덩어리를 복사해 연도 · 제목 · `data-id`(유튜브 주소 `v=` 뒤 11글자)만 바꾸면 됩니다.
- **러닝타임 · 관람 안내**가 정해지면 `pages/production.html` 의 주석을 풀어 채우세요.
- 페이지마다 역할이 하나씩입니다. 같은 정보를 여러 페이지에 반복하지 마세요. (카운트다운은 Home 에만)

# OSHS

글로벌선진학교 문경캠퍼스 청소년예술제 — **Our Story, His Story** 웹사이트

- 공연일: 2026.11.21 (SAT) · Coming Soon
- 빌드 없이 동작하는 정적 사이트입니다. `index.html` 을 브라우저로 열면 바로 보입니다.
- 서비스 주소: https://story.gvcs.kr (Cloudflare Pages. `main` 에 push 하면 1~2분 뒤 반영)

## 파일 구조

```
OSHS/
├─ index.html        Home        : 제목 · 홍보 문구 · D-DAY · 카운트다운
├─ production.html   Production  : 포스터 + 일시 · 장소 · 오시는 길
├─ story.html        Story       : 줄거리
├─ history.html      History     : 지난 공연 영상
│
├─ css/styles.css    디자인 전체. 색 · 글꼴은 맨 위 :root 에서 바꿉니다
├─ js/
│  ├─ fonts-wait.js  글꼴이 준비될 때까지 화면을 잠깐 숨김 (새로고침 때 글꼴 바뀜 방지)
│  ├─ i18n.js        7개 언어 번역 · 국기 그림 · 언어 버튼
│  └─ main.js        카운트다운 · 메뉴 열기/닫기 · 영상 재생
├─ images/           poster.jpg · hero.jpg(공유 미리보기) · logo-white.png · flag-ko.png
└─ favicon.ico · favicon-16/32.png · apple-touch-icon.png   (브라우저가 맨 위 폴더에서 찾으므로 여기 둠)
```

주소는 `story.gvcs.kr/production` 처럼 `.html` 없이도 열립니다.
예전 한 페이지 시절 주소(`story.gvcs.kr/#story` 등)로 들어오면 해당 페이지로 자동 이동합니다.

## 고칠 때 알아둘 것

- **상단 메뉴 · 푸터는 4개 페이지에 똑같이 들어 있습니다.** 고칠 때는 4개 파일을 모두 고치세요.
  (지금 보고 있는 탭은 각 페이지의 메뉴 링크에 `class="active"` 로 표시)
- **한국어 문장**은 각 페이지 HTML 에서, **다른 언어**는 `js/i18n.js` 에서 같은 이름(`data-i18n="s1"` → `s1`)을 찾아 고칩니다.
- **History 영상 추가**: `history.html` 의 `<article class="past">` 한 덩어리를 복사해 연도 · 제목 · `data-id`(유튜브 주소 `v=` 뒤 11글자)만 바꾸면 됩니다.
- **러닝타임 · 관람 안내**가 정해지면 `production.html` 의 주석을 풀어 채우세요.
- 페이지마다 역할이 하나씩입니다. 같은 정보를 여러 페이지에 반복하지 마세요. (카운트다운은 Home 에만)

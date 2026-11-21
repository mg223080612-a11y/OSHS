# OSHS

글로벌선진학교 문경캠퍼스 청소년예술제 — **Our Story, His Story** 웹사이트

- 공연일: 2026.11.21 (SAT) · Coming Soon
- 빌드 없이 동작하는 정적 사이트입니다. `index.html` 을 브라우저로 열면 바로 보입니다.
- 서비스 주소: https://story.gvcs.kr (Cloudflare Pages. `main` 에 push 하면 1~2분 뒤 반영)

## 파일 구조 : 페이지마다 HTML · CSS (필요하면 JS) 가 한 벌씩

| 탭 | HTML | CSS | JS | 주소 |
|---|---|---|---|---|
| Home | `index.html` | `css/home.css` | `js/home.js` (카운트다운) | story.gvcs.kr (메인 화면 + 스케치 영상 자동 재생 + 줄거리) |
| Number | `pages/scenes.html` | `css/scenes.css` | | /pages/scenes (뮤지컬 넘버 목록) |
| Cast | `pages/cast.html` | `css/cast.css` | `js/cast.js` (주연 카드 누르면 배역 설명) | /pages/cast |
| Crew | `pages/crew.html` | `css/crew.css` | | /pages/crew (파트별 단체 사진 + 이름. 사진 : images/lineup/) |
| History | `pages/history.html` | `css/history.css` | `js/video.js` (영상 재생) | /pages/history |

모든 페이지가 함께 쓰는 파일:

```
css/common.css     색 · 글꼴(맨 위 :root) · 상단바 · 메뉴 · 언어 버튼 · 페이지 제목 · 푸터
css/fonts.css      제목 글꼴 4개(Kaushan Script · Oswald · Playfair Display · Anton)를 fonts/ 에서 불러오는 설정
js/fonts-wait.js   글꼴이 준비될 때까지 화면을 잠깐 숨김 (새로고침 때 글꼴 바뀜 방지)
js/i18n.js         7개 언어 번역 · 국기 그림 · 언어 버튼
js/main.js         상단바 배경 · 메뉴 열기/닫기 · 휴대폰에서 맨 아래 더 당기면 다음 페이지로 (순서는 상단 메뉴 순서)
fonts/             제목 글꼴 파일(woff2, 언어별 조각) + 라이선스(OFL). 각 페이지 <head> 에서 latin 조각 3개를 preload (Home 은 Anton 까지 4개)
images/            poster.jpg · hero.jpg(공유 미리보기) · logo-white.png · flag-ko.png
downloads/         Home 다운로드 버튼 파일 : poster.jpg · invitation.jpg(앞·안쪽 한 장) · kakao-profile.jpg (같은 이름으로 덮어쓰면 교체)
_redirects         예전 주소(/story, /production.html 등) → 새 주소로 이동 (Cloudflare Pages 규칙)
_headers           보안 헤더 (HTTPS 강제 · CSP 등). 새 외부 서비스(스크립트 · 이미지 · 영상)를 붙이면 여기 CSP 에 주소 추가
.assetsignore      Cloudflare 에 올리지 않을 파일 (.git · README 등 — 사이트 주소로 열리면 안 되는 것)
favicon.ico · favicon-16/32.png · apple-touch-icon.png   (브라우저가 맨 위 폴더에서 찾으므로 여기 둠)
```

## 고칠 때 알아둘 것

- **HTML 안에 <script> 를 직접 쓰지 마세요.** 보안 설정(CSP) 때문에 막힙니다. 스크립트는 js/ 에 파일로 만들어 <script src> 로 넣으세요.
- **상단 메뉴 · 푸터는 5개 페이지에 똑같이 들어 있습니다.** 고칠 때는 5개 파일을 모두 고치세요.
  (지금 보고 있는 탭은 각 페이지의 메뉴 링크에 `class="active"` 로 표시)
- **새 페이지 추가**: `pages/` 에 HTML(기존 페이지 복사) + `css/새페이지.css` 를 만들고, 6개 페이지 메뉴에 링크를 넣으세요.
- **한국어 문장**은 각 페이지 HTML 에서, **다른 언어**는 `js/i18n.js` 에서 같은 이름(`data-i18n="s1"` → `s1`)을 찾아 고칩니다.
- **Cast 사진**: `images/cast/` 에 사진(세로 3:4 권장)을 올리고, `pages/cast.html` 의 각 카드 주석에 적힌 대로
  `<span class="cast-ph">` 줄을 `<img src="../images/cast/(이름).jpg">` 로 바꾸면 됩니다.
- **History 영상 추가**: `pages/history.html` 의 `<article class="past">` 한 덩어리를 복사해 연도 · 제목 · `data-id`(유튜브 주소 `v=` 뒤 11글자)만 바꾸면 됩니다.
- 페이지마다 역할이 하나씩입니다. 같은 정보를 여러 페이지에 반복하지 마세요. (카운트다운은 Home 에만)

## 공연 당일 Home · 공연 종료 버튼

- Home(`index.html`)은 시간에 따라 바뀝니다 (`css/showday.css` · `js/showday.js` · 공연 후 커튼 그림은 `js/curtain.js`).
  - 11/21 17:00 전 : 기존 화면 (D-DAY)
  - 17:00부터 : **ON AIR** (막이 오른 뒤 지난 시간)
  - 운영진이 **공연 종료**를 누르면 : **THE END 커튼** → 제목이 *History* 로 → 엔딩 크레딧 (명단은 `pages/crew.html` 에서 읽어 옴)
    - 커튼(벨벳 막 · 위 휘장 · 금색 술 · 무대 바닥)은 그림 파일 없이 `js/curtain.js` 가 그립니다(WebGL). 열 때는 버튼 · 막을 옆으로 밀기 · 술 당기기. WebGL 이 안 되는 기기는 단순한 커튼으로 보입니다.
    - '오늘'이 들어간 문구는 공연 다음 날부터 자동으로 바뀝니다 (`index.html` 의 `data-after-day`).
  - 미리보기 : `story.gvcs.kr/?preview=onair` · `?preview=after` (다음 날 문구까지 보려면 `?preview=after&day=later`)
- **공연 종료 버튼** : `story.gvcs.kr/admin.html` (메뉴에 없음). 비밀번호를 넣고 버튼을 1.5초 꾹 누르면 1~2분 안에 모든 방문자 화면이 바뀜. 되돌리기 가능.
  - 17:00 전에 눌러도 방문자 화면은 바뀌지 않음 (테스트 가능). 테스트 뒤에는 되돌리기.
  - 관리자 기능이 설정되지 않았으면 19:30에 자동으로, 아무도 안 눌러도 다음 날 0시에는 공연 후 화면.
  - 서버 코드 : `functions/api/showday.js` (Cloudflare Pages Functions)
- **현장 사진** : 같은 `admin.html` 의 **현장 사진** 탭에서 폰으로 찍거나 앨범에서 골라 올리면 Home 에 바로 뜸.
  - 촬영 시각(사진 정보)으로 나눔 : 17:00 전 → Home 의 **지금 무대 뒤**(리허설), 17:00 후 → ON AIR 화면. 공연 후에는 **오늘의 사진**에 전부 (공연 → 무대 뒤 · 리허설 순서, 각각 시간이 빠른 사진부터). 방문자에게는 숨기지 않은 사진을 모두 보냅니다(올릴 수 있는 한도와 같은 400장까지, `functions/api/showday.js` 의 `MAX_PUBLIC`).
  - 목록에서 사진마다 공연/리허설 직접 바꾸기 · 대표 사진 · 숨기기 · 삭제 가능
  - 올릴 때 사진을 줄이고 위치 정보(GPS)는 지움. 최대 400장
  - 비밀번호 두 가지 : `ADMIN_KEY` = 전부(공연 종료 + 사진), `PHOTO_KEY` = 사진만 (사진 담당 선생님·학생용)
  - 서버 코드 : `functions/api/photos.js`, `functions/photos/[name].js`

### Cloudflare 설정 (한 번만)

이 사이트는 Cloudflare **Worker(oshs)** 로 배포됩니다. 보통 파일은 Cloudflare 가 그대로 보내고,
`/api/*` · `/photos/*` 만 `worker/index.js` 가 받아서 `functions/` 의 코드를 실행합니다 (`wrangler.jsonc`).

1. `main` 에 push → 자동 배포. KV 저장소(`SHOWDAY`)는 첫 배포 때 자동으로 만들어짐
2. Cloudflare 대시보드 → **Workers 및 Pages → oshs → 설정 → 변수 및 비밀 → 추가**
   - 유형 **비밀**, 이름 `ADMIN_KEY`, 값 = 관리자 비밀번호 (공연 종료 + 사진)
   - 유형 **비밀**, 이름 `PHOTO_KEY`, 값 = 사진 업로드용 비밀번호 (사진만)
3. `story.gvcs.kr/api/showday` 를 열어 `{"ended":false,...}` 가 보이면 성공

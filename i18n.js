// ===== 언어 바꾸기 (국기 버튼) =====
// 화면 글자 중 data-i18n="이름" 이 붙은 곳만 바뀝니다.
// 한국어는 HTML 에 적힌 원래 글자를 그대로 쓰고, 다른 언어는 아래 TEXT 에서 가져옵니다.
// 문장을 고치려면 TEXT 의 해당 언어 · 이름을 찾아 바꾸면 됩니다.

const TEXT = {
  en: {
    title: 'Our Story, His Story | 2026 Youth Arts Festival',
    heroDesc: 'Different stories meet and become one story',
    pill: 'View show info',
    dtDate: 'When', dtVenue: 'Venue',
    venue: 'Hulbert Hall, GVCS Mungyeong Campus',
    dtMap: 'Directions', mapLink: 'View on map ↗',
    btnStory: 'Read the story',
    storyHead: 'The Story',
    s1: 'Students who must create a single stage around the theme of <em>“unification.”</em><br />Their different ideas collide, and a show that seemed perfect begins to falter.',
    s2: 'And among them, one student holds a story never told to anyone.<br />What lies hidden behind that silence?',
    s3: '<b>Our Story</b>: we, all different, come together to build one stage.<br /><b>His Story</b> of love and reconciliation flows into it,<br />and a new <b>History</b> begins, dreaming of peace on the Korean Peninsula and reunification through the Gospel.',
    s5: 'On November 21, we invite you to the Youth Arts Festival',
    histLead: 'Revisit the stages of past years.',
    footer: 'Global Vision Christian School, Mungyeong Campus · 2026 Youth Arts Festival',
  },
  id: {
    title: 'Our Story, His Story | Festival Seni Remaja GVCS 2026',
    heroDesc: 'Kisah-kisah yang berbeda bertemu dan menjadi satu kisah',
    pill: 'Lihat info pertunjukan',
    dtDate: 'Waktu', dtVenue: 'Tempat',
    venue: 'Hulbert Hall, Kampus GVCS Mungyeong',
    dtMap: 'Rute', mapLink: 'Lihat peta ↗',
    btnStory: 'Baca sinopsis',
    storyHead: 'Sinopsis',
    s1: 'Para siswa yang harus menciptakan satu panggung bertema <em>“penyatuan”</em>.<br />Perbedaan pendapat saling berbenturan, dan pertunjukan yang tampak sempurna mulai goyah.',
    s2: 'Lalu ada seorang siswa yang menyimpan kisah yang tak pernah ia ceritakan kepada siapa pun.<br />Apa yang tersembunyi di balik diamnya?',
    s3: 'Kisah kita (<b>Our Story</b>): kita yang berbeda bertemu dan membangun satu panggung.<br />Kisah-Nya (<b>His Story</b>) tentang kasih dan pendamaian meresap ke dalamnya,<br />dan dimulailah sejarah baru (<b>History</b>) yang memimpikan perdamaian di Semenanjung Korea dan penyatuan melalui Injil.',
    s5: 'Pada 21 November, kami mengundang Anda ke Festival Seni Remaja',
    histLead: 'Saksikan kembali panggung-panggung tahun sebelumnya.',
    footer: 'Global Vision Christian School, Kampus Mungyeong · Festival Seni Remaja 2026',
  },
  mn: {
    title: 'Our Story, His Story | GVCS 2026 Залуучуудын урлагийн наадам',
    heroDesc: 'Өөр өөр түүхүүд нийлж, нэг түүх болно',
    pill: 'Тоглолтын мэдээлэл',
    dtDate: 'Хэзээ', dtVenue: 'Хаана',
    venue: 'GVCS Мүнгёон кампус, Hulbert Hall',
    dtMap: 'Хаяг', mapLink: 'Газрын зураг ↗',
    btnStory: 'Үйл явдал',
    storyHead: 'Үйл явдал',
    s1: '<em>“Нэгдэл”</em> сэдвээр нэг тайз бүтээх ёстой сурагчид.<br />Өөр өөр бодол мөргөлдөж, төгс мэт байсан тоглолт ганхаж эхэлнэ.',
    s2: 'Мөн хэнд ч хэлж чадаагүй түүхээ нууж яваа нэгэн сурагч.<br />Тэр чимээгүй байдлын цаана юу нуугдаж байгаа бол?',
    s3: 'Өөр өөр бид нэгдэж, нэг тайз бүтээх бидний түүх (<b>Our Story</b>).<br />Түүнд хайр ба эвлэрлийн төлөөх Түүний түүх (<b>His Story</b>) шингэж,<br />Солонгосын хойгийн энх тайван, сайн мэдээгээр нэгдэхийг мөрөөдсөн шинэ түүх (<b>History</b>) эхэлнэ.',
    s5: '11-р сарын 21-нд Залуучуудын урлагийн наадамд таныг урьж байна',
    histLead: 'Өмнөх жилүүдийн тоглолтыг дахин үзээрэй.',
    footer: 'Global Vision Christian School, Мүнгёон кампус · 2026 Залуучуудын урлагийн наадам',
  },
  zh: {
    title: 'Our Story, His Story | GVCS 2026 青少年艺术节',
    heroDesc: '不同的故事相遇，成为同一个故事',
    pill: '查看演出信息',
    dtDate: '时间', dtVenue: '地点',
    venue: 'GVCS 闻庆校区 Hulbert Hall',
    dtMap: '交通', mapLink: '查看地图 ↗',
    btnStory: '剧情简介',
    storyHead: '剧情简介',
    s1: '以<em>“统一”</em>为主题，必须共同完成一个舞台的学生们。<br />不同的想法彼此碰撞，看似完美的演出开始动摇。',
    s2: '还有一个学生，心中藏着从未对任何人说出的故事。<br />那份沉默的背后，究竟隐藏着什么？',
    s3: '彼此不同的我们相遇，共同打造一个舞台——我们的故事（<b>Our Story</b>）。<br />指向爱与和好的祂的故事（<b>His Story</b>）渗透其中，<br />梦想朝鲜半岛和平与福音统一的新历史（<b>History</b>）由此开始。',
    s5: '11月21日，诚邀您来到青少年艺术节',
    histLead: '重温往届的舞台。',
    footer: 'Global Vision Christian School 闻庆校区 · 2026 青少年艺术节',
  },
  de: {
    title: 'Our Story, His Story | GVCS Jugendkunstfestival 2026',
    heroDesc: 'Verschiedene Geschichten begegnen sich und werden zu einer',
    pill: 'Zur Aufführung',
    dtDate: 'Termin', dtVenue: 'Ort',
    venue: 'Hulbert Hall, GVCS Campus Mungyeong',
    dtMap: 'Anfahrt', mapLink: 'Karte öffnen ↗',
    btnStory: 'Zur Handlung',
    storyHead: 'Die Handlung',
    s1: 'Schüler, die zum Thema <em>„Wiedervereinigung“</em> gemeinsam eine Bühne erschaffen sollen.<br />Ihre Vorstellungen prallen aufeinander, und die scheinbar perfekte Aufführung gerät ins Wanken.',
    s2: 'Und unter ihnen ist jemand mit einer Geschichte, die noch niemandem erzählt wurde.<br />Was verbirgt sich hinter diesem Schweigen?',
    s3: 'Unsere Geschichte (<b>Our Story</b>): Wir, so verschieden, kommen zusammen und erschaffen eine Bühne.<br />Seine Geschichte (<b>His Story</b>) von Liebe und Versöhnung fließt hinein,<br />und eine neue Geschichte (<b>History</b>) beginnt, die vom Frieden auf der koreanischen Halbinsel und der Wiedervereinigung durch das Evangelium träumt.',
    s5: 'Am 21. November laden wir Sie herzlich zum Jugendkunstfestival ein',
    histLead: 'Erleben Sie die Bühnen der vergangenen Jahre noch einmal.',
    footer: 'Global Vision Christian School, Campus Mungyeong · Jugendkunstfestival 2026',
  },
  es: {
    title: 'Our Story, His Story | Festival Juvenil de las Artes GVCS 2026',
    heroDesc: 'Historias distintas se encuentran y se convierten en una sola',
    pill: 'Ver información',
    dtDate: 'Fecha', dtVenue: 'Lugar',
    venue: 'Hulbert Hall, campus GVCS Mungyeong',
    dtMap: 'Cómo llegar', mapLink: 'Ver mapa ↗',
    btnStory: 'Leer la sinopsis',
    storyHead: 'Sinopsis',
    s1: 'Unos estudiantes que deben crear un solo escenario sobre la <em>«unificación»</em>.<br />Sus ideas chocan, y la obra que parecía perfecta empieza a tambalearse.',
    s2: 'Y entre ellos, alguien guarda una historia que nunca ha contado a nadie.<br />¿Qué se esconde detrás de ese silencio?',
    s3: 'Nuestra historia (<b>Our Story</b>): nosotros, tan distintos, nos encontramos para construir un mismo escenario.<br />En ella se filtra Su historia (<b>His Story</b>) de amor y reconciliación,<br />y comienza una nueva historia (<b>History</b>) que sueña con la paz en la península coreana y la reunificación a través del Evangelio.',
    s5: 'El 21 de noviembre, te invitamos al Festival Juvenil de las Artes',
    histLead: 'Revive los escenarios de años anteriores.',
    footer: 'Global Vision Christian School, campus Mungyeong · Festival Juvenil de las Artes 2026',
  },
};

// ----- 국기 (원 안에 들어가는 단순한 그림, 30×30) -----

const star =(cx, cy, r, rot = 0) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.382 : r;
    const a = (rot - 90 + i * 36) * Math.PI / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#ffde00"/>`;
};

function chinaStars() {
  const S = 1.6, X0 = 9, Y0 = 9.5;   // 격자 1칸 = 1.6, 큰 별 중심 = (9, 9.5)
  const at = (gx, gy) => [X0 + (gx - 5) * S, Y0 + (gy - 5) * S];
  const [bx, by] = at(5, 5);
  const small = [[10, 2], [12, 4], [12, 7], [10, 9]].map(([gx, gy]) => {
    const [x, y] = at(gx, gy);
    const rot = Math.atan2(by - y, bx - x) * 180 / Math.PI + 90;   // 꼭짓점 하나를 큰 별 쪽으로
    return star(x, y, 1 * S, rot);
  });
  return star(bx, by, 3 * S) + small.join('');
}

const FLAGS = {
  // 태극기 : 받은 태극기 이미지를 태극 중심에 맞춰 정사각형으로 만든 것 (flag-ko.png)
  ko: `<rect width="30" height="30" fill="#fff"/><image href="flag-ko.png" width="30" height="30"/>`,
  // 영국 : 빨간 대각선은 흰 대각선 한가운데가 아니라 한쪽으로 치우쳐 있음 (바람개비처럼).
  //        왼쪽 위·오른쪽 아래 칸에서는 대각선 아래·위, 오른쪽 위·왼쪽 아래 칸에서는 위·아래로.
  en: `<rect width="30" height="30" fill="#012169"/>
       <path d="M0 0L30 30M30 0L0 30" stroke="#fff" stroke-width="6"/>
       <path d="M-.7 .7L14.3 15.7M30.7 29.3L15.7 14.3M29.3 -.7L14.3 14.3M.7 30.7L15.7 15.7" stroke="#c8102e" stroke-width="2"/>
       <path d="M15 0V30M0 15H30" stroke="#fff" stroke-width="10"/>
       <path d="M15 0V30M0 15H30" stroke="#c8102e" stroke-width="6"/>`,
  id: `<rect width="30" height="30" fill="#fff"/><rect width="30" height="15" fill="#ce1126"/>`,
  // 몽골 : 왼쪽 빨간 띠의 소욤보 문양. 94×192 칸에 실제 국기 비율로 그린 뒤 줄여서 띠 안에 넣음
  //        (위에서부터 불꽃 · 해 · 달 · 삼각형 · 막대 · 태극 · 막대 · 삼각형, 양옆 굵은 세로 막대)
  mn: `<rect width="10" height="30" fill="#c4272f"/><rect x="10" width="10" height="30" fill="#015197"/><rect x="20" width="10" height="30" fill="#c4272f"/>
       <g transform="translate(2.17 8) scale(.0729)">
         <g fill="#f9cf02">
           <path d="M33 30Q30 18 37 12Q38 20 42 22Q41 9 47 0Q53 9 52 22Q56 20 57 12Q64 18 61 30Z"/>
           <circle cx="47" cy="48" r="14"/>
           <path d="M22 62A25 25 0 0 0 72 62A30 30 0 0 1 22 62Z"/>
           <rect x="0" y="92" width="20" height="100"/>
           <rect x="74" y="92" width="20" height="100"/>
           <path d="M26 94H68L47 106Z"/>
           <rect x="26" y="110" width="42" height="6"/>
           <circle cx="47" cy="139" r="18"/>
           <rect x="26" y="162" width="42" height="6"/>
           <path d="M26 176H68L47 190Z"/>
         </g>
         <path d="M47 121A18 18 0 0 1 47 157A9 9 0 0 1 47 139A9 9 0 0 0 47 121Z" fill="#c4272f"/>
         <circle cx="47" cy="130" r="3" fill="#c4272f"/>
         <circle cx="47" cy="148" r="3" fill="#f9cf02"/>
       </g>`,
  // 중국 : 국기법의 격자(가로 30 × 세로 20) 위치를 그대로 1.6배. 작은 별 4개는 각각 한 꼭짓점이 큰 별 중심을 향함
  zh: `<rect width="30" height="30" fill="#ee1c25"/>${chinaStars()}`,
  de: `<rect width="30" height="10" fill="#000"/><rect y="10" width="30" height="10" fill="#dd0000"/><rect y="20" width="30" height="10" fill="#ffce00"/>`,
  // 스페인 : 빨강 1 : 노랑 2 : 빨강 1 + 깃대 쪽의 국장 (헤라클레스 기둥 2개 · 왕관 · 4분할 방패).
  //          작은 버튼에서도 형태가 보이도록 단순화. 40×46 칸에 그린 뒤 줄여서 넣음
  es: `<rect width="30" height="30" fill="#aa151b"/><rect y="7.5" width="30" height="15" fill="#f1bf00"/>
       <g transform="translate(6.2 9.5) scale(.24)">
         <g fill="#c8b100">
           <path d="M0 8H7V11H0Z M33 8H40V11H33Z"/>
           <path d="M1 4L2 6L3.5 3.5L5 6L6 4V8H1Z M34 4L35 6L36.5 3.5L38 6L39 4V8H34Z"/>
           <rect x="0" y="40" width="7" height="3"/><rect x="33" y="40" width="7" height="3"/>
         </g>
         <rect x="1" y="11" width="5" height="29" fill="#e6e6e6" stroke="#8a8a8a" stroke-width=".6"/>
         <rect x="34" y="11" width="5" height="29" fill="#e6e6e6" stroke="#8a8a8a" stroke-width=".6"/>
         <path d="M-1 24Q3.5 21 8 24V27Q3.5 24 -1 27Z M32 24Q36.5 21 41 24V27Q36.5 24 32 27Z" fill="#aa151b"/>
         <path d="M11 11L13 4L16.5 8L20 2L23.5 8L27 4L29 11Z" fill="#c8b100"/>
         <path d="M14 8Q20 5 26 8V10H14Z" fill="#aa151b"/>
         <path d="M10 12H30V32Q30 41 20 41Q10 41 10 32Z" fill="#aa151b" stroke="#c8b100" stroke-width=".8"/>
         <rect x="20" y="12" width="10" height="11" fill="#fff"/>
         <path d="M10 23H20V33H10Z" fill="#c8b100"/>
         <path d="M12 23V33M15 23V33M18 23V33" stroke="#aa151b" stroke-width="1.4"/>
         <path d="M12.5 15H17.5V21H12.5Z M12 14H13.5V15H12Z M14.25 14H15.75V15H14.25Z M16.5 14H18V15H16.5Z" fill="#c8b100"/>
         <circle cx="25" cy="17.5" r="2.6" fill="#9b2c7c"/>
         <path d="M22 28H28M25 25V31" stroke="#c8b100" stroke-width="1.2"/>
         <ellipse cx="20" cy="23" rx="3" ry="3.6" fill="#1f4aa8" stroke="#aa151b" stroke-width=".8"/>
       </g>`,
};

const LANGS = [
  ['ko', '한국어'], ['en', 'English'], ['id', 'Bahasa Indonesia'], ['mn', 'Монгол'],
  ['zh', '中文'], ['de', 'Deutsch'], ['es', 'Español'],
];

// ----- 화면에 적용 -----
const KO_TITLE = document.title;   // 브라우저 탭 제목 (한국어 원문)
const applyLang = (lang) => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (el.dataset.ko === undefined) el.dataset.ko = el.innerHTML;   // 처음 한 번 한국어 원문 보관
    el.innerHTML = lang === 'ko' ? el.dataset.ko : (TEXT[lang]?.[el.dataset.i18n] ?? el.dataset.ko);
  });
  document.title = (lang !== 'ko' && TEXT[lang]?.title) || KO_TITLE;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', b.dataset.lang === lang);
  });
  try { localStorage.setItem('lang', lang); } catch (e) { /* 저장이 막혀 있어도 번역은 됩니다 */ }
};

// 국기 버튼 만들기 (상단바 · 펼친 메뉴 두 곳)
document.querySelectorAll('.lang-switch').forEach((box) => {
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Language');
  box.innerHTML = LANGS.map(([code, name]) => `
    <button class="lang-btn" type="button" data-lang="${code}" title="${name}" aria-label="${name}">
      <svg viewBox="0 0 30 30" aria-hidden="true">${FLAGS[code]}</svg>
      <span class="lang-code" aria-hidden="true">${code.toUpperCase()}</span>
    </button>`).join('');
  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    applyLang(btn.dataset.lang);
    document.dispatchEvent(new Event('close-menu'));   // 언어를 고르면 펼친 메뉴는 닫기 (main.js)
  });
});

// 지난번에 고른 언어로 시작 (없으면 한국어)
let saved = 'ko';
try { saved = localStorage.getItem('lang') || 'ko'; } catch (e) { /* 무시 */ }
applyLang(TEXT[saved] || saved === 'ko' ? saved : 'ko');

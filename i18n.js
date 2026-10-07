// ===== 언어 바꾸기 (국기 버튼) =====
// 화면 글자 중 data-i18n="이름" 이 붙은 곳만 바뀝니다.
// 한국어는 HTML 에 적힌 원래 글자를 그대로 쓰고, 다른 언어는 아래 TEXT 에서 가져옵니다.
// 문장을 고치려면 TEXT 의 해당 언어 · 이름을 찾아 바꾸면 됩니다.

const TEXT = {
  en: {
    title: 'Our Story, His Story | 2026 Youth Arts Festival',
    heroDesc: 'Different stories meet and become one story',
    pill: 'View show info',
    dtDate: 'When', dtVenue: 'Venue', dtTicket: 'Tickets',
    venue: 'Hulbert Hall, GVCS Mungyeong Campus',
    dtMap: 'Directions', mapLink: 'View on map ↗',
    ticketSoon: 'Opening soon', btnStory: 'Read the story',
    storyHead: 'The Story',
    s1: 'Students who must create a single stage around the theme of <em>“unification.”</em>',
    s2: 'But their different ideas keep clashing,<br />and the show that seemed perfect slowly begins to falter.',
    s3: 'And among them, one student holds a story never told to anyone.<br />What could be hidden behind that silence…?',
    s4: 'The moment they understand one another,<br />the stage they were building becomes a completely different story.',
    s5: 'See you on November 21 at Hulbert Hall.',
    histLead: 'Revisit the stages of past years.',
    footer: 'Global Vision Christian School, Mungyeong Campus · 2026 Youth Arts Festival',
  },
  id: {
    title: 'Our Story, His Story | Festival Seni Remaja GVCS 2026',
    heroDesc: 'Kisah-kisah yang berbeda bertemu dan menjadi satu kisah',
    pill: 'Lihat info pertunjukan',
    dtDate: 'Waktu', dtVenue: 'Tempat', dtTicket: 'Tiket',
    venue: 'Hulbert Hall, Kampus GVCS Mungyeong',
    dtMap: 'Rute', mapLink: 'Lihat peta ↗',
    ticketSoon: 'Segera dibuka', btnStory: 'Baca sinopsis',
    storyHead: 'Sinopsis',
    s1: 'Para siswa yang harus menciptakan satu panggung dengan tema <em>“penyatuan”</em>.',
    s2: 'Namun perbedaan pendapat terus berbenturan,<br />dan pertunjukan yang tampak sempurna perlahan mulai goyah.',
    s3: 'Di antara mereka, ada seorang siswa yang menyimpan kisah yang tak pernah diceritakan kepada siapa pun.<br />Kisah apa yang tersembunyi di balik diamnya…?',
    s4: 'Saat mereka mulai saling memahami,<br />panggung yang mereka bangun menjadi kisah yang sama sekali berbeda.',
    s5: 'Sampai jumpa pada 21 November di Hulbert Hall.',
    histLead: 'Saksikan kembali panggung-panggung tahun sebelumnya.',
    footer: 'Global Vision Christian School, Kampus Mungyeong · Festival Seni Remaja 2026',
  },
  mn: {
    title: 'Our Story, His Story | GVCS 2026 Залуучуудын урлагийн наадам',
    heroDesc: 'Өөр өөр түүхүүд нийлж, нэг түүх болно',
    pill: 'Тоглолтын мэдээлэл',
    dtDate: 'Хэзээ', dtVenue: 'Хаана', dtTicket: 'Тасалбар',
    venue: 'GVCS Мүнгёон кампус, Hulbert Hall',
    dtMap: 'Хаяг', mapLink: 'Газрын зураг ↗',
    ticketSoon: 'Удахгүй нээгдэнэ', btnStory: 'Үйл явдал',
    storyHead: 'Үйл явдал',
    s1: '<em>“Нэгдэл”</em> сэдвээр нэг тайз бүтээх ёстой сурагчид.',
    s2: 'Гэвч өөр өөр бодол санаа нь байнга мөргөлдөж,<br />төгс болох мэт байсан тоглолт аажмаар ганхаж эхэлнэ.',
    s3: 'Мөн тэдний дунд хэнд ч хэлээгүй түүхээ нууж яваа нэгэн сурагч бий.<br />Тэр чимээгүй байдлын цаана ямар түүх нуугдаж байгаа бол…?',
    s4: 'Бие биенээ ойлгох тэр мөчид<br />тэдний бүтээж буй тайз огт өөр түүх болон хувирна.',
    s5: '11-р сарын 21-нд Hulbert Hall-д уулзацгаая.',
    histLead: 'Өмнөх жилүүдийн тоглолтыг дахин үзээрэй.',
    footer: 'Global Vision Christian School, Мүнгёон кампус · 2026 Залуучуудын урлагийн наадам',
  },
  zh: {
    title: 'Our Story, His Story | GVCS 2026 青少年艺术节',
    heroDesc: '不同的故事相遇，成为同一个故事',
    pill: '查看演出信息',
    dtDate: '时间', dtVenue: '地点', dtTicket: '购票',
    venue: 'GVCS 闻庆校区 Hulbert Hall',
    dtMap: '交通', mapLink: '查看地图 ↗',
    ticketSoon: '即将开放', btnStory: '剧情简介',
    storyHead: '剧情简介',
    s1: '以<em>“统一”</em>为主题，必须共同完成一个舞台的学生们。',
    s2: '然而彼此不同的想法不断碰撞，<br />原以为完美的演出开始一点点动摇。',
    s3: '其中有一个学生，心中藏着从未向任何人说起的故事。<br />那份沉默的背后，究竟隐藏着怎样的故事……？',
    s4: '在彼此理解的那一刻，<br />他们打造的舞台变成了一个完全不同的故事。',
    s5: '11月21日，Hulbert Hall 不见不散。',
    histLead: '重温往届的舞台。',
    footer: 'Global Vision Christian School 闻庆校区 · 2026 青少年艺术节',
  },
  de: {
    title: 'Our Story, His Story | GVCS Jugendkunstfestival 2026',
    heroDesc: 'Verschiedene Geschichten begegnen sich und werden zu einer',
    pill: 'Zur Aufführung',
    dtDate: 'Termin', dtVenue: 'Ort', dtTicket: 'Tickets',
    venue: 'Hulbert Hall, GVCS Campus Mungyeong',
    dtMap: 'Anfahrt', mapLink: 'Karte öffnen ↗',
    ticketSoon: 'Demnächst', btnStory: 'Zur Handlung',
    storyHead: 'Die Handlung',
    s1: 'Schüler, die zum Thema <em>„Wiedervereinigung“</em> gemeinsam eine Bühne erschaffen sollen.',
    s2: 'Doch ihre unterschiedlichen Vorstellungen prallen immer wieder aufeinander,<br />und die Aufführung, die perfekt schien, gerät allmählich ins Wanken.',
    s3: 'Und unter ihnen ist jemand mit einer Geschichte, die noch nie erzählt wurde.<br />Was verbirgt sich wohl hinter diesem Schweigen …?',
    s4: 'In dem Moment, in dem sie einander verstehen,<br />wird ihre Bühne zu einer ganz anderen Geschichte.',
    s5: 'Wir sehen uns am 21. November in der Hulbert Hall.',
    histLead: 'Erleben Sie die Bühnen der vergangenen Jahre noch einmal.',
    footer: 'Global Vision Christian School, Campus Mungyeong · Jugendkunstfestival 2026',
  },
  es: {
    title: 'Our Story, His Story | Festival Juvenil de las Artes GVCS 2026',
    heroDesc: 'Historias distintas se encuentran y se convierten en una sola',
    pill: 'Ver información',
    dtDate: 'Fecha', dtVenue: 'Lugar', dtTicket: 'Entradas',
    venue: 'Hulbert Hall, campus GVCS Mungyeong',
    dtMap: 'Cómo llegar', mapLink: 'Ver mapa ↗',
    ticketSoon: 'Próximamente', btnStory: 'Leer la sinopsis',
    storyHead: 'Sinopsis',
    s1: 'Unos estudiantes que deben crear un solo escenario sobre el tema de la <em>«unificación»</em>.',
    s2: 'Pero sus ideas distintas chocan una y otra vez,<br />y la obra que parecía perfecta empieza a tambalearse poco a poco.',
    s3: 'Y entre ellos, alguien guarda una historia que nunca ha contado a nadie.<br />¿Qué se esconderá detrás de ese silencio…?',
    s4: 'En el momento en que se comprenden,<br />el escenario que construían se convierte en una historia completamente distinta.',
    s5: 'Nos vemos el 21 de noviembre en el Hulbert Hall.',
    histLead: 'Revive los escenarios de años anteriores.',
    footer: 'Global Vision Christian School, campus Mungyeong · Festival Juvenil de las Artes 2026',
  },
};

// ----- 국기 (원 안에 들어가는 단순한 그림, 30×30) -----

// 태극기 : 국기법의 비율을 따라 계산해서 그립니다.
//  · 태극과 4괘는 깃발의 대각선(가로 3 : 세로 2) 위에 놓임
//  · 태극 : 위 빨강 · 아래 파랑. 왼쪽은 빨강이, 오른쪽은 파랑이 휘어 들어감
//  · 4괘 : 왼쪽 위 건(☰) · 오른쪽 아래 곤(☷) · 오른쪽 위 감(☵) · 왼쪽 아래 리(☲)
//  둥근 버튼(지름 30) 안에 4괘까지 다 들어가도록 크기를 맞췄고,
//  작은 화면에서도 괘의 끊어진 막대가 보이도록 막대 굵기 · 간격만 조금 키웠습니다.
function taegukgi() {
  const C = 15;              // 가운데
  const R = 6;               // 태극 반지름
  const BAR_LEN = 6.2;       // 괘 막대 길이
  const BAR_W = 1.25;        // 괘 막대 굵기
  const BAR_GAP = 0.8;       // 괘 막대 사이 간격
  const SPLIT = 1.1;         // 끊어진 막대 가운데 틈
  const TO_BAR = 2.6;        // 태극 가장자리 ~ 첫 막대
  const f = (n) => n.toFixed(2);

  // 대각선 방향 (가로 3 : 세로 2)
  const k = Math.hypot(3, 2);
  const toBR = [3 / k, 2 / k];     // 가운데 → 오른쪽 아래
  const toTR = [3 / k, -2 / k];    // 가운데 → 오른쪽 위
  const at = (dir, d) => [C + dir[0] * d, C + dir[1] * d];

  // 태극 : 파란 원 위에 빨간 S 모양을 덮음 (작은 반원 지름 = 태극 반지름)
  const A = at(toBR, -R);   // 왼쪽 위 끝
  const B = at(toBR, R);    // 오른쪽 아래 끝
  const r2 = R / 2;
  const taeguk =
    `<circle cx="${C}" cy="${C}" r="${R}" fill="#0047a0"/>` +
    `<path fill="#cd2e3a" d="M${f(A[0])} ${f(A[1])}` +
    `A${R} ${R} 0 0 1 ${f(B[0])} ${f(B[1])}` +      // 큰 반원 (위쪽)
    `A${r2} ${r2} 0 0 0 ${C} ${C}` +                 // 오른쪽 : 파랑이 위로 휘어 들어감
    `A${r2} ${r2} 0 0 1 ${f(A[0])} ${f(A[1])}Z"/>`;  // 왼쪽 : 빨강이 아래로 휘어 내려감

  // 괘 하나 : lines 는 안쪽 막대부터 [true = 이어진 막대, false = 끊어진 막대]
  const trigram = (dir, lines) => {
    const angle = Math.atan2(dir[1], dir[0]) * 180 / Math.PI + 90;  // 막대는 대각선에 수직
    return lines.map((solid, i) => {
      const [x, y] = at(dir, R + TO_BAR + BAR_W / 2 + i * (BAR_W + BAR_GAP));
      const half = BAR_LEN / 2;
      const parts = solid
        ? [[-half, BAR_LEN]]
        : [[-half, half - SPLIT / 2], [SPLIT / 2, half - SPLIT / 2]];
      return parts.map(([start, len]) =>
        `<rect x="${f(start)}" y="${f(-BAR_W / 2)}" width="${f(len)}" height="${f(BAR_W)}" ` +
        `transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"/>`).join('');
    }).join('');
  };
  const neg = (d) => [-d[0], -d[1]];
  const trigrams =
    trigram(neg(toBR), [true, true, true]) +     // 건 ☰ 왼쪽 위
    trigram(toBR, [false, false, false]) +       // 곤 ☷ 오른쪽 아래
    trigram(toTR, [false, true, false]) +        // 감 ☵ 오른쪽 위
    trigram(neg(toTR), [true, false, true]);     // 리 ☲ 왼쪽 아래

  return `<rect width="30" height="30" fill="#fff"/>${taeguk}<g fill="#000">${trigrams}</g>`;
}

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
  ko: taegukgi(),
  // 영국 : 빨간 대각선은 흰 대각선 한가운데가 아니라 한쪽으로 치우쳐 있음 (바람개비처럼).
  //        왼쪽 위·오른쪽 아래 칸에서는 대각선 아래·위, 오른쪽 위·왼쪽 아래 칸에서는 위·아래로.
  en: `<rect width="30" height="30" fill="#012169"/>
       <path d="M0 0L30 30M30 0L0 30" stroke="#fff" stroke-width="6"/>
       <path d="M-.7 .7L14.3 15.7M30.7 29.3L15.7 14.3M29.3 -.7L14.3 14.3M.7 30.7L15.7 15.7" stroke="#c8102e" stroke-width="2"/>
       <path d="M15 0V30M0 15H30" stroke="#fff" stroke-width="10"/>
       <path d="M15 0V30M0 15H30" stroke="#c8102e" stroke-width="6"/>`,
  id: `<rect width="30" height="30" fill="#fff"/><rect width="30" height="15" fill="#ce1126"/>`,
  // 몽골 : 왼쪽 빨간 띠의 소욤보 문양 (위에서부터 불꽃 · 해 · 달 · 삼각형 · 막대 · 태극 · 막대 · 삼각형, 양옆 세로 막대)
  mn: `<rect width="10" height="30" fill="#c4272f"/><rect x="10" width="10" height="30" fill="#015197"/><rect x="20" width="10" height="30" fill="#c4272f"/>
       <g fill="#f9cf02">
         <path d="M3.9 8.6Q3.6 7.2 4.3 6.6Q4.4 7.4 4.8 7.6Q4.8 6.4 5.3 5.6Q5.8 6.4 5.8 7.6Q6.2 7.4 6.3 6.6Q7 7.2 6.7 8.6Z"/>
         <circle cx="5.3" cy="10" r="1.2"/>
         <path d="M3.9 11.5A1.4 1.4 0 0 0 6.7 11.5A1.8 1.8 0 0 1 3.9 11.5Z"/>
         <path d="M3.3 13H7.3L5.3 14.6Z"/>
         <rect x="3.3" y="15.1" width="4" height=".6"/>
         <circle cx="5.3" cy="17.6" r="1.5"/>
         <rect x="3.3" y="19.5" width="4" height=".6"/>
         <path d="M3.3 20.5H7.3L5.3 22.1Z"/>
         <rect x="2.3" y="13" width=".6" height="9.1"/>
         <rect x="7.7" y="13" width=".6" height="9.1"/>
       </g>
       <path d="M5.3 16.1A1.5 1.5 0 0 1 5.3 19.1A.75 .75 0 0 1 5.3 17.6A.75 .75 0 0 0 5.3 16.1Z" fill="#c4272f"/>`,
  // 중국 : 국기법의 격자(가로 30 × 세로 20) 위치를 그대로 1.6배. 작은 별 4개는 각각 한 꼭짓점이 큰 별 중심을 향함
  zh: `<rect width="30" height="30" fill="#ee1c25"/>${chinaStars()}`,
  de: `<rect width="30" height="10" fill="#000"/><rect y="10" width="30" height="10" fill="#dd0000"/><rect y="20" width="30" height="10" fill="#ffce00"/>`,
  es: `<rect width="30" height="30" fill="#aa151b"/><rect y="7.5" width="30" height="15" fill="#f1bf00"/>`,
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

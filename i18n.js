// ===== 언어 바꾸기 (국기 버튼) =====
// 화면 글자 중 data-i18n="이름" 이 붙은 곳만 바뀝니다.
// 한국어는 HTML 에 적힌 원래 글자를 그대로 쓰고, 다른 언어는 아래 TEXT 에서 가져옵니다.
// 문장을 고치려면 TEXT 의 해당 언어 · 이름을 찾아 바꾸면 됩니다.

const YT = 'https://www.youtube.com/@GVCSMG';
const ytLink = (label) => `<a href="${YT}" target="_blank" rel="noopener">${label}</a>`;

const TEXT = {
  en: {
    logo: 'GVCS Youth Arts Festival',
    heroDesc: 'The story of students building one stage around the theme of “unification”',
    heroFest: 'GVCS 2026 Youth Arts Festival',
    pill: 'View show info',
    genre: '2026 Youth Arts Festival',
    dtDate: 'When', dtVenue: 'Venue', dtTicket: 'Tickets',
    venue: 'Hulbert Hall, GVCS Mungyeong Campus',
    btnInfo: 'Show info', btnTicket: 'Tickets · Coming Soon',
    s1: 'Students who must create a single stage around the theme of <em>“unification.”</em>',
    s2: 'But their different ideas keep clashing,<br />and the show that seemed perfect slowly begins to falter.',
    s3: 'And among them, one student holds a story never told to anyone.<br />What could be hidden behind that silence…?',
    s4: 'The moment they understand one another,<br />the stage they were building becomes a completely different story.',
    s5: 'An amazing story unfolding at GVCS…',
    histLead: 'Revisit the stages of past years.',
    histMore: `More videos on the ${ytLink('GVCS [MG] YouTube channel')}.`,
    footer: 'Global Vision Christian School, Mungyeong Campus · 2026 Youth Arts Festival',
  },
  id: {
    logo: 'Festival Seni Remaja GVCS',
    heroDesc: 'Kisah para siswa yang membangun satu panggung bertema “penyatuan”',
    heroFest: 'Festival Seni Remaja GVCS 2026',
    pill: 'Lihat info pertunjukan',
    genre: 'Festival Seni Remaja 2026',
    dtDate: 'Waktu', dtVenue: 'Tempat', dtTicket: 'Tiket',
    venue: 'Hulbert Hall, Kampus GVCS Mungyeong',
    btnInfo: 'Info pertunjukan', btnTicket: 'Tiket · Segera Hadir',
    s1: 'Para siswa yang harus menciptakan satu panggung dengan tema <em>“penyatuan”</em>.',
    s2: 'Namun perbedaan pendapat terus berbenturan,<br />dan pertunjukan yang tampak sempurna perlahan mulai goyah.',
    s3: 'Di antara mereka, ada seorang siswa yang menyimpan kisah yang tak pernah diceritakan kepada siapa pun.<br />Kisah apa yang tersembunyi di balik diamnya…?',
    s4: 'Saat mereka mulai saling memahami,<br />panggung yang mereka bangun menjadi kisah yang sama sekali berbeda.',
    s5: 'Kisah menakjubkan yang terungkap di GVCS…',
    histLead: 'Saksikan kembali panggung-panggung tahun sebelumnya.',
    histMore: `Video lainnya dapat ditonton di ${ytLink('kanal YouTube GVCS [MG]')}.`,
    footer: 'Global Vision Christian School, Kampus Mungyeong · Festival Seni Remaja 2026',
  },
  mn: {
    logo: 'GVCS Залуучуудын урлагийн наадам',
    heroDesc: '“Нэгдэл” сэдвээр нэг тайз бүтээж буй сурагчдын түүх',
    heroFest: 'GVCS 2026 Залуучуудын урлагийн наадам',
    pill: 'Тоглолтын мэдээлэл',
    genre: '2026 Залуучуудын урлагийн наадам',
    dtDate: 'Хэзээ', dtVenue: 'Хаана', dtTicket: 'Тасалбар',
    venue: 'GVCS Мүнгёон кампус, Hulbert Hall',
    btnInfo: 'Тоглолтын тухай', btnTicket: 'Тасалбар · Тун удахгүй',
    s1: '<em>“Нэгдэл”</em> сэдвээр нэг тайз бүтээх ёстой сурагчид.',
    s2: 'Гэвч өөр өөр бодол санаа нь байнга мөргөлдөж,<br />төгс болох мэт байсан тоглолт аажмаар ганхаж эхэлнэ.',
    s3: 'Мөн тэдний дунд хэнд ч хэлээгүй түүхээ нууж яваа нэгэн сурагч бий.<br />Тэр чимээгүй байдлын цаана ямар түүх нуугдаж байгаа бол…?',
    s4: 'Бие биенээ ойлгох тэр мөчид<br />тэдний бүтээж буй тайз огт өөр түүх болон хувирна.',
    s5: 'GVCS-д өрнөх гайхамшигт түүх…',
    histLead: 'Өмнөх жилүүдийн тоглолтыг дахин үзээрэй.',
    histMore: `Бусад бичлэгийг ${ytLink('GVCS [MG] YouTube сувгаас')} үзэх боломжтой.`,
    footer: 'Global Vision Christian School, Мүнгёон кампус · 2026 Залуучуудын урлагийн наадам',
  },
  zh: {
    logo: 'GVCS 青少年艺术节',
    heroDesc: '以“统一”为主题，共同打造一个舞台的学生们的故事',
    heroFest: 'GVCS 2026 青少年艺术节',
    pill: '查看演出信息',
    genre: '2026 青少年艺术节',
    dtDate: '时间', dtVenue: '地点', dtTicket: '购票',
    venue: 'GVCS 闻庆校区 Hulbert Hall',
    btnInfo: '演出信息', btnTicket: '购票 · 敬请期待',
    s1: '以<em>“统一”</em>为主题，必须共同完成一个舞台的学生们。',
    s2: '然而彼此不同的想法不断碰撞，<br />原以为完美的演出开始一点点动摇。',
    s3: '其中有一个学生，心中藏着从未向任何人说起的故事。<br />那份沉默的背后，究竟隐藏着怎样的故事……？',
    s4: '在彼此理解的那一刻，<br />他们打造的舞台变成了一个完全不同的故事。',
    s5: '在 GVCS 上演的精彩故事……',
    histLead: '重温往届的舞台。',
    histMore: `更多视频请前往 ${ytLink('GVCS [MG] YouTube 频道')} 观看。`,
    footer: 'Global Vision Christian School 闻庆校区 · 2026 青少年艺术节',
  },
  de: {
    logo: 'GVCS Jugendkunstfestival',
    heroDesc: 'Die Geschichte von Schülern, die gemeinsam eine Bühne zum Thema „Wiedervereinigung“ gestalten',
    heroFest: 'GVCS Jugendkunstfestival 2026',
    pill: 'Zur Aufführung',
    genre: 'Jugendkunstfestival 2026',
    dtDate: 'Termin', dtVenue: 'Ort', dtTicket: 'Tickets',
    venue: 'Hulbert Hall, GVCS Campus Mungyeong',
    btnInfo: 'Über das Stück', btnTicket: 'Tickets · Demnächst',
    s1: 'Schüler, die zum Thema <em>„Wiedervereinigung“</em> gemeinsam eine Bühne erschaffen sollen.',
    s2: 'Doch ihre unterschiedlichen Vorstellungen prallen immer wieder aufeinander,<br />und die Aufführung, die perfekt schien, gerät allmählich ins Wanken.',
    s3: 'Und unter ihnen ist jemand mit einer Geschichte, die noch nie erzählt wurde.<br />Was verbirgt sich wohl hinter diesem Schweigen …?',
    s4: 'In dem Moment, in dem sie einander verstehen,<br />wird ihre Bühne zu einer ganz anderen Geschichte.',
    s5: 'Eine erstaunliche Geschichte, die sich an der GVCS entfaltet …',
    histLead: 'Erleben Sie die Bühnen der vergangenen Jahre noch einmal.',
    histMore: `Weitere Videos gibt es auf dem ${ytLink('YouTube-Kanal von GVCS [MG]')}.`,
    footer: 'Global Vision Christian School, Campus Mungyeong · Jugendkunstfestival 2026',
  },
  es: {
    logo: 'Festival Juvenil de las Artes GVCS',
    heroDesc: 'La historia de unos estudiantes que crean juntos un escenario sobre la «unificación»',
    heroFest: 'Festival Juvenil de las Artes GVCS 2026',
    pill: 'Ver información',
    genre: 'Festival Juvenil de las Artes 2026',
    dtDate: 'Fecha', dtVenue: 'Lugar', dtTicket: 'Entradas',
    venue: 'Hulbert Hall, campus GVCS Mungyeong',
    btnInfo: 'Sobre la obra', btnTicket: 'Entradas · Próximamente',
    s1: 'Unos estudiantes que deben crear un solo escenario sobre el tema de la <em>«unificación»</em>.',
    s2: 'Pero sus ideas distintas chocan una y otra vez,<br />y la obra que parecía perfecta empieza a tambalearse poco a poco.',
    s3: 'Y entre ellos, alguien guarda una historia que nunca ha contado a nadie.<br />¿Qué se esconderá detrás de ese silencio…?',
    s4: 'En el momento en que se comprenden,<br />el escenario que construían se convierte en una historia completamente distinta.',
    s5: 'Una historia asombrosa que se desarrolla en GVCS…',
    histLead: 'Revive los escenarios de años anteriores.',
    histMore: `Más vídeos en el ${ytLink('canal de YouTube de GVCS [MG]')}.`,
    footer: 'Global Vision Christian School, campus Mungyeong · Festival Juvenil de las Artes 2026',
  },
};

// ----- 국기 (원 안에 들어가는 단순한 그림, 30×30) -----
const star = (cx, cy, r, rot = 0) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.382 : r;
    const a = (rot - 90 + i * 36) * Math.PI / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#ffde00"/>`;
};

const FLAGS = {
  ko: `<rect width="30" height="30" fill="#fff"/>
       <circle cx="15" cy="15" r="7" fill="#0047a0"/>
       <path d="M8 15a7 7 0 0 1 14 0a3.5 3.5 0 0 1-7 0a3.5 3.5 0 0 0-7 0z" fill="#cd2e3a"/>
       <g stroke="#111" stroke-width="1.3"><path d="M4 8l3-3M5.5 9.5l3-3M3.5 12l2.5-2.5"/><path d="M22 5l3 3M23.5 3.5l3 3M21 21l3 3M22.5 19.5l3 3M4 22l3 3M5.5 20.5l3 3"/></g>`,
  en: `<rect width="30" height="30" fill="#012169"/>
       <path d="M0 0L30 30M30 0L0 30" stroke="#fff" stroke-width="6"/>
       <path d="M0 0L30 30M30 0L0 30" stroke="#c8102e" stroke-width="2"/>
       <path d="M15 0V30M0 15H30" stroke="#fff" stroke-width="10"/>
       <path d="M15 0V30M0 15H30" stroke="#c8102e" stroke-width="6"/>`,
  id: `<rect width="30" height="30" fill="#fff"/><rect width="30" height="15" fill="#ce1126"/>`,
  mn: `<rect width="10" height="30" fill="#c4272f"/><rect x="10" width="10" height="30" fill="#015197"/><rect x="20" width="10" height="30" fill="#c4272f"/>
       <circle cx="5" cy="10" r="1.8" fill="#f9cf02"/><rect x="3" y="13" width="4" height="1.5" fill="#f9cf02"/><rect x="3" y="15.5" width="4" height="5" fill="none" stroke="#f9cf02" stroke-width="1"/><rect x="3" y="21.5" width="4" height="1.5" fill="#f9cf02"/>`,
  zh: `<rect width="30" height="30" fill="#ee1c25"/>${star(9, 10, 5)}${star(15, 5, 1.6, 20)}${star(17.5, 8, 1.6, 40)}${star(17.5, 12, 1.6, 0)}${star(15, 15, 1.6, 20)}`,
  de: `<rect width="30" height="10" fill="#000"/><rect y="10" width="30" height="10" fill="#dd0000"/><rect y="20" width="30" height="10" fill="#ffce00"/>`,
  es: `<rect width="30" height="30" fill="#aa151b"/><rect y="7.5" width="30" height="15" fill="#f1bf00"/>`,
};

const LANGS = [
  ['ko', '한국어'], ['en', 'English'], ['id', 'Bahasa Indonesia'], ['mn', 'Монгол'],
  ['zh', '中文'], ['de', 'Deutsch'], ['es', 'Español'],
];

// ----- 화면에 적용 -----
const applyLang = (lang) => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (el.dataset.ko === undefined) el.dataset.ko = el.innerHTML;   // 처음 한 번 한국어 원문 보관
    el.innerHTML = lang === 'ko' ? el.dataset.ko : (TEXT[lang]?.[el.dataset.i18n] ?? el.dataset.ko);
  });
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
    if (btn) applyLang(btn.dataset.lang);
  });
});

// 지난번에 고른 언어로 시작 (없으면 한국어)
let saved = 'ko';
try { saved = localStorage.getItem('lang') || 'ko'; } catch (e) { /* 무시 */ }
applyLang(TEXT[saved] || saved === 'ko' ? saved : 'ko');

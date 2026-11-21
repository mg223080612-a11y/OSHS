// ===== 실사 무대 커튼 (WebGL) : 공연 후 Home 첫 화면 (js/showday.js 가 씀 · 모양은 css/showday.css) =====
// 그림 파일 없이 벨벳 주름 · 위 휘장 · 금색 술 · 당김 줄 · 무대 바닥을 한 장면으로 그립니다.
// 열릴 때 : 위 레일이 먼저 움직이고 아랫단이 늦게 따라오다 흔들리며 멈춤. 주름은 모이면서 좁고 깊어짐.
// WebGL 을 못 쓰는 기기에서는 null 을 돌려주고, css/showday.css 의 .sd-curtain.no-gl (단순 커튼)이 대신 보입니다.
// onArrive(열림) : 막이 끝까지 열리거나 닫혔을 때 (손으로 밀다 놓은 경우 포함. 바로 여닫는 경우에는 부르지 않음)
// onLost · onRestored : 브라우저가 그리기 기능을 거둬 갔을 때(탭을 오래 떠났다 돌아온 폰 등) · 되찾았을 때
window.createStageCurtain = (canvas, { reduce = false, onProgress = () => {}, onArrive = () => {}, onLost = () => {}, onRestored = () => {} } = {}) => {
  const VERT = 'attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }';
  const FRAG = `
precision highp float;
uniform vec2 uRes;      // 캔버스 크기 (CSS px)
uniform float uScale;   // CSS px 하나가 캔버스 몇 px 인지
uniform float uTime;
uniform vec4 uLead;     // 막 안쪽 끝 위치 (높이 0 · 1/4 · 2/4 · 3/4). 1 = 가운데까지 닫힘
uniform float uLead4;   // 막 안쪽 끝 위치 (아랫단)
uniform float uR;       // 다 열렸을 때 한쪽 막의 폭 (화면 절반 대비)
uniform float uTop;     // 상단 메뉴 높이
uniform float uVal;     // 위 휘장 높이
uniform float uFold;    // 주름 하나의 폭
uniform float uHem;     // 아랫단 위치 (위에서부터)
uniform vec4 uTassel;   // 당김 줄 : x, 술 위쪽 y, 당긴 길이, 보임(0 · 1)
uniform vec3 uSpot;     // 조명 : x, y, 반지름
uniform float uSway;    // 가만히 있을 때의 미세한 흔들림 (0 = 끔)

const float PI = 3.14159265;
float gOpen, gSpot, gLift, gH;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float cr(float a, float b, float c, float d, float t) {
  return 0.5 * (2.0 * b + (c - a) * t + (2.0 * a - 5.0 * b + 4.0 * c - d) * t * t + (3.0 * b - a - 3.0 * c + d) * t * t * t);
}
// 높이(0 위 ~ 1 아랫단)에 따른 막 안쪽 끝 : 다섯 점을 부드럽게 이음 (아랫단이 늦게 따라와 휘어짐)
float leadAt(float v) {
  float t = clamp(v, 0.0, 1.0) * 4.0;
  if (t < 1.0) return cr(2.0 * uLead.x - uLead.y, uLead.x, uLead.y, uLead.z, t);
  if (t < 2.0) return cr(uLead.x, uLead.y, uLead.z, uLead.w, t - 1.0);
  if (t < 3.0) return cr(uLead.y, uLead.z, uLead.w, uLead4, t - 2.0);
  return cr(uLead.z, uLead.w, uLead4, 2.0 * uLead4 - uLead.w, t - 3.0);
}
float spotAt(vec2 p) { return (1.0 - smoothstep(0.62, 1.0, length(p - uSpot.xy) / uSpot.z)) * gSpot; }
// 위 휘장의 아래 가장자리 (물결 모양). 화면 폭에 딱 맞게 나눔
float valEdge(float x) {
  float n = max(2.0, floor(uRes.x / (uVal * 2.9) + 0.5));
  return uVal * (0.70 + 0.30 * pow(abs(sin(PI * x * n / uRes.x)), 0.75));
}
// 벨벳 : 정면은 깊고 어둡게, 비스듬한 면은 결이 빛남. 골은 그늘
vec3 velvet(float nx, float hn, float tight) {
  vec3 n = normalize(vec3(nx, -0.10, 1.0));
  float diff = pow(max(0.0, dot(n, normalize(vec3(-0.20, -0.40, 0.89))) * 0.62 + 0.38), 1.35);
  float rim = pow(1.0 - n.z, 2.2);
  float ao = mix(mix(0.26, 0.09, tight), 1.0, smoothstep(-1.0, 0.25, hn));
  return (vec3(0.215, 0.052, 0.305) * (0.07 + 1.25 * diff) + vec3(0.62, 0.42, 0.76) * rim * 0.20 * (0.30 + diff)) * ao;
}

// 큰 막 (좌우 두 장). 열린 자리(무대)에는 막이 드리우는 그림자만
vec4 drape(vec2 p) {
  float halfW = 0.5 * uRes.x;
  float side = p.x < halfW ? -1.0 : 1.0;
  float q = (side < 0.0 ? p.x : uRes.x - p.x) / halfW;
  float v = clamp((p.y - uTop) / (uHem - uTop), 0.0, 1.0);
  float L = leadAt(v);
  float edge = (L - q) * halfW;
  gH = 0.0;
  if (edge < 0.0) return vec4(0.0, 0.0, 0.0, 0.45 * exp(edge / 34.0) * smoothstep(0.0, 0.08, gOpen));

  // 화면 위치 → 천 위의 위치 : 안쪽 끝부터 주름이 모여 쌓임 (모인 곳은 uR 배로 좁아짐)
  float op = clamp((1.0 - L) / (1.0 - uR), 0.0, 1.3);
  float k = mix(8.0, 24.0, smoothstep(0.5, 1.0, op));
  float m = min(40.0, k * max(0.0, 1.0 - L) / (1.0 - uR));
  float sc = 1.0 - log(max(exp(m) - 1.0, 1e-5)) / k;
  float s = q < sc ? q : sc + (q - sc) / uR;
  for (int i = 0; i < 5; i++) {
    float z = k * (s - sc);
    float e = exp(clamp(z, -30.0, 15.0));
    float sp = z > 15.0 ? z : log(1.0 + e);
    float sg = z > 15.0 ? 1.0 : e / (1.0 + e);
    s -= (s - (1.0 - uR) * sp / k - q) / (1.0 - (1.0 - uR) * sg);
  }
  float ez = exp(clamp(k * (s - sc), -30.0, 15.0));
  float lam = 1.0 - (1.0 - uR) * ez / (1.0 + ez);

  // 주름 : 간격이 조금씩 다르고, 아래로 갈수록 크게 늘어짐
  float S = s * halfW;
  float th = 2.0 * PI * S / uFold + side * 1.7 + 0.6;
  float a1 = 0.37 * th + 1.3 + side * 2.1;
  float a2 = 0.173 * th + 4.0;
  float tw = th + 0.85 * sin(a1) + 0.45 * sin(a2)
    + 0.30 * v * sin(p.y * 0.0034 + th * 0.09 + side)
    + uSway * 0.10 * v * sin(uTime * 0.55 + p.y * 0.004 + th * 0.07);
  float dtw = 1.0 + 0.3145 * cos(a1) + 0.0779 * cos(a2);
  float low = mix(0.08, 0.40, smoothstep(0.0, 0.75, v));
  float pipe = 0.5 + 0.5 * sin(tw);
  float h = 2.0 * pow(max(pipe, 0.0), 0.62) - 1.0 + low * sin(0.5 * tw + 2.0 + side) + 0.10 * sin(2.0 * tw + 0.7);
  float dh = 0.62 * pow(max(pipe, 0.035), -0.38) * cos(tw) + 0.5 * low * cos(0.5 * tw + 2.0 + side) + 0.20 * cos(2.0 * tw + 0.7);
  gH = h / (1.10 + low);
  float tight = clamp((1.0 - lam) / (1.0 - uR), 0.0, 1.0);
  vec3 col = velvet(side * 0.92 * dh * dtw / pow(lam, 0.6), gH, tight);

  // 천의 결 (세로 결 · 잔 결 · 얼룩)
  col *= 1.0 + 0.11 * (vnoise(vec2(S * 0.22, p.y * 0.030)) - 0.5)
             + 0.07 * (vnoise(vec2(S * 1.5, p.y * 1.1)) - 0.5)
             + 0.16 * (vnoise(vec2(S * 0.011, p.y * 0.008) + side * 7.0) - 0.5);

  // 조명 : 위는 휘장 그늘, 가운데는 핀 조명, 아래로 갈수록 어둡게
  float wash = mix(0.50, 1.0, smoothstep(0.0, 0.30, v)) * mix(1.0, 0.62, smoothstep(0.50, 1.0, v));
  float ve = uTop + valEdge(p.x) + uVal * 0.17 - gLift;
  float shade = 1.0 - 0.62 * (1.0 - smoothstep(ve - 4.0, ve + uVal * 0.55, p.y));
  float spot = spotAt(p);
  float vig = 1.0 - 0.30 * smoothstep(0.30, 0.56, abs(p.x / uRes.x - 0.5)) * (1.0 - gOpen);
  col *= wash * shade * vig * (0.72 + 0.76 * spot);
  col *= mix(vec3(1.0), vec3(1.10, 1.0, 0.88), spot);
  col *= mix(0.40, 1.0, smoothstep(0.0, 16.0, edge));   // 안쪽 끝은 접혀 돌아감
  col *= 1.0 + 0.75 * gOpen;                            // 열린 뒤 양옆에 모인 막은 무대 빛을 받음
  col = mix(vec3(dot(col, vec3(0.30, 0.59, 0.11))), col, 0.90);
  return vec4(col, smoothstep(0.0, 1.5, edge));
}

// 당김 줄 + 술 (금색 꼰 줄 · 구슬 · 실)
vec4 cord(vec2 p, float cx, float ty) {
  vec2 t = p - vec2(cx, ty);
  float a, lit;
  if (t.y < 1.0) {
    float u = t.x / 2.7;
    a = (1.0 - smoothstep(0.8, 1.2, abs(u)));
    lit = sqrt(max(0.0, 1.0 - u * u)) * (0.30 + 0.70 * (0.5 + 0.5 * sin(p.y * 1.75 + t.x * 1.6))) - u * 0.15;
  } else {
    float hw = sqrt(max(0.0, 49.0 - (t.y - 7.0) * (t.y - 7.0)));                           // 구슬
    if (t.y > 12.0) hw = max(hw, 5.2 + 1.6 * clamp((t.y - 13.0) / 11.0, 0.0, 1.0));        // 목
    if (t.y > 24.0) hw = 8.6;                                                              // 띠
    if (t.y > 29.0) hw = 8.2 + 7.0 * pow(clamp((t.y - 29.0) / 46.0, 0.0, 1.0), 0.85);      // 실
    float u = t.x / max(hw, 0.01);
    a = (1.0 - smoothstep(1.0 - 0.6 / max(hw, 1.0), 1.0 + 0.6 / max(hw, 1.0), abs(u)));
    lit = sqrt(max(0.0, 1.0 - u * u)) * 0.85 - u * 0.28 + 0.08;
    if (t.y > 29.0) {
      float f = u * 6.5 + 0.5;
      float tf = fract(f) - 0.5;
      lit *= 0.68 + 0.32 * sqrt(max(0.0, 1.0 - 4.0 * tf * tf));
      float len = 75.0 - 4.0 * hash(vec2(floor(f), 9.0));
      a *= (1.0 - smoothstep(len - 1.5, len, t.y));
    } else if (t.y > 24.0) {
      lit = lit * 0.70 + 0.25 * (1.0 - smoothstep(0.0, 1.2, abs(t.y - 26.3)));
    } else if (t.y < 14.0) {
      lit += 0.45 * pow(max(0.0, 1.0 - length(t - vec2(-2.4, 4.6)) / 5.0), 2.0);
    }
  }
  lit = clamp(lit, 0.0, 1.0);
  return vec4(mix(vec3(0.24, 0.14, 0.04), vec3(0.82, 0.60, 0.24), lit) + vec3(1.0, 0.91, 0.68) * pow(lit, 4.0) * 0.42, a);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uScale - gl_FragCoord.y) / uScale;
  gOpen = clamp((1.0 - uLead.z) / (1.0 - uR), 0.0, 1.0);
  gSpot = 1.0 - smoothstep(0.02, 0.45, gOpen);
  gLift = smoothstep(0.20, 0.92, gOpen) * uVal * 1.30;
  vec4 acc;   // 색에 투명도를 미리 곱한 값

  vec4 d = drape(p);
  float hemY = uHem + 2.5 * gH;
  if (p.y > hemY) {
    // 무대 바닥 : 어두운 마루 + 막이 비친 모습 + 조명. 막이 열리면 사라짐
    float fy = p.y - uHem;
    float fh = max(1.0, uRes.y - uHem);
    float ft = clamp(fy / fh, 0.0, 1.0);
    vec4 rc = drape(vec2(p.x, uHem - 2.0 - fy * 1.3));
    vec3 col = vec3(0.082, 0.054, 0.050) * (0.70 + 0.55 * vnoise(vec2(p.x * 0.010, fy * 0.55)));
    float seam = min(min(abs(ft - 0.17), abs(ft - 0.40)), abs(ft - 0.71)) * fh;
    col *= mix(0.55, 1.0, smoothstep(0.3, 1.5, seam));
    col += rc.rgb * rc.a * mix(0.62, 0.08, pow(ft, 0.55)) * (0.60 + 0.40 * vnoise(vec2(p.x * 0.07, fy * 0.25)));
    float gx = (p.x - uSpot.x) / (uSpot.z * 0.9);
    col += vec3(0.20, 0.13, 0.07) * gSpot * exp(-gx * gx) * (1.0 - ft);
    col *= mix(0.22, 1.0, smoothstep(0.0, 9.0, p.y - hemY));
    col = mix(col, vec3(0.027, 0.020, 0.051), smoothstep(0.50, 1.0, ft));
    acc = vec4(col, 1.0) * (1.0 - smoothstep(0.45, 0.95, gOpen));
  } else {
    float hb = hemY - p.y;
    vec3 col = d.rgb * mix(0.70, 1.0, smoothstep(0.0, 7.0, hb));
    col *= 1.0 - 0.16 * (1.0 - smoothstep(0.5, 1.5, abs(hb - 10.0)));   // 아랫단 박음질
    float a = d.a * (1.0 - smoothstep(0.80, 1.0, gOpen) * smoothstep(uHem - 0.26 * uRes.y, uHem - 6.0, p.y));   // 다 열린 뒤 양옆 막의 아래쪽은 스르르 사라짐
    acc = vec4(col * a, a);
  }

  // 당김 줄 (휘장 뒤에서 내려옴) + 막에 드리운 그림자
  if (uTassel.w > 0.5 && abs(p.x - uTassel.x) < 44.0) {
    float ty = uTassel.y + uTassel.z - gLift * 2.2;
    float ang = uSway * 0.020 * sin(uTime * 1.2);
    vec2 ps = p - vec2(8.0, 6.0);
    acc.rgb *= 1.0 - 0.42 * cord(ps, uTassel.x + ang * (ps.y - uTop), ty).a;
    vec4 c = cord(p, uTassel.x + ang * (p.y - uTop), ty);
    c.rgb *= 0.62 + 0.55 * spotAt(p);
    c.a *= 1.0 - smoothstep(0.25, 0.60, gOpen);
    acc = vec4(c.rgb * c.a, c.a) + acc * (1.0 - c.a);
  }

  // 위 휘장 : 촘촘한 주름 + 금색 단 + 금색 술. 막이 열리면 위로 올라감
  vec2 pv = vec2(p.x, p.y + gLift);
  float vy = pv.y - uTop;
  if (p.y >= uTop && vy < uVal * 1.2) {
    float ey = valEdge(pv.x);
    float fr = uVal * 0.17;
    float light = 0.92 + 0.50 * spotAt(p);
    vec4 c = vec4(0.0);
    if (vy < ey) {
      float th = 2.0 * PI * pv.x / (uFold * 0.52);
      float b1 = 0.31 * th + 0.9;
      float b2 = 0.13 * th + 2.0;
      float tw = th + 0.60 * sin(b1) + 0.25 * sin(b2);
      float dtw = 1.0 + 0.186 * cos(b1) + 0.0325 * cos(b2);
      float h = sin(tw) + 0.25 * sin(0.5 * tw + 1.0);
      float dh = cos(tw) + 0.125 * cos(0.5 * tw + 1.0);
      vec3 col = velvet(-0.90 * dh * dtw, h / 1.25, 0.12);
      col *= 1.0 + 0.11 * (vnoise(vec2(pv.x * 0.22, vy * 0.030)) - 0.5) + 0.07 * (vnoise(vec2(pv.x * 1.5, vy * 1.1)) - 0.5);
      col *= mix(0.42, 1.22, smoothstep(0.0, uVal * 0.42, vy)) * light;
      float bd = ey - vy;
      float bl = max(0.0, sin(PI * clamp(bd / 6.0, 0.0, 1.0))) * (0.55 + 0.45 * sin(pv.x * 1.5 + bd * 1.1));
      vec3 gold = mix(vec3(0.24, 0.14, 0.04), vec3(0.86, 0.64, 0.27), bl) + vec3(1.0, 0.90, 0.66) * pow(bl, 5.0) * 0.35;
      c = vec4(mix(col, gold * light, (1.0 - smoothstep(5.5, 6.5, bd))), 1.0);
    } else if (vy < ey + fr) {
      float fx = pv.x / 2.9;
      float ci = floor(fx);
      float cu = fract(fx) - 0.5;
      float fy = vy - ey;
      float len = fr * (0.84 + 0.16 * hash(vec2(ci, 3.0)));
      float lit = sqrt(max(0.0, 1.0 - 4.0 * cu * cu)) * (0.40 + 0.60 * (0.5 + 0.5 * sin(fy * 2.3 + cu * 5.0 + ci * 1.9)));
      vec3 gold = mix(vec3(0.24, 0.13, 0.03), vec3(1.0, 0.74, 0.30), lit) + vec3(1.0, 0.92, 0.70) * pow(lit, 6.0) * 0.36;
      c = vec4(gold * light * mix(1.0, 0.8, fy / fr), (1.0 - smoothstep(len - 1.6, len, fy)) * (1.0 - smoothstep(0.30, 0.52, abs(cu))));
    }
    acc = vec4(c.rgb * c.a, c.a) + acc * (1.0 - c.a);
  }

  // 무대 위 어두운 띠 (상단 메뉴 뒤) + 금색 몰딩. 휘장은 이 뒤로 올라가 숨음
  float band = 1.0 - smoothstep(0.55, 0.95, gOpen);
  if (p.y < uTop) {
    float t = p.y / uTop;
    float ml = uTop - p.y;
    vec3 col = mix(vec3(0.020, 0.014, 0.030), vec3(0.052, 0.036, 0.068), t * t);
    vec3 gold = mix(vec3(0.30, 0.19, 0.07), vec3(0.93, 0.74, 0.38), (1.0 - smoothstep(1.6, 3.6, ml)) * smoothstep(0.0, 1.2, ml));
    col = mix(col, gold, (1.0 - smoothstep(3.2, 4.2, ml)) * 0.9);
    acc = vec4(col * band, band) + acc * (1.0 - band);
  } else {
    acc.rgb *= mix(1.0, mix(0.50, 1.0, smoothstep(0.0, 16.0, p.y - uTop)), band);
  }

  acc.rgb += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0 * acc.a;   // 색 띠 방지
  acc.rgb = clamp(acc.rgb, vec3(0.0), vec3(acc.a));   // 미리 곱한 색은 투명도를 넘지 않게
  gl_FragColor = acc;
}`;

  // failIfMajorPerformanceCaveat : 그래픽 가속이 없는 기기(아주 느림)는 쓰지 않고 단순 커튼으로
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, failIfMajorPerformanceCaveat: true });
  if (!gl) return null;
  const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!precision || !precision.precision) return null;

  const UNIFORMS = ['uRes', 'uScale', 'uTime', 'uLead', 'uLead4', 'uR', 'uTop', 'uVal', 'uFold', 'uHem', 'uTassel', 'uSpot', 'uSway'];
  let uniform = null;
  function setup() {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vert = compile(gl.VERTEX_SHADER, VERT);
    const frag = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return false;
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    uniform = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]));
    return true;
  }
  if (!setup()) return null;

  // ---------- 크기 · 배치 (CSS px) ----------
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const MAX_PIXELS = 2.4e6;   // 그리는 점 수 상한 (큰 화면 · 고해상도 폰에서 무리하지 않게)
  let geo = null, quality = 1;
  function measure() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (w < 2 || h < 2) { geo = null; return; }
    const top = w <= 860 ? 64 : 84;
    const val = clamp(w * 0.085, 60, 128);
    const stageTop = top + val * 1.17;
    const hem = h - clamp(h * 0.085, 40, 84);
    const openW = w <= 600 ? Math.max(13, w * 0.036) : clamp(w * 0.062, 40, 96);
    const scale = Math.min(Math.min(window.devicePixelRatio || 1, 2) * quality, Math.sqrt(MAX_PIXELS / (w * h)));
    geo = {
      w, h, top, val, hem, scale,
      fold: clamp(w * 0.066, 58, 104),
      r: openW / (w / 2),
      centerY: (stageTop + hem) / 2 + 4,
      spotR: clamp(Math.min(w * 0.60, (hem - stageTop) * 0.56), 170, 400),
      // 좁은 화면에서 세로 공간이 모자라면 당김 줄은 뺌 (가운데 글과 겹치므로)
      tassel: w > 600 || hem - stageTop >= 520,
      tasselX: w * (w <= 860 ? 0.86 : 0.865),
      tasselY: stageTop + clamp(h * (w <= 600 ? 0.035 : 0.11), 26, 120),
    };
    const cw = Math.round(w * scale), ch = Math.round(h * scale);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    gl.viewport(0, 0, cw, ch);
  }

  // ---------- 움직임 : 맨 위(레일)는 정해진 길로, 아래 네 점은 위 점을 용수철처럼 따라감 ----------
  const NODES = 5;
  const CLOSED = 1.012;   // 두 막이 가운데에서 살짝 겹침
  const STIFF = 300, DAMP = 15;
  const IDLE_FRAME_MS = 80;   // 가만히 있을 때 다시 그리는 간격 (1초에 12번쯤)
  const IDLE_FOR_MS = 60000;  // 가만히 흔들리는 시간. 지나면 멈춤 (건드리거나 다시 보면 또 시작)
  const lead = new Float32Array(NODES).fill(CLOSED);
  const speed = new Float32Array(NODES);
  let travel = null;        // { from, to, start, seconds }
  let dragging = false, dragGoal = CLOSED, opened = false;
  let pull = 0, pullGoal = 0, pullSpeed = 0;
  let visible = true, dead = false;
  let raf = 0, lastTime = 0, lastDraw = 0, lastProgress = -1;
  let slowFrames = 0, checkedFrames = 0;

  const openness = () => (geo ? clamp((1 - lead[2]) / (1 - geo.r), 0, 1) : (opened ? 1 : 0));
  const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
  function setAll(value) { lead.fill(value); speed.fill(0); travel = null; }
  function go(to, seconds) {
    const share = Math.abs(to - lead[0]) / (CLOSED - (geo ? geo.r : 0.12));
    travel = { from: lead[0], to, start: -1, seconds: Math.max(0.7, seconds * Math.sqrt(Math.min(1, share))) };
    kick();
  }
  function step(now, dt) {
    if (travel) {
      if (travel.start < 0) travel.start = now;
      const u = Math.min(1, (now - travel.start) / travel.seconds);
      lead[0] = travel.from + (travel.to - travel.from) * easeInOut(u);
      if (u >= 1) { travel = null; onArrive(opened); }
    } else if (dragging) {
      lead[0] += (dragGoal - lead[0]) * (1 - Math.exp(-dt * 22));   // 손을 조금 늦게, 부드럽게 따라감
    }
    const half = dt / 2;
    for (let n = 0; n < 2; n++) {
      for (let i = 1; i < NODES; i++) {
        speed[i] += (STIFF * (lead[i - 1] - lead[i]) - DAMP * speed[i]) * half;
        lead[i] += speed[i] * half;
      }
      pullSpeed += (220 * (pullGoal - pull) - 13 * pullSpeed) * half;
      pull += pullSpeed * half;
    }
  }
  const settled = () => {
    if (travel || dragging) return false;
    if (Math.abs(pull - pullGoal) > 0.2 || Math.abs(pullSpeed) > 2) return false;
    for (let i = 1; i < NODES; i++) if (Math.abs(lead[i] - lead[0]) > 0.0006 || Math.abs(speed[i]) > 0.0006) return false;
    return true;
  };
  // 가만히 있을 때 : 닫힌 막이 아주 조금 숨 쉬듯 흔들림 (화면에 보일 때만 · 배터리를 아끼려 드물게, 1분 뒤 멈춤)
  let idleUntil = 0;
  const idle = () => !reduce && !opened && !dead && visible && !document.hidden && performance.now() < idleUntil;

  function draw(seconds) {
    if (!geo || dead) return;
    gl.uniform2f(uniform.uRes, geo.w, geo.h);
    gl.uniform1f(uniform.uScale, canvas.width / geo.w);
    gl.uniform1f(uniform.uTime, seconds % 3600);
    gl.uniform4f(uniform.uLead, lead[0], lead[1], lead[2], lead[3]);
    gl.uniform1f(uniform.uLead4, lead[4]);
    gl.uniform1f(uniform.uR, geo.r);
    gl.uniform1f(uniform.uTop, geo.top);
    gl.uniform1f(uniform.uVal, geo.val);
    gl.uniform1f(uniform.uFold, geo.fold);
    gl.uniform1f(uniform.uHem, geo.hem);
    gl.uniform4f(uniform.uTassel, geo.tasselX, geo.tasselY, pull, geo.tassel ? 1 : 0);
    gl.uniform3f(uniform.uSpot, geo.w / 2, geo.centerY - 6, geo.spotR);
    gl.uniform1f(uniform.uSway, reduce ? 0 : 1);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const progress = openness();
    if (Math.abs(progress - lastProgress) > 0.002) { lastProgress = progress; onProgress(progress); }
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
    lastTime = now;
    const moving = !settled();
    if (moving) {
      step(now / 1000, dt);
      // 기기가 버거워하면(연속으로 느린 프레임) 해상도를 한 단계 낮춤
      if (dt > 0.040) slowFrames++;
      if (++checkedFrames === 24) {
        if (slowFrames > 12 && quality > 0.5) { quality *= 0.75; measure(); }
        slowFrames = 0; checkedFrames = 0;
      }
    }
    if (moving || now - lastDraw > IDLE_FRAME_MS) { lastDraw = now; draw(now / 1000); }
    if (!settled() || idle()) raf = requestAnimationFrame(frame);
    else lastTime = 0;
  }
  function kick() { idleUntil = performance.now() + IDLE_FOR_MS; if (!raf && !dead) raf = requestAnimationFrame(frame); }
  function refresh() { measure(); draw(performance.now() / 1000); kick(); }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dead = true; onLost(); });
  canvas.addEventListener('webglcontextrestored', () => { dead = !setup(); if (!dead) { refresh(); onRestored(); } });
  if ('ResizeObserver' in window) new ResizeObserver(refresh).observe(canvas);
  else window.addEventListener('resize', refresh);
  if ('IntersectionObserver' in window) new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  refresh();

  return {
    // 화면 배치에 쓰는 값 (CSS px) : 가운데 글 높이 · 당김 줄이 있는지와 위치. 막이 안 보이면 null
    geometry: () => geo && { centerY: geo.centerY, tassel: geo.tassel, tasselX: geo.tasselX, tasselY: geo.tasselY },
    refresh,
    open({ instant = false } = {}) {
      opened = true; dragging = false; pullGoal = 0;
      if (instant || reduce || !geo) { setAll(geo ? geo.r : 0.12); refresh(); } else go(geo.r, 2.7);
    },
    close({ instant = false } = {}) {
      opened = false; dragging = false; pullGoal = 0;
      if (instant || reduce || !geo) { setAll(CLOSED); refresh(); } else go(CLOSED, 2.0);
    },
    // 손으로 옆으로 밀기 : amount = 민 거리 / 화면 절반 (0 ~ 1)
    drag(amount) {
      if (!geo) return;
      dragging = true; travel = null;
      dragGoal = CLOSED - clamp(amount, 0, 1) * (CLOSED - geo.r);
      kick();
    },
    // 손을 뗌 : 충분히 밀었으면 끝까지 열고, 아니면 제자리로
    release(willOpen) {
      dragging = false;
      if (willOpen) opened = true;
      const to = willOpen ? (geo ? geo.r : 0.12) : CLOSED;
      if (reduce) { setAll(to); refresh(); } else go(to, willOpen ? 2.7 : 1.1);
    },
    // 술을 아래로 당긴 길이 (px). 놓으면 0 으로 튕겨 올라감
    pull(px) { pull = px; pullGoal = px; pullSpeed = 0; kick(); },
    letGo() { pullGoal = 0; kick(); },
  };
};

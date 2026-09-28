/**
 * Gate de contraste (WCAG 2.1 AA).
 *
 * Duas metades, e a segunda é a que importa:
 *
 *   1. Um punhado de pares conhecidos, como rede de segurança da paleta. Barato.
 *   2. Varredura REAL de `src/` e `website/src/`, medindo o par texto/fundo que
 *      a pessoa enxerga de fato.
 *
 * O histórico importa: a versão anterior só fazia a metade 1. O resultado era um
 * teste que comparava uma lista consigo mesma — dava `exit 1` com uma
 * recomendação que não vinha de lugar nenhum do projeto, e nunca abria um
 * arquivo. Ficou anos assim porque ninguém sabia que ele media alguma coisa.
 * Ver a nota AWR-N11.
 *
 * A paleta é lida de `node_modules/tailwindcss/theme.css`: o projeto usa
 * Tailwind v4 com a paleta padrão, em `oklch()`. `tailwind.config.js` existe no
 * repositório mas NENHUM arquivo o carrega (o v4 só o lê via `@config`, que não
 * está no `src/index.css`), então não é fonte de verdade — e o teste não deve
 * fingir que é.
 *
 * Uso: node scripts/test/contrast.cjs [--verbose]
 */

const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('--verbose');

// ── Limiares WCAG 2.1 AA ───────────────────────────────────────────────────
const AA_NORMAL = 4.5; // texto normal
const AA_LARGE = 3.0;   // >= 18.66px em negrito, ou >= 24px

// ── Cores ──────────────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';

// ── Conversão de cor ───────────────────────────────────────────────────────

/** Codificação gama sRGB — o inverso da transferência usada na luminância. */
function encodeSrgb(linear) {
  if (linear <= 0) return 0;
  return linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/**
 * oklch(L C H) -> {r,g,b} em 0..255, fórmula da CSS Color 4.
 *
 * A fórmula produz sRGB LINEAR. Sem aplicar a curva gama, zinc-400
 * (oklch 70.5%) sairia #585865 em vez de #a1a1aa e o contraste viraria 2.83:1
 * em vez de 7.54:1 — o gate reprovaria texto correto e aprovaria texto errado.
 * Foi o primeiro bug deste arquivo.
 */
function oklchToRgb(l, c, hDeg) {
  const h = (hDeg * Math.PI) / 180;

  const toLinear = (chroma) => {
    const a = chroma * Math.cos(h);
    const b = chroma * Math.sin(h);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;
    const l3 = l_ ** 3;
    const m3 = m_ ** 3;
    const s3 = s_ ** 3;
    return [
      4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
      -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
      -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
    ];
  };

  const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

  // Cor muito saturada pode cair fora do gamut do sRGB. Em vez de cortar o
  // canal (o que muda o tom), reduz o croma até caber — é o que o navegador faz.
  let rgb = toLinear(c);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(toLinear(mid))) lo = mid;
      else hi = mid;
    }
    rgb = toLinear(lo);
  }

  const to255 = (v) => Math.max(0, Math.min(255, Math.round(encodeSrgb(v) * 255)));
  return { r: to255(rgb[0]), g: to255(rgb[1]), b: to255(rgb[2]) };
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** Luminância relativa WCAG. */
function luminance({ r, g, b }) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Razão de contraste WCAG entre duas cores opacas. */
function contrastRatio(fgRgb, bgRgb) {
  const l1 = luminance(fgRgb);
  const l2 = luminance(bgRgb);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Compõe uma cor com alfa sobre um fundo opaco. */
function composite(fgRgb, alpha, bgRgb) {
  return {
    r: Math.round(fgRgb.r * alpha + bgRgb.r * (1 - alpha)),
    g: Math.round(fgRgb.g * alpha + bgRgb.g * (1 - alpha)),
    b: Math.round(fgRgb.b * alpha + bgRgb.b * (1 - alpha)),
  };
}

// ── Paleta real do Tailwind ────────────────────────────────────────────────

/**
 * Lê `--color-<nome>-<shade>` de `node_modules/tailwindcss/theme.css`.
 * Lê o pacote INSTALADO, não uma cópia: se o Tailwind subir de versão e a
 * paleta mudar, o teste acompanha em vez de mentir.
 */
function loadPalette() {
  const themePath = path.join(__dirname, '..', '..', 'node_modules', 'tailwindcss', 'theme.css');
  if (!fs.existsSync(themePath)) {
    return { palette: null, error: 'node_modules/tailwindcss/theme.css não encontrado — rode `npm install`' };
  }
  const css = fs.readFileSync(themePath, 'utf-8');
  const palette = new Map();

  // --color-zinc-400: oklch(70.5% 0.015 286.067);
  const re = /--color-([a-z]+)-(\d{2,3}):\s*oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const [, nome, shade, l, c, h] = m;
    const rgb = oklchToRgb(parseFloat(l) / 100, parseFloat(c), parseFloat(h));
    palette.set(`${nome}-${shade}`, { ...rgb, oklch: `oklch(${l}% ${c} ${h})`, hex: rgbToHex(rgb) });
  }

  if (palette.size === 0) {
    return { palette: null, error: 'nenhuma cor oklch() encontrada em theme.css — a paleta mudou de formato?' };
  }
  return { palette, error: null };
}

// ── Varredura do projeto ───────────────────────────────────────────────────

const SOURCE_DIRS = [
  { dir: path.join(__dirname, '..', '..', 'src'), label: 'app' },
  { dir: path.join(__dirname, '..', '..', 'website', 'src'), label: 'promo' },
];

/** Cor de fundo da página, por superfície. */
const PAGE_BACKGROUNDS = {
  app: { hex: '#0a0a0b', where: 'fundo escuro do tema do editor' },
  promo: { hex: '#000000', where: 'bg-black das páginas do site' },
};

function walk(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, exts, acc);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      acc.push(full);
    }
  }
  return acc;
}

// Classes de cor do Tailwind: text-zinc-500, bg-purple-500/60, border-white/10
const COLOR_CLASS_RE =
  /\b(text|bg|border|ring|from|to|via|fill|stroke|outline|decoration|shadow|accent|caret|divide)-([a-z]+)-(\d{2,3})(\/(\d{1,3}))?\b/g;
const SPECIAL_COLORS = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};
// O grupo `prop` da regex é capturado SEM o hífen: 'text', não 'text-'.
const TEXT_PROPS = ['text'];

function alphaFrom(match) {
  if (!match) return 1;
  return parseInt(match, 10) / 100;
}

/**
 * O elemento é "texto grande" segundo a WCAG 2.1?
 *
 * Grande = >= 18.66px em negrito, ou >= 24px normal. Tailwind:
 *   text-2xl = 24px  -> sempre grande
 *   text-xl  = 20px  -> grande só com peso >= 600
 *   text-lg  = 18px  -> NÃO é grande (18 < 18.66)
 *
 * O limiar de texto grande é 3:1, então a distinção muda o resultado: sem isto,
 * um rótulo de 20px negrito seria reprovado a 4.10:1 mesmo estando em conformidade.
 */
function isLargeText(line) {
  if (/\btext-([2-9]xl)\b/.test(line)) return true;
  if (/\btext-xl\b/.test(line) && /\bfont-(semibold|bold|extrabold|black)\b/.test(line)) return true;
  return false;
}

let PALETTE = new Map();
const FINDINGS = [];
let SCANNED_FILES = 0;
let SCANNED_LINES = 0;

/** Qual shade da família passa do limiar? Só para sugerir a correção. */
function suggestFix(family, ratio, bgHex, required) {
  const ladders = {
    zinc: [800, 700, 600, 500, 400, 300],
    gray: [600, 500, 400, 300],
    slate: [600, 500, 400, 300],
    neutral: [600, 500, 400, 300],
    stone: [600, 500, 400, 300],
  };
  const ladder = ladders[family] || [600, 500, 400, 300];
  const bg = hexToRgb(bgHex);
  if (!bg) return null;
  const lighterIsBetter = luminance(bg) < 0.5;
  for (const s of ladder) {
    const cand = PALETTE.get(`${family}-${s}`);
    if (!cand) continue;
    if (contrastRatio(cand, bg) >= required) {
      const improves = lighterIsBetter
        ? luminance(cand) > luminance(bg) / 2
        : luminance(cand) < luminance(bg);
      if (improves) return `text-${family}-${s}`;
    }
  }
  return null;
}

function analyze() {
  const { palette, error } = loadPalette();
  if (error) {
    console.error(`${RED}❌ ${error}${RESET}`);
    process.exit(2);
  }
  PALETTE = palette;

  for (const { dir, label } of SOURCE_DIRS) {
    const files = walk(dir, ['.tsx', '.ts']);
    const bgHex = PAGE_BACKGROUNDS[label].hex;
    const pageBg = hexToRgb(bgHex);

    for (const file of files) {
      SCANNED_FILES++;
      const src = fs.readFileSync(file, 'utf-8');
      const rel = path.relative(path.join(__dirname, '..', '..'), file).replace(/\\/g, '/');

      src.split(/\r?\n/).forEach((line, i) => {
        SCANNED_LINES++;
        COLOR_CLASS_RE.lastIndex = 0;
        let m;
        while ((m = COLOR_CLASS_RE.exec(line)) !== null) {
          const [full, prop, family, shade, , alphaRaw] = m;
          // Só cor de TEXTO mede contraste de texto. bg-*/border-*/from-* etc.
          // definem fundo ou borda, e são tratados como contexto.
          if (!TEXT_PROPS.includes(prop)) continue;

          const color = /\d{2,3}$/.test(shade) ? PALETTE.get(`${family}-${shade}`) : SPECIAL_COLORS[family];
          if (!color) {
            FINDINGS.push({ kind: 'desconhecida', file: rel, line: i + 1, className: full, detail: `${family}-${shade}` });
            continue;
          }

          const alpha = alphaFrom(alphaRaw);
          const fg = alpha < 1 ? composite(color, alpha, pageBg) : color;
          const ratio = contrastRatio(fg, pageBg);

          const large = isLargeText(line);
          const required = large ? AA_LARGE : AA_NORMAL;
          if (ratio >= required) continue;

          FINDINGS.push({
            kind: 'contraste',
            file: rel,
            line: i + 1,
            className: full,
            color: rgbToHex(fg),
            bg: bgHex,
            ratio,
            required,
            level: ratio >= 7 ? 'AAA' : ratio >= AA_NORMAL ? 'AA' : 'FAIL',
            suggestion: suggestFix(family, ratio, bgHex, required),
          });
        }
      });
    }
  }
}

// ── Relatório ──────────────────────────────────────────────────────────────

function report() {
  console.log(`\n${CYAN}${BOLD}══════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}${BOLD}       WCAG 2.1 AA — contraste de texto       ${RESET}`);
  console.log(`${CYAN}${BOLD}══════════════════════════════════════════${RESET}\n`);

  console.log(`${BOLD}Superfície varrida:${RESET}`);
  for (const { label } of SOURCE_DIRS) {
    const bg = PAGE_BACKGROUNDS[label];
    console.log(`  ${label.padEnd(6)} fundo ${bg.hex} ${DIM}(${bg.where})${RESET}`);
  }
  console.log(`\n  ${SCANNED_FILES} arquivos, ${SCANNED_LINES} linhas, paleta de ${PALETTE.size} cores`);

  if (FINDINGS.length === 0) {
    console.log(`\n${GREEN}${BOLD}✓ Nenhuma violação de contraste.${RESET}\n`);
    return 0;
  }

  const byClass = new Map();
  for (const f of FINDINGS) {
    if (f.kind !== 'contraste') continue;
    if (!byClass.has(f.className)) byClass.set(f.className, []);
    byClass.get(f.className).push(f);
  }
  const unknown = FINDINGS.filter((f) => f.kind === 'desconhecida');

  console.log(`\n${BOLD}Violações por classe:${RESET} ${DIM}(cor de texto sobre o fundo da página)${RESET}\n`);

  for (const [className, list] of [...byClass.entries()].sort((a, b) => a[1][0].ratio - b[1][0].ratio)) {
    const f = list[0];
    console.log(
      `  ${RED}✗${RESET} ${className.padEnd(20)} ${f.ratio.toFixed(2)}:1  ${RED}${BOLD}abaixo de ${f.required}:1${RESET}  ${DIM}${list.length} usos${RESET}`
    );
    console.log(`      ${DIM}cor ${f.color} sobre ${f.bg}${RESET}`);
    console.log(
      f.suggestion
        ? `      ${GREEN}sugestão: ${f.suggestion}${RESET}`
        : `      ${DIM}sem sugestão automática: nenhuma shade da família passa de ${f.required}:1 neste fundo${RESET}`
    );
    if (VERBOSE) {
      for (const item of list.slice(0, 40)) console.log(`        ${DIM}${item.file}:${item.line}${RESET}`);
      if (list.length > 40) console.log(`        ${DIM}… e mais ${list.length - 40}${RESET}`);
    }
  }

  if (unknown.length > 0) {
    console.log(`\n${BOLD}Classes de cor não reconhecidas:${RESET}`);
    for (const u of unknown.slice(0, 10)) {
      console.log(`  ? ${u.className.padEnd(20)} ${DIM}${u.file}:${u.line} (${u.detail})${RESET}`);
    }
  }

  const total = FINDINGS.filter((f) => f.kind === 'contraste').length;
  console.log(`\n${BOLD}Resumo:${RESET}`);
  console.log(`  classes com problema : ${byClass.size}`);
  console.log(`  usos afetados       : ${total}`);
  console.log(`  limiar              : ${AA_NORMAL}:1 texto normal, ${AA_LARGE}:1 texto grande`);
  console.log(`\n${CYAN}${BOLD}══════════════════════════════════════════${RESET}\n`);

  return 1;
}

// ── Metade 1: rede de segurança da paleta ──────────────────────────────────
// Pares que o projeto usa de verdade. Falha aqui é sinal de que a paleta mudou
// de valor, não de que o código está errado.
const KNOWN_PAIRS = [
  { fg: '#a1a1aa', bg: '#0a0a0b', name: 'zinc-400 sobre fundo do app' },
  { fg: '#d4d4d8', bg: '#0a0a0b', name: 'zinc-300 sobre fundo do app' },
  { fg: '#ffffff', bg: '#000000', name: 'branco sobre preto do promo' },
];

function checkKnownPairs() {
  const rows = [];
  let failed = 0;
  for (const p of KNOWN_PAIRS) {
    const ratio = contrastRatio(hexToRgb(p.fg), hexToRgb(p.bg));
    const pass = ratio >= AA_NORMAL;
    if (!pass) failed++;
    rows.push({ ...p, ratio, pass });
  }
  return { rows, failed };
}

function main() {
  const { rows, failed } = checkKnownPairs();

  console.log(`\n${BOLD}Rede de segurança da paleta:${RESET}\n`);
  for (const r of rows) {
    const mark = r.pass ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(`  ${mark} ${r.name.padEnd(32)} ${r.ratio.toFixed(2)}:1`);
  }
  if (failed > 0) {
    console.log(`\n${RED}${BOLD}❌ ${failed} par(es) base da paleta abaixo de AA.${RESET}`);
    return 1;
  }

  analyze();
  return report();
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  oklchToRgb,
  hexToRgb,
  rgbToHex,
  luminance,
  contrastRatio,
  composite,
  loadPalette,
  checkWcagAA: (ratio, isLarge = false) => ({
    passes: ratio >= (isLarge ? AA_LARGE : AA_NORMAL),
    threshold: isLarge ? AA_LARGE : AA_NORMAL,
  }),
  KNOWN_PAIRS,
};

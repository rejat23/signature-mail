// Génère le logo animé (GIF) + le fallback statique (PNG) pour la signature mail.
const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const SRC = path.join(__dirname, 'assets', 'logo-horizontal-nb.jpg'); // logo horizontal (1917x499)
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const TARGET_W = 600;      // rendu 2x, affiché à 300px
const SWEEP_FRAMES = 26;
const SWEEP_DELAY = 55;    // ms
const HOLD_DELAY = 5000;  // ms sur le logo net entre deux balayages

// --- 1. décodage + nettoyage du fond (le JPEG a du ringing autour des lettres)
const raw = jpeg.decode(fs.readFileSync(SRC), { useTArray: true });
const { width: sw, height: sh, data: sd } = raw;
for (let i = 0; i < sd.length; i += 4) {
  if (sd[i] > 244 && sd[i + 1] > 244 && sd[i + 2] > 244) {
    sd[i] = sd[i + 1] = sd[i + 2] = 255;
  }
}

// --- 2. rognage des marges blanches
let x0 = sw, y0 = sh, x1 = -1, y1 = -1;
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    const i = (y * sw + x) * 4;
    if (sd[i] !== 255 || sd[i + 1] !== 255 || sd[i + 2] !== 255) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

// --- 3. rééchantillonnage (moyenne par boîte) vers TARGET_W, + marge blanche
const scale = TARGET_W / cw;
const iw = TARGET_W;
const ih = Math.round(ch * scale);
const PAD = Math.round(iw * 0.02);
const W = iw + PAD * 2;
const H = ih + PAD * 2;

const base = new Uint8Array(W * H * 3).fill(255);
for (let y = 0; y < ih; y++) {
  const sy0 = y0 + Math.floor(y / scale), sy1 = y0 + Math.min(ch, Math.ceil((y + 1) / scale));
  for (let x = 0; x < iw; x++) {
    const sx0 = x0 + Math.floor(x / scale), sx1 = x0 + Math.min(cw, Math.ceil((x + 1) / scale));
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = sy0; yy < sy1; yy++) {
      for (let xx = sx0; xx < sx1; xx++) {
        const i = (yy * sw + xx) * 4;
        r += sd[i]; g += sd[i + 1]; b += sd[i + 2]; n++;
      }
    }
    const o = ((y + PAD) * W + (x + PAD)) * 3;
    base[o] = Math.round(r / n);
    base[o + 1] = Math.round(g / n);
    base[o + 2] = Math.round(b / n);
  }
}

// --- 4. frames : un reflet doux balaye le logo parallèlement au trait diagonal
// bande de constante u = x + y (perpendiculaire à la barre du monogramme)
const uMax = W + H;
const sigma = uMax * 0.10;

function makeFrame(progress) {
  const out = new Uint8Array(W * H * 4);
  const center = -sigma * 2 + progress * (uMax + sigma * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const si = (y * W + x) * 3, di = (y * W + x) * 4;
      let r = base[si], g = base[si + 1], b = base[si + 2];
      if (progress >= 0 && !(r === 255 && g === 255 && b === 255)) {
        const d = (x + y - center) / sigma;
        const k = Math.exp(-d * d) * 0.62;
        if (k > 0.004) {
          r = r + (255 - r) * k;
          g = g + (255 - g) * k;
          b = b + (255 - b) * k;
        }
      }
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = 255;
    }
  }
  return out;
}

const frames = [makeFrame(-1)]; // frame 1 = logo net (seule frame vue par Outlook desktop)
for (let f = 0; f < SWEEP_FRAMES; f++) frames.push(makeFrame(f / (SWEEP_FRAMES - 1)));

// --- 5. palette globale (cohérence entre frames, pas de scintillement)
const sample = new Uint8Array(frames.length * W * H * 4);
frames.forEach((fr, i) => sample.set(fr, i * fr.length));
const palette = quantize(sample, 63, { format: 'rgb565' });
palette.push([0, 0, 0]); // index 63 reservé à la transparence (frames delta)
const TRANSPARENT = palette.length - 1;

const gif = GIFEncoder();
let prevIdx = null;
frames.forEach((fr, i) => {
  const idx = applyPalette(fr, palette, 'rgb565');
  if (prevIdx) {
    // frames différentielles : seuls les pixels modifiés sont réécrits
    const d = Uint8Array.from(idx);
    for (let p = 0; p < d.length; p++) if (d[p] === prevIdx[p]) d[p] = TRANSPARENT;
    gif.writeFrame(d, W, H, { delay: SWEEP_DELAY, transparent: true, transparentIndex: TRANSPARENT, dispose: 1 });
  } else {
    gif.writeFrame(idx, W, H, { palette, delay: HOLD_DELAY, dispose: 1 });
  }
  prevIdx = idx;
});
gif.finish();
fs.writeFileSync(path.join(OUT, 'logo-nb-anime.gif'), Buffer.from(gif.bytes()));

// --- 6. fallback statique
const png = new PNG({ width: W, height: H });
png.data = Buffer.from(frames[0]);
fs.writeFileSync(path.join(OUT, 'logo-nb.png'), PNG.sync.write(png));

const mid = new PNG({ width: W, height: H }); mid.data = Buffer.from(frames[Math.round(frames.length*0.5)]); fs.writeFileSync(path.join(OUT,'_apercu-mi-balayage.png'), PNG.sync.write(mid));
console.log(`OK  ${W}x${H}  ${frames.length} frames`);
console.log(' gif', (fs.statSync(path.join(OUT, 'logo-nb-anime.gif')).size / 1024).toFixed(1), 'Ko');
console.log(' png', (fs.statSync(path.join(OUT, 'logo-nb.png')).size / 1024).toFixed(1), 'Ko');

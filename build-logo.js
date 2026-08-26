// Ré-encode l'animation du bloc-marque (Gif.gif, médiathèque WordPress) pour un usage
// en signature mail. Le fichier d'origine fait 1,5 Mo, 226 images à 50 i/s, boucle à
// l'infini et se termine en s'effaçant : inutilisable tel quel dans un mail.
//
// Ce que fait ce script :
//   - recadre sur le contenu et redimensionne à la taille d'affichage (x2 pour les écrans fins) ;
//   - ne garde que la phase d'apparition (images 14 à 41 de la source), ramenée à 25 i/s ;
//   - place en TÊTE une image du logo terminé : Outlook pour Windows n'affiche que la
//     première image d'un GIF, il montrera donc le logo correct ;
//   - termine sur le logo terminé et ne boucle pas, pour que la signature reste au repos ;
//   - encode en différentiel avec palette globale.
const fs = require('fs');
const path = require('path');
const { GifReader } = require('omggif');
const { PNG } = require('pngjs');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const SRC = path.join(__dirname, 'assets', 'logo-anime-source.gif');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const TARGET_W = 400;      // affiché à 200 px
const FIRST = 14;          // première image utile de la source (avant : toile vide)
const LAST = 42;           // le logo est stabilisé à partir de l'image 41
const SETTLED = 120;       // une image du logo au repos
const STEP = 2;            // 50 i/s -> 25 i/s
const DELAY = 40;          // ms par image d'animation
const POSTER_DELAY = 20;   // ms : image de tête, quasi invisible sauf sur Outlook
const REST_DELAY = 4000;   // ms sur le logo terminé avant la fin de lecture
const LOOP = -1;           // -1 : lecture unique ; 0 : boucle infinie

// --- 1. décodage et composition des images de la source
const reader = new GifReader(fs.readFileSync(SRC));
const SW = reader.width, SH = reader.height;
const canvas = new Uint8Array(SW * SH * 4);
const src = [];
for (let i = 0; i < reader.numFrames(); i++) {
  reader.decodeAndBlitFrameRGBA(i, canvas);
  src.push(Uint8Array.from(canvas));
}

// --- 2. cadrage sur le contenu du logo au repos
const settled = src[SETTLED];
let x0 = SW, y0 = SH, x1 = -1, y1 = -1;
for (let y = 0; y < SH; y++) {
  for (let x = 0; x < SW; x++) {
    const i = (y * SW + x) * 4;
    if (!(settled[i] > 246 && settled[i + 1] > 246 && settled[i + 2] > 246)) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

const scale = TARGET_W / cw;
const iw = TARGET_W;
const ih = Math.round(ch * scale);
const PAD = Math.round(iw * 0.015);
const W = iw + PAD * 2;
const H = ih + PAD * 2;

// --- 3. recadrage + rééchantillonnage (moyenne de boîte) d'une image source
function reduce(frame) {
  const out = new Uint8Array(W * H * 4);
  out.fill(255);
  for (let y = 0; y < ih; y++) {
    const sy0 = y0 + Math.floor(y / scale), sy1 = y0 + Math.min(ch, Math.ceil((y + 1) / scale));
    for (let x = 0; x < iw; x++) {
      const sx0 = x0 + Math.floor(x / scale), sx1 = x0 + Math.min(cw, Math.ceil((x + 1) / scale));
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = sy0; yy < sy1; yy++) {
        for (let xx = sx0; xx < sx1; xx++) {
          const i = (yy * SW + xx) * 4;
          r += frame[i]; g += frame[i + 1]; b += frame[i + 2]; n++;
        }
      }
      const o = ((y + PAD) * W + (x + PAD)) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = 255;
    }
  }
  return out;
}

const repos = reduce(settled);
const frames = [{ data: repos, delay: POSTER_DELAY }];
for (let i = FIRST; i < LAST; i += STEP) frames.push({ data: reduce(src[i]), delay: DELAY });
frames.push({ data: repos, delay: REST_DELAY });

// --- 4. palette globale + encodage différentiel
const sample = new Uint8Array(frames.length * W * H * 4);
frames.forEach((f, i) => sample.set(f.data, i * f.data.length));
const palette = quantize(sample, 95, { format: 'rgb565' });
palette.push([0, 0, 0]); // index réservé à la transparence des images différentielles
const TRANSPARENT = palette.length - 1;

const gif = GIFEncoder();
let prev = null;
frames.forEach((f, i) => {
  const idx = applyPalette(f.data, palette, 'rgb565');
  if (prev) {
    const d = Uint8Array.from(idx);
    for (let p = 0; p < d.length; p++) if (d[p] === prev[p]) d[p] = TRANSPARENT;
    gif.writeFrame(d, W, H, { delay: f.delay, transparent: true, transparentIndex: TRANSPARENT, dispose: 1 });
  } else {
    gif.writeFrame(idx, W, H, { palette, delay: f.delay, repeat: LOOP, dispose: 1 });
  }
  prev = idx;
});
gif.finish();
fs.writeFileSync(path.join(OUT, 'logo-signature.gif'), Buffer.from(gif.bytes()));

// --- 5. version fixe (logo terminé), pour une signature sans animation
const png = new PNG({ width: W, height: H });
png.data = Buffer.from(repos);
fs.writeFileSync(path.join(OUT, 'logo-signature.png'), PNG.sync.write(png));

console.log(`source ${SW}x${SH}, ${reader.numFrames()} images, ${(fs.statSync(SRC).size / 1024 / 1024).toFixed(2)} Mo`);
console.log(`sortie ${W}x${H} (affiché ${Math.round(W / 2)} px), ${frames.length} images`);
console.log(` gif ${(fs.statSync(path.join(OUT, 'logo-signature.gif')).size / 1024).toFixed(1)} Ko`);
console.log(` png ${(fs.statSync(path.join(OUT, 'logo-signature.png')).size / 1024).toFixed(1)} Ko`);

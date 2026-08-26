// Dessine l'icône Facebook manquante, calée sur le jeu d'icônes déjà en ligne
// (mesures relevées sur instagam.png : toile 1250 px, trait 74 px, rayon de coin 240 px,
// or rgb(188,164,135), tracé jointif au bord de la toile).
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const N = 1250;      // toile, identique à instagam.png
const SS = 3;        // supersampling
const W = 74;        // épaisseur de trait du jeu existant
const R_OUT = 240;   // rayon de coin extérieur du carré arrondi
const OR = [188, 164, 135];

// --- distance signée à un rectangle arrondi (repère centré)
function sdRoundRect(x, y, hw, hh, r) {
  const qx = Math.abs(x) - (hw - r);
  const qy = Math.abs(y) - (hh - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

// --- carré arrondi en contour, épaisseur W, bord extérieur collé à la toile
const HW = N / 2;
const rMid = R_OUT - W / 2;
const cadre = (x, y) => Math.abs(sdRoundRect(x - HW, y - HW, HW - W / 2, HW - W / 2, rMid)) <= W / 2;

// --- le « f », tracé d'épaisseur constante W : hampe + crochet tangents au même point
const F_X = 600;        // axe de la hampe
const F_JOIN = 470;     // raccord hampe / crochet
const F_R = 170;        // rayon de la ligne médiane du crochet
const F_BOTTOM = 960;
const F_BAR_Y = 600, F_BAR_X0 = 420, F_BAR_X1 = 790;

function segment(x, y, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) <= W / 2;
}

function crochet(x, y) {
  const dx = x - (F_X + F_R), dy = y - F_JOIN;
  const d = Math.hypot(dx, dy);
  if (Math.abs(d - F_R) > W / 2) return false;
  return dx <= 0 && dy <= 0; // quart supérieur gauche : du raccord vers le haut
}

const glyphe = (x, y) =>
  segment(x, y, F_X, F_JOIN, F_X, F_BOTTOM) ||
  crochet(x, y) ||
  segment(x, y, F_BAR_X0, F_BAR_Y, F_BAR_X1, F_BAR_Y);

const forme = (x, y) => cadre(x, y) || glyphe(x, y);

const png = new PNG({ width: N, height: N });
for (let py = 0; py < N; py++) {
  for (let px = 0; px < N; px++) {
    let hits = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        if (forme(px + (sx + 0.5) / SS, py + (sy + 0.5) / SS)) hits++;
      }
    }
    const i = (py * N + px) * 4;
    png.data[i] = OR[0];
    png.data[i + 1] = OR[1];
    png.data[i + 2] = OR[2];
    png.data[i + 3] = Math.round((hits / (SS * SS)) * 255);
  }
}
fs.writeFileSync(path.join(OUT, 'facebook.png'), PNG.sync.write(png));

// --- planche de contrôle : le nouveau Facebook à côté des icônes existantes
const set = ['wp/instagam.png', 'out/facebook.png', 'wp/telephone.png', 'wp/mail.png'];
const S = 120;
const sheet = new PNG({ width: S * set.length, height: S });
for (let i = 0; i < sheet.data.length; i += 4) {
  sheet.data[i] = sheet.data[i + 1] = sheet.data[i + 2] = 255;
  sheet.data[i + 3] = 255;
}
set.forEach((f, k) => {
  const p = PNG.sync.read(fs.readFileSync(path.join(__dirname, f)));
  const sc = Math.min(S / p.width, S / p.height) * 0.86;
  const ow = Math.round(p.width * sc), oh = Math.round(p.height * sc);
  const ox = k * S + Math.round((S - ow) / 2), oy = Math.round((S - oh) / 2);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      // moyenne de boîte pour un rendu propre à petite taille
      const sx0 = Math.floor(x / sc), sx1 = Math.min(p.width, Math.ceil((x + 1) / sc));
      const sy0 = Math.floor(y / sc), sy1 = Math.min(p.height, Math.ceil((y + 1) / sc));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = sy0; yy < sy1; yy++) for (let xx = sx0; xx < sx1; xx++) {
        const si = (yy * p.width + xx) * 4;
        const al = p.data[si + 3] / 255;
        r += p.data[si] * al; g += p.data[si + 1] * al; b += p.data[si + 2] * al; a += al; n++;
      }
      const di = ((oy + y) * sheet.width + (ox + x)) * 4;
      const av = a / n;
      sheet.data[di] = Math.round(255 + (r / n / (av || 1) - 255) * av);
      sheet.data[di + 1] = Math.round(255 + (g / n / (av || 1) - 255) * av);
      sheet.data[di + 2] = Math.round(255 + (b / n / (av || 1) - 255) * av);
    }
  }
});
fs.writeFileSync(path.join(OUT, '_apercu-facebook.png'), PNG.sync.write(sheet));
console.log('facebook.png généré');

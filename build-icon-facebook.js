// Dessine l'icône Facebook manquante, calée sur le jeu d'icônes déjà en ligne
// (mesures relevées sur instagam.png : toile 1250 px, trait 74 px, rayon de coin 240 px,
// or rgb(188,164,135), tracé jointif au bord de la toile).
//
// Le « f » n'est pas une lettre redessinée : c'est le tracé officiel de la marque
// Facebook, repris tel quel puis mis à l'échelle. Il est plein — c'est ainsi que la
// marque existe ; un « f » en trait fin ne ressemble pas à Facebook.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const N = 1250;          // toile, identique à instagam.png
const SS = 3;            // supersampling
const TRAIT = 74;        // épaisseur de trait du jeu existant
const R_COIN = 240;      // rayon de coin extérieur du carré arrondi
const OR = [188, 164, 135];

const GLYPHE_H = Number(process.env.FB_H) || 580;  // hauteur du « f » sur la toile
const CADRE = process.env.FB_CADRE || 'carre';     // 'carre' | 'cercle' | 'aucun'

// --- tracé officiel de la marque, dans sa boîte d'origine 24x24 (x de 6.187 à 18.188)
const PATH = [
  ['M', 15.997, 3.985],
  ['L', 18.188, 3.985],
  ['L', 18.188, 0.169],
  ['C', 17.810, 0.117, 16.510, 0, 14.996, 0],
  ['C', 11.837, 0, 9.673, 1.987, 9.673, 5.639],
  ['L', 9.673, 9],
  ['L', 6.187, 9],
  ['L', 6.187, 13.266],
  ['L', 9.673, 13.266],
  ['L', 9.673, 24],
  ['L', 13.947, 24],
  ['L', 13.947, 13.267],
  ['L', 17.292, 13.267],
  ['L', 17.823, 9.001],
  ['L', 13.946, 9.001],
  ['L', 13.946, 6.062],
  ['C', 13.947, 4.829, 14.279, 3.985, 15.997, 3.985],
];
const BOITE = { x0: 6.187, y0: 0, x1: 18.188, y1: 24 };

// --- aplatissement des courbes en polygone
function polygone(scale, dx, dy, pas = 24) {
  const pts = [];
  const T = (x, y) => [dx + (x - BOITE.x0) * scale, dy + (y - BOITE.y0) * scale];
  let cur = null;
  for (const c of PATH) {
    if (c[0] === 'M' || c[0] === 'L') {
      cur = [c[1], c[2]];
      pts.push(T(cur[0], cur[1]));
    } else {
      const [, c1x, c1y, c2x, c2y, ex, ey] = c;
      const [sx, sy] = cur;
      for (let i = 1; i <= pas; i++) {
        const t = i / pas, u = 1 - t;
        const x = u * u * u * sx + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex;
        const y = u * u * u * sy + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey;
        pts.push(T(x, y));
      }
      cur = [ex, ey];
    }
  }
  return pts;
}

// --- remplissage par balayage de lignes (pair-impair : contour unique)
function remplir(mask, W, H, pts) {
  let ymin = Infinity, ymax = -Infinity;
  for (const [, y] of pts) { if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
  const y0 = Math.max(0, Math.floor(ymin)), y1 = Math.min(H - 1, Math.ceil(ymax));
  const xs = [];
  for (let py = y0; py <= y1; py++) {
    const yc = py + 0.5;
    xs.length = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) {
        xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(xs[k] - 0.5)), b = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5));
      for (let px = a; px <= b; px++) mask[py * W + px] = 1;
    }
  }
}

// --- distance signée à un rectangle arrondi (repère centré)
function sdRoundRect(x, y, hw, hh, r) {
  const qx = Math.abs(x) - (hw - r), qy = Math.abs(y) - (hh - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function generer(fichier) {
  const W3 = N * SS;
  const mask = new Uint8Array(W3 * W3);

  // le glyphe, à l'échelle demandée et centré
  const scale = (GLYPHE_H / (BOITE.y1 - BOITE.y0)) * SS;
  const gw = (BOITE.x1 - BOITE.x0) * scale, gh = (BOITE.y1 - BOITE.y0) * scale;
  remplir(mask, W3, W3, polygone(scale, (W3 - gw) / 2, (W3 - gh) / 2));

  // le cadre
  if (CADRE !== 'aucun') {
    const HW = N / 2, rMid = R_COIN - TRAIT / 2, demi = TRAIT / 2;
    for (let py = 0; py < W3; py++) {
      const y = (py + 0.5) / SS - HW;
      for (let px = 0; px < W3; px++) {
        const x = (px + 0.5) / SS - HW;
        const d = CADRE === 'cercle'
          ? Math.abs(Math.hypot(x, y) - (HW - demi))
          : Math.abs(sdRoundRect(x, y, HW - demi, HW - demi, rMid));
        if (d <= demi) mask[py * W3 + px] = 1;
      }
    }
  }

  // sous-échantillonnage SSxSS -> couverture
  const png = new PNG({ width: N, height: N });
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        const row = (y * SS + sy) * W3 + x * SS;
        for (let sx = 0; sx < SS; sx++) hits += mask[row + sx];
      }
      const i = (y * N + x) * 4;
      png.data[i] = OR[0]; png.data[i + 1] = OR[1]; png.data[i + 2] = OR[2];
      png.data[i + 3] = Math.round((hits / (SS * SS)) * 255);
    }
  }
  fs.writeFileSync(path.join(OUT, fichier), PNG.sync.write(png));
}

generer(process.env.FB_OUT || 'facebook.png');
console.log(`${process.env.FB_OUT || 'facebook.png'} — cadre « ${CADRE} », glyphe ${GLYPHE_H} px`);

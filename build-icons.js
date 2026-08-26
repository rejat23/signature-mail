// Génère les petites icônes de la signature (Instagram, Facebook, téléphone,
// adresse, Doctolib) aux couleurs de la charte. Rendu analytique + supersampling 4x.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const SIZE = Number(process.env.ICON_SIZE) || 64; // rendu 2x, affiché à 22px
const SS = 4;      // supersampling
const VERT = [0x1c, 0x32, 0x27];
const OR = [0xbd, 0xa5, 0x88];

// --- primitives en coordonnées normalisées 0..1
const rect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const roundRect = (x0, y0, x1, y1, r) => (x, y) => {
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r || (x >= x0 + r && x <= x1 - r) || (y >= y0 + r && y <= y1 - r);
};
const ring = (cx, cy, r, w) => (x, y) => {
  const d = Math.hypot(x - cx, y - cy);
  return d >= r - w / 2 && d <= r + w / 2;
};
const disc = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) <= r;
const arc = (cx, cy, r, w, a0, a1) => (x, y) => {
  const dx = x - cx, dy = y - cy;
  const d = Math.hypot(dx, dy);
  if (d < r - w / 2 || d > r + w / 2) return false;
  let a = Math.atan2(dy, dx);
  if (a < 0) a += Math.PI * 2;
  return a >= a0 && a <= a1;
};
const rot = (fn, ang, cx = 0.5, cy = 0.5) => (x, y) => {
  const c = Math.cos(-ang), si = Math.sin(-ang);
  const dx = x - cx, dy = y - cy;
  return fn(cx + dx * c - dy * si, cy + dx * si + dy * c);
};
const any = (...fns) => (x, y) => fns.some((f) => f(x, y));
const sub = (a, b) => (x, y) => a(x, y) && !b(x, y);

function render(shape, fg, bg, file) {
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / SIZE;
          const y = (py + (sy + 0.5) / SS) / SIZE;
          if (shape(x, y)) hits++;
        }
      }
      const a = hits / (SS * SS);
      const i = (py * SIZE + px) * 4;
      png.data[i] = Math.round(bg[0] + (fg[0] - bg[0]) * a);
      png.data[i + 1] = Math.round(bg[1] + (fg[1] - bg[1]) * a);
      png.data[i + 2] = Math.round(bg[2] + (fg[2] - bg[2]) * a);
      png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(OUT, file), PNG.sync.write(png));
}

const WHITE = [255, 255, 255];

// --- Instagram : contour arrondi + objectif + témoin
const instagram = any(
  sub(roundRect(0.11, 0.11, 0.89, 0.89, 0.25), roundRect(0.19, 0.19, 0.81, 0.81, 0.18)),
  ring(0.5, 0.5, 0.205, 0.08),
  disc(0.705, 0.295, 0.055)
);

// --- Facebook : le « f », tracé d'épaisseur constante autour d'une ligne médiane.
// La hampe et le crochet partagent le même point de raccord (0.5, HOOK_Y) et la même
// tangente (verticale) : sans cela le raccord laisse une encoche.
const FB_W = 0.158;        // épaisseur du trait
const FB_X = 0.50;         // axe de la hampe
const FB_HOOK_Y = 0.335;   // hauteur du raccord hampe / crochet
const FB_HOOK_R = 0.195;   // rayon de la ligne médiane du crochet
const facebook = any(
  // hampe
  rect(FB_X - FB_W / 2, FB_HOOK_Y, FB_X + FB_W / 2, 0.95),
  // crochet : quart de couronne, du raccord (angle pi) vers le haut (angle 3pi/2)
  arc(FB_X + FB_HOOK_R, FB_HOOK_Y, FB_HOOK_R, FB_W, Math.PI, Math.PI * 1.5),
  // barre
  rect(0.27, 0.455, 0.73, 0.455 + FB_W * 0.83)
);

// --- Téléphone : combiné stylisé (deux embouts + arche)
const phone = rot(any(
  sub(ring(0.5, 0.34, 0.38, 0.115), rect(0, 0.36, 1, 1)),
  roundRect(0.06, 0.30, 0.30, 0.60, 0.10),
  roundRect(0.70, 0.30, 0.94, 0.60, 0.10)
), -0.72);

// --- Adresse : goutte de localisation
const pin = any(
  sub(disc(0.5, 0.38, 0.30), disc(0.5, 0.375, 0.15)),
  (x, y) => {
    if (y < 0.38 || y > 0.94) return false;
    const t = (y - 0.38) / (0.94 - 0.38);
    const half = 0.30 * (1 - t) * (1 - t * 0.35);
    return Math.abs(x - 0.5) <= half;
  }
);

// --- Doctolib / rendez-vous : calendrier
const calendar = any(
  sub(roundRect(0.10, 0.20, 0.90, 0.90, 0.10), roundRect(0.185, 0.285, 0.815, 0.815, 0.05)),
  rect(0.10, 0.34, 0.90, 0.44),
  rect(0.27, 0.08, 0.37, 0.28),
  rect(0.63, 0.08, 0.73, 0.28),
  disc(0.35, 0.62, 0.075),
  disc(0.5, 0.62, 0.075),
  disc(0.65, 0.62, 0.075)
);

render(instagram, VERT, WHITE, 'ic-instagram.png');
render(facebook, VERT, WHITE, 'ic-facebook.png');
render(phone, OR, WHITE, 'ic-tel.png');
render(pin, OR, WHITE, 'ic-adresse.png');
render(calendar, WHITE, [0x1c, 0x32, 0x27], 'ic-rdv.png');

// planche de contrôle
const names = ['ic-instagram.png', 'ic-facebook.png', 'ic-tel.png', 'ic-adresse.png', 'ic-rdv.png'];
const sheet = new PNG({ width: SIZE * names.length, height: SIZE });
names.forEach((n, k) => {
  const p = PNG.sync.read(fs.readFileSync(path.join(OUT, n)));
  PNG.bitblt(p, sheet, 0, 0, SIZE, SIZE, k * SIZE, 0);
});
fs.writeFileSync(path.join(OUT, '_apercu-icones.png'), PNG.sync.write(sheet));
console.log('icônes OK');

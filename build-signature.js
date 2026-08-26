// Génère les signatures HTML (contact@ et secretariat@) en version « preview »
// (images locales, pour contrôle au navigateur) et « production » (images hébergées).
//
// Les pictogrammes proviennent de la médiathèque WordPress existante (dossier 2023/03) ;
// seuls le bloc-marque ré-encodé et l'icône Facebook sont de nouveaux fichiers.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

// Pictogrammes déjà en ligne, inchangés
const BASE_ICONES = 'https://dr-bergeon.fr/wp-content/uploads/2023/03';
// Dossier où seront déposés logo-signature.gif et facebook.png
const BASE_NOUVEAU = process.env.SIGN_BASE || 'https://dr-bergeon.fr/wp-content/uploads/2026/08';

const NOUVEAUX = new Set(['logo-signature.gif', 'logo-signature.png', 'facebook.png']);

const VERT = '#1C3227';
const OR = '#BDA588';
const TEXTE = '#42544B';
const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = "Arial,Helvetica,sans-serif";

const LOGO_W = 200, LOGO_H = 144;

const TEL_AFF = '09 70 75 07 10';
const TEL_HREF = 'tel:+33970750710';
const SITE = 'https://www.dr-bergeon.fr';
const DOCTOLIB = 'https://www.doctolib.fr/angiologue/gueret/nicolas-bergeon';
const INSTAGRAM = 'https://www.instagram.com/drbergeon/';
const FACEBOOK = 'https://www.facebook.com/profile.php?id=100084380033524';

const maps = (adresse) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse);

const PROFILS = {
  contact: {
    fichier: 'signature-contact',
    titre: 'Docteur Nicolas Bergeon',
    sousTitre: null, // déjà porté par le bloc-marque, on évite le doublon
    email: 'contact@dr-bergeon.fr',
  },
  secretariat: {
    fichier: 'signature-secretariat',
    titre: 'Secr&eacute;tariat m&eacute;dical',
    sousTitre: 'Cabinet du Dr Nicolas Bergeon',
    email: 'secretariat@dr-bergeon.fr',
  },
};

function signature(p, local) {
  const url = (f) => (local ? `./${f}` : `${NOUVEAUX.has(f) ? BASE_NOUVEAU : BASE_ICONES}/${f}`);
  const lien = (href, texte, extra = '') =>
    `<a href="${href}" style="color:${TEXTE};text-decoration:none;${extra}">${texte}</a>`;

  // pictogramme + texte, sur une largeur de colonne fixe pour que le texte s'aligne
  const ligne = (icone, w, h, alt, contenu) => `
          <tr>
            <td width="26" style="padding:3px 10px 3px 0;vertical-align:middle;">
              <img src="${url(icone)}" width="${w}" height="${h}" alt="${alt}" style="display:block;border:0;" />
            </td>
            <td style="padding:3px 0;font-family:${SANS};font-size:13px;line-height:19px;color:${TEXTE};">
              ${contenu}
            </td>
          </tr>`;

  const sousTitre = p.sousTitre ? `
      <div style="padding:0 0 10px 0;font-family:${SANS};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${OR};">
        ${p.sousTitre}
      </div>` : '';

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="545" style="border-collapse:collapse;background:#ffffff;width:545px;">
  <tr>
    <td width="${LOGO_W}" style="padding:0 16px 0 0;vertical-align:top;">
      <a href="${SITE}" style="text-decoration:none;border:0;">
        <img src="${url('logo-signature.gif')}" width="${LOGO_W}" height="${LOGO_H}" alt="Dr Nicolas Bergeon &ndash; M&eacute;decine vasculaire et esth&eacute;tique" style="display:block;border:0;outline:none;" />
      </a>
    </td>
    <td style="padding:2px 0 0 16px;vertical-align:top;border-left:1px dashed ${OR};">
      <div style="padding:0 0 ${p.sousTitre ? 2 : 10}px 0;font-family:${SERIF};font-size:15px;font-weight:bold;color:${VERT};letter-spacing:.2px;">
        ${p.titre}
      </div>${sousTitre}
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">${
        ligne('telephone.png', 15, 15, 'T&eacute;l&eacute;phone', lien(TEL_HREF, TEL_AFF, 'font-weight:bold;'))
      }${
        ligne('mail.png', 16, 11, 'Courriel', lien('mailto:' + p.email, p.email))
      }${
        ligne('adresse.png', 11, 15, 'Adresse',
          lien(maps('57 avenue du Berry, 23000 Guéret'), '57 avenue du Berry &mdash; 23000 Gu&eacute;ret'))
      }${
        ligne('adresse.png', 11, 15, 'Adresse',
          lien(maps('8 rue Ambroise Croizat, 03630 Désertines'), '8 rue Ambroise Croizat &mdash; 03630 D&eacute;sertines'))
      }${
        ligne('site-internet.png', 15, 15, 'Site internet', lien(SITE, 'www.dr-bergeon.fr'))
      }
      </table>
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:14px;">
        <tr>
          <td style="background:${VERT};border-radius:3px;">
            <a href="${DOCTOLIB}" style="display:inline-block;padding:9px 15px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
              Prendre rendez-vous
            </a>
          </td>
          <td style="padding-left:14px;vertical-align:middle;">
            <a href="${INSTAGRAM}" style="text-decoration:none;border:0;">
              <img src="${url('instagam.png')}" width="22" height="22" alt="Instagram" style="display:block;border:0;" />
            </a>
          </td>
          <td style="padding-left:9px;vertical-align:middle;">
            <a href="${FACEBOOK}" style="text-decoration:none;border:0;">
              <img src="${url('facebook.png')}" width="22" height="22" alt="Facebook" style="display:block;border:0;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td colspan="2" width="545" style="padding:16px 0 0 0;font-family:${SANS};font-size:10px;line-height:15px;color:#9AA6A0;">
      Cabinet ouvert du lundi au vendredi, 8h00 &ndash; 19h00.<br />
      Ce message et ses pi&egrave;ces jointes sont confidentiels. Si vous n&rsquo;en &ecirc;tes pas le destinataire,
      merci de nous en informer et de le supprimer.
    </td>
  </tr>
</table>`;
}

function page(titre, corps) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${titre}</title></head>
<body style="margin:0;padding:32px;background:#f2efe9;font-family:Arial,Helvetica,sans-serif;">
${corps}
</body></html>`;
}

// les pictogrammes existants sont copiés dans out/ pour que les aperçus fonctionnent hors ligne
for (const f of ['telephone.png', 'mail.png', 'adresse.png', 'site-internet.png', 'instagam.png']) {
  fs.copyFileSync(path.join(__dirname, 'wp', f), path.join(OUT, f));
}

for (const key of Object.keys(PROFILS)) {
  const p = PROFILS[key];
  fs.writeFileSync(path.join(OUT, `${p.fichier}.html`), signature(p, false) + '\n');
  fs.writeFileSync(path.join(OUT, `preview-${p.fichier}.html`), page(p.fichier, signature(p, true)));
}

fs.writeFileSync(
  path.join(OUT, 'preview-les-deux.html'),
  page('Signatures Dr Bergeon',
    Object.values(PROFILS)
      .map((p) => `<div style="margin-bottom:48px;">${signature(p, true)}</div>`)
      .join('\n'))
);

console.log('signatures générées');
console.log('  pictogrammes  :', BASE_ICONES);
console.log('  nouveaux fichiers :', BASE_NOUVEAU);

// Génère les signatures HTML (contact@ et secretariat@) en version « preview »
// (images locales, pour contrôle au navigateur) et « production » (images hébergées).
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

// URL publique où seront déposés logo-nb-anime.gif, ic-*.png (sans / final)
const BASE = process.env.SIGN_BASE || 'https://www.dr-bergeon.fr/signature';

const VERT = '#1C3227';
const OR = '#BDA588';
const TEXTE = '#42544B';
const SERIF = "Georgia,'Times New Roman',Times,serif";
const SANS = "Arial,Helvetica,sans-serif";

const TEL_AFF = '09 70 75 07 10';
const TEL_HREF = 'tel:+33970750710';
const SITE = 'https://www.dr-bergeon.fr';
const DOCTOLIB = 'https://www.doctolib.fr/angiologue/gueret/nicolas-bergeon';
const INSTAGRAM = 'https://www.instagram.com/drbergeon/';
const FACEBOOK = 'https://www.facebook.com/profile.php?id=100084380033524';

const ADRESSES = [
  {
    ligne: '57 avenue du Berry &mdash; 23000 Gu&eacute;ret',
    maps: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('57 avenue du Berry, 23000 Guéret'),
  },
  {
    ligne: '8 rue Ambroise Croizat &mdash; 03630 D&eacute;sertines',
    maps: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('8 rue Ambroise Croizat, 03630 Désertines'),
  },
];

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

function signature(p, base) {
  const a = (f) => `${base}/${f}`;
  const lien = (href, texte, extra = '') =>
    `<a href="${href}" style="color:${TEXTE};text-decoration:none;${extra}">${texte}</a>`;

  const adresses = ADRESSES.map((ad) => `
                    <tr>
                      <td style="padding:2px 8px 2px 0;vertical-align:middle;" width="18">
                        <img src="${a('ic-adresse.png')}" width="12" height="12" alt="" style="display:block;border:0;" />
                      </td>
                      <td style="padding:2px 0;font-family:${SANS};font-size:13px;line-height:19px;color:${TEXTE};">
                        ${lien(ad.maps, ad.ligne)}
                      </td>
                    </tr>`).join('');

  const sousTitre = p.sousTitre ? `
  <tr>
    <td style="padding:0 0 10px 0;font-family:${SANS};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${OR};">
      ${p.sousTitre}
    </td>
  </tr>` : '';

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="border-collapse:collapse;background:#ffffff;width:470px;">
  <tr>
    <td style="padding:0 0 10px 0;">
      <a href="${SITE}" style="text-decoration:none;border:0;">
        <img src="${a('logo-nb-anime.gif')}" width="312" height="88" alt="Dr Nicolas Bergeon &ndash; M&eacute;decine vasculaire et esth&eacute;tique" style="display:block;border:0;outline:none;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:0;border-top:1px dashed ${OR};font-size:0;line-height:0;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:10px 0 ${p.sousTitre ? 2 : 10}px 0;font-family:${SERIF};font-size:15px;font-weight:bold;color:${VERT};letter-spacing:.2px;">
      ${p.titre}
    </td>
  </tr>${sousTitre}
  <tr>
    <td style="padding:0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
        <tr>
          <td style="padding:2px 8px 2px 0;vertical-align:middle;" width="18">
            <img src="${a('ic-tel.png')}" width="12" height="12" alt="T&eacute;l." style="display:block;border:0;" />
          </td>
          <td style="padding:2px 0;font-family:${SANS};font-size:13px;line-height:19px;color:${TEXTE};">
            ${lien(TEL_HREF, TEL_AFF, 'font-weight:bold;')}
            <span style="color:${OR};padding:0 6px;">&#8226;</span>
            ${lien('mailto:' + p.email, p.email)}
          </td>
        </tr>${adresses}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 0 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
        <tr>
          <td style="background:${VERT};border-radius:3px;">
            <a href="${DOCTOLIB}" style="display:inline-block;padding:9px 16px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
              Prendre rendez-vous
            </a>
          </td>
          <td style="padding-left:14px;vertical-align:middle;">
            <a href="${INSTAGRAM}" style="text-decoration:none;border:0;">
              <img src="${a('ic-instagram.png')}" width="22" height="22" alt="Instagram" style="display:block;border:0;" />
            </a>
          </td>
          <td style="padding-left:8px;vertical-align:middle;">
            <a href="${FACEBOOK}" style="text-decoration:none;border:0;">
              <img src="${a('ic-facebook.png')}" width="22" height="22" alt="Facebook" style="display:block;border:0;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td width="470" style="padding:12px 0 0 0;font-family:${SANS};font-size:10px;line-height:15px;color:#9AA6A0;">
      ${lien(SITE, 'www.dr-bergeon.fr', 'color:#9AA6A0;')} &nbsp;|&nbsp; Lundi au vendredi, 8h00 &ndash; 19h00<br />
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

for (const key of Object.keys(PROFILS)) {
  const p = PROFILS[key];
  // production : images hébergées, fragment HTML à coller
  fs.writeFileSync(path.join(OUT, `${p.fichier}.html`), signature(p, BASE) + '\n');
  // preview : images locales, ouvrable au navigateur
  fs.writeFileSync(
    path.join(OUT, `preview-${p.fichier}.html`),
    page(p.fichier, signature(p, '.'))
  );
}

fs.writeFileSync(
  path.join(OUT, 'preview-les-deux.html'),
  page('Signatures Dr Bergeon',
    Object.values(PROFILS)
      .map((p) => `<div style="margin-bottom:48px;">${signature(p, '.')}</div>`)
      .join('\n'))
);

console.log('signatures générées (base images :', BASE + ')');

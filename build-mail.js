// Fabrique le message que l'on s'envoie à soi-même pour transporter les signatures
// d'un poste à l'autre : un .eml prêt à ouvrir dans Outlook, et le même corps en .html
// si l'on préfère le coller à la main dans un nouveau message.
//
// Le message porte les signatures en clair dans le corps (copie immédiate) ET en pièces
// jointes (copie fiable : on ouvre la pièce jointe au navigateur, Ctrl+A, Ctrl+C, sans
// risque d'emporter le texte alentour ni de dépendre de l'affichage des images).
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const ADRESSE = process.env.MAIL_TO || 'contact@dr-bergeon.fr';

const VERT = '#1C3227';
const OR = '#BDA588';
const SANS = "Arial,Helvetica,sans-serif";

const SIGNATURES = [
  { fichier: 'signature-contact.html', libelle: 'contact@dr-bergeon.fr' },
  { fichier: 'signature-secretariat.html', libelle: 'secretariat@dr-bergeon.fr' },
];

const lire = (f) => fs.readFileSync(path.join(OUT, f), 'utf8').trim();

// --- corps du message
const blocs = SIGNATURES.map((s) => `
    <tr>
      <td style="padding:0 0 6px 0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${OR};">
        Signature &mdash; ${s.libelle}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 14px 0;">
${lire(s.fichier)}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 34px 0;border-bottom:2px solid #E7E1D6;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr><td style="height:34px;font-size:0;line-height:0;">&nbsp;</td></tr>`).join('\n');

const CORPS_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" style="border-collapse:collapse;width:600px;">
  <tr>
    <td style="padding:0 0 10px 0;font-family:${SANS};font-size:17px;font-weight:bold;color:${VERT};">
      Signatures du cabinet &mdash; à installer sur ce poste
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px 0;font-family:${SANS};font-size:13px;line-height:20px;color:#42544B;">
      <b>Le plus fiable :</b> ouvrir la pièce jointe correspondante (elle s&rsquo;ouvre dans le
      navigateur), faire <b>Ctrl+A</b> puis <b>Ctrl+C</b>, et coller dans les réglages de
      signature d&rsquo;Outlook avec <b>Ctrl+V</b>.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px 0;font-family:${SANS};font-size:13px;line-height:20px;color:#42544B;">
      <b>Plus rapide :</b> copier directement le bloc ci-dessous, du logo jusqu&rsquo;à la dernière
      ligne. Si les images n&rsquo;apparaissent pas, cliquer d&rsquo;abord sur
      «&nbsp;Télécharger les images&nbsp;» en haut du message, sinon la copie les emporte vides.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 8px 0;font-family:${SANS};font-size:13px;line-height:20px;color:#42544B;">
      Coller avec <b>Ctrl+V</b> et surtout pas Ctrl+Maj+V, qui supprimerait toute la mise en forme.
      Penser à affecter la signature <b>aux nouveaux messages</b> et <b>aux réponses et transferts</b>.
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 30px 0;font-family:${SANS};font-size:12px;line-height:18px;color:#9AA6A0;">
      Les images sont hébergées sur dr-bergeon.fr : rien à installer sur le poste, mais ne pas
      les déplacer sur le site.
    </td>
  </tr>
${blocs}
</table>`;

const CORPS_TEXTE = [
  'Signatures du cabinet - à installer sur ce poste.',
  '',
  'Ce message est en HTML. Pour installer une signature :',
  'ouvrir la pièce jointe correspondante dans le navigateur,',
  'Ctrl+A, Ctrl+C, puis Ctrl+V dans les réglages de signature',
  "d'Outlook (jamais Ctrl+Maj+V).",
  '',
  SIGNATURES.map((s) => `- ${s.fichier}  ->  ${s.libelle}`).join('\r\n'),
].join('\r\n') + '\r\n';

// --- assemblage MIME
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
const sujet = '=?UTF-8?B?' + Buffer.from('Signatures du cabinet — à installer sur ce poste', 'utf8').toString('base64') + '?=';
const MIXTE = 'mixte_9f3a1c7e';
const ALT = 'alt_4b8d2e60';

const parties = [
  `--${MIXTE}`,
  `Content-Type: multipart/alternative; boundary="${ALT}"`,
  '',
  `--${ALT}`,
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: base64',
  '',
  b64(CORPS_TEXTE),
  '',
  `--${ALT}`,
  'Content-Type: text/html; charset=UTF-8',
  'Content-Transfer-Encoding: base64',
  '',
  b64(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:20px;background:#ffffff;">\r\n${CORPS_HTML}\r\n</body></html>`),
  '',
  `--${ALT}--`,
  '',
];

for (const s of SIGNATURES) {
  parties.push(
    `--${MIXTE}`,
    `Content-Type: text/html; charset=UTF-8; name="${s.fichier}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${s.fichier}"`,
    '',
    b64(lire(s.fichier) + '\n'),
    ''
  );
}
parties.push(`--${MIXTE}--`, '');

const eml = [
  `From: ${ADRESSE}`,
  `To: ${ADRESSE}`,
  `Subject: ${sujet}`,
  `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
  'MIME-Version: 1.0',
  `Content-Type: multipart/mixed; boundary="${MIXTE}"`,
  '',
  ...parties,
].join('\r\n');

fs.writeFileSync(path.join(OUT, 'signatures-a-envoyer.eml'), eml, 'utf8');

// même corps en page autonome, pour un copier-coller manuel dans un nouveau message
fs.writeFileSync(
  path.join(OUT, 'signatures-a-envoyer.html'),
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Signatures à envoyer</title></head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
${CORPS_HTML}
</body></html>`
);

console.log('signatures-a-envoyer.eml  (' + (fs.statSync(path.join(OUT, 'signatures-a-envoyer.eml')).size / 1024).toFixed(1) + ' Ko)');
console.log('signatures-a-envoyer.html');
console.log('destinataire :', ADRESSE);

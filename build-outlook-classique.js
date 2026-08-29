// Produit les fichiers que l'Outlook classique (Win32) range dans
// %APPDATA%\Microsoft\Signatures : un .htm pour les messages HTML et un .txt pour les
// messages en texte brut. Les recopier sur un poste évite de refaire le copier-coller,
// et garantit un rendu identique partout.
//
// Sans objet pour le nouvel Outlook, qui ne lit pas ce dossier.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out', 'signatures-outlook-classique');
fs.mkdirSync(OUT, { recursive: true });

const cabinet = (qui, email) => [
  qui,
  '',
  'Tél. 09 70 75 07 10',
  email,
  '57 avenue du Berry - 23000 Guéret',
  '8 rue Ambroise Croizat - 03630 Désertines',
  'www.dr-bergeon.fr',
  '',
  'Rendez-vous : https://www.doctolib.fr/angiologue/gueret/nicolas-bergeon',
  'Instagram : https://www.instagram.com/drbergeon/',
  'Facebook : https://www.facebook.com/people/Dr-Nicolas-Bergeon/100084380033524/',
  '',
  'Cabinet ouvert du lundi au vendredi, 8h00 - 19h00.',
  "Ce message et ses pièces jointes sont confidentiels. Si vous n'en êtes pas le",
  'destinataire, merci de nous en informer et de le supprimer.',
];

const PROFILS = [
  {
    src: 'signature-contact.html', nom: 'Dr Bergeon',
    texte: cabinet('Docteur Nicolas Bergeon', 'contact@dr-bergeon.fr'),
  },
  {
    src: 'signature-secretariat.html', nom: 'Secretariat Dr Bergeon',
    texte: cabinet('Secrétariat médical — Cabinet du Dr Nicolas Bergeon', 'secretariat@dr-bergeon.fr'),
  },
  {
    src: 'signature-personnelle.html', nom: 'Carina et Nicolas',
    texte: [
      'Carina Passant & Nicolas Bergeon',
      '',
      '22 rue du Pradet - 23000 Guéret',
      '06 95 15 86 96',
    ],
  },
];

const texte = (p) => p.texte.join('\r\n') + '\r\n';

for (const p of PROFILS) {
  const corps = fs.readFileSync(path.join(__dirname, 'out', p.src), 'utf8');
  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Generator" content="Microsoft Word 15 (filtered medium)" />
<title>${p.nom}</title>
</head>
<body lang="FR" style="margin:0;padding:0;">
${corps}</body>
</html>
`;
  // Outlook lit ces fichiers en UTF-8 s'ils portent une BOM
  fs.writeFileSync(path.join(OUT, `${p.nom}.htm`), '﻿' + html, 'utf8');
  fs.writeFileSync(path.join(OUT, `${p.nom}.txt`), '﻿' + texte(p), 'utf8');
}

fs.writeFileSync(path.join(OUT, 'À LIRE.txt'),
  '﻿' + [
    'Signatures pour l\'Outlook CLASSIQUE (Win32) uniquement.',
    '',
    'Copier les fichiers .htm et .txt de ce dossier dans :',
    '    %APPDATA%\\Microsoft\\Signatures',
    'sur chaque poste (coller ce chemin dans la barre d\'adresse de l\'Explorateur).',
    '',
    'Puis dans Outlook : Fichier > Options > Courrier > Signatures,',
    'et affecter la signature au compte, pour les nouveaux messages',
    'et pour les réponses/transferts.',
    '',
    'Outlook doit être fermé pendant la copie.',
    '',
    'Le NOUVEL Outlook ne lit pas ce dossier : il faut y refaire le',
    'copier-coller depuis signature-contact.html ouvert au navigateur.',
  ].join('\r\n') + '\r\n', 'utf8');

console.log('fichiers Outlook classique générés dans out/signatures-outlook-classique/');

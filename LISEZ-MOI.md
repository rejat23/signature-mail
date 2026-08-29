# Signatures mail — Cabinet Dr Nicolas Bergeon

Deux signatures HTML aux couleurs de la charte 2024 (vert `#1C3227`, or `#BDA588`,
Georgia pour les titres), construites sur les visuels déjà présents dans la
médiathèque WordPress de `dr-bergeon.fr`.

## Contenu

| Fichier | Rôle |
|---|---|
| `out/signature-contact.html` | signature de **contact@dr-bergeon.fr** (à coller) |
| `out/signature-secretariat.html` | signature de **secretariat@dr-bergeon.fr** (à coller) |
| `out/signature-personnelle.html` | signature **personnelle** de Carina et Nicolas (à coller) |
| `out/preview-*.html` | aperçus ouvrables au navigateur (images locales) |
| `out/logo-signature.gif` | bloc-marque animé ré-encodé, 412×297 px (affiché 200×144), 92 Ko |
| `out/logo-signature.png` | même image figée, pour une signature sans animation |
| `out/facebook.png` | icône Facebook, ajoutée pour compléter le jeu existant |
| `out/signatures-outlook-classique/` | fichiers prêts à copier pour l'Outlook classique |
| `build-*.js` | scripts de regénération |

## Ce que contient la signature

- bloc-marque animé, cliquable vers `www.dr-bergeon.fr`
- nom / fonction
- téléphone **09 70 75 07 10** — cliquable (`tel:+33970750710`)
- adresse mail — cliquable (`mailto:`)
- **57 avenue du Berry, 23000 Guéret** — cliquable (Google Maps)
- **8 rue Ambroise Croizat, 03630 Désertines** — cliquable (Google Maps)
- site internet — cliquable
- bouton **Prendre rendez-vous** → Doctolib
- icônes Instagram et Facebook — cliquables
- horaires et mention de confidentialité

## Les images

Cinq pictogrammes proviennent de la médiathèque et sont appelés à leur adresse
actuelle, sans rien redéposer :

```
https://dr-bergeon.fr/wp-content/uploads/2023/03/telephone.png
https://dr-bergeon.fr/wp-content/uploads/2023/03/mail.png
https://dr-bergeon.fr/wp-content/uploads/2023/03/adresse.png
https://dr-bergeon.fr/wp-content/uploads/2023/03/site-internet.png
https://dr-bergeon.fr/wp-content/uploads/2023/03/instagam.png
```

Deux fichiers seulement sont à téléverser : `logo-signature.gif` et `facebook.png`.
S'ils atterrissent dans `wp-content/uploads/2026/08/` sous ces noms exacts, les
signatures sont déjà correctes. Sinon, regénérer avec la bonne adresse :

```bash
SIGN_BASE=https://dr-bergeon.fr/wp-content/uploads/2026/09 node build-signature.js
```

Ne plus déplacer ni renommer ces fichiers ensuite : les mails déjà envoyés pointent dessus.

> À savoir : la plupart des clients mail bloquent les images distantes au premier
> message d'un correspondant. Le texte, les liens et le bouton Doctolib restent
> lisibles ; le bloc-marque et les pictogrammes attendent un clic sur « afficher les
> images ». C'est le comportement de toute signature illustrée.

## La signature personnelle

Même grammaire graphique que celles du cabinet — vert, or, Georgia, filet pointillé,
mêmes pictogrammes — mais **sans le bloc-marque** : celui-ci porte l'identité médicale
du cabinet, qui n'a rien à faire sur du courrier privé.

Elle ne comporte volontairement ni bouton Doctolib, ni réseaux sociaux, ni mention de
confidentialité. Pour lui ajouter une ligne courriel, renseigner `email` dans l'objet
`PERSO` en tête de `build-signature.js` et regénérer.

## L'icône Facebook

Le jeu en ligne n'en comportait pas. `build-icon-facebook.js` la produit au gabarit
exact des autres, relevé sur `instagam.png` : toile 1250 px, trait 74 px, rayon de coin
240 px, or `rgb(188,164,135)`.

Le « f » n'est pas une lettre redessinée : c'est le tracé vectoriel officiel de la
marque, aplati puis rempli. Il est **plein**, comme la marque elle-même — un « f » en
trait fin, aligné sur l'épaisseur des autres pictogrammes, ne ressemble pas à Facebook.

Deux réglages par variables d'environnement :

```bash
FB_CADRE=cercle node build-icon-facebook.js   # cadre rond au lieu du carré arrondi
FB_H=540 node build-icon-facebook.js          # « f » plus ou moins grand dans le cadre
```

Le carré arrondi est retenu par défaut : il reprend le cadre de l'icône Instagram
existante et correspond à l'icône d'application Facebook.

## Le bloc-marque animé

`Gif.gif` de la médiathèque est l'animation d'origine : 500×300, 226 images à 50 i/s,
**1,5 Mo**. Tel quel il est inutilisable en signature — trop lourd, il boucle sans fin,
sa première image est vide et il se termine en s'effaçant.

`build-logo.js` le ré-encode : recadrage sur le contenu, mise à l'échelle, phase
d'apparition seule ramenée à 25 i/s, encodage différentiel. **1,5 Mo → 92 Ko.**

Deux partis pris, modifiables en tête du script :

- **La première image est le logo terminé.** L'**Outlook classique** (Win32, moteur de
  rendu de Word) n'affiche que la première image d'un GIF : il montrera donc le logo
  correct au lieu d'une case vide. Elle dure 20 ms, invisible partout ailleurs.
  Le **nouvel Outlook**, lui, est bâti sur Chromium et anime normalement le GIF.
- **Lecture unique** (`LOOP = -1`), l'animation se joue une fois et la signature reste
  au repos sur le logo terminé. Mettre `LOOP = 0` pour une boucle infinie.

Pour renoncer à l'animation, remplacer `logo-signature.gif` par `logo-signature.png`
dans les deux fichiers HTML.

## Installation

### Webmail Infomaniak (mail.infomaniak.com)

Le webmail n'accepte pas le collage de HTML brut. Ouvrir
`out/preview-signature-contact.html` dans le navigateur, sélectionner toute la
signature, copier, puis coller dans *Paramètres → Signatures → Nouvelle signature*.
Vérifier que le bloc-marque est bien passé ; sinon, l'insérer par son URL via le
bouton « image » de l'éditeur.

### Apple Mail (macOS)

1. *Mail → Réglages → Signatures*, créer une signature vide et lui donner un nom.
2. Quitter Mail.
3. Ouvrir `~/Library/Mail/V10/MailData/Signatures/` (le numéro de version varie),
   repérer le `.mailsignature` le plus récent et remplacer tout ce qui suit les
   en-têtes par le contenu de `signature-contact.html`.
4. Verrouiller le fichier (*Lire les informations → Verrouillé*) pour que Mail ne le
   réécrive pas, puis relancer Mail.

### Mail sur iPhone / iPad

iOS ne gère pas le HTML dans les signatures. Ouvrir la signature dans Safari,
tout sélectionner, copier, puis coller dans *Réglages → Applications → Mail → Signature*.
Le rendu est simplifié (le bouton Doctolib devient un lien), mais les liens fonctionnent.

### Outlook (nouveau) — Windows 11

Le nouvel Outlook est bâti sur Chromium : il **anime le GIF** et rend correctement le
tableau. Son éditeur de signature n'accepte pas le HTML brut, il faut coller du contenu
déjà rendu.

1. Ouvrir `out/signature-contact.html` dans le navigateur (double-clic). Le fichier est
   autonome, ses images sont en ligne.
2. `Ctrl+A` puis `Ctrl+C` — la page ne contient que la signature, la sélection est propre.
3. Dans Outlook, engrenage **Paramètres** (en haut à droite) → **Comptes** →
   **Signatures**. Sur les versions plus anciennes : **Courrier** → **Rédaction et
   réponse** → **Signature électronique**.
4. **Nouvelle signature**, la nommer, puis coller avec **`Ctrl+V`**.
   Surtout pas `Ctrl+Maj+V`, qui colle en texte brut et détruit la mise en forme.
5. Choisir la signature pour les **nouveaux messages** et pour les **réponses/transferts**.
6. **Enregistrer**.

Deux comptes, deux signatures : le sélecteur de compte est en haut de la page
*Signatures*. Refaire l'opération avec `signature-secretariat.html` sur `secretariat@`.

Après le collage, vérifier trois points que l'éditeur peut simplifier : le filet
vertical en pointillé, le fond vert du bouton *Prendre rendez-vous*, et la présence du
bloc-marque. Si le logo manque, refaire le copier-coller — ne pas l'insérer avec le
bouton « image », qui téléverse une copie locale et la joint à chaque message.

> Le nouvel Outlook fait transiter les comptes tiers (IMAP, donc Infomaniak) par les
> serveurs de Microsoft pour les synchroniser. Point à peser pour une boîte
> professionnelle de santé ; sans rapport avec la signature, mais autant le savoir.

### Outlook classique (Windows)

*Fichier → Options → Courrier → Signatures*, même copier-coller depuis le navigateur.
Rappel : celui-ci affichera le logo figé sur sa première image.

### Thunderbird

*Paramètres du compte → Utiliser HTML* → cocher « Joindre la signature depuis un
fichier » et pointer sur `signature-contact.html`.

## Plusieurs postes

Les **signatures itinérantes** de Microsoft rangent la signature dans la boîte aux
lettres, d'où elle suit l'utilisateur de poste en poste. Elles sont réservées aux boîtes
**Exchange Online / Outlook.com** : un compte IMAP tiers, donc Infomaniak, en est exclu,
et l'abonnement Microsoft 365 n'y change rien — c'est la boîte qui décide, pas la licence.

Il faut donc installer la signature **sur chaque poste**. Selon la version :

- **Nouvel Outlook** : refaire le copier-coller depuis `signature-contact.html`. Ouvrir
  le fichier depuis un emplacement commun (le partage du NAS) pour que les postes
  partent tous de la même source.
- **Outlook classique** : pas de ressaisie. Copier les fichiers de
  `out/signatures-outlook-classique/` dans `%APPDATA%\Microsoft\Signatures`, Outlook
  fermé, puis affecter la signature au compte dans *Fichier → Options → Courrier →
  Signatures*. Le rendu est alors rigoureusement identique d'un poste à l'autre.

Ces fichiers sont produits par `build-outlook-classique.js` : un `.htm` pour les
messages HTML, un `.txt` pour ceux en texte brut.

## Regénérer

```bash
npm install
node build-logo.js && node build-icon-facebook.js && node build-signature.js && node build-outlook-classique.js
```

Sources : `assets/logo-anime-source.gif` (copie de `Gif.gif` de la médiathèque),
`wp/` (copie des pictogrammes en ligne, pour les aperçus hors connexion).
Coordonnées et liens : en tête de `build-signature.js`.

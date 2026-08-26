# Signatures mail — Cabinet Dr Nicolas Bergeon

Deux signatures HTML aux couleurs de la charte 2024 (vert `#1C3227`, or `#BDA588`,
Georgia pour les titres), construites sur les visuels déjà présents dans la
médiathèque WordPress de `dr-bergeon.fr`.

## Contenu

| Fichier | Rôle |
|---|---|
| `out/signature-contact.html` | signature de **contact@dr-bergeon.fr** (à coller) |
| `out/signature-secretariat.html` | signature de **secretariat@dr-bergeon.fr** (à coller) |
| `out/preview-*.html` | aperçus ouvrables au navigateur (images locales) |
| `out/logo-signature.gif` | bloc-marque animé ré-encodé, 412×297 px (affiché 200×144), 92 Ko |
| `out/logo-signature.png` | même image figée, pour une signature sans animation |
| `out/facebook.png` | icône Facebook, dessinée pour compléter le jeu existant |
| `build-logo.js`, `build-icon-facebook.js`, `build-signature.js` | scripts de regénération |

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

## Le bloc-marque animé

`Gif.gif` de la médiathèque est l'animation d'origine : 500×300, 226 images à 50 i/s,
**1,5 Mo**. Tel quel il est inutilisable en signature — trop lourd, il boucle sans fin,
sa première image est vide et il se termine en s'effaçant.

`build-logo.js` le ré-encode : recadrage sur le contenu, mise à l'échelle, phase
d'apparition seule ramenée à 25 i/s, encodage différentiel. **1,5 Mo → 92 Ko.**

Deux partis pris, modifiables en tête du script :

- **La première image est le logo terminé.** Outlook pour Windows n'affiche que la
  première image d'un GIF : il montrera donc le logo correct au lieu d'une case vide.
  Elle dure 20 ms, invisible partout ailleurs.
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

### Outlook (Windows)

*Fichier → Options → Courrier → Signatures*. Comme pour le webmail, passer par un
copier-coller depuis le navigateur. Rappel : Outlook affichera le logo fixe.

### Thunderbird

*Paramètres du compte → Utiliser HTML* → cocher « Joindre la signature depuis un
fichier » et pointer sur `signature-contact.html`.

## Regénérer

```bash
npm install
node build-logo.js && node build-icon-facebook.js && node build-signature.js
```

Sources : `assets/logo-anime-source.gif` (copie de `Gif.gif` de la médiathèque),
`wp/` (copie des pictogrammes en ligne, pour les aperçus hors connexion).
Coordonnées et liens : en tête de `build-signature.js`.

# Signatures mail — Cabinet Dr Nicolas Bergeon

Deux signatures HTML aux couleurs de la charte 2024 (vert `#1C3227`, or `#BDA588`,
Georgia pour les titres), avec bloc-marque animé.

## Contenu

| Fichier | Rôle |
|---|---|
| `out/signature-contact.html` | signature de **contact@dr-bergeon.fr** (à coller) |
| `out/signature-secretariat.html` | signature de **secretariat@dr-bergeon.fr** (à coller) |
| `out/preview-*.html` | aperçus ouvrables au navigateur (images locales) |
| `out/logo-nb-anime.gif` | bloc-marque animé, 624×175 px (affiché 312×88), 105 Ko |
| `out/logo-nb.png` | même image en version fixe (secours) |
| `out/ic-tel.png`, `ic-adresse.png`, `ic-instagram.png`, `ic-facebook.png` | pictogrammes |
| `build-logo.js`, `build-icons.js`, `build-signature.js` | scripts de regénération |

## Ce que contient la signature

- bloc-marque animé, cliquable vers `www.dr-bergeon.fr`
- nom / fonction
- téléphone **09 70 75 07 10** — cliquable (`tel:+33970750710`)
- adresse mail — cliquable (`mailto:`)
- **57 avenue du Berry, 23000 Guéret** — cliquable (Google Maps)
- **8 rue Ambroise Croizat, 03630 Désertines** — cliquable (Google Maps)
- bouton **Prendre rendez-vous** → Doctolib
- pictogrammes Instagram et Facebook — cliquables
- horaires, site, mention de confidentialité

## L'animation

Un reflet doux balaye le bloc-marque dans l'axe du trait diagonal du logo, toutes
les 6 secondes environ. Le GIF est **animé en différentiel** (seuls les pixels qui
changent sont réécrits) pour tenir en ~105 Ko.

**La première image du GIF est le logo net.** C'est important : Outlook pour Windows
n'affiche que la première image d'un GIF — la signature y sera donc correcte, simplement
sans animation. Même chose pour l'aperçu des notifications.

Pour changer la cadence : `HOLD_DELAY` dans `build-logo.js` (durée du temps mort entre
deux balayages), puis `node build-logo.js`.

## Étape obligatoire : héberger les images

Les images d'une signature ne peuvent pas être embarquées (les clients mail bloquent
les `data:` URI, et une image en pièce jointe se réattache à chaque message). Il faut
donc les déposer une fois pour toutes à une URL publique et stable.

1. Déposer `logo-nb-anime.gif`, `ic-tel.png`, `ic-adresse.png`, `ic-instagram.png`
   et `ic-facebook.png` dans un dossier public, par exemple
   `https://www.dr-bergeon.fr/signature/`.
2. Regénérer les signatures avec cette adresse :

```bash
SIGN_BASE=https://www.dr-bergeon.fr/signature node build-signature.js
```

Ne plus déplacer ni renommer ces fichiers ensuite : les mails déjà envoyés pointent
dessus.

> À savoir : la plupart des clients mail bloquent les images distantes par défaut au
> premier message d'un correspondant. Le texte, les liens et le bouton Doctolib restent
> lisibles ; seuls le bloc-marque et les pictogrammes attendent un clic sur
> « afficher les images ». C'est le comportement normal de toutes les signatures illustrées.

## Installation

### Webmail Infomaniak (mail.infomaniak.com)

Le webmail n'accepte pas le collage de HTML brut. Ouvrir
`out/preview-signature-contact.html` dans le navigateur, sélectionner toute la
signature, copier, puis coller dans *Paramètres → Signatures → Nouvelle signature*.
Vérifier que le logo animé est bien passé ; sinon, insérer l'image par son URL via
le bouton « image » de l'éditeur.

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
node build-logo.js && node build-icons.js && node build-signature.js
```

Sources : `assets/logo-horizontal-nb.jpg` (bloc-marque horizontal du site).
Coordonnées et liens : en haut de `build-signature.js`.

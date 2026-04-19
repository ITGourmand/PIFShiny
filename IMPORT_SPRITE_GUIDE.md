# Guide d'utilisation - Onglet Import Sprite

## Vue d'ensemble
La nouvelle fonctionnalité "Import Sprite" permet aux utilisateurs de :
1. Télécharger une image PNG personnalisée
2. Sélectionner une palette de couleurs existante parmi tous les Pokémon
3. Appliquer cette palette à la tête ou au corps du sprite
4. Télécharger l'image résultante

## Comment utiliser

### Étape 1 : Accéder à la page d'import
- Sur la page d'accueil, vous verrez deux onglets : **Recherche** et **Import Sprite**
- Cliquez sur **Import Sprite** pour accéder à l'outil

### Étape 2 : Télécharger une image
- Cliquez sur le bouton **"Sélectionner une image"** 
- Sélectionnez un fichier PNG depuis votre ordinateur
- **OU** glissez-déposez simplement un fichier PNG dans la zone pointillée

### Étape 3 : Rechercher une palette
- Une fois l'image importée, une zone de recherche apparaît
- Entrez le **nom** ou le **numéro** d'un Pokémon pour trouver sa palette
- Cliquez sur un résultat pour sélectionner la palette

### Étape 4 : Appliquer la palette
- Cliquez sur **"🎨 Appliquer à la tête"** pour appliquer la palette à la zone supérieure
- Cliquez sur **"🎨 Appliquer au corps"** pour appliquer la palette à la zone inférieure
- L'aperçu s'affichera à côté de l'original

### Étape 5 : Télécharger le résultat
- Cliquez sur **"⬇️ Télécharger l'image"** pour sauvegarder l'image avec la palette appliquée

## Fonctionnalités

### Recherche intelligente
- Recherche par **numéro du Pokémon** (ex: "25" pour Pikachu)
- Recherche par **nom** (ex: "Pikachu")
- Les résultats s'affichent en temps réel

### Palette
- Les palettes utilisent le système de conversion de couleurs RGB/Hex
- Chaque Pokémon dans la base de données a sa propre palette shiny
- La palette est affichée dans le format texte pour référence

### Aperçus
- **Original** : Votre image d'origine
- **Avec palette** : L'image après application de la palette

## Conseils

- **Taille d'image recommandée** : Les sprites Pokémon standard sont 96x96 ou 160x160 pixels
- **Format** : Assurez-vous que votre image est au format PNG
- **Transparence** : La transparence sera préservée après l'application de la palette
- **Plusieurs palettes** : Vous pouvez appliquer différentes palettes successivement pour essayer plusieurs styles

## Technologie

La fonctionnalité utilise :
- Canvas HTML5 pour la manipulation d'images
- Système de correspondance de couleurs RGB pour la conversion de palette
- Les mêmes palettes que celles utilisées dans la recherche Pokémon

## Dépannage

### L'image ne se charge pas
- Vérifiez que le fichier est au format PNG
- Vérifiez que le fichier n'est pas corrompu
- Essayez avec une image plus petite

### Aucune palette trouvée
- Vérifiez l'orthographe du nom du Pokémon
- Essayez avec le numéro au lieu du nom
- Assurez-vous que le Pokémon existe dans la base de données

### L'image téléchargée est vide
- Assurez-vous d'avoir appliqué une palette avant de télécharger
- Cliquez sur l'un des boutons "Appliquer" en premier

## Améliorations futures possibles

- [ ] Appliquer des palettes à des zones spécifiques de l'image
- [ ] Support du mode "Double Shiny" pour plus d'options de couleur
- [ ] Aperçu en temps réel avec slider
- [ ] Sauvegarde des palettes favorites

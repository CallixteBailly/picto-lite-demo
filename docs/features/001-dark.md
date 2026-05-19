# 001 — Dark Mode

## Status: 📋 Prêt pour implémentation

## Branch

`feat/001-dark`

## Description

Ajouter le support du mode sombre (dark mode) à PictoLite. L'utilisateur peut basculer entre thème clair, sombre, ou suivre le thème système. Le choix est persisté via `localStorage`.

## Architecture & Plan

### Approche technique

- **CSS Custom Properties** pour toutes les couleurs (switch dynamique sans recompilation)
- **`@nuxtjs/color-mode`** (déjà dans `node_modules` via `@nuxt/ui`) pour la gestion du thème
- **Classe `html.dark`** injectée automatiquement par le module
- **Transition douce** sur `background-color`, `color`, `border-color` (0.3s ease)

### Phase 1 — Infrastructure

| Tâche | Fichier |
|---|---|
| Activer `@nuxtjs/color-mode` dans nuxt.config.ts | `nuxt.config.ts` |
| Ajouter CSS Custom Properties `:root` + `html.dark` | `app/styles/variables.scss` |
| Ajouter variables dark supplémentaires si besoin | `app/styles/variables.scss` |

### Phase 2 — Toggle UI

| Tâche | Fichier |
|---|---|
| Créer icône `sun.svg` | `app/assets/svg/sun.svg` |
| Créer icône `moon.svg` | `app/assets/svg/moon.svg` |
| Créer composant ThemeSwitcher | `app/components/ThemeSwitcher.vue` |
| Intégrer ThemeSwitcher dans le Header | `app/components/Header.vue` |
| Ajouter clés i18n | `i18n/locales/fr-FR.json` + `en-US.json` |

### Phase 3 — Migration des composants

Remplacer les `$variables SCSS` de couleur par des `var(--xxx)` dans :

| Composant | Variables à migrer | Complexité |
|---|---|---|
| `layouts/default.vue` | `$background-color`, `$primary-text-color`, scrollbar colors, shadows | 🔴 Élevée |
| `Header.vue` | `$header-background-color`, shadow | 🟡 Moyenne |
| `Footer.vue` | `$footer-background-color`, icône github | 🟢 Faible |
| `LangSwitcher.vue` | `$grey-blue-color`, `$white-color`, bg semi-transparent | 🟡 Moyenne |
| `ImageUploader.vue` | ~11 variables (drop-zone, progress, boutons, cards) | 🔴 Élevée |
| `ImagePreviewModal.vue` | ~6 variables (backdrop, modal bg, borders) | 🔴 Élevée |

### Phase 4 — Polish & Tests

| Tâche | Détail |
|---|---|
| Transitions douces | `transition: background-color 0.3s, color 0.3s, border-color 0.3s` |
| Anti-FOUC | Vérifier le script inline de `@nuxtjs/color-mode` |
| Tests ThemeSwitcher | Toggle, persistance localStorage |
| Audit visuel | Chaque composant en dark + light |

## Palette Dark

| Élément | Variable CSS | Light | Dark |
|---|---|---|---|
| Background principal | `--bg-color` | `#FFFFFF` | `#121212` |
| Texte principal | `--text-color` | `#000000` | `#E0E0E0` |
| Header/Footer bg | `--header-bg` / `--footer-bg` | `#F5F5F5` | `#1E1E1E` |
| Border cards | `--card-border` | `#CBD5E0` | `#333333` |
| Drop zone border | `--drop-zone-border` | `#4A5568` | `#666666` |
| Scrollbar track | `--scrollbar-track` | `#F1F1F1` | `#1E1E1E` |
| Scrollbar border | `--scrollbar-border` | `#CACA` | `#444444` |
| Modal bg | `--modal-bg` | `#FFFFFF` | `#1E1E1E` |
| Bouton bleu | `--blue-color` | `#3B82F6` | `#5B9CF6` |
| Bouton rouge/delete | `--red-color` | `#A00000` | `#CC3333` |

> **Note** : La palette dark est une proposition. À valider visuellement pendant l'implémentation.

## Files to Modify

```
nuxt.config.ts                              # Activer colorMode
app/styles/variables.scss                   # CSS Custom Properties + dark palette
app/styles/default.scss                     # Transitions globales
app/assets/svg/sun.svg                      # Nouveau — icône soleil
app/assets/svg/moon.svg                     # Nouveau — icône lune
app/components/ThemeSwitcher.vue            # Nouveau — toggle dark/light
app/components/Header.vue                   # Intégrer ThemeSwitcher + migrer couleurs
app/components/Footer.vue                   # Migrer couleurs
app/components/LangSwitcher.vue             # Migrer couleurs
app/components/ImageUploader.vue            # Migrer ~11 variables couleur
app/components/ImagePreviewModal.vue        # Migrer ~6 variables couleur
app/layouts/default.vue                     # Migrer scrollbar, bg, text, shadows
i18n/locales/fr-FR.json                     # Ajouter components.theme_switcher.*
i18n/locales/en-US.json                     # Ajouter components.theme_switcher.*
```

## Translation Keys (i18n)

```json
// fr-FR.json
{
  "components": {
    "theme_switcher": {
      "toggle_label": "Changer le thème",
      "light": "Clair",
      "dark": "Sombre",
      "system": "Système"
    }
  }
}

// en-US.json
{
  "components": {
    "theme_switcher": {
      "toggle_label": "Toggle theme",
      "light": "Light",
      "dark": "Dark",
      "system": "System"
    }
  }
}
```

## Changelog

- **2026-05-19 21:32 UTC** — Feature created in Brain-Storming
- **2026-05-19 22:10 UTC** — Analyse complète du codebase, plan d'implémentation détaillé, palette dark proposée — Prêt pour Feature-Dev

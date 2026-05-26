# 📊 Spec : Gauge Visuelle de Réduction

## Résumé

Chaque item de résultat affiche une barre visuelle animée (gauge) qui se remplit proportionnellement au % de réduction obtenu. Plus la gauge est remplie et verte, plus la réduction est forte.

---

## Comportement

### Calcul
```
reductionPercent = Math.round((1 - optimizedSize / originalSize) * 100)
gaugeWidth = reductionPercent  // 0 → 100%
```

### Seuils de couleur

| Réduction | Couleur de la gauge | Label CSS        |
|-----------|---------------------|------------------|
| ≥ 60%     | Vert vif `#22c55e`  | `.gauge-great`   |
| 20–59%    | Vert clair `#86efac`| `.gauge-good`    |
| 1–19%     | Orange `#f59e0b`    | `.gauge-moderate`|
| ≤ 0%      | Gris `#9ca3af`      | `.gauge-none`    |

### Animation
- **Déclenchement** : à l'apparition de l'item dans les résultats
- **Type** : remplissage de gauche → droite
- **Durée** : `0.6s ease-out`
- **Délai staggeré** : `index * 80ms` pour un effet en cascade
- **Une seule fois** : pas de re-jeu au scroll / re-render

---

## Implémentation

### Nouveau composant : `app/components/ReductionGauge.vue`

#### Props
| Prop   | Type     | Requis | Description                          |
|--------|----------|--------|--------------------------------------|
| `percent` | `number` | ✅     | Pourcentage de réduction (0–100)    |
| `delay`   | `number` | ❌     | Délai avant animation (ms), défaut `0` |

#### Template
```html
<template>
  <div class="reduction-gauge">
    <div class="reduction-gauge-label">
      -{{ percent }}%
    </div>
    <div class="reduction-gauge-track">
      <div
        class="reduction-gauge-fill"
        :class="gaugeClass"
        :style="{ width: animatedWidth, transitionDelay: `${delay}ms` }"
      />
    </div>
  </div>
</template>
```

#### Script (logique)
```ts
const props = withDefaults(defineProps<{
  percent: number
  delay?: number
}>(), { delay: 0 })

const gaugeClass = computed(() => {
  if (props.percent >= 60) return 'gauge-great'
  if (props.percent >= 20) return 'gauge-good'
  if (props.percent > 0) return 'gauge-moderate'
  return 'gauge-none'
})

// Animated fill: starts at 0, grows to final width on mount
const animatedWidth = ref('0%')
onMounted(() => {
  requestAnimationFrame(() => {
    animatedWidth.value = `${props.percent}%`
  })
})
```

#### Styles (SCSS)
```scss
.reduction-gauge {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reduction-gauge-label {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
  color: var(--gauge-text-color, #374151);
}

.reduction-gauge-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.reduction-gauge-fill {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  transition: width 0.6s ease-out;

  &.gauge-great   { background: #22c55e; }
  &.gauge-good    { background: #86efac; }
  &.gauge-moderate { background: #f59e0b; }
  &.gauge-none    { background: #9ca3af; }
}
```

---

### Intégration dans `ImageUploader.vue`

#### Emplacement
Sous `.item-size`, à l'intérieur de `.item-details` :

```html
<div class="item-details">
  <div class="item-name">{{ item.name }}</div>
  <div :class="['item-size', reductionClass(item)]">
    {{ formatImageReductionWording(item) }}
  </div>

  <!-- ✨ NOUVEAU : Gauge visuelle -->
  <ReductionGauge
    v-if="item.success"
    :percent="reductionPercent(item)"
    :delay="idx * 80"
  />
</div>
```

#### Import automatique
Nuxt auto-importe les composants de `app/components/` — aucun import manuel nécessaire.

---

## Critères d'acceptance

- [ ] La gauge s'affiche sur chaque résultat réussi
- [ ] La largeur correspond au % de réduction
- [ ] La couleur change selon les seuils définis (≥60%, 20-59%, 1-19%, ≤0%)
- [ ] L'animation se déclenche à l'apparition avec un effet cascade
- [ ] Les résultats en erreur n'affichent pas la gauge (`v-if="item.success"`)
- [ ] Responsive : la gauge s'adapte à la largeur du conteneur
- [ ] Pas de régression visuelle sur les items existants

---

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `app/components/ReductionGauge.vue` | **Créer** — Nouveau composant |
| `app/components/ImageUploader.vue` | **Modifier** — Intégration de `<ReductionGauge>` |

---

## Notes

- Le label texte `-XX%` est intégré à gauche de la gauge (pas besoin de le dupliquer ailleurs).
- L'animation utilise `requestAnimationFrame` pour garantir que le navigateur a render la largeur `0%` avant de la transitionner vers la valeur finale.
- La gauge utilise `flex: 1` pour toujours occuper l'espace disponible — responsive par design.

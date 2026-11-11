<script setup lang="ts">
import type { CatalogItem } from '../types/catalog'

defineProps<{ item: CatalogItem }>()
</script>

<template>
  <section class="media-credits" aria-labelledby="credits-heading">
    <h2 id="credits-heading">Elenco e equipe</h2>
    <dl class="credits-list">
      <div>
        <dt>Elenco</dt>
        <dd>{{ item.cast?.join(', ') || 'Não informado no catálogo' }}</dd>
      </div>
      <div>
        <dt>Direção</dt>
        <dd>{{ item.director || 'Não informada no catálogo' }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.media-credits {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.media-credits h2 {
  margin: 0 0 18px;
  color: #f5f7ff;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
}

.credits-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 32px;
  margin: 0;
}

.credits-list dt {
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.credits-list dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
}

@media (max-width: 575.98px) {
  .credits-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

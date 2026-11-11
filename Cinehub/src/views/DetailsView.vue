<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import MediaCredits from '../components/MediaCredits.vue'
import MediaDetailHero from '../components/MediaDetailHero.vue'
import { useGoBack } from '../composables/useGoBack'
import { useMediaDetails } from '../composables/useMediaDetails'
import type { CatalogItemType } from '../types/catalog'

const props = defineProps<{
  id: string
  type: CatalogItemType
}>()

const { item, isLoading, errorMessage, retry } = useMediaDetails(
  () => props.id,
  () => props.type,
)
const goBack = useGoBack({ name: props.type === 'movie' ? 'movies' : 'series' })
</script>

<template>
  <section class="details-view">
    <button class="back-button" type="button" @click="goBack">
      <span aria-hidden="true">←</span> Voltar
    </button>

    <div v-if="isLoading" class="details-state" role="status" aria-live="polite">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>Carregando detalhes...</p>
      <div class="loading-placeholder" aria-hidden="true"></div>
    </div>

    <section v-else-if="errorMessage" class="details-state details-error" role="alert">
      <p class="page-eyebrow">Não foi possível carregar</p>
      <h1>Ocorreu um erro</h1>
      <p>{{ errorMessage }}</p>
      <button class="retry-button" type="button" @click="retry">Tentar novamente</button>
    </section>

    <section v-else-if="!item" class="details-state details-not-found" role="status">
      <p class="page-eyebrow">Conteúdo indisponível</p>
      <h1>Não encontramos este título</h1>
      <p>Confira o endereço ou volte ao catálogo para escolher outro conteúdo.</p>
      <RouterLink :to="type === 'movie' ? '/filmes' : '/series'" class="catalog-link">
        Voltar ao catálogo
      </RouterLink>
    </section>

    <template v-else>
      <MediaDetailHero :item="item" />
      <div class="details-lower">
        <MediaCredits :item="item" />
        <CatalogSection
          :items="item.relatedItems"
          title="Títulos relacionados"
          empty-message="O TMDB não retornou títulos relacionados."
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.details-view {
  min-height: 55vh;
}

.back-button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 15, 18, 0.68);
  color: rgba(255, 255, 255, 0.88);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.back-button:hover {
  border-color: rgba(240, 68, 82, 0.56);
  background: rgba(240, 68, 82, 0.14);
}

.details-state {
  display: flex;
  min-height: 50vh;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.details-state h1 {
  margin: 0;
  color: #f5f7ff;
  font-size: clamp(2rem, 5vw, 3.2rem);
  letter-spacing: -0.05em;
}

.details-state p:not(.page-eyebrow) {
  max-width: 560px;
  color: rgba(255, 255, 255, 0.68);
}

.loading-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: details-spin 0.8s linear infinite;
}

.loading-placeholder {
  width: min(440px, 85%);
  height: 140px;
  margin-top: 12px;
  border-radius: 18px;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0.04) 20%, rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0.04) 60%);
  background-size: 200% 100%;
  animation: details-shimmer 1.5s ease infinite;
}

.retry-button,
.catalog-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  padding: 10px 18px;
  border: 0;
  border-radius: 999px;
  background: var(--accent-red);
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.details-lower {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 clamp(4px, 2vw, 24px) 24px;
}

@keyframes details-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes details-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-button {
    transition: none;
  }

  .loading-spinner,
  .loading-placeholder {
    animation-duration: 3s;
  }
}
</style>

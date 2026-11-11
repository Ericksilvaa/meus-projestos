<script setup lang="ts">
import { computed } from 'vue'
import CatalogSection from '../components/CatalogSection.vue'
import AiringSeriesSection from '../components/AiringSeriesSection.vue'
import FeaturedHero from '../components/FeaturedHero.vue'
import { useCatalog } from '../composables/useCatalog'

const trending = useCatalog('movie', 'trending')
const nowPlaying = useCatalog('movie', 'now_playing')
const popularSeries = useCatalog('series', 'popular')
const airingSeries = useCatalog('series', 'on_the_air')
const featured = computed(() => trending.items.value[0])
</script>

<template>
  <div class="content">
    <FeaturedHero v-if="featured" :item="featured" />
    <section v-else-if="trending.isLoading.value" class="featured-loading" role="status">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Buscando títulos em tendência...</span>
    </section>
    <p v-else-if="trending.errorMessage.value" class="home-error" role="alert">
      {{ trending.errorMessage.value }}
      <button class="btn btn-outline-light" type="button" @click="trending.retry">Tentar novamente</button>
    </p>
    <CatalogSection
      :items="trending.items.value"
      title="Em tendência"
      empty-message="Nenhum filme em tendência foi encontrado."
      :is-loading="trending.isLoading.value"
      :error-message="trending.errorMessage.value"
      @retry="trending.retry"
    />
    <CatalogSection
      :items="nowPlaying.items.value"
      title="Em cartaz"
      empty-message="Nenhum filme em cartaz foi encontrado."
      :is-loading="nowPlaying.isLoading.value"
      :error-message="nowPlaying.errorMessage.value"
      @retry="nowPlaying.retry"
    />
    <CatalogSection
      :items="popularSeries.items.value"
      title="Séries populares"
      empty-message="Nenhuma série popular foi encontrada."
      :is-loading="popularSeries.isLoading.value"
      :error-message="popularSeries.errorMessage.value"
      @retry="popularSeries.retry"
    />
    <AiringSeriesSection
      :items="airingSeries.items.value"
      :is-loading="airingSeries.isLoading.value"
      :error-message="airingSeries.errorMessage.value"
      @retry="airingSeries.retry"
    />
  </div>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 42px;
}

.featured-loading,
.home-error {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.loading-spinner {
  width: 26px;
  height: 26px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: home-spin 0.8s linear infinite;
}

@keyframes home-spin {
  to { transform: rotate(360deg); }
}
</style>

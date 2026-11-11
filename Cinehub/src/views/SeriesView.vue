<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import PageHeading from '../components/PageHeading.vue'
import { useCatalog } from '../composables/useCatalog'

const popular = useCatalog('series', 'popular', true)
const topRated = useCatalog('series', 'top_rated', true)
const trending = useCatalog('series', 'trending', true)
const onTheAir = useCatalog('series', 'on_the_air', true)
</script>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Maratone suas favoritas"
      title="Séries"
      description="Novos mundos e personagens esperando por você."
    />
    <CatalogSection :items="popular.items.value" title="Séries populares"
      empty-message="Nenhuma série popular foi encontrada." :is-loading="popular.isLoading.value"
      :error-message="popular.errorMessage.value" :page="popular.page.value"
      :page-count="popular.totalPages.value" @retry="popular.retry" @page-change="popular.setPage" />
    <CatalogSection :items="topRated.items.value" title="Mais bem avaliadas"
      empty-message="Nenhuma série bem avaliada foi encontrada." :is-loading="topRated.isLoading.value"
      :error-message="topRated.errorMessage.value" :page="topRated.page.value"
      :page-count="topRated.totalPages.value" @retry="topRated.retry" @page-change="topRated.setPage" />
    <CatalogSection :items="trending.items.value" title="Em tendência"
      empty-message="Nenhuma série em tendência foi encontrada." :is-loading="trending.isLoading.value"
      :error-message="trending.errorMessage.value" :page="trending.page.value"
      :page-count="trending.totalPages.value" @retry="trending.retry" @page-change="trending.setPage" />
    <CatalogSection :items="onTheAir.items.value" title="Em exibição"
      empty-message="Nenhuma série em exibição foi encontrada." :is-loading="onTheAir.isLoading.value"
      :error-message="onTheAir.errorMessage.value" :page="onTheAir.page.value"
      :page-count="onTheAir.totalPages.value" @retry="onTheAir.retry" @page-change="onTheAir.setPage" />
  </section>
</template>

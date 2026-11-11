<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import PageHeading from '../components/PageHeading.vue'
import { useCatalog } from '../composables/useCatalog'

const popular = useCatalog('movie', 'popular', true)
const nowPlaying = useCatalog('movie', 'now_playing', true)
const upcoming = useCatalog('movie', 'upcoming', true)
const topRated = useCatalog('movie', 'top_rated', true)
const trending = useCatalog('movie', 'trending', true)
</script>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Explore o catálogo"
      title="Filmes"
      description="Histórias para assistir do começo ao fim."
    />
    <CatalogSection :items="popular.items.value" title="Filmes populares"
      empty-message="Nenhum filme popular foi encontrado." :is-loading="popular.isLoading.value"
      :error-message="popular.errorMessage.value" :page="popular.page.value"
      :page-count="popular.totalPages.value" @retry="popular.retry" @page-change="popular.setPage" />
    <CatalogSection :items="nowPlaying.items.value" title="Em cartaz"
      empty-message="Nenhum filme em cartaz foi encontrado." :is-loading="nowPlaying.isLoading.value"
      :error-message="nowPlaying.errorMessage.value" :page="nowPlaying.page.value"
      :page-count="nowPlaying.totalPages.value" @retry="nowPlaying.retry" @page-change="nowPlaying.setPage" />
    <CatalogSection :items="upcoming.items.value" title="Próximos lançamentos"
      empty-message="Nenhum próximo lançamento foi encontrado." :is-loading="upcoming.isLoading.value"
      :error-message="upcoming.errorMessage.value" :page="upcoming.page.value"
      :page-count="upcoming.totalPages.value" @retry="upcoming.retry" @page-change="upcoming.setPage" />
    <CatalogSection :items="topRated.items.value" title="Mais bem avaliados"
      empty-message="Nenhum filme bem avaliado foi encontrado." :is-loading="topRated.isLoading.value"
      :error-message="topRated.errorMessage.value" :page="topRated.page.value"
      :page-count="topRated.totalPages.value" @retry="topRated.retry" @page-change="topRated.setPage" />
    <CatalogSection :items="trending.items.value" title="Em tendência"
      empty-message="Nenhum filme em tendência foi encontrado." :is-loading="trending.isLoading.value"
      :error-message="trending.errorMessage.value" :page="trending.page.value"
      :page-count="trending.totalPages.value" @retry="trending.retry" @page-change="trending.setPage" />
  </section>
</template>

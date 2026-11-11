<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import PageHeading from '../components/PageHeading.vue'
import { useFavoriteItems } from '../composables/useFavoriteItems'

const { items, isLoading, errorMessage, retry } = useFavoriteItems()
</script>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Sua coleção pessoal"
      title="Favoritos"
      description="Os títulos que você guardou para assistir depois."
    />
    <CatalogSection
      :items="items"
      title="Minha lista"
      empty-message="Sua lista está vazia. Adicione favoritos pelos cards do catálogo."
      :is-loading="isLoading"
      :error-message="errorMessage"
      @retry="retry"
    />
  </section>
</template>

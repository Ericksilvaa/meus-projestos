<script setup lang="ts">
import type { CatalogItem } from '../types/catalog'
import CatalogSection from './CatalogSection.vue'

defineProps<{
  items: CatalogItem[]
  isLoading: boolean
  errorMessage: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <CatalogSection
    :items="items"
    title="Séries em exibição"
    empty-message="Nenhuma série em exibição foi encontrada."
    :is-loading="isLoading"
    :error-message="errorMessage"
    @retry="emit('retry')"
  />
</template>

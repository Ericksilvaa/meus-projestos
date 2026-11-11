<script setup lang="ts">
import type { CatalogItem } from '../types/catalog'
import CatalogCard from './CatalogCard.vue'

withDefaults(defineProps<{
  items: CatalogItem[]
  title?: string
  emptyMessage?: string
  isLoading?: boolean
  errorMessage?: string
  page?: number
  pageCount?: number
}>(), {
  title: 'Para você',
  emptyMessage: 'Nenhum título encontrado.',
  isLoading: false,
  errorMessage: '',
  page: 1,
  pageCount: 1,
})

const emit = defineEmits<{
  retry: []
  pageChange: [page: number]
}>()

</script>

<template>
  <section class="row-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <RouterLink to="/filmes">Explorar</RouterLink>
    </div>

    <div v-if="isLoading" class="catalog-state" role="status" aria-live="polite">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Carregando títulos...</span>
    </div>
    <div v-else-if="errorMessage" class="catalog-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button class="btn btn-outline-light" type="button" @click="emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="items.length" class="row g-3 g-lg-4">
      <CatalogCard v-for="item in items" :key="item.id" :item="item" />
    </div>
    <p v-else class="empty-state text-center mb-0" role="status">
      {{ emptyMessage }}
    </p>

    <nav v-if="!isLoading && !errorMessage && pageCount > 1" class="catalog-pagination" :aria-label="`Paginação: ${title}`">
      <button class="btn btn-outline-light" type="button" :disabled="page <= 1" @click="emit('pageChange', page - 1)">
        Anterior
      </button>
      <span aria-live="polite">Página {{ page }} de {{ pageCount }}</span>
      <button class="btn btn-outline-light" type="button" :disabled="page >= pageCount" @click="emit('pageChange', page + 1)">
        Próxima
      </button>
    </nav>
  </section>
</template>

<style scoped>
.row-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  color: #f5f7ff;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  letter-spacing: -0.04em;
}

.section-header a {
  color: #ff8b8b;
  text-decoration: none;
  font-weight: 600;
}

.empty-state {
  padding: 28px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.68);
}

.catalog-state,
.catalog-pagination {
  display: flex;
  min-height: 120px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.catalog-state p {
  margin: 0;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: catalog-spin 0.8s linear infinite;
}

.catalog-pagination {
  min-height: auto;
  margin-top: 8px;
}

.catalog-pagination button:disabled {
  opacity: 0.45;
}

@keyframes catalog-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation-duration: 3s;
  }
}
</style>

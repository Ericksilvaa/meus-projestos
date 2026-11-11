<script setup lang="ts">
import CatalogSection from '../components/CatalogSection.vue'
import PageHeading from '../components/PageHeading.vue'
import { useSearchResults } from '../composables/useSearchResults'

const {
  query,
  filters,
  filteredItems,
  pageItems,
  currentPage,
  pageCount,
  totalResults,
  isLoading,
  errorMessage,
  retry,
  setFilter,
  setPage,
} = useSearchResults()
</script>

<template>
  <section class="search-results-page catalog-page">
    <PageHeading
      eyebrow="Encontre sua próxima sessão"
      title="Buscar"
      :description="query ? `Resultados para “${query}” no TMDB.` : 'Explore filmes e séries do TMDB.'"
    />

    <form class="search-filters" aria-label="Filtros de busca" @submit.prevent>
      <label>
        <span>Tipo</span>
        <select
          class="form-select"
          :value="filters.selectedType.value"
          @change="setFilter('tipo', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Filmes e séries</option>
          <option value="movie">Filmes</option>
          <option value="series">Séries</option>
        </select>
      </label>

      <label>
        <span>Gênero</span>
        <select
          class="form-select"
          :value="filters.selectedGenre.value"
          @change="setFilter('genero', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todos os gêneros</option>
          <option v-for="genre in filters.genres.value" :key="genre.name" :value="genre.name">
            {{ genre.name }}
          </option>
        </select>
      </label>

      <label>
        <span>Ano</span>
        <select
          class="form-select"
          :value="filters.selectedYear.value"
          @change="setFilter('ano', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todos os anos</option>
          <option v-for="year in filters.years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </label>

      <label>
        <span>Avaliação mínima</span>
        <select
          class="form-select"
          :value="filters.selectedRating.value"
          @change="setFilter('nota', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Qualquer avaliação</option>
          <option v-for="rating in filters.ratingOptions" :key="rating" :value="rating">
            {{ rating }}+ / 10
          </option>
        </select>
      </label>
    </form>

    <div v-if="isLoading" class="search-loading" role="status" aria-live="polite">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Buscando filmes e séries no TMDB...</span>
    </div>
    <div v-else-if="errorMessage" class="search-loading search-error" role="alert">
      <p>{{ errorMessage }}</p>
      <button class="btn btn-outline-light" type="button" @click="retry">Tentar novamente</button>
    </div>
    <template v-else>
      <CatalogSection
        :items="pageItems"
        :title="`${totalResults} resultado${totalResults === 1 ? '' : 's'}`"
        :empty-message="query ? 'Nenhum título encontrado. Tente ajustar os filtros ou o termo pesquisado.' : 'Nenhum título corresponde aos filtros selecionados.'"
      />

      <nav v-if="pageCount > 1" class="pagination-nav" aria-label="Paginação dos resultados">
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
        >
          Anterior
        </button>
        <span aria-live="polite">Página {{ currentPage }} de {{ pageCount }}</span>
        <button
          type="button"
          :disabled="currentPage === pageCount"
          @click="setPage(currentPage + 1)"
        >
          Próxima
        </button>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.search-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
}

.search-filters label {
  display: grid;
  gap: 7px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.82rem;
}

.search-filters select {
  width: 100%;
  min-width: 0;
  padding: 10px 34px 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background-color: #19191e;
  color: #fff;
}

.search-filters select:focus-visible,
.pagination-nav button:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}

.search-loading {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.search-error p {
  margin: 0;
  text-align: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: search-spin 0.8s linear infinite;
}

.pagination-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 4px 0 12px;
  color: rgba(255, 255, 255, 0.75);
}

.pagination-nav button {
  padding: 9px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.pagination-nav button:not(:disabled):hover {
  border-color: var(--accent-red);
  background: rgba(229, 9, 20, 0.16);
}

.pagination-nav button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

@keyframes search-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .search-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .search-filters {
    grid-template-columns: minmax(0, 1fr);
  }

  .pagination-nav {
    gap: 10px;
    font-size: 0.85rem;
  }

  .pagination-nav button {
    padding: 8px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation-duration: 3s;
  }
}
</style>

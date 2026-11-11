<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchHistory } from '../composables/useSearchHistory'
import { searchSuggestions } from '../services/tmdb'
import type { CatalogItem } from '../types/catalog'
import { useImageFallback } from '../utils/imageFallback'

const route = useRoute()
const router = useRouter()
const { searches, initialize, addSearch, clearHistory } = useSearchHistory()
const searchTerm = ref(typeof route.query.q === 'string' ? route.query.q : '')
const isOpen = ref(false)
const suggestions = ref<CatalogItem[]>([])
const isSuggesting = ref(false)
const suggestionError = ref('')
let queryDebounceTimer: ReturnType<typeof setTimeout> | undefined
let suggestionDebounceTimer: ReturnType<typeof setTimeout> | undefined
let suggestionController: AbortController | undefined

const showSuggestions = () => isOpen.value && Boolean(searchTerm.value.trim())

async function updateQuery(value: string): Promise<void> {
  const query = { ...route.query }
  if (value.trim()) query.q = value.trim()
  else delete query.q
  delete query.pagina
  await router.replace({ name: 'search', query })
}

function submitSearch(term = searchTerm.value): void {
  searchTerm.value = term.trim()
  if (queryDebounceTimer) clearTimeout(queryDebounceTimer)
  if (suggestionDebounceTimer) clearTimeout(suggestionDebounceTimer)
  suggestionController?.abort()
  addSearch(searchTerm.value)
  isOpen.value = false
  const query = route.name === 'search' ? { ...route.query } : {}
  if (searchTerm.value) query.q = searchTerm.value
  else delete query.q
  delete query.pagina
  void router.push({ name: 'search', query })
}

async function loadSuggestions(query: string): Promise<void> {
  suggestionController?.abort()
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) {
    suggestions.value = []
    suggestionError.value = ''
    isSuggesting.value = false
    return
  }

  const controller = new AbortController()
  suggestionController = controller
  isSuggesting.value = true
  suggestionError.value = ''
  try {
    suggestions.value = await searchSuggestions(normalizedQuery, controller.signal)
  } catch (error) {
    if (controller.signal.aborted) return
    suggestionError.value = error instanceof Error ? error.message : 'Não foi possível carregar sugestões.'
    suggestions.value = []
  } finally {
    if (!controller.signal.aborted) isSuggesting.value = false
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') isOpen.value = false
}

watch(searchTerm, (value) => {
  if (queryDebounceTimer) clearTimeout(queryDebounceTimer)
  if (suggestionDebounceTimer) clearTimeout(suggestionDebounceTimer)
  if (route.name === 'search' && value.trim() !== (typeof route.query.q === 'string' ? route.query.q : '')) {
    queryDebounceTimer = setTimeout(() => void updateQuery(value), 350)
  }
  suggestionDebounceTimer = setTimeout(() => void loadSuggestions(value), 300)
})

watch(
  () => route.query.q,
  (value) => {
    searchTerm.value = typeof value === 'string' ? value : ''
  },
)

onMounted(() => {
  initialize()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (queryDebounceTimer) clearTimeout(queryDebounceTimer)
  if (suggestionDebounceTimer) clearTimeout(suggestionDebounceTimer)
  suggestionController?.abort()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="search-control">
    <form class="search-form" role="search" @submit.prevent="submitSearch()">
      <label class="visually-hidden" for="movie-search">Buscar filmes e séries</label>
      <input
        id="movie-search"
        v-model="searchTerm"
        class="form-control search-input"
        type="search"
        placeholder="Buscar títulos..."
        autocomplete="off"
        aria-controls="search-suggestions"
        :aria-expanded="showSuggestions()"
        @focus="isOpen = true"
      >
      <button class="btn search-button" type="submit" aria-label="Ver resultados da busca">⌕</button>
    </form>

    <div v-if="showSuggestions()" id="search-suggestions" class="suggestion-panel" role="listbox">
      <p v-if="isSuggesting" class="suggestion-empty" role="status">Buscando sugestões...</p>
      <p v-else-if="suggestionError" class="suggestion-empty" role="alert">{{ suggestionError }}</p>
      <template v-if="suggestions.length">
        <p class="suggestion-heading">Sugestões</p>
        <button
          v-for="item in suggestions"
          :key="item.id"
          class="suggestion-item"
          type="button"
          role="option"
          @click="submitSearch(item.title)"
        >
          <img :src="item.poster" alt="" width="38" height="50" loading="lazy" decoding="async" @error="useImageFallback">
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.type === 'movie' ? 'Filme' : 'Série' }} · {{ item.releaseYear ?? 'Ano não informado' }}</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </template>
      <p v-else class="suggestion-empty">Nenhuma sugestão encontrada.</p>
      <button class="all-results-link" type="button" @click="submitSearch()">
        Ver todos os resultados
      </button>
    </div>

    <div v-else-if="isOpen && searches.length" class="suggestion-panel history-panel">
      <div class="suggestion-heading">
        <span>Buscas recentes</span>
        <button type="button" @click="clearHistory">Limpar</button>
      </div>
      <button
        v-for="search in searches"
        :key="search"
        class="history-item"
        type="button"
        @click="submitSearch(search)"
      >
        <span aria-hidden="true">◷</span>{{ search }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-control {
  position: relative;
  min-width: 0;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 2px 3px 2px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.search-form:focus-within {
  border-color: rgba(240, 68, 82, 0.6);
  background: rgba(255, 255, 255, 0.08);
}

.search-input {
  width: clamp(110px, 13vw, 176px);
  padding: 7px 2px;
  border: 0;
  background: transparent;
  color: #fff;
  box-shadow: none !important;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
}

.search-button:hover {
  background: rgba(240, 68, 82, 0.2);
  color: #fff;
}

.suggestion-panel {
  position: absolute;
  z-index: 40;
  top: calc(100% + 10px);
  right: 0;
  width: min(390px, 90vw);
  max-height: min(70vh, 480px);
  overflow: auto;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: #19191e;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.48);
}

.suggestion-heading {
  display: flex;
  justify-content: space-between;
  margin: 4px 8px 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.suggestion-heading button,
.suggestion-item,
.history-item {
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.suggestion-heading button {
  color: var(--accent-cyan);
  font: inherit;
  font-size: 0.72rem;
}

.suggestion-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 9px;
  border-radius: 10px;
  text-align: left;
}

.suggestion-item:hover,
.history-item:hover {
  background: rgba(255, 255, 255, 0.07);
}

.suggestion-item img {
  width: 38px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.suggestion-item > span:nth-child(2) {
  display: grid;
  flex: 1;
  gap: 3px;
  min-width: 0;
}

.suggestion-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-item small {
  color: rgba(255, 255, 255, 0.56);
}

.suggestion-empty {
  margin: 12px 8px;
  color: rgba(255, 255, 255, 0.62);
}

.all-results-link {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 11px 9px 5px;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: var(--accent-cyan);
  font-size: 0.9rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.history-item {
  display: flex;
  width: 100%;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 9px;
  text-align: left;
}

@media (max-width: 575.98px) {
  .search-form {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }
}
</style>

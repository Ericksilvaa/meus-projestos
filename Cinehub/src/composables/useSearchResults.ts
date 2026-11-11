import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CatalogGenre, CatalogItem, SearchFilters } from '../types/catalog'
import { getGenres, searchCatalog } from '../services/tmdb'

const ratingOptions = [5, 7, 8, 9]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index))

function queryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function useSearchResults() {
  const route = useRoute()
  const router = useRouter()
  const items = ref<CatalogItem[]>([])
  const totalResults = ref(0)
  const totalPages = ref(1)
  const genres = ref<CatalogGenre[]>([])
  const isLoading = ref(true)
  const errorMessage = ref('')
  let controller: AbortController | undefined
  let requestId = 0

  const query = computed(() => queryValue(route.query.q))
  const selectedType = computed(() => {
    const type = queryValue(route.query.tipo)
    return type === 'movie' || type === 'series' ? type : ''
  })
  const selectedGenre = computed(() => queryValue(route.query.genero))
  const selectedYear = computed(() => queryValue(route.query.ano))
  const selectedRating = computed(() => queryValue(route.query.nota))
  const requestedPage = computed(() => Math.max(1, Number(queryValue(route.query.pagina)) || 1))
  const currentPage = computed(() => Math.min(requestedPage.value, totalPages.value))
  const filteredItems = computed(() => items.value)

  async function load(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    const signal = controller.signal
    const currentRequest = ++requestId
    const filters: SearchFilters = {
      query: query.value,
      type: selectedType.value,
      genre: selectedGenre.value,
      year: selectedYear.value,
      rating: selectedRating.value,
      page: requestedPage.value,
    }

    isLoading.value = true
    errorMessage.value = ''
    try {
      const [result, availableGenres] = await Promise.all([
        searchCatalog(filters, signal),
        getGenres(signal),
      ])
      if (currentRequest !== requestId) return
      items.value = result.items
      totalResults.value = result.totalResults
      totalPages.value = result.totalPages
      genres.value = availableGenres
    } catch (error) {
      if (
        currentRequest !== requestId ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) return
      errorMessage.value = error instanceof Error
        ? error.message
        : 'Não foi possível carregar os resultados da busca.'
      items.value = []
      totalResults.value = 0
      totalPages.value = 1
    } finally {
      if (currentRequest === requestId) isLoading.value = false
    }
  }

  async function setFilter(key: string, value: string): Promise<void> {
    const nextQuery = { ...route.query }
    if (value) nextQuery[key] = value
    else delete nextQuery[key]
    delete nextQuery.pagina
    await router.replace({ name: 'search', query: nextQuery })
  }

  async function setPage(page: number): Promise<void> {
    await router.replace({
      name: 'search',
      query: { ...route.query, pagina: page > 1 ? String(page) : undefined },
    })
  }

  watch(() => route.query, () => void load(), { deep: true, immediate: true })
  onBeforeUnmount(() => controller?.abort())

  return {
    query,
    filters: {
      selectedType,
      selectedGenre,
      selectedYear,
      selectedRating,
      genres,
      years,
      ratingOptions,
    },
    filteredItems,
    pageItems: filteredItems,
    totalResults,
    currentPage,
    pageCount: totalPages,
    isLoading,
    errorMessage,
    retry: load,
    setFilter,
    setPage,
  }
}

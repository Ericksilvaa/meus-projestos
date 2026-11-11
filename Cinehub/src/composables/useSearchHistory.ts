import { ref } from 'vue'

const storageKey = 'cinehub-search-history'
const maxHistoryItems = 8
const searches = ref<string[]>([])
let initialized = false

function persist(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(searches.value))
  } catch (error) {
    console.warn('Não foi possível salvar o histórico de buscas.', error)
  }
}

export function useSearchHistory() {
  function initialize(): void {
    if (initialized || typeof window === 'undefined') return

    initialized = true
    try {
      const saved = window.localStorage.getItem(storageKey)
      const parsed: unknown = saved ? JSON.parse(saved) : []
      searches.value = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string').slice(0, maxHistoryItems)
        : []
    } catch (error) {
      console.warn('Não foi possível carregar o histórico de buscas.', error)
      searches.value = []
    }
  }

  function addSearch(term: string): void {
    const normalizedTerm = term.trim()
    if (!normalizedTerm) return

    searches.value = [
      normalizedTerm,
      ...searches.value.filter((search) => search.toLocaleLowerCase('pt-BR') !== normalizedTerm.toLocaleLowerCase('pt-BR')),
    ].slice(0, maxHistoryItems)
    persist()
  }

  function clearHistory(): void {
    searches.value = []
    persist()
  }

  return { searches, initialize, addSearch, clearHistory }
}

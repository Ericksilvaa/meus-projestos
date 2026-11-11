import { onBeforeUnmount, ref, watch } from 'vue'
import type { CatalogItem, CatalogItemType } from '../types/catalog'
import { getCatalogItem } from '../services/catalogService'
import { useFavoritesStore } from '../stores/favorites'

export function useFavoriteItems() {
  const favorites = useFavoritesStore()
  const items = ref<CatalogItem[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  let controller: AbortController | undefined
  let requestId = 0

  async function load(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    const currentRequest = ++requestId
    const entries = favorites.favoriteIds.flatMap((id) => {
      const match = /^(movie|series):(\d+)$/.exec(id)
      if (!match?.[2]) return []
      return [{ id: match[2], type: match[1] as CatalogItemType }]
    })

    isLoading.value = entries.length > 0
    errorMessage.value = ''
    if (!entries.length) {
      items.value = []
      return
    }

    const signal = controller.signal
    const results = await Promise.allSettled(
      entries.map(({ id, type }) => getCatalogItem(id, type, signal)),
    )
    if (currentRequest !== requestId) return

    items.value = results.flatMap((result) =>
      result.status === 'fulfilled' && result.value ? [result.value] : [],
    )
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (failure) {
      errorMessage.value = failure.reason instanceof Error
        ? failure.reason.message
        : 'Não foi possível carregar alguns títulos favoritos.'
    }
    isLoading.value = false
  }

  watch(() => favorites.favoriteIds.slice(), () => void load(), { immediate: true })
  onBeforeUnmount(() => controller?.abort())

  return { items, isLoading, errorMessage, retry: load }
}

import { onBeforeUnmount, ref, watch } from 'vue'
import type { CatalogItem, CatalogItemType } from '../types/catalog'
import { loadCatalogItem } from '../services/catalogService'

export function useMediaDetails(id: () => string, type: () => CatalogItemType) {
  const item = ref<CatalogItem>()
  const isLoading = ref(true)
  const errorMessage = ref('')
  let controller: AbortController | undefined
  let requestId = 0

  async function load(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    const currentRequestId = ++requestId
    isLoading.value = true
    errorMessage.value = ''
    item.value = undefined

    try {
      const result = await loadCatalogItem(id(), type(), controller.signal)
      if (currentRequestId === requestId) {
        item.value = result
        if (result && typeof document !== 'undefined') {
          document.title = `${result.title} | CineHub`
          setMeta('description', result.description || `Detalhes de ${result.title} no CineHub.`)
          setMeta('og:title', document.title, 'property')
          setMeta('og:description', result.description || `Detalhes de ${result.title} no CineHub.`, 'property')
          setMeta('og:image', result.backdrop, 'property')
        }
      }
    } catch (error) {
      if (currentRequestId !== requestId) return
      if (error instanceof DOMException && error.name === 'AbortError') return
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar os detalhes.'
    } finally {
      if (currentRequestId === requestId) isLoading.value = false
    }
  }

  watch([id, type], () => void load(), { immediate: true })
  onBeforeUnmount(() => controller?.abort())

  return { item, isLoading, errorMessage, retry: load }
}

function setMeta(name: string, content: string, attribute = 'name'): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.append(element)
  }
  element.content = content
}

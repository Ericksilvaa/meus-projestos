import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useNotifications } from '../composables/useNotifications'

const storageKey = 'cinehub-favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref<string[]>(loadFavoriteIds())
  const { notify } = useNotifications()
  let syncingFromStorage = false

  watch(
    favoriteIds,
    (ids) => {
      if (syncingFromStorage || typeof window === 'undefined') return

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(ids))
      } catch (error) {
        console.error('Não foi possível salvar os favoritos no armazenamento local.', error)
        notify('Não foi possível salvar seus favoritos neste dispositivo.', 'info')
      }
    },
    { deep: true, flush: 'sync' },
  )

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return

      syncingFromStorage = true
      favoriteIds.value = parseFavoriteIds(event.newValue)
      syncingFromStorage = false
      notify('Sua lista de favoritos foi atualizada em outra aba.', 'info')
    })
  }

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function addFavorite(id: string): void {
    if (isFavorite(id)) return

    favoriteIds.value = [...favoriteIds.value, id]
    notify('Adicionado aos favoritos.')
  }

  function removeFavorite(id: string): void {
    if (!isFavorite(id)) return

    favoriteIds.value = favoriteIds.value.filter((favoriteId) => favoriteId !== id)
    notify('Removido dos favoritos.', 'info')
  }

  function toggleFavorite(id: string): void {
    if (isFavorite(id)) removeFavorite(id)
    else addFavorite(id)
  }

  return { favoriteIds, isFavorite, addFavorite, removeFavorite, toggleFavorite }
})

function loadFavoriteIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    return parseFavoriteIds(window.localStorage.getItem(storageKey))
  } catch (error) {
    console.error('Não foi possível carregar os favoritos do armazenamento local.', error)
    return []
  }
}

function parseFavoriteIds(serializedIds: string | null): string[] {
  if (!serializedIds) return []

  try {
    const parsed: unknown = JSON.parse(serializedIds)
    if (!Array.isArray(parsed)) {
      console.warn('O formato salvo dos favoritos é inválido; a lista será iniciada vazia.')
      return []
    }

    return [...new Set(parsed.filter((id): id is string => typeof id === 'string'))]
  } catch (error) {
    console.error('Não foi possível interpretar os favoritos salvos.', error)
    return []
  }
}

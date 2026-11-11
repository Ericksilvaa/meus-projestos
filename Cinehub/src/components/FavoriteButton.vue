<script setup lang="ts">
import { useFavoritesStore } from '../stores/favorites'

defineProps<{ itemId: string }>()

const favorites = useFavoritesStore()

function toggleFavorite(itemId: string): void {
  favorites.toggleFavorite(itemId)
}
</script>

<template>
  <button
    class="favorite-button"
    type="button"
    :aria-pressed="favorites.isFavorite(itemId)"
    @click="toggleFavorite(itemId)"
  >
    {{ favorites.isFavorite(itemId) ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos' }}
  </button>
</template>

<style scoped>
.favorite-button {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #ff8b8b;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.favorite-button:hover,
.favorite-button:focus-visible {
  color: #fff;
}
</style>

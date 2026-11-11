<script setup lang="ts">
import { computed } from 'vue'
import type { CatalogItem } from '../types/catalog'
import FavoriteButton from './FavoriteButton.vue'
import { useImageFallback } from '../utils/imageFallback'

const props = defineProps<{ item: CatalogItem }>()
const detailsRoute = computed(() => ({
  name: props.item.type === 'movie' ? 'movie-details' : 'series-details',
  params: { id: props.item.tmdbId },
}))
</script>

<template>
  <article class="col-6 col-sm-6 col-md-4 col-lg-3">
    <div class="catalog-card card h-100 shadow rounded-4">
      <RouterLink :to="detailsRoute" class="poster-link">
        <div
          class="catalog-poster"
          :style="{ backgroundImage: `linear-gradient(180deg, rgba(13,18,30,0.04), rgba(13,18,30,0.72)), url('${item.poster}')` }"
        >
          <img
            :src="item.poster"
            :alt="`Poster de ${item.title}`"
            @error="useImageFallback"
            class="poster-image"
            width="300"
            height="375"
            loading="lazy"
            decoding="async"
          >
          <span class="happy-overlay" aria-hidden="true">😊</span>
          <span class="play-button" aria-hidden="true">▶</span>
        </div>
      </RouterLink>
      <div class="card-body catalog-card-body">
        <RouterLink :to="detailsRoute" class="title-link">
          <h2>{{ item.title }}</h2>
        </RouterLink>
        <p>{{ item.caption }}</p>
        <FavoriteButton :item-id="item.id" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.catalog-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #17171b;
  color: #fff;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.poster-link,
.title-link {
  color: inherit;
  text-decoration: none;
}

.catalog-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.catalog-poster::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: linear-gradient(180deg, rgba(7, 9, 14, 0.06), rgba(7, 9, 14, 0.66));
  content: '';
}

.poster-image {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease, transform 0.35s ease;
}

.happy-overlay {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--accent-gold);
  font-size: 4rem;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  text-shadow: 0 0 24px rgba(255, 229, 106, 0.9);
  transform: scale(0.65) rotate(-12deg);
  transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.play-button {
  position: absolute;
  z-index: 3;
  bottom: 18px;
  left: 18px;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 0.9rem;
  backdrop-filter: blur(6px);
}

.catalog-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.catalog-card-body h2 {
  margin: 0;
  color: #f4f6ff;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  letter-spacing: -0.04em;
}

.title-link:hover {
  color: var(--accent-cyan);
}

.catalog-card-body p {
  margin: 0;
  color: rgba(255, 255, 255, 0.64);
}

@media (hover: hover) {
  .catalog-card:hover {
    transform: translateY(-5px);
    border-color: rgba(229, 9, 20, 0.6);
    box-shadow: 0 18px 34px rgba(0, 0, 0, 0.36), 0 0 24px rgba(229, 9, 20, 0.12) !important;
  }

  .catalog-card:hover .poster-image {
    opacity: 0.4;
    transform: scale(1.06);
  }

  .catalog-card:hover .happy-overlay {
    animation: happy-emoji-peek 1.25s ease-out both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-card,
  .poster-image,
  .happy-overlay {
    transition: none;
  }

  .catalog-card:hover,
  .catalog-card:hover .poster-image {
    transform: none;
  }

  .catalog-card:hover .happy-overlay {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>

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
  <section
    class="featured-hero row align-items-center g-4 g-lg-5"
    :style="{ '--hero-backdrop': `url('${item.backdrop}')` }"
  >
    <div class="hero-copy col-12 col-lg-6">
      <span class="eyebrow">Em tendência</span>
      <h1>{{ item.title }}</h1>
      <p v-if="item.tagline" class="hero-tagline">{{ item.tagline }}</p>
      <p>{{ item.description || 'Sinopse não disponível.' }}</p>

      <div class="cta-row">
        <RouterLink :to="detailsRoute" class="btn btn-primary primary-button large">Ver detalhes</RouterLink>
        <FavoriteButton :item-id="item.id" />
      </div>

      <div class="meta-row">
        <span v-if="item.rating">★ {{ item.rating.toFixed(1) }}</span>
        <span v-if="item.releaseYear">{{ item.releaseYear }}</span>
        <span v-if="item.genres.length">{{ item.genres.slice(0, 3).join(' • ') }}</span>
        <span v-if="item.durationMinutes">{{ item.durationMinutes }} min</span>
      </div>
    </div>

    <div class="hero-visual col-12 col-lg-6">
      <div class="poster-glow"></div>
      <RouterLink :to="detailsRoute" class="movie-card large-card" :aria-label="`Ver detalhes de ${item.title}`">
        <img
          :src="item.backdrop"
          :alt="`Imagem de ${item.title}`"
          class="featured-poster"
          @error="useImageFallback"
          width="440"
          height="520"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        >
        <div class="poster-overlay"></div>
        <span class="happy-overlay" aria-hidden="true">😊</span>
        <div class="poster-content">
          <span class="tag">Em tendência</span>
          <h2>{{ item.title }}</h2>
        </div>
        <span v-if="item.rating" class="floating-badge info-badge">
          <span class="tiny-label">Nota TMDB</span>
          <strong>{{ item.rating.toFixed(1) }}</strong>
        </span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.featured-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 540px;
  padding: clamp(24px, 4vw, 56px) 0;
  border-radius: 22px;
  margin-right: 0;
  margin-left: 0;
}

.featured-hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(13, 13, 16, 0.96) 0%, rgba(13, 13, 16, 0.82) 52%, rgba(13, 13, 16, 0.56) 100%),
    var(--hero-backdrop);
  background-position: center;
  background-size: cover;
  content: '';
}

.hero-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: clamp(14px, 2vw, 22px);
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.32);
  color: var(--accent-cyan);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.75rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  max-width: 640px;
  color: #f5f7ff;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.hero-copy p {
  margin: 0;
  max-width: 58ch;
  color: rgba(234, 239, 255, 0.72);
  font-size: clamp(1rem, 1.3vw, 1.125rem);
  line-height: 1.7;
}

.hero-tagline {
  color: var(--accent-gold) !important;
  font-weight: 600;
}

.cta-row,
.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-row {
  margin-top: 6px;
}

.meta-row span {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
}

.primary-button,
.secondary-button {
  min-height: 48px;
  padding: 10px clamp(16px, 2vw, 24px);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-size: clamp(0.9rem, 2.4vw, 1rem);
  white-space: nowrap;
}

.primary-button {
  background: linear-gradient(135deg, var(--accent-red), #ff674d);
  border-color: var(--accent-red);
  color: white;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(229, 9, 20, 0.28);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: clamp(360px, 40vw, 500px);
}

.poster-glow {
  position: absolute;
  inset: 40px clamp(20px, 7vw, 80px) 50px;
  border-radius: 40px;
  background:
    radial-gradient(circle at 40% 42%, rgba(229, 9, 20, 0.2), transparent 62%),
    radial-gradient(circle at 62% 58%, rgba(255, 103, 77, 0.22), transparent 68%);
  filter: blur(18px);
}

.movie-card {
  position: relative;
  width: min(440px, 100%);
  height: 520px;
  border-radius: 34px;
  overflow: hidden;
  border: 1px solid rgba(229, 9, 20, 0.34);
  background: linear-gradient(160deg, rgba(9, 12, 17, 0.16), rgba(8, 10, 17, 0));
  box-shadow: 0 34px 52px rgba(0, 0, 0, 0.46);
  color: #fff;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.poster-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(12, 15, 25, 0.02) 18%, rgba(8, 10, 17, 0.82) 100%),
    linear-gradient(135deg, rgba(229, 9, 20, 0.12), transparent 52%, rgba(255, 103, 77, 0.12));
}

.movie-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 30%),
    radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.22), transparent 20%),
    linear-gradient(135deg, rgba(21, 27, 38, 0.8), rgba(12, 14, 24, 0.22));
}

.featured-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease, transform 0.45s ease;
}

.happy-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  color: var(--accent-gold);
  font-size: 5rem;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  text-shadow: 0 0 28px rgba(255, 229, 106, 0.9);
  transform: scale(0.65) rotate(-12deg);
  transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.poster-content {
  position: absolute;
  inset: auto 24px 24px;
  z-index: 3;
  max-width: calc(100% - 48px);
}

.tag {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(229, 9, 20, 0.22);
  border: 1px solid rgba(229, 9, 20, 0.48);
  color: #fff;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.poster-content h2 {
  margin: 16px 0 0;
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1;
  letter-spacing: -0.045em;
  color: white;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

@media (hover: hover) {
  .movie-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 42px 64px rgba(0, 0, 0, 0.55);
  }

  .movie-card:hover .featured-poster {
    opacity: 0.4;
    transform: scale(1.04);
  }

  .movie-card:hover .happy-overlay {
    animation: happy-emoji-peek 1.25s ease-out both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .movie-card,
  .featured-poster,
  .happy-overlay {
    transition: none;
  }

  .movie-card:hover,
  .movie-card:hover .featured-poster {
    transform: none;
  }

  .movie-card:hover .happy-overlay {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.floating-badge {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid rgba(229, 9, 20, 0.26);
  background: rgba(8, 18, 30, 0.76);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  color: #fff;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
}

.info-badge {
  top: 18px;
  right: 18px;
}

.genre-badge {
  top: 18px;
  left: 18px;
}

.tiny-label {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.floating-badge strong {
  font-size: 1.1rem;
}

.info-badge strong {
  color: var(--accent-gold);
}

.genre-badge strong {
  color: var(--accent-cyan);
}

@media (max-width: 991.98px) {
  .featured-hero {
    min-height: auto;
  }

  .hero-visual {
    min-height: 0;
    padding: 8px 0 16px;
  }

  .movie-card {
    width: min(440px, 100%);
  }
}

@media (max-width: 575.98px) {
  .featured-hero {
    padding-top: 20px;
  }

  .hero-copy h1 {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .hero-copy p {
    line-height: 1.6;
  }

  .movie-card {
    width: min(440px, 100%);
    height: clamp(300px, 105vw, 420px);
  }

  .floating-badge {
    padding: 10px 12px;
  }

  .genre-badge {
    left: 12px;
  }

  .info-badge {
    right: 12px;
  }

  .poster-content {
    inset: auto 18px 20px;
    max-width: calc(100% - 36px);
  }
}
</style>

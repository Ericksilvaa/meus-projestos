<script setup lang="ts">
import type { CatalogItem } from '../types/catalog'
import FavoriteButton from './FavoriteButton.vue'
import { useImageFallback } from '../utils/imageFallback'

defineProps<{ item: CatalogItem }>()
</script>

<template>
  <section class="media-hero" :style="{ '--detail-backdrop': `url('${item.backdrop}')` }">
    <div class="hero-content container-xl">
      <div class="row align-items-center g-4 g-lg-5">
        <div class="col-12 col-md-4 d-flex justify-content-center">
          <img
            class="detail-poster"
            :src="item.poster"
            :alt="`Poster de ${item.title}`"
            @error="useImageFallback"
            width="560"
            height="840"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          >
        </div>
        <div class="col-12 col-md-8 detail-copy">
          <p class="page-eyebrow">{{ item.type === 'movie' ? 'Filme' : 'Série' }}</p>
          <h1>{{ item.title }}</h1>
          <p v-if="item.originalTitle !== item.title" class="detail-original-title">
            Título original: {{ item.originalTitle }}
          </p>
          <p class="detail-caption">{{ item.caption }}</p>
          <p class="detail-synopsis">{{ item.description }}</p>

          <dl class="detail-metadata row g-3">
            <div class="col-6 col-lg-3">
              <dt>Avaliação</dt>
              <dd>{{ item.rating !== undefined ? `${item.rating} / 10` : 'Não informada' }}</dd>
            </div>
            <div class="col-6 col-lg-3">
              <dt>Lançamento</dt>
              <dd>{{ item.releaseYear ?? 'Não informado' }}</dd>
            </div>
            <div class="col-6 col-lg-3">
              <dt>Gêneros</dt>
              <dd>{{ item.genres?.join(', ') || 'Não informados' }}</dd>
            </div>
            <div class="col-6 col-lg-3">
              <dt>Duração</dt>
              <dd>{{ item.durationMinutes ? `${item.durationMinutes} min` : 'Não informada' }}</dd>
            </div>
            <div v-if="item.seasons" class="col-6 col-lg-3">
              <dt>Temporadas</dt>
              <dd>{{ item.seasons }}</dd>
            </div>
            <div v-if="item.episodes" class="col-6 col-lg-3">
              <dt>Episódios</dt>
              <dd>{{ item.episodes }}</dd>
            </div>
            <div v-if="item.status" class="col-6 col-lg-3">
              <dt>Status</dt>
              <dd>{{ item.status }}</dd>
            </div>
            <div v-if="item.originalLanguage" class="col-6 col-lg-3">
              <dt>Idioma original</dt>
              <dd>{{ item.originalLanguage.toUpperCase() }}</dd>
            </div>
          </dl>

          <div class="detail-actions">
            <FavoriteButton :item-id="item.id" />
            <iframe
              v-if="item.trailerUrl"
              class="trailer-player"
              :src="item.trailerUrl"
              :title="`Trailer oficial de ${item.title}`"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
            <span v-else class="trailer-unavailable">Trailer não disponível</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 480px;
  margin: 0 -1rem;
  padding: clamp(24px, 5vw, 64px) clamp(16px, 4vw, 48px);
}

.media-hero::before {
  position: absolute;
  z-index: -2;
  inset: -24px;
  background-image: linear-gradient(90deg, rgba(12, 12, 15, 0.96) 6%, rgba(12, 12, 15, 0.72) 58%, rgba(12, 12, 15, 0.45)), var(--detail-backdrop);
  background-position: center, center 35%;
  background-size: cover;
  content: '';
  filter: blur(12px);
  transform: scale(1.04);
}

.media-hero::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(0deg, #121216 0%, transparent 50%, rgba(12, 12, 15, 0.16) 100%);
  content: '';
  pointer-events: none;
}

.hero-content {
  max-width: 1180px;
}

.detail-poster {
  width: 100%;
  max-width: 280px;
  max-height: 420px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  object-fit: cover;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.detail-copy h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 750;
  letter-spacing: -0.06em;
  line-height: 1;
  text-wrap: balance;
}

.detail-caption {
  margin: 16px 0 10px;
  color: var(--accent-gold);
  font-weight: 600;
}

.detail-original-title {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-style: italic;
}

.detail-synopsis {
  max-width: 680px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.7;
}

.detail-metadata {
  margin: 24px 0 0;
}

.detail-metadata dt {
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-metadata dd {
  margin: 0;
  color: #fff;
  font-size: 0.92rem;
}

.detail-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 24px;
}

.trailer-link,
.trailer-unavailable {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
}

.trailer-player {
  width: min(100%, 560px);
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: #000;
}

.trailer-link:hover {
  color: #fff;
}

.trailer-unavailable {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.9rem;
}

@media (max-width: 575.98px) {
  .media-hero {
    margin-inline: -0.5rem;
  }

  .detail-poster {
    width: min(58vw, 240px);
    max-height: 340px;
  }
}
</style>

<template>
  <section class="catalog-page">
    <PageHeading
      eyebrow="Sobre nós"
      title="CineHub"
      description="Sua próxima sessão começa aqui. Explore filmes, séries e monte sua lista de favoritos."
    />
    <RouterLink to="/" class="btn btn-primary mt-3">Explorar o catálogo</RouterLink>
  </section>
</template>

<script setup lang="ts">
import PageHeading from '../components/PageHeading.vue'
</script>

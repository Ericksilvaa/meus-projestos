<script setup lang="ts">
import Breadcrumbs from '../components/Breadcrumbs.vue'
import NotificationToast from '../components/NotificationToast.vue'
import SiteHeader from '../components/SiteHeader.vue'
import { isRouteLoading } from '../composables/navigationState'

const navItems = [
  { label: 'Início', to: '/' },
  { label: 'Filmes', to: '/filmes' },
  { label: 'Séries', to: '/series' },
  { label: 'Favoritos', to: '/favoritos' },
]
</script>

<template>
  <NotificationToast />
  <div class="page-shell container py-4 px-3 px-md-4 my-3 rounded-4 shadow">
    <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
    <div v-if="isRouteLoading" class="route-loading" role="status" aria-live="polite">
      <span class="visually-hidden">Carregando página</span>
    </div>
    <SiteHeader :nav-items="navItems" />

    <Breadcrumbs />

    <main id="main-content" class="page-content" tabindex="-1">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer text-center mt-5 pt-4">
      <p class="mb-1">CINEHUB · Sua próxima sessão começa aqui.</p>
      <small>
        Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">The Movie Database</a>
      </small>
      <small>&copy; {{ new Date().getFullYear() }} CineHub</small>
      <p class="mb-0 mt-2"><RouterLink to="/about">Sobre o CineHub</RouterLink></p>
    </footer>
  </div>
</template>

<style scoped>
.page-shell {
  max-width: 1440px;
  min-height: calc(100vh - 2rem);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(20, 20, 24, 0.98), rgba(12, 12, 15, 0.98));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(10px);
}

@media (max-width: 991.98px) {
  .page-shell {
    backdrop-filter: none;
  }
}

.page-content {
  min-height: 55vh;
}

.site-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.site-footer small {
  color: rgba(255, 255, 255, 0.48);
}

.site-footer a {
  color: rgba(255, 255, 255, 0.7);
}
</style>

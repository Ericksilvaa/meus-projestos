import { createRouter, createWebHistory } from 'vue-router'
import { isRouteLoading } from '../composables/navigationState'
import { getCatalogItem } from '../services/catalogService'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'Filmes e séries para descobrir',
      description: 'Descubra filmes e séries no CineHub. Explore títulos, veja detalhes e salve seus favoritos.',
      image: '/poster-placeholder.svg',
    },
  },
  {
    path: '/buscar',
    name: 'search',
    component: () => import('../views/SearchResultsView.vue'),
    meta: {
      title: (route) => {
        const term = typeof route.query.q === 'string' ? route.query.q : ''
        return term ? `Busca: ${term}` : 'Busca'
      },
      description: 'Pesquise e filtre filmes e séries do catálogo CineHub.',
      robots: 'noindex,follow',
      breadcrumbs: [{ label: 'Início', to: { name: 'home' } }, { label: 'Buscar' }],
    },
  },
  {
    path: '/filmes',
    name: 'movies',
    component: () => import('../views/MoviesView.vue'),
    meta: {
      title: 'Filmes',
      description: 'Explore filmes no CineHub e encontre seu próximo título para assistir.',
      breadcrumbs: [{ label: 'Início', to: { name: 'home' } }, { label: 'Filmes' }],
    },
  },
  {
    path: '/series',
    name: 'series',
    component: () => import('../views/SeriesView.vue'),
    meta: {
      title: 'Séries',
      description: 'Explore séries no CineHub e encontre sua próxima maratona.',
      breadcrumbs: [{ label: 'Início', to: { name: 'home' } }, { label: 'Séries' }],
    },
  },
  {
    path: '/filmes/:id',
    name: 'movie-details',
    component: () => import('../views/DetailsView.vue'),
    props: (route) => ({ id: route.params.id, type: 'movie' }),
    meta: {
      title: 'Filme',
      description: 'Consulte sinopse, elenco, avaliações e trailer deste filme no CineHub.',
      robots: 'noindex,follow',
      breadcrumbs: [{ label: 'Filmes', to: { name: 'movies' } }, { label: 'Detalhes' }],
    },
  },
  {
    path: '/series/:id',
    name: 'series-details',
    component: () => import('../views/DetailsView.vue'),
    props: (route) => ({ id: route.params.id, type: 'series' }),
    meta: {
      title: 'Série',
      description: 'Consulte sinopse, elenco, avaliações e trailer desta série no CineHub.',
      robots: 'noindex,follow',
      breadcrumbs: [{ label: 'Séries', to: { name: 'series' } }, { label: 'Detalhes' }],
    },
  },
  {
    path: '/detalhes/:id',
    redirect: async (route) => {
      const item =
        (await getCatalogItem(String(route.params.id), 'movie')) ??
        (await getCatalogItem(String(route.params.id), 'series'))
      if (!item) return { name: 'not-found' }
      return {
        name: item.type === 'movie' ? 'movie-details' : 'series-details',
        params: { id: item.tmdbId },
      }
    },
  },
  {
    path: '/favoritos',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue'),
    meta: {
      title: 'Favoritos',
      description: 'Acesse sua lista pessoal de filmes e séries favoritos no CineHub.',
      robots: 'noindex,nofollow',
      breadcrumbs: [{ label: 'Início', to: { name: 'home' } }, { label: 'Favoritos' }],
    },
  },
  {
    path: '/favorites',
    redirect: { name: 'favorites' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'Sobre',
      description: 'Conheça o CineHub, seu espaço para descobrir filmes e séries.',
      breadcrumbs: [{ label: 'Início', to: { name: 'home' } }, { label: 'Sobre' }],
    },
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Página não encontrada',
      description: 'A página solicitada não foi encontrada no CineHub.',
      robots: 'noindex,nofollow',
      breadcrumbs: [{ label: 'Página não encontrada' }],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found-path',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Página não encontrada',
      description: 'A página solicitada não foi encontrada no CineHub.',
      robots: 'noindex,nofollow',
      breadcrumbs: [{ label: 'Página não encontrada' }],
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
})

router.beforeEach((to, from) => {
  if (to.path !== from.path) isRouteLoading.value = true
})

router.afterEach((to) => {
  isRouteLoading.value = false
  if (typeof document === 'undefined') return

  const resolveMeta = (value, fallback) =>
    (typeof value === 'function' ? value(to) : value) ?? fallback
  const pageTitle = resolveMeta(to.meta.title, 'CineHub')
  const description = resolveMeta(
    to.meta.description,
    'Descubra filmes e séries no CineHub. Explore títulos, veja detalhes e salve seus favoritos.',
  )
  const image = resolveMeta(to.meta.image, '/poster-placeholder.svg')
  const robots = resolveMeta(to.meta.robots, 'index,follow')
  const canonicalUrl = `${window.location.origin}${router.resolve({ path: to.path }).href}`
  const absoluteImage = new URL(image, window.location.origin).href

  document.title = pageTitle === 'CineHub' ? pageTitle : `${pageTitle} | CineHub`
  updateMeta('name', 'description', description)
  updateMeta('name', 'robots', robots)
  updateMeta('property', 'og:title', document.title)
  updateMeta('property', 'og:description', description)
  updateMeta('property', 'og:url', canonicalUrl)
  updateMeta('property', 'og:image', absoluteImage)
  updateMeta('name', 'twitter:title', document.title)
  updateMeta('name', 'twitter:description', description)
  updateMeta('name', 'twitter:image', absoluteImage)
  updateLink('canonical', canonicalUrl)
})

router.onError((error) => {
  isRouteLoading.value = false
  console.error('Falha ao carregar a rota.', error)
})

export default router

function updateMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

function updateLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.append(element)
  }
  element.setAttribute('href', href)
}

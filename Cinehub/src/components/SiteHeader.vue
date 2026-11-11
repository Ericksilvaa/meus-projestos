<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from './SearchBar.vue'

defineProps<{
  navItems: { label: string; to: string }[]
}>()

const route = useRoute()
const menuOpen = ref(false)
let bodyOverflowBeforeMenu: string | undefined

function closeMenu(): void {
  menuOpen.value = false
}

function updateBodyScrollLock(isMenuOpen: boolean): void {
  if (isMenuOpen) {
    bodyOverflowBeforeMenu = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  if (bodyOverflowBeforeMenu !== undefined) {
    document.body.style.overflow = bodyOverflowBeforeMenu
    bodyOverflowBeforeMenu = undefined
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeMenu()
}

watch(() => route.fullPath, closeMenu)
watch(menuOpen, updateBodyScrollLock)

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  updateBodyScrollLock(false)
})
</script>

<template>
  <header class="site-header">
    <div class="header-row">
      <RouterLink class="brand-wrap" to="/" aria-label="CineHub - início" @click="closeMenu">
        <span class="brand-mark">C</span>
        <span class="brand-name">CINEHUB</span>
      </RouterLink>

      <nav
        id="primary-navigation"
        class="primary-navigation"
        :class="{ 'is-open': menuOpen }"
        aria-label="Navegação principal"
      >
        <div class="mobile-menu-heading">
          <span>Explore</span>
          <button class="menu-close" type="button" aria-label="Fechar menu" @click="closeMenu">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <ul class="navbar-nav">
          <li v-for="item in navItems" :key="item.to" class="nav-item">
            <RouterLink
              :to="item.to"
              class="nav-link"
              active-class="active"
              exact-active-class="exact-active"
              @click="closeMenu"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
        <RouterLink class="mobile-about-link" to="/about" @click="closeMenu">Sobre o CineHub</RouterLink>
      </nav>

      <div v-if="menuOpen" class="menu-scrim" aria-hidden="true" @click="closeMenu"></div>

      <div class="header-actions">
        <SearchBar />
        <RouterLink class="btn watch-button" to="/filmes">Explorar</RouterLink>
      </div>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
        @click="menuOpen ? closeMenu() : (menuOpen = true)"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 20;
  top: 0;
  padding: 8px 0 18px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(20, 20, 24, 0.98), rgba(20, 20, 24, 0.9));
  backdrop-filter: blur(18px);
}

.header-row {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: clamp(16px, 2.4vw, 36px);
}

.brand-wrap {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  flex-shrink: 0;
  color: #fff;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-pink), #ff9f43 58%, var(--accent-gold));
  color: #fff;
  font-weight: 800;
  box-shadow: 0 0 22px rgba(255, 79, 154, 0.28);
}

.brand-name {
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.primary-navigation {
  display: flex;
  flex: 1;
  align-items: center;
}

.navbar-nav {
  flex-direction: row;
  gap: clamp(8px, 1.4vw, 22px);
}

.nav-link {
  position: relative;
  padding: 12px 3px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  position: absolute;
  right: 3px;
  bottom: 3px;
  left: 3px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(240, 68, 82, 0.5);
  content: '';
}

.nav-link.exact-active {
  color: var(--accent-cyan);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.watch-button {
  padding: 9px 16px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-pink), #ff684d);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 650;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(229, 9, 20, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.watch-button:hover {
  transform: translateY(-1px);
  color: #fff;
  box-shadow: 0 10px 26px rgba(229, 9, 20, 0.32);
}

.menu-toggle,
.mobile-menu-heading,
.mobile-about-link {
  display: none;
}

@media (max-width: 991.98px) {
  .site-header {
    background: #141418;
    backdrop-filter: none;
  }

  .header-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .primary-navigation {
    position: fixed;
    z-index: 32;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    width: min(86vw, 340px);
    max-height: 100vh;
    max-height: 100dvh;
    align-items: stretch;
    flex-direction: column;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: max(24px, env(safe-area-inset-top)) 22px max(24px, env(safe-area-inset-bottom));
    background-color: #000;
    background-image: none;
    box-shadow: 24px 0 60px rgba(0, 0, 0, 0.4);
    transform: translateX(-105%);
    transition: transform 0.24s ease;
    visibility: hidden;
  }

  .primary-navigation.is-open {
    transform: translateX(0);
    visibility: visible;
  }

  .mobile-menu-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .menu-close {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 50%;
    background: transparent;
    color: #fff;
    font-size: 1.5rem;
  }

  .navbar-nav {
    flex-direction: column;
    gap: 8px;
  }

  .nav-link {
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 1rem;
  }

  .nav-link.active,
  .nav-link.exact-active {
    background: rgba(240, 68, 82, 0.12);
  }

  .nav-link.active::after {
    top: 10px;
    right: auto;
    bottom: 10px;
    left: 0;
    width: 3px;
    height: auto;
  }

  .mobile-about-link {
    display: block;
    margin-top: auto;
    padding: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
  }

  .menu-scrim {
    position: fixed;
    z-index: 31;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(3px);
  }

  .header-actions {
    flex: 1;
    justify-content: flex-end;
    margin-left: auto;
  }

  .menu-toggle {
    display: flex;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    order: 1;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
  }

  .menu-toggle span {
    width: 17px;
    height: 2px;
    border-radius: 2px;
    background: #fff;
  }
}

@media (max-width: 575.98px) {
  .header-row {
    gap: 10px;
  }

  .brand-name {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }

  .header-actions {
    order: 2;
    width: 100%;
    flex: 1 1 100%;
  }

  .watch-button {
    padding-inline: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .primary-navigation,
  .nav-link,
  .watch-button {
    transition: none;
  }
}
</style>

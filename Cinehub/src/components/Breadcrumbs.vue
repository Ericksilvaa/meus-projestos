<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { BreadcrumbItem } from '../types/navigation'

const route = useRoute()
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const routeBreadcrumbs = route.meta.breadcrumbs
  return typeof routeBreadcrumbs === 'function' ? routeBreadcrumbs(route) : routeBreadcrumbs ?? []
})
</script>

<template>
  <nav v-if="breadcrumbs.length" class="breadcrumbs" aria-label="Trilha de navegação">
    <ol>
      <li v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.label">
        <RouterLink
          v-if="breadcrumb.to && index < breadcrumbs.length - 1"
          :to="breadcrumb.to"
        >
          {{ breadcrumb.label }}
        </RouterLink>
        <span v-else :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
          {{ breadcrumb.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

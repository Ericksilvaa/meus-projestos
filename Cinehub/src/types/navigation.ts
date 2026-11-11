import type { RouteLocationRaw, RouteLocationNormalizedLoaded } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

export type BreadcrumbResolver = (route: RouteLocationNormalizedLoaded) => BreadcrumbItem[]

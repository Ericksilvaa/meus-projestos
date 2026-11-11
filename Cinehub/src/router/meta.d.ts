import 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { BreadcrumbItem, BreadcrumbResolver } from '../types/navigation'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | ((route: RouteLocationNormalizedLoaded) => string)
    description?: string | ((route: RouteLocationNormalizedLoaded) => string)
    image?: string | ((route: RouteLocationNormalizedLoaded) => string)
    robots?: string | ((route: RouteLocationNormalizedLoaded) => string)
    breadcrumbs?: BreadcrumbItem[] | BreadcrumbResolver
  }
}

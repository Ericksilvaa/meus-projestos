import { useRouter, type RouteLocationRaw } from 'vue-router'

export function useGoBack(fallback: RouteLocationRaw) {
  const router = useRouter()

  return () => {
    if (router.options.history.state.back) {
      router.back()
      return
    }

    void router.push(fallback)
  }
}

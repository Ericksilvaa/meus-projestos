import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useSearchQuery() {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
    set: (value: string) => {
      const query = { ...route.query }
      if (value) query.q = value
      else delete query.q
      void router.replace({ query })
    },
  })
}

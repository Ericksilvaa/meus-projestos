import { ref } from 'vue'

export interface AppNotification {
  id: number
  message: string
  kind: 'success' | 'info'
}

const notifications = ref<AppNotification[]>([])
let nextNotificationId = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export function useNotifications() {
  function dismiss(id: number): void {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    notifications.value = notifications.value.filter((notification) => notification.id !== id)
  }

  function notify(message: string, kind: AppNotification['kind'] = 'success'): void {
    const id = ++nextNotificationId
    notifications.value = [...notifications.value, { id, message, kind }].slice(-4)
    timers.set(id, setTimeout(() => dismiss(id), 3500))
  }

  return { notifications, notify, dismiss }
}

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications'

const { notifications, dismiss } = useNotifications()
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-relevant="additions">
    <TransitionGroup name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="app-toast"
        :class="`app-toast--${notification.kind}`"
        role="status"
      >
        <span class="toast-icon" aria-hidden="true">
          {{ notification.kind === 'success' ? '✓' : 'i' }}
        </span>
        <span class="toast-message">{{ notification.message }}</span>
        <button
          class="toast-dismiss"
          type="button"
          aria-label="Dispensar notificação"
          @click="dismiss(notification.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  z-index: 1100;
  top: max(18px, env(safe-area-inset-top));
  right: max(18px, env(safe-area-inset-right));
  display: grid;
  width: min(360px, calc(100vw - 32px));
  gap: 10px;
  pointer-events: none;
}

.app-toast {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: rgba(25, 25, 30, 0.96);
  color: #fff;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(14px);
  pointer-events: auto;
}

.toast-icon {
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  place-items: center;
  border-radius: 50%;
  background: rgba(240, 68, 82, 0.16);
  color: #ff8b8b;
  font-weight: 800;
}

.app-toast--info .toast-icon {
  background: rgba(138, 180, 255, 0.14);
  color: #8ab4ff;
}

.toast-message {
  flex: 1;
  font-size: 0.92rem;
}

.toast-dismiss {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  font-size: 1.35rem;
  line-height: 1;
}

.toast-dismiss:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.toast-enter-active,
.toast-leave-active,
.toast-move {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-leave-active {
  position: absolute;
  right: 0;
  left: 0;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
}
</style>

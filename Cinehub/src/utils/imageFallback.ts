export function useImageFallback(event: Event): void {
  const image = event.currentTarget
  if (!(image instanceof HTMLImageElement)) return

  image.onerror = null
  image.src = '/poster-placeholder.svg'
}

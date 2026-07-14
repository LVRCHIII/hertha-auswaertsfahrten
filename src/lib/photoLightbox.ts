import 'spotlight.js/src/css/spotlight.css'
import type { SpotlightSlide } from 'spotlight.js/src/js/spotlight.js'

type SpotlightModule = typeof import('spotlight.js/src/js/spotlight.js')

type OpenPhotoLightboxOptions = {
  slides: SpotlightSlide[]
  index: number
  trigger: HTMLElement
}

const CONTROL_LABELS = {
  '.spl-close': 'Galerie schließen',
  '.spl-prev': 'Vorheriges Foto',
  '.spl-next': 'Nächstes Foto',
  '.spl-fullscreen': 'Vollbild umschalten',
  '.spl-zoom-in': 'Foto vergrößern',
  '.spl-zoom-out': 'Foto verkleinern',
  '.spl-download': 'Foto herunterladen',
} as const

let spotlightModulePromise: Promise<SpotlightModule> | null = null

function loadSpotlight() {
  spotlightModulePromise ??= import('spotlight.js/src/js/spotlight.js').catch((error) => {
    spotlightModulePromise = null
    throw error
  })
  return spotlightModulePromise
}

function makeSpotlightAccessible(overlay: HTMLElement): () => void {
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Fotos der Auswärtsfahrt')

  const controlCleanups: Array<() => void> = []

  Object.entries(CONTROL_LABELS).forEach(([selector, label]) => {
    const control = overlay.querySelector<HTMLElement>(selector)
    if (!control) return

    control.setAttribute('role', 'button')
    control.setAttribute('aria-label', label)
    control.tabIndex = 0

    const handleControlKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      control.click()
    }

    control.addEventListener('keydown', handleControlKeydown)
    controlCleanups.push(() => control.removeEventListener('keydown', handleControlKeydown))
  })

  const getFocusable = () =>
    Array.from(overlay.querySelectorAll<HTMLElement>('[tabindex="0"]')).filter(
      (element) => element.getClientRects().length > 0,
    )

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    const focusable = getFocusable()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  overlay.addEventListener('keydown', trapFocus)
  overlay.querySelector<HTMLElement>('.spl-close')?.focus()

  return () => {
    overlay.removeEventListener('keydown', trapFocus)
    controlCleanups.forEach((cleanup) => cleanup())
  }
}

export async function openPhotoLightbox({ slides, index, trigger }: OpenPhotoLightboxOptions) {
  const { default: Spotlight } = await loadSpotlight()
  let cleanupAccessibility = () => {}
  let accessibilityTimer: number | null = null

  Spotlight.show(slides, {
    class: 'hertha-spotlight',
    animation: ['fade', 'slide'],
    control: ['page', 'zoom', 'fullscreen', 'download', 'close'],
    autohide: false,
    preload: true,
    index: index + 1,
    onshow: () => {
      accessibilityTimer = window.setTimeout(() => {
        const overlay = document.getElementById('spotlight')
        if (overlay) cleanupAccessibility = makeSpotlightAccessible(overlay)
      }, 0)
    },
    onclose: () => {
      if (accessibilityTimer !== null) window.clearTimeout(accessibilityTimer)
      cleanupAccessibility()
      trigger.focus()
    },
  })
}

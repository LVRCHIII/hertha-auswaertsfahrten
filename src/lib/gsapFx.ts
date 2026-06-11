import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Zählt eine Zahl beim ersten Sichtbarwerden von 0 hoch.
 * Gibt eine Ref zurück, die auf das Text-Element gelegt wird.
 */
export function useCountUp(value: number, options?: { suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const suffix = options?.suffix ?? ''
  const decimals = options?.decimals ?? 0

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const format = (n: number) =>
      n.toLocaleString('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix

    if (prefersReducedMotion()) {
      el.textContent = format(value)
      return
    }

    const obj = { n: 0 }
    const tween = gsap.to(obj, {
      n: value,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => {
        el.textContent = format(obj.n)
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [value, suffix, decimals])

  return ref
}

/**
 * Staggert direkte Kinder (oder Elemente mit [data-reveal]) beim Mount herein.
 * Auf einen Container legen.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
  options?: { selector?: string; y?: number; stagger?: number },
) {
  const ref = useRef<T>(null)
  const selector = options?.selector ?? '[data-reveal]'
  const y = options?.y ?? 16
  const stagger = options?.stagger ?? 0.06

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll(selector)
    if (targets.length === 0) return

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger,
        clearProps: 'transform',
      },
    )
    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

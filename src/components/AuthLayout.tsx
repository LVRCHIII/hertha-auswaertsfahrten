import { motion } from 'framer-motion'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const EMBLEMS = [
  { className: 'auth-emblem--1', depth: 13, opacity: 0.12 },
  { className: 'auth-emblem--2', depth: -9, opacity: 0.08 },
  { className: 'auth-emblem--3', depth: 18, opacity: 0.09 },
  { className: 'auth-emblem--4', depth: -15, opacity: 0.07 },
  { className: 'auth-emblem--5', depth: 10, opacity: 0.1 },
] as const

function AuthBackdrop() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const glow = glowRef.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!scene || !glow || !finePointer.matches || reducedMotion.matches) return

    const emblems = Array.from(
      scene.querySelectorAll<HTMLElement>('[data-auth-emblem]'),
    )
    let frameId = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let sceneWidth = scene.clientWidth
    let sceneHeight = scene.clientHeight

    const render = () => {
      currentX += (targetX - currentX) * 0.075
      currentY += (targetY - currentY) * 0.075

      emblems.forEach((emblem) => {
        const depth = Number(emblem.dataset.depth ?? 0)
        emblem.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`
      })

      glow.style.transform = `translate3d(calc(-50% + ${currentX * sceneWidth * 0.34}px), calc(-50% + ${currentY * sceneHeight * 0.3}px), 0)`

      const isSettled =
        Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001

      if (isSettled) {
        frameId = 0
        return
      }

      frameId = window.requestAnimationFrame(render)
    }

    const startRender = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = scene.getBoundingClientRect()
      sceneWidth = bounds.width
      sceneHeight = bounds.height
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      startRender()
    }

    const resetPointer = () => {
      targetX = 0
      targetY = 0
      startRender()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', resetPointer)
    window.addEventListener('blur', resetPointer)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener('mouseleave', resetPointer)
      window.removeEventListener('blur', resetPointer)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div ref={glowRef} className="auth-pointer-glow absolute left-1/2 top-1/2" />
      <div className="auth-grid absolute inset-0" />

      {EMBLEMS.map((emblem) => (
        <div
          key={emblem.className}
          className={`auth-emblem ${emblem.className} absolute`}
          data-auth-emblem
          data-depth={emblem.depth}
        >
          <img
            alt=""
            className="auth-emblem__image h-auto w-full select-none"
            draggable={false}
            src="/wappen/hertha.png"
            style={{ '--auth-emblem-opacity': emblem.opacity } as CSSProperties}
          />
        </div>
      ))}
    </div>
  )
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-hidden bg-transparent px-4 py-10 sm:px-6">
      <AuthBackdrop />

      <motion.section
        aria-labelledby="auth-title"
        className="glass-card noise-overlay relative w-full max-w-md overflow-hidden rounded-[1.75rem] p-7 sm:p-9"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="accent-line absolute inset-x-0 top-0 h-px" />

        <motion.div
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-shell-fg/[0.07] ring-1 ring-inset ring-shell-fg/15">
            <img
              alt="Hertha BSC"
              className="h-auto w-8 drop-shadow-[0_3px_8px_rgba(0,0,0,0.22)]"
              src="/wappen/hertha.png"
            />
          </div>
          <div>
            <p className="font-display-wide text-[9px] leading-none text-shell-fg/50">Hertha BSC</p>
            <p className="mt-1 text-sm font-medium tracking-[-0.01em] text-shell-fg/85">
              Auswärtsfahrten
            </p>
          </div>
        </motion.div>

        <motion.header
          className="mb-8 text-left"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17, duration: 0.4, ease: 'easeOut' }}
        >
          <h1 id="auth-title" className="auth-title text-shell-fg">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-[36ch] text-[0.95rem] leading-6 text-shell-fg/58">
              {subtitle}
            </p>
          ) : null}
        </motion.header>

        {children}
      </motion.section>
    </main>
  )
}

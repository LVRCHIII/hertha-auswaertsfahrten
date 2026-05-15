import { useState } from 'react'

type VereinWappenProps = {
  src: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClass = {
  sm: 'h-8 w-8 p-0.5',
  md: 'h-10 w-10 p-1',
} as const

export function VereinWappen({ src, size = 'sm', className = '' }: VereinWappenProps) {
  const [failed, setFailed] = useState(!src)

  if (failed || !src) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-hertha-blue/10 text-sm ${sizeClass[size]} ${className}`}
        aria-hidden
      >
        ⚽
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={size === 'md' ? 40 : 32}
      height={size === 'md' ? 40 : 32}
      className={`shrink-0 rounded bg-slate-50 object-contain ${sizeClass[size]} ${className}`}
      onError={() => setFailed(true)}
    />
  )
}

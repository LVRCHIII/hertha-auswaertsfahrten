import { initialsFromName } from '../lib/displayName'

import type { CSSProperties } from 'react'

type ProfileAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-xl',
} as const

export function ProfileAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  style,
}: ProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
        style={style}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-card-accent font-bold text-white ${sizeClass} ${className}`}
      style={style}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  )
}

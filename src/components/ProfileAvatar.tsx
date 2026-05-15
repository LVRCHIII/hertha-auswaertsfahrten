import { initialsFromName } from '../lib/displayName'

type ProfileAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
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
}: ProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-hertha-blue/10 font-bold text-hertha-blue ${sizeClass} ${className}`}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  )
}

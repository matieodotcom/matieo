import * as RadixAvatar from '@radix-ui/react-avatar'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserAvatarProps {
  src?: string | null
  name?: string
  size?: AvatarSize
}

export function UserAvatar({ src, name, size = 'md' }: UserAvatarProps) {
  return (
    <RadixAvatar.Root
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden select-none`}
    >
      <RadixAvatar.Image
        src={src ?? undefined}
        alt={name ?? 'User avatar'}
        className="w-full h-full object-cover"
      />
      <RadixAvatar.Fallback
        delayMs={0}
        className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-medium"
      >
        {getInitials(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}

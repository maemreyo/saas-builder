'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface OAuthButtonProps {
  provider: 'google' | 'github' | 'discord'
  onClick: () => Promise<void>
  disabled?: boolean
  className?: string
}

const providerConfig = {
  google: {
    icon: Icons.google,
    label: 'Google',
    className: 'hover:bg-gray-50',
  },
  github: {
    icon: Icons.github,
    label: 'GitHub',
    className: 'hover:bg-gray-900 hover:text-white',
  },
  discord: {
    icon: (props: any) => (
      <svg role="img" viewBox="0 0 24 24" {...props}>
        <path
          fill="currentColor"
          d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
        />
      </svg>
    ),
    label: 'Discord',
    className: 'hover:bg-[#5865F2] hover:text-white',
  },
}

export function OAuthButton({ provider, onClick, disabled, className }: OAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const config = providerConfig[provider]
  const Icon = config.icon

  const handleClick = async () => {
    setLoading(true)
    try {
      await onClick()
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(config.className, className)}
    >
      {loading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {config.label}
    </Button>
  )
}

// OAuth buttons group component
interface OAuthButtonsProps {
  onSignIn: (provider: 'google' | 'github' | 'discord') => Promise<void>
  disabled?: boolean
  providers?: ('google' | 'github' | 'discord')[]
}

export function OAuthButtons({ 
  onSignIn, 
  disabled, 
  providers = ['google', 'github'] 
}: OAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {providers.map((provider) => (
        <OAuthButton
          key={provider}
          provider={provider}
          onClick={() => onSignIn(provider)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
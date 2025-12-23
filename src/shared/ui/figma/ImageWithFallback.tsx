import React, { useEffect, useMemo, useState } from 'react'

// Prefer bundled asset (works with stricter CSP); inline data URI is a last-resort guard.
const DEFAULT_PUBLIC_FALLBACK = '/campaign-fallback.svg'
const INLINE_FALLBACK_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
}

export function ImageWithFallback({
  src,
  alt,
  style,
  className,
  onError,
  fallbackSrc,
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [fallbackExhausted, setFallbackExhausted] = useState(false)

  // Reset error state when source changes so a new image can attempt to load.
  useEffect(() => {
    setDidError(false)
    setFallbackExhausted(false)
  }, [src])

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!didError) {
      setDidError(true)
      onError?.(event)
    } else if (!fallbackExhausted) {
      // Fallback failed; try inline data URI as final guard.
      setFallbackExhausted(true)
    }
  }

  const effectiveSrc = useMemo(() => {
    const normalizedSrc = typeof src === 'string' ? src.trim() : src
    if (!didError && normalizedSrc) {
      return normalizedSrc
    }

    if (!fallbackExhausted) {
      return fallbackSrc || DEFAULT_PUBLIC_FALLBACK
    }

    return INLINE_FALLBACK_SRC
  }, [didError, fallbackExhausted, fallbackSrc, src])

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      data-original-url={src}
      {...rest}
    />
  )
}

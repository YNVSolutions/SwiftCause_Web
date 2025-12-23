import React, { useEffect, useMemo, useState } from 'react'

const DEFAULT_FALLBACK_SRC =
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

  // Reset error state when source changes so a new image can attempt to load.
  useEffect(() => {
    setDidError(false)
  }, [src])

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!didError) {
      setDidError(true)
      onError?.(event)
    }
  }

  const effectiveSrc = useMemo(() => {
    const normalizedSrc = typeof src === 'string' ? src.trim() : src
    if (didError || !normalizedSrc) {
      return fallbackSrc || DEFAULT_FALLBACK_SRC
    }
    return normalizedSrc
  }, [didError, fallbackSrc, src])

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

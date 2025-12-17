import React, { useState } from 'react'
import { Heart, Image } from 'lucide-react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'campaign' | 'default'
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, fallbackType = 'default', ...rest } = props

  // Don't try to load if src is empty or undefined
  if (!src || src.trim() === '') {
    return fallbackType === 'campaign' ? (
      <img 
        src="/campaign-fallback.svg" 
        alt="Campaign placeholder" 
        className={className} 
        style={style} 
        {...rest}
      />
    ) : (
      <div
        className={`inline-block bg-gradient-to-br from-blue-50 to-indigo-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Image className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">No Image</span>
        </div>
      </div>
    )
  }

  return didError ? (
    fallbackType === 'campaign' ? (
      <img 
        src="/campaign-fallback.svg" 
        alt="Campaign placeholder" 
        className={className} 
        style={style} 
        {...rest}
      />
    ) : (
      <div
        className={`inline-block bg-gradient-to-br from-blue-50 to-indigo-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Image className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Image Unavailable</span>
        </div>
      </div>
    )
  ) : (
    <>
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse ${className ?? ''}`}
          style={style}
        />
      )}
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        style={style} 
        {...rest} 
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  )
}

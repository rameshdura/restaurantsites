"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useEffect } from "react"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = "/images/placeholder.png",
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Image
      {...props}
      src={mounted ? imgSrc : src}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}

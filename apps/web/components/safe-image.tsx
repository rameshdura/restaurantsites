"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

export function SafeImage({ src, fallbackSrc = "/images/placeholder.png", alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}

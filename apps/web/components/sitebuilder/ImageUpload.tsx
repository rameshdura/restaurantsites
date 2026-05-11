'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { Upload, X, Image as ImageIcon, Download } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface ImageUploadProps {
  label: string
  image: string | null
  onImageSelect: (file: File, previewUrl: string) => void
  onImageRemove: () => void
  slugPrefix?: string
  canDownload?: boolean
}

export function ImageUpload({
  label,
  image,
  onImageSelect,
  onImageRemove,
  slugPrefix = '',
  canDownload = true,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDragActive(true)
    }
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const compressImage = (dataUrl: string, maxWidth = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to JPEG with specified quality
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = dataUrl
    })
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string
      
      // Compress image before saving to state
      const compressedDataUrl = await compressImage(originalDataUrl)
      onImageSelect(file, compressedDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = () => {
    if (image) {
      // Create a temporary download link
      const link = document.createElement('a')
      link.href = image
      // Use slug prefix for filename
      const filename = slugPrefix ? `${slugPrefix}_${label.toLowerCase().replace(/\s+/g, '_')}.jpg` : `${label.toLowerCase().replace(/\s+/g, '_')}.jpg`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {image ? (
        <div className="relative group rounded-xl border-2 border-border bg-card p-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image src={image} alt={label || 'Uploaded image'} fill className="object-cover" />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Change
            </Button>
            {canDownload && (
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button type="button" variant="destructive" size="sm" onClick={onImageRemove}>
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div
          className={cn(
            'relative aspect-video w-full cursor-pointer rounded-xl border-2 border-dashed border-border bg-card transition-all hover:border-primary/50 hover:bg-card/50',
            dragActive && 'border-primary bg-primary/10'
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <div className="rounded-full bg-primary/10 p-3">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 800x400)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}

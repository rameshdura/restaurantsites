import { ReactNode } from "react"
import { OwnerHeader } from "./OwnerHeader"

interface OwnerLayoutProps {
  children: ReactNode
  params: Promise<{ restaurant: string }>
}

export default async function OwnerLayout({
  children,
  params,
}: OwnerLayoutProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <OwnerHeader decodedSlug={decodedSlug} />
      <div className="flex-1">{children}</div>
    </div>
  )
}

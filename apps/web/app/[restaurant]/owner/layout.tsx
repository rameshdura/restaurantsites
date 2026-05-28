import { ReactNode } from "react"
import Link from "next/link"
import { ScanLine, ActivitySquare, Utensils, Settings } from "lucide-react"

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Owner Dashboard
            </h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href={`/${decodedSlug}/owner/tables`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Tables</span>
            </Link>
            <Link
              href={`/${decodedSlug}/owner/scan`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
            >
              <ScanLine className="h-4 w-4" />
              <span className="hidden sm:inline">Scanner</span>
            </Link>
            <Link
              href={`/${decodedSlug}/owner/activity`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
            >
              <ActivitySquare className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </Link>
            <Link
              href={`/${decodedSlug}/owner/settings`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  )
}

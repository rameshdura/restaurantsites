"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Download } from "lucide-react"

interface SiteBuilderHeaderProps {
  showBack?: boolean
  downloadAll?: () => void
  siteName?: string
}

export function SiteBuilderHeader({
  showBack = true,
  downloadAll,
  siteName,
}: SiteBuilderHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to homepage">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <h1 className="text-xl font-bold">
            Site Builder{" "}
            {siteName && (
              <span className="font-normal text-muted-foreground">
                - {siteName}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sitebuilder/validator">JSON Validator</Link>
          </Button>
          {downloadAll && (
            <Button onClick={downloadAll} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

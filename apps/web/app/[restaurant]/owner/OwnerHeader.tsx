"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CreditCard,
  ActivitySquare,
  Utensils,
  Settings,
  ChefHat,
  Globe,
  Menu,
  X,
  HandPlatter,
  ShoppingBag,
  Puzzle,
  Calendar,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface OwnerHeaderProps {
  decodedSlug: string
}

export function OwnerHeader({ decodedSlug }: OwnerHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: `/${decodedSlug}/owner/tables`, label: "Tables", icon: Utensils },
    { href: `/${decodedSlug}/owner/kitchen`, label: "Kitchen", icon: ChefHat },
    {
      href: `/${decodedSlug}/owner/orders`,
      label: "Server",
      icon: HandPlatter,
    },
    {
      href: `/${decodedSlug}/owner/takeout`,
      label: "Takeout",
      icon: ShoppingBag,
    },
    {
      href: `/${decodedSlug}/owner/bookings`,
      label: "Bookings",
      icon: Calendar,
    },
    { href: `/${decodedSlug}/owner/pay`, label: "Pay", icon: CreditCard },

    {
      href: `/${decodedSlug}/owner/activity`,
      label: "Activity",
      icon: ActivitySquare,
    },
    {
      href: `/${decodedSlug}/owner/settings`,
      label: "Settings",
      icon: Settings,
    },
    {
      href: `/${decodedSlug}/owner/apps`,
      label: "Apps",
      icon: Puzzle,
    },
  ]

  const currentLink = navLinks.find(
    (link) => pathname === link.href || pathname.startsWith(link.href + "/")
  )

  let pageTitle = currentLink?.label
  if (!pageTitle) {
    const parts = pathname.split("/")
    const lastPart = parts[parts.length - 1]
    if (lastPart && lastPart !== "owner" && lastPart !== decodedSlug) {
      pageTitle = lastPart
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    } else {
      pageTitle = "Dashboard"
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo & Site Icon */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${decodedSlug}/owner/tables`}
              className="flex items-center transition-opacity hover:opacity-80"
              title="Dashboard Home"
            >
              <Utensils className="h-6 w-6 text-primary" />
            </Link>

            <div className="h-6 w-px bg-border" aria-hidden="true" />

            <a
              href={`/${decodedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground transition-colors hover:text-primary"
              title="View Public Site"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-tight">
            {pageTitle}
          </div>

          {/* Right: Navigation (Hamburger Menu) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Menu Right Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-72 animate-in flex-col border-l border-border bg-background shadow-xl duration-200 slide-in-from-right">
            {/* Sidebar Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
              <span className="text-lg font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="-mr-2 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <a
                  href={`/${decodedSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Globe className="h-5 w-5" />
                  View Site
                </a>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}

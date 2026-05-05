"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Heart } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import { useRestaurantLink } from "@workspace/ui/hooks/use-restaurant-link"
import { getTranslations } from "@/lib/i18n"

type LocalTranslations = ReturnType<typeof getTranslations>

interface FooterProps {
  restaurantName: string
  restaurantSlug: string
  translations?: LocalTranslations
}

export function Footer({ restaurantName, translations }: FooterProps) {
   const [mounted, setMounted] = useState(false)
   const { setTheme, resolvedTheme } = useTheme()
   const { getLink } = useRestaurantLink()

   useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setMounted(true)
   }, [])

   const isDark = resolvedTheme === "dark"
   const t = translations?.footer || { companyInformation: "Company Information" }

  return (
    <footer className="py-6 border-t text-center text-xs text-muted-foreground bg-background">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
<Link 
           href={getLink("/company-information")}
           className="hover:text-primary transition-colors duration-200"
         >
           {t.companyInformation}
         </Link>
        <span className="hidden md:inline text-border">|</span>
        <div className="flex items-center gap-2">
          &copy; {new Date().getFullYear()} {restaurantName}
           <Link
             href={getLink("/brand")}
             className="hover:scale-110 inline-block transition-transform duration-200 text-foreground/60 hover:text-foreground"
             title="View Brand Assets"
           >
              <HugeiconsIcon icon={Heart} size={18} />
           </Link>
          <span className="text-border">|</span>
          <span>Dark Mode</span>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              mounted && isDark ? "bg-primary" : "bg-muted"
            )}
            role="switch"
            aria-checked={mounted ? isDark : false}
            aria-label="Toggle dark mode"
          >
            <span
              className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                mounted && isDark ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </footer>
  )
}
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Call02Icon,
  GlobalIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"
import { buttonVariants } from "./button"
import { useRestaurantLink } from "../hooks/use-restaurant-link"

// Google Translate types
interface GoogleTranslateTranslateElement {
  InlineLayout: { SIMPLE: number }
  new (
    options: {
      pageLanguage: string
      includedLanguages: string
      layout: number
      autoDisplay: boolean
    },
    elementId: string
  ): void
}

interface GoogleTranslate {
  translate: {
    TranslateElement: GoogleTranslateTranslateElement
  }
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: GoogleTranslate
  }
}

function setGoogleTranslateCookie(langCode: string) {
  const date = new Date()
  date.setTime(date.getTime() + 24 * 60 * 60 * 1000)
  document.cookie = `googtrans=/en/${langCode}; path=/; expires=${date.toUTCString()}`
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; expires=${date.toUTCString()}`
}

interface NavbarProps {
  restaurant: {
    name: string
    logo?: string
    phone?: string
    contact?: {
      phone?: string
    }
    gallery?: string[]
    about?: {
      title?: string
      content?: string
      image?: string
    }
  }
  translations?: NavbarTranslations
}

interface NavbarTranslations {
  navbar?: {
    home?: string
    menu?: string
    about?: string
    gallery?: string
    contact?: string
    callUs?: string
    followUs?: string
  }
}

const languages = [
  { code: "default", name: "Default" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "zh-CN", name: "简体中文" },
  { code: "ja", name: "日本語" },
  { code: "ne", name: "नेपाली" },
]

export function Navbar({ restaurant, translations }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  
  const [langTransitionState, setLangTransitionState] = React.useState<"idle" | "in" | "out" | "covering">("idle")
  const [targetLangName, setTargetLangName] = React.useState("")

  const getInitialLang = () => {
    if (typeof document === "undefined") return "default"
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return undefined
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
    }
    const savedLang = getCookie("googtrans")
    if (savedLang) {
      const lang = savedLang.split("/").pop()
      if (lang) return lang
    }
    return "default"
  }

  const [currentLang, setCurrentLang] = React.useState("default")

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentLang(getInitialLang())
    
    // Check for pending language transition from a reload
    const savedLangName = sessionStorage.getItem("lang-transition-name")
    if (savedLangName) {
      setTargetLangName(savedLangName)
      setLangTransitionState("covering")
      sessionStorage.removeItem("lang-transition-name")
      
      const timer1 = setTimeout(() => {
        setLangTransitionState("out")
      }, 2000)
      
      const timer2 = setTimeout(() => {
        setLangTransitionState("idle")
      }, 2700)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [])
  const pathname = usePathname()
  const langDropdownRef = React.useRef<HTMLDivElement>(null)
  
  const { getLink, slug } = useRestaurantLink()
  const isHomePage = pathname === `/${slug}` || (pathname === "/" && slug !== "")

  const phone = restaurant.contact?.phone || restaurant.phone

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdowns on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Google Translate Logic
  React.useEffect(() => {
    // Ensure the translate element exists outside React's lifecycle
    if (!document.getElementById("google_translate_element")) {
      const gtDiv = document.createElement("div")
      gtDiv.id = "google_translate_element"
      gtDiv.style.display = "none"
      document.body.appendChild(gtDiv)
    }

    // Prevent multiple script injections
    if (document.getElementById("google-translate-script")) {
      return
    }

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    window.googleTranslateElementInit = () => {
      // Prevent multiple initializations
      if (document.querySelector(".goog-te-combo")) {
        return
      }
      
      try {
        new window.google!.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages
              .filter((l) => l.code !== "default")
              .map((l) => l.code)
              .join(","),
            autoDisplay: false,
            layout: 0,
          },
          "google_translate_element"
        )
      } catch (e) {
        console.error("Google Translate init error:", e)
      }
    }
  }, [])

  const changeLanguage = (langCode: string) => {
    const langName = languages.find((l) => l.code === langCode)?.name || "Language"
    setIsLangOpen(false)
    setTargetLangName(langName)
    setLangTransitionState("in")

    setTimeout(() => {
      let needsReload = true

      try {
        if (langCode === "default") {
          // Delete Google Translate cookie to revert to browser default
          document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
          document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
          
          // Force a full reload for default to ensure DOM is perfectly reset
          needsReload = true
        } else {
          setGoogleTranslateCookie(langCode)

          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
          if (select) {
            select.value = langCode
            select.dispatchEvent(new Event('change'))
            needsReload = false
          }
        }
      } catch (e) {
        console.error("Translation error:", e)
      }

      if (needsReload) {
        sessionStorage.setItem("lang-transition-name", langName)
        window.location.reload()
      } else {
        setTimeout(() => {
          setLangTransitionState("out")

          // Reset to idle after animation
          setTimeout(() => {
            setLangTransitionState("idle")
            setCurrentLang(langCode) // Defer state update to prevent React reconciliation crashes
          }, 700)
        }, 2000)
      }
    }, 700) // Wait for slide up animation
  }

  const navLinks = [
    { name: translations?.navbar?.home || "Home", href: getLink("/") },
    { name: translations?.navbar?.menu || "Menu", href: getLink("/menu") },
    { name: translations?.navbar?.about || "About", href: getLink("/about"), show: !!restaurant.about },
    {
      name: translations?.navbar?.gallery || "Gallery",
      href: isHomePage ? "#gallery" : getLink("#gallery"),
      show: !!restaurant.gallery && restaurant.gallery.length > 0,
    },
    { name: translations?.navbar?.contact || "Contact", href: getLink("/contact") },
  ].filter((link) => link.show !== false)

  return (
    <>
      {/* Hide Google Translate UI elements */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .goog-te-banner-frame, 
        .goog-te-balloon-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame.skiptranslate,
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        body {
          top: 0 !important;
        }
        #google_translate_element {
          display: none !important;
        }
        .skiptranslate {
          display: none !important;
        }
        .skiptranslate.goog-te-gadget {
            display: none !important;
        }
        /* Hide the new Google Translate floating mobile widget and iframes */
        div[id^="goog-gt-"] {
          display: none !important;
        }
        div[class^="VIpgJd-"] {
          display: none !important;
        }
        iframe[src*="translate.googleapis.com"] {
          display: none !important;
        }
      `,
        }}
      />

      <nav
        className={cn(
          "fixed top-0 right-0 left-0 z-50 border-b transition-all duration-500",
          isScrolled
            ? "border-border bg-background/90 py-3 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-transparent py-6"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo / Name */}
            <Link href={getLink("/")} className="group flex items-center gap-2">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-primary transition-opacity group-hover:opacity-80">
                  {restaurant.name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group/link relative text-[15px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover/link:w-full" />
                </Link>
              ))}
            </div>

            {/* Contact & Language & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="notranslate flex items-center gap-2 rounded-full border border-border/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50"
                  translate="no"
                >
                  <HugeiconsIcon icon={GlobalIcon} className="size-4" />
                  <span className="hidden sm:inline">
                    {languages.find((l) => l.code === currentLang)?.name || "Language"}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn(
                      "size-3 transition-transform",
                      isLangOpen && "rotate-180"
                    )}
                  />
                </button>

                {isLangOpen && (
                  <div
                    className="notranslate absolute top-full right-0 z-60 mt-2 w-48 animate-in overflow-hidden rounded-2xl border border-border bg-background shadow-2xl duration-200 fade-in slide-in-from-top-2"
                    translate="no"
                  >
                    <div className="max-h-[300px] overflow-y-auto py-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent",
                            currentLang === lang.code
                              ? "bg-primary/5 font-bold text-primary"
                              : "text-foreground"
                          )}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "hidden items-center gap-2 rounded-full shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105 active:scale-95 sm:flex"
                  )}
                >
                  <HugeiconsIcon icon={Call02Icon} className="size-4" />
                  <span className="hidden font-semibold lg:inline">
                    {phone}
                  </span>
                  <span className="text-xs font-semibold lg:hidden">Call</span>
                </a>
              )}

              <button
                className="rounded-full p-2 text-foreground transition-colors hover:bg-accent focus:outline-none md:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu} className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-100 transition-opacity duration-300 md:hidden",
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={cn(
            "absolute top-0 right-0 flex h-full w-[85%] max-w-[320px] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-500 ease-out",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b p-6">
            <span className="text-lg font-bold">{restaurant.name}</span>
            <button
              className="rounded-full p-2 text-foreground transition-colors hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={X} className="size-6" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
<div className="flex flex-col gap-4">
               {navLinks.map((link) => (
                 <Link
                   key={link.name}
                   href={link.href}
                   className="group flex items-center justify-between text-2xl font-semibold text-foreground transition-colors hover:text-primary"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   {link.name}
                   <span className="h-2 w-2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                 </Link>
               ))}
             </div>

             <div className="mt-auto flex flex-col gap-4 border-t pt-10">
               {phone && (
                 <a
                   href={`tel:${phone}`}
                   className={cn(
                     buttonVariants({ variant: "default", size: "lg" }),
                     "w-full justify-center gap-3 rounded-2xl shadow-xl shadow-primary/20"
                   )}
                 >
                   <HugeiconsIcon icon={Call02Icon} className="size-5" />
                   {translations?.navbar?.callUs || "Call Us Now"}
                 </a>
               )}
               <p className="text-center text-xs text-muted-foreground">
                 {translations?.navbar?.followUs || "Follow us on social media for updates!"}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Language Transition Overlay */}
      <div
        className={cn(
          "notranslate fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary text-primary-foreground",
          langTransitionState === "idle" && "translate-y-full transition-none",
          langTransitionState === "in" && "translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          langTransitionState === "covering" && "translate-y-0 transition-none",
          langTransitionState === "out" && "-translate-y-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
        translate="no"
      >
        <div className="flex flex-col items-center gap-6">
          <HugeiconsIcon icon={GlobalIcon} className="size-16 animate-pulse" />
          <span className="text-4xl font-bold tracking-tight md:text-5xl">{targetLangName}</span>
          <span className="text-sm font-medium opacity-80 md:text-base">Changing Language...</span>
        </div>
      </div>
    </>
  )
}

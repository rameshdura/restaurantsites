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
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}; expires=${date.toUTCString()}`
}

function removeGoogleTranslateCookie() {
  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
  if (typeof window !== "undefined") {
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
    document.cookie = `googtrans=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
  }
}

// Use our own cookie to track the user's language preference instead of
// relying on Google's `googtrans` cookie. This decouples selection state
// from the Google Translate script so we can defer script loading.
function setSiteLangCookie(langCode: string) {
  const date = new Date()
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
  document.cookie = `site_lang=${langCode}; path=/; expires=${date.toUTCString()}`
  document.cookie = `site_lang=${langCode}; path=/; domain=${window.location.hostname}; expires=${date.toUTCString()}`
  document.cookie = `site_lang=${langCode}; path=/; domain=.${window.location.hostname}; expires=${date.toUTCString()}`
}

function removeSiteLangCookie() {
  document.cookie = "site_lang=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
  if (typeof window !== "undefined") {
    document.cookie = `site_lang=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
    document.cookie = `site_lang=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
  }
}

function getInitialLang(defaultLanguage?: string): string {
  if (typeof document === "undefined") return defaultLanguage || "default"
  const value = `; ${document.cookie}`
  const parts = value.split("; site_lang=")
  if (parts.length === 2) {
    const lang = parts.pop()?.split(";").shift()
    if (lang) return lang
  }
  return defaultLanguage || "default"
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
    showStores?: boolean
  }
  translations?: NavbarTranslations
  defaultLanguage?: string // e.g., "EN", "JA"
}

interface NavbarTranslations {
  navbar?: {
    home?: string
    menu?: string
    about?: string
    gallery?: string
    contact?: string
    stores?: string
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

export function Navbar({
  restaurant,
  translations,
  defaultLanguage,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)

  const [langTransitionState, setLangTransitionState] = React.useState<
    "idle" | "in" | "out" | "covering"
  >("idle")
  const [targetLangName, setTargetLangName] = React.useState("")

  const [currentLang, setCurrentLang] = React.useState("default")

  // useLayoutEffect fires synchronously after DOM mutations but BEFORE the
  // browser paints. This lets us read sessionStorage and switch to "covering"
  // state before the user ever sees a frame without the curtain — eliminating
  // the flicker without causing a hydration mismatch (since the server and
  // initial client state both start as "idle" / "").
  React.useLayoutEffect(() => {
    const savedLangName = sessionStorage.getItem("lang-transition-name")
    if (savedLangName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetLangName(savedLangName)
      setLangTransitionState("covering")
      sessionStorage.removeItem("lang-transition-name")
    }
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentLang(getInitialLang(defaultLanguage))

    // If we're in "covering" state (set by layoutEffect above), schedule
    // the curtain exit animation.
    if (langTransitionState === "covering") {
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
  }, [defaultLanguage, langTransitionState])
  const pathname = usePathname()
  const langDropdownRef = React.useRef<HTMLDivElement>(null)
  const { getLink, slug } = useRestaurantLink()
  const isHomePage =
    pathname === `/${slug}` || (pathname === "/" && slug !== "")

  const phone = restaurant.contact?.phone || restaurant.phone

  // Helper to get language display name (case-insensitive)
  const getLanguageName = (code: string): string => {
    const lowerCode = code.toLowerCase()
    return (
      languages.find((l) => l.code.toLowerCase() === lowerCode)?.name ||
      "Language"
    )
  }

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

  // Google Translate — only loaded when a non-default language is active.
  // This keeps the script entirely off the critical path for default-language
  // visitors, avoiding Lighthouse and Core Web Vitals penalties.
  React.useEffect(() => {
    const lang = getInitialLang(defaultLanguage)
    if (lang === "default") return // No script needed for default language

    // A non-default language was previously selected — load Google Translate
    // so it can apply the translation. The googtrans cookie tells Google
    // which language to translate into once the widget initialises.
    setGoogleTranslateCookie(lang)

    // Ensure the hidden container exists
    if (!document.getElementById("google_translate_element")) {
      const gtDiv = document.createElement("div")
      gtDiv.id = "google_translate_element"
      gtDiv.style.display = "none"
      document.body.appendChild(gtDiv)
    }

    // Prevent multiple script injections
    if (document.getElementById("google-translate-script")) return

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true

    window.googleTranslateElementInit = () => {
      if (document.querySelector(".goog-te-combo")) return

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

    document.body.appendChild(script)
  }, [defaultLanguage])

  const changeLanguage = (langCode: string) => {
    const langName = getLanguageName(langCode)
    setIsLangOpen(false)
    setTargetLangName(langName)
    setLangTransitionState("in")

    setTimeout(() => {
      try {
        if (langCode === "default") {
          // Clear both our tracking cookie and Google's cookie
          removeSiteLangCookie()
          removeGoogleTranslateCookie()

          // Full reload to reset the DOM (removes all Google Translate artefacts)
          sessionStorage.setItem("lang-transition-name", langName)
          window.location.reload()
          return
        }

        // Persist the user's choice in our own cookie
        setSiteLangCookie(langCode)
        // Also set Google's cookie so the widget auto-translates on load
        setGoogleTranslateCookie(langCode)

        // If the Google Translate widget is already loaded, use it directly
        const select = document.querySelector(
          ".goog-te-combo"
        ) as HTMLSelectElement
        if (select) {
          select.value = langCode
          select.dispatchEvent(new Event("change"))

          setTimeout(() => {
            setLangTransitionState("out")

            // Reset to idle after animation
            setTimeout(() => {
              setLangTransitionState("idle")
              setCurrentLang(langCode) // Defer state update to prevent React reconciliation crashes
            }, 700)
          }, 2000)
        } else {
          // Script not loaded yet — reload so the useEffect picks up the
          // cookie and loads Google Translate with the right language.
          sessionStorage.setItem("lang-transition-name", langName)
          window.location.reload()
        }
      } catch (e) {
        console.error("Translation error:", e)
        sessionStorage.setItem("lang-transition-name", langName)
        window.location.reload()
      }
    }, 700) // Wait for slide-up animation
  }

  const navLinks = [
    { name: translations?.navbar?.home || "Home", href: getLink("/") },
    { name: translations?.navbar?.menu || "Menu", href: getLink("/menu") },
    {
      name: translations?.navbar?.about || "About",
      href: getLink("/about"),
      show: !!restaurant.about,
    },
    {
      name: translations?.navbar?.stores || "Our Stores",
      href: getLink("/stores"),
      show: !!restaurant.showStores,
    },
    {
      name: translations?.navbar?.gallery || "Gallery",
      href: isHomePage ? "#gallery" : getLink("#gallery"),
      show: !!restaurant.gallery && restaurant.gallery.length > 0,
    },
    {
      name: translations?.navbar?.contact || "Contact",
      href: getLink("/contact"),
    },
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
                  width={160}
                  height={40}
                  className={cn(
                    "h-10 w-auto object-contain transition-all duration-300",
                    !isScrolled && "brightness-0 invert"
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "text-2xl font-bold tracking-tight transition-all duration-300 group-hover:opacity-80",
                    isScrolled ? "text-primary" : "text-white"
                  )}
                >
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
                  className={cn(
                    "group/link relative text-[15px] font-medium transition-colors",
                    isScrolled
                      ? "text-muted-foreground hover:text-primary"
                      : "text-white/90 hover:text-primary"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover/link:w-full",
                      "bg-primary"
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* Contact & Language & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={cn(
                    "notranslate flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
                    isScrolled
                      ? "border-border/50 bg-background text-foreground hover:bg-accent/50"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  )}
                  aria-label={`Select language ${getLanguageName(currentLang)}`}
                  translate="no"
                >
                  <HugeiconsIcon icon={GlobalIcon} className="size-4" />
                  <span className="hidden sm:inline">
                    {getLanguageName(currentLang)}
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
                            currentLang.toLowerCase() ===
                              lang.code.toLowerCase()
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
                    buttonVariants({
                      variant: isScrolled ? "default" : "outline",
                      size: "sm",
                    }),
                    "hidden items-center gap-2 rounded-full shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 sm:flex",
                    !isScrolled &&
                      "border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20"
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
                className={cn(
                  "rounded-full p-2 transition-colors focus:outline-none md:hidden",
                  isScrolled
                    ? "text-foreground hover:bg-accent"
                    : "text-white hover:bg-white/20"
                )}
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
                {translations?.navbar?.followUs ||
                  "Follow us on social media for updates!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Transition Overlay */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "notranslate fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary text-primary-foreground",
          langTransitionState === "idle" &&
            "pointer-events-none -translate-y-full transition-none",
          langTransitionState === "in" &&
            "pointer-events-auto translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          langTransitionState === "covering" &&
            "pointer-events-none translate-y-0 transition-none",
          langTransitionState === "out" &&
            "pointer-events-none -translate-y-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
        translate="no"
      >
        <div className="flex flex-col items-center gap-6" aria-hidden="true">
          <HugeiconsIcon icon={GlobalIcon} className="size-16 animate-pulse" />
          <span className="text-4xl font-bold tracking-tight md:text-5xl">
            {targetLangName}
          </span>
          <span className="text-sm font-medium opacity-80 md:text-base">
            Changing Language...
          </span>
        </div>
      </div>
    </>
  )
}

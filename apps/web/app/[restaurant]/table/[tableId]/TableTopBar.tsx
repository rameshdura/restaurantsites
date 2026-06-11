"use client"

import * as React from "react"
import { GlobalIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"
import { UserPlus } from "lucide-react"

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

function setSiteLangCookie(langCode: string) {
  const date = new Date()
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
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

interface TableTopBarProps {
  restaurantName: string
  logoUrl: string | null
  tableLabel: string
  defaultLanguage?: string
  showLeaveTable: boolean
  isLeaving: boolean
  onLeaveTable: () => void
  onShareTable?: () => void
}

export function TableTopBar({
  restaurantName,
  logoUrl,
  tableLabel,
  defaultLanguage,
  showLeaveTable,
  isLeaving,
  onLeaveTable,
  onShareTable,
}: TableTopBarProps) {
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  const [langTransitionState, setLangTransitionState] = React.useState<
    "idle" | "in" | "out" | "covering"
  >("idle")
  const [targetLangName, setTargetLangName] = React.useState("")
  const [currentLang, setCurrentLang] = React.useState("default")
  const langDropdownRef = React.useRef<HTMLDivElement>(null)

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

  React.useEffect(() => {
    const lang = getInitialLang(defaultLanguage)
    if (lang === "default") return

    setGoogleTranslateCookie(lang)

    if (!document.getElementById("google_translate_element")) {
      const gtDiv = document.createElement("div")
      gtDiv.id = "google_translate_element"
      gtDiv.style.display = "none"
      document.body.appendChild(gtDiv)
    }

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

  const getLanguageName = (code: string): string => {
    const lowerCode = code.toLowerCase()
    return (
      languages.find((l) => l.code.toLowerCase() === lowerCode)?.name ||
      "Language"
    )
  }

  const changeLanguage = (langCode: string) => {
    const langName = getLanguageName(langCode)
    setIsLangOpen(false)
    setTargetLangName(langName)
    setLangTransitionState("in")

    setTimeout(() => {
      try {
        if (langCode === "default") {
          removeSiteLangCookie()
          removeGoogleTranslateCookie()

          sessionStorage.setItem("lang-transition-name", langName)
          window.location.reload()
          return
        }

        setSiteLangCookie(langCode)
        setGoogleTranslateCookie(langCode)

        const select = document.querySelector(
          ".goog-te-combo"
        ) as HTMLSelectElement
        if (select) {
          select.value = langCode
          select.dispatchEvent(new Event("change"))

          setTimeout(() => {
            setLangTransitionState("out")

            setTimeout(() => {
              setLangTransitionState("idle")
              setCurrentLang(langCode)
            }, 700)
          }, 2000)
        } else {
          sessionStorage.setItem("lang-transition-name", langName)
          window.location.reload()
        }
      } catch (e) {
        console.error("Translation error:", e)
        sessionStorage.setItem("lang-transition-name", langName)
        window.location.reload()
      }
    }, 700)
  }

  return (
    <>
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

      <header className="relative z-40 flex h-16 w-full items-center justify-between border-b border-border bg-transparent px-4 sm:px-6">
        {/* Left Side: Logo, Site Name, Table Label, Separator, Language Switcher */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {logoUrl && (
            <div className="hidden shrink-0 overflow-hidden rounded-md border border-primary/20 bg-primary/5 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={restaurantName}
                className="h-8 w-8 object-cover"
              />
            </div>
          )}
          <span className="hidden truncate text-lg font-bold tracking-tight text-foreground sm:inline">
            {restaurantName}
          </span>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {tableLabel.toLowerCase().includes("table")
              ? tableLabel
              : `Table ${tableLabel}`}
          </div>

          <div className="mx-1 hidden h-5 w-px shrink-0 bg-border/60 sm:block" />

          {/* Language Switcher */}
          <div className="relative shrink-0" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="notranslate flex h-9 items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-accent/50"
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
                className="notranslate absolute top-full left-0 z-60 mt-2 w-48 animate-in overflow-hidden rounded-2xl border border-border bg-background shadow-2xl duration-200 fade-in slide-in-from-top-2"
                translate="no"
              >
                <div className="max-h-[300px] overflow-y-auto py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent",
                        currentLang.toLowerCase() === lang.code.toLowerCase()
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
        </div>

        {/* Right Side: Leave Table & Share Button */}
        <div className="flex items-center gap-2">
          {onShareTable && (
            <button
              onClick={onShareTable}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20 active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Friend</span>
            </button>
          )}
          {showLeaveTable && (
            <button
              onClick={onLeaveTable}
              disabled={isLeaving}
              className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLeaving ? "Leaving..." : "Leave"}
            </button>
          )}
        </div>
      </header>

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

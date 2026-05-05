"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react"
import {
  Location01Icon,
  CallIcon,
  Mail01Icon,
  Clock01Icon,
  SentIcon,
  InstagramIcon,
  Facebook01Icon,
  TwitterIcon,
  UserIcon,
  Message01Icon,
  ArrowDown01Icon,
  MapsCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "./button"
import { SectionHeader } from "./section-header"
import { useTheme } from "next-themes"

interface ContactDetailProps {
  icon: IconSvgElement
  title: string
  description: string
  subDescription?: React.ReactNode
}

function ContactDetail({
  icon,
  title,
  description,
  subDescription,
}: ContactDetailProps) {
  return (
    <div className="group flex items-start gap-5 transition-all">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:border-primary/40">
        <HugeiconsIcon icon={icon} size={22} />
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold tracking-wider text-muted-foreground/60 uppercase">
          {title}
        </h3>
        <p className="font-semibold text-foreground">{description}</p>
        {subDescription && (
          <div className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline">
            {subDescription}
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleRow({
  item,
  isLast = false,
}: {
  item: {
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
  }
  isLast?: boolean
}) {
  const times = [item.lunch, item.dinner].filter(Boolean).join(", ")

  return (
    <div
      className={`group relative z-10 -mx-2 flex cursor-default items-center justify-between px-2 py-5 transition-all duration-300 hover:bg-primary/5 ${!isLast ? "border-b border-border/40" : ""}`}
    >
      <span className="text-sm font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">
        {item.day}
      </span>
      <span className="text-lg font-medium tracking-tight text-foreground/90 italic">
        {times}
      </span>
    </div>
  )
}

interface ContactTranslations {
  contact?: {
    subtitle?: string
    title?: string
    sectionTitle?: string
    description?: React.ReactNode
    backgroundTitle?: string
    location?: string
    getDirections?: React.ReactNode
    phone?: string
    availableHours?: string
    email?: string
    generalReservations?: string
    hours?: string
    hoursComingSoon?: string
    holidayNotice?: string
    serviceHours?: string
    serviceHoursDescription?: string
    requestReservation?: string
    success?: string
    sendError?: string
    error?: string
    privacyAgreement?: string
    privacyPolicy?: string
    followUs?: string
    googleMaps?: string
    findUs?: string
    openGoogleMap?: string
    subjectPlaceholder?: string
    subjectReservation?: string
    subjectEvent?: string
    subjectFeedback?: string
    subjectOther?: string
    yourName?: string
    emailAddress?: string
    subject?: string
    yourMessage?: string
    processing?: string
    sendMessage?: string
  }
}

export function ContactSection({
  hideHeader = false,
  address,
  phone,
  email,
  hours,
  location,
  embedUrl,
  isHomePage = false,
  restaurantSlug,
  openingHours = [],
  holidayNotes,
   restaurantName,
   translations,
}: {
  hideHeader?: boolean
  address?: string
  phone?: string
  email?: string
  hours?: string
  location?: {
    lat: number
    lng: number
    mapsUrl?: string
    address?: string
  }
  embedUrl?: string | null
  isHomePage?: boolean
  restaurantSlug?: string
  openingHours?: {
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
  }[]
   holidayNotes?: string
   restaurantName?: string
   translations?: ContactTranslations
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)

    const formData = new FormData(form)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      restaurantEmail: email,
      restaurantName: restaurantName || restaurantSlug,
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        alert(translations?.contact?.success || "Message sent! We'll get back to you soon.")
        form.reset()
      } else {
        const errorData = await response.json()
        alert(errorData.error || translations?.contact?.sendError || "Failed to send message. Please try again later.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(translations?.contact?.error || "An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-background py-20"
      id="contact"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-primary/10 blur-3xl" />

       <div className="relative z-10 mx-auto max-w-7xl px-6">
        {!hideHeader && (
            <SectionHeader
              subtitle={translations?.contact?.subtitle || "Our Contacts"}
              title={translations?.contact?.title || "Get in Touch"}
              description={
                translations?.contact?.description || (
                  <>
                    Have a question or want to book a private event? We&apos;d love
                    to hear from you. Reach out through the form or our direct
                    contact details.
                  </>
                )
              }
              backgroundTitle={translations?.contact?.backgroundTitle || "Contact"}
              align="center"
              className="mb-12 lg:mb-16"
            />
          )}
 
           <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
             {/* Contact Details */}
             <div className="space-y-8">
                <h3 className="mb-2 text-3xl font-black tracking-tight">
                  {translations?.contact?.sectionTitle || "Contact"}
                </h3>
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
               <ContactDetail
                 icon={Location01Icon}
                 title={translations?.contact?.location || "Location"}
                 description={
                   address || "1420 Napa Valley Hwy, St. Helena, CA 94574"
                 }
                 subDescription={
                   location?.mapsUrl ? (
                     <a
                       href={location.mapsUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="transition-colors hover:text-primary"
                     >
                       {translations?.contact?.getDirections || "Get Directions →"}
                     </a>
                   ) : (
                     translations?.contact?.getDirections || "Get Directions →"
                   )
                 }
               />
               <ContactDetail
                 icon={CallIcon}
                 title={translations?.contact?.phone || "Phone"}
                 description={phone || "+1 (707) 555-0199"}
                 subDescription={translations?.contact?.availableHours || "Available 11 AM - 10 PM daily"}
               />
               <ContactDetail
                 icon={Mail01Icon}
                 title={translations?.contact?.email || "Email"}
                 description={email || "reservations@oakandhearth.com"}
                 subDescription={translations?.contact?.generalReservations || "General & Reservations"}
               />
               {!isHomePage && (
                 <ContactDetail
                   icon={Clock01Icon}
                   title={translations?.contact?.hours || "Hours"}
                   description={hours || "Tue - Sat: 5:00 PM - 10:30 PM"}
                   subDescription={
                     hours
                       ? undefined
                       : "Sun: 11:00 AM - 3:00 PM / 5:00 PM - 10:00 PM"
                   }
                 />
               )}
               {location?.mapsUrl && (
                 <ContactDetail
                   icon={MapsCircle02Icon}
                   title={translations?.contact?.googleMaps || "Google Maps"}
                   description={translations?.contact?.findUs || "Find us on Google Maps"}
                   subDescription={
                     <a
                       href={location.mapsUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="transition-colors hover:text-primary"
                     >
                       {translations?.contact?.openGoogleMap || "Open Google Map →"}
                     </a>
                   }
                 />
               )}
            </div>

            {/* Social Links */}
            <div className="border-t border-border/40 pt-8">
              <h4 className="mb-6 text-xs font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
                {translations?.contact?.followUs || "Follow Us"}
              </h4>
              <div className="flex gap-5">
                {[
                  { icon: InstagramIcon, label: "Instagram" },
                  { icon: Facebook01Icon, label: "Facebook" },
                  { icon: TwitterIcon, label: "Twitter" },
                ].map((social, i) => (
                  <button
                    key={i}
                    className="group relative flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-all hover:scale-110 hover:border-primary/40 hover:bg-primary hover:text-white"
                    aria-label={social.label}
                  >
                    <HugeiconsIcon
                      icon={social.icon}
                      size={22}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isHomePage ? (
            <div className="group relative h-full">
              <div className="relative flex h-full flex-col">
                <div className="relative z-10 mb-10">
                  <h3 className="mb-2 text-3xl font-black tracking-tight">
                    {translations?.contact?.serviceHours || "Service Hours"}
                  </h3>
                  <p className="text-muted-foreground/80">
                    {translations?.contact?.serviceHoursDescription || "Join us for an unforgettable dining experience during our business hours."}
                  </p>
                </div>

                <div className="relative z-10 mb-10 flex flex-1 flex-col justify-center">
                  {openingHours.length > 0 ? (
                    openingHours.map((item, idx) => (
                      <ScheduleRow
                        key={idx}
                        item={item}
                        isLast={idx === openingHours.length - 1}
                      />
                    ))
                   ) : (
                     <div className="py-8 text-center text-muted-foreground">
                       {translations?.contact?.hoursComingSoon || "Hours coming soon..."}
                     </div>
                   )}
                </div>

                {holidayNotes && (
                  <div className="relative z-10 mb-8 rounded-2xl bg-primary/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0 text-primary">
                        <HugeiconsIcon icon={InformationCircleIcon} size={20} />
                      </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold tracking-widest text-primary uppercase">
                            {translations?.contact?.holidayNotice || "Holiday Notice"}
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground/90">
                            {holidayNotes}
                          </p>
                        </div>
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className="h-16 w-full rounded-2xl text-lg font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Link
                    href={`/${restaurantSlug}/contact`}
                    className="flex items-center justify-center gap-3"
                  >
                    {translations?.contact?.requestReservation || "Request Reservation"}
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={22}
                      className="-rotate-90"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="relative flex flex-col">
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 space-y-6"
                >
<div className="grid gap-6 sm:grid-cols-2">
                     <div className="space-y-2.5">
                       <label
                         htmlFor="name"
                         className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase"
                       >
                         {translations?.contact?.yourName || "Your Name"}
                       </label>
                       <div className="group/input relative">
                         <input
                           id="name"
                           name="name"
                           type="text"
                           required
                           placeholder={translations?.contact?.yourName ? undefined : "John Doe"}
                           className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pr-4 pl-12 transition-all outline-none placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/5"
                         />
                         <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within/input:text-primary">
                           <HugeiconsIcon icon={UserIcon} size={20} />
                         </div>
                       </div>
                     </div>
                     <div className="space-y-2.5">
                       <label
                         htmlFor="email"
                         className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase"
                       >
                         {translations?.contact?.emailAddress || "Email Address"}
                       </label>
                       <div className="group/input relative">
                         <input
                           id="email"
                           name="email"
                           type="email"
                           required
                           placeholder={translations?.contact?.emailAddress ? undefined : "john@example.com"}
                           className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pr-4 pl-12 transition-all outline-none placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/5"
                         />
                         <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within/input:text-primary">
                           <HugeiconsIcon icon={Mail01Icon} size={20} />
                         </div>
                       </div>
                     </div>
                   </div>

<div className="space-y-2.5">
                     <label
                       htmlFor="subject"
                       className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase"
                     >
                       {translations?.contact?.subject || "Subject"}
                     </label>
                     <div className="group/input relative">
                       <select
                         id="subject"
                         name="subject"
                         required
                         defaultValue=""
                         className="w-full appearance-none rounded-2xl border border-white/5 bg-white/5 py-4 pr-12 pl-12 transition-all outline-none focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/5"
                       >
                         <option
                           value=""
                           disabled
                           className="bg-[#1a1a1a] text-foreground"
                         >
                           {translations?.contact?.subjectPlaceholder || "Select a subject"}
                         </option>
                         <option
                           value="reservation"
                           className="bg-[#1a1a1a] text-foreground"
                         >
                           {translations?.contact?.subjectReservation || "Reservation Inquiry"}
                         </option>
                         <option
                           value="event"
                           className="bg-[#1a1a1a] text-foreground"
                         >
                           {translations?.contact?.subjectEvent || "Private Event"}
                         </option>
                         <option
                           value="feedback"
                           className="bg-[#1a1a1a] text-foreground"
                         >
                           {translations?.contact?.subjectFeedback || "Feedback"}
                         </option>
                         <option
                           value="other"
                           className="bg-[#1a1a1a] text-foreground"
                         >
                           {translations?.contact?.subjectOther || "Other"}
                         </option>
                       </select>
                       <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within/input:text-primary">
                         <HugeiconsIcon icon={Message01Icon} size={20} />
                       </div>
                       <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground/40 group-focus-within/input:text-primary">
                         <HugeiconsIcon icon={ArrowDown01Icon} size={18} />
                       </div>
                     </div>
                   </div>

<div className="space-y-2.5">
                     <label
                       htmlFor="message"
                       className="ml-1 text-xs font-bold tracking-widest text-muted-foreground/60 uppercase"
                     >
                       {translations?.contact?.yourMessage || "Your Message"}
                     </label>
                     <div className="group/input relative">
                       <textarea
                         id="message"
                         name="message"
                         required
                         rows={4}
                         placeholder={translations?.contact?.yourMessage ? undefined : "Tell us how we can help..."}
                         className="w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-4 py-4 transition-all outline-none placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-white/8 focus:ring-4 focus:ring-primary/5"
                       />
                     </div>
                   </div>

<Button
                     type="submit"
                     className="h-16 w-full rounded-2xl text-lg font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? (
                       <span className="flex items-center gap-3">
                         <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                         {translations?.contact?.processing || "Processing..."}
                       </span>
                     ) : (
                       <span className="flex items-center gap-3">
                         {translations?.contact?.sendMessage || "Send Message"}
                         <HugeiconsIcon icon={SentIcon} size={22} />
                       </span>
                     )}
                   </Button>

                   <p className="text-center text-xs text-muted-foreground/60">
                     {translations?.contact?.privacyAgreement
                       ? translations.contact.privacyAgreement
                       : "By clicking send, you agree to our"}{" "}
                     <span className="cursor-pointer underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary">
                       {translations?.contact?.privacyPolicy || "Privacy Policy"}
                     </span>
                     .
                   </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Width Google Maps Section */}
      {embedUrl && (
        <div className="mt-20 h-[450px] w-full overflow-hidden border-y border-border bg-background lg:h-[600px]">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={`h-full w-full focus:outline-none ${mounted && isDark ? "dark-map-filter" : ""}`}
          />
        </div>
      )}
    </section>
  )
}

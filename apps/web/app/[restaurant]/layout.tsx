import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import * as React from "react"

interface RestaurantLayoutProps {
  children: React.ReactNode
  params: Promise<{ restaurant: string }>
}

export default async function RestaurantLayout({
  children,
  params,
}: RestaurantLayoutProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant
  const theme = data.theme || {}

  // Resolve custom style overrides safely from the data.json configuration
  const customStyles = {
    ...(theme.palette?.primary && { "--primary": theme.palette.primary }),
    ...(theme.palette?.primaryForeground && {
      "--primary-foreground": theme.palette.primaryForeground,
    }),
    ...(theme.palette?.background && {
      "--background": theme.palette.background,
    }),
    ...(theme.palette?.foreground && {
      "--foreground": theme.palette.foreground,
    }),
    ...(theme.layout?.buttonRadius && {
      "--button-radius": theme.layout.buttonRadius,
    }),
    ...(theme.layout?.cardRadius && { "--radius": theme.layout.cardRadius }),
  } as React.CSSProperties

  return (
    <div style={customStyles} className="contents">
      {children}
    </div>
  )
}

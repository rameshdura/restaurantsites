import Image from "next/image"
import Link from "next/link"
import { SectionHeader } from "./section-header"
import { Location01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "../lib/utils"

export interface StoresSectionProps {
  stores: Array<{
    id: string
    name: string
    shortLocation: string
    address: string
    phone: string
    image: string
    website?: string
  }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translations?: any
  getLink: (path: string) => string
}

export function StoresSection({
  stores,
  translations,
  getLink,
}: StoresSectionProps) {
  if (!stores || stores.length === 0) return null

  const t = translations?.common?.stores || {}
  const title = t.title || "Our Stores"

  const gridClass =
    stores.length >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : stores.length === 3
        ? "grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
        : stores.length === 2
          ? "grid-cols-2 max-w-3xl mx-auto"
          : "grid-cols-1 max-w-md mx-auto"

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeader
          title={title}
          subtitle={t.subtitle || "Find us near you"}
          align="center"
        />

        <div className={cn("mt-12 grid gap-6", gridClass)}>
          {stores.map((store) => (
            <Link
              key={store.id}
              href={getLink(`/stores`)}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={store.image}
                  alt={store.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {store.name}
                </h3>
                <div className="mt-auto flex items-center text-muted-foreground">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium">
                    {store.shortLocation}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

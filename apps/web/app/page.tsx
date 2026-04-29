import { getAllRestaurantSlugs, getRestaurant } from "@/lib/restaurant"
import Link from "next/link"

export default async function Page() {
  const slugs = await getAllRestaurantSlugs()
  const restaurants = await Promise.all(
    slugs.map(async (slug) => {
      const res = await getRestaurant(slug)
      return res ? { slug, name: res.data.name } : null
    })
  )

  const activeRestaurants = restaurants.filter(Boolean) as { slug: string, name: string }[]

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          RestaurantSite Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-10">
          A high-performance, multi-tenant platform powering the next generation of restaurant websites.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {activeRestaurants.map((restaurant) => (
            <Link 
              key={restaurant.slug}
              href={`/${restaurant.slug}`}
              className="group relative flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
            >
              <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                {restaurant.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {restaurant.slug}.localhost:3000
              </span>
            </Link>
          ))}
        </div>

        {activeRestaurants.length === 0 && (
          <p className="text-muted-foreground italic">
            No restaurants found in the /restaurants directory.
          </p>
        )}
      </div>
    </div>
  )
}


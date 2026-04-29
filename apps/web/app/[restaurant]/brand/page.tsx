import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { Navbar } from "@workspace/ui/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@workspace/ui/components/button"
import { CreditCard } from "lucide-react"
import { DownloadPdfButton } from "@/components/download-pdf-button"
import { JsonLd } from "@/components/json-ld"
import { generateBrandMetadata, generateBrandSchema } from "@/lib/seo"


interface BrandPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)
  if (!restaurant) return {}
  return generateBrandMetadata(restaurant.data, slug)
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { restaurant: slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const { data } = restaurant

  return (
    <div className="flex flex-col min-h-svh bg-slate-50/50">
      <JsonLd data={generateBrandSchema(data, slug)} />
      <Navbar restaurant={{ ...data, name: data.name || slug }} />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16 text-center">
            <h4 className="font-bold mb-4 text-primary uppercase tracking-widest text-xs">Brand Assets</h4>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Marketing Materials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Download and print professional marketing assets for {data.name}. 
               All designs are pre-populated with your restaurant&apos;s information.
            </p>
          </header>

          <div className="space-y-24">
            {/* Visiting Card Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Visiting Cards</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Front Side */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Front Side</p>
                    <div 
                      id="card-front"
                      className="bg-[#ffffff] shadow-xl overflow-hidden border border-[#e2e8f0] flex items-center justify-center p-8 relative"
                      style={{ width: '91mm', height: '55mm' }}
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#f46d1b]" />
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-[#0f172a] mb-1">{data.name}</h3>
                        <p className="text-[#f46d1b] font-medium text-sm tracking-widest uppercase mb-4">Restaurant & Dining</p>
                        <div className="w-12 h-1 bg-[#e2e8f0] mx-auto" />
                      </div>
                    </div>
                  </div>
                  <DownloadPdfButton 
                    elementId="card-front" 
                    filename={`${slug}-business-card-front`} 
                    widthMm={91} 
                    heightMm={55} 
                  />
                </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Back Side - Dark</p>
                      <div 
                        id="card-back-dark"
                        className="bg-[#0f172a] shadow-xl overflow-hidden p-8 flex flex-col justify-between text-[#ffffff] relative"
                        style={{ width: '91mm', height: '55mm' }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f46d1b] opacity-10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div>
                          <h3 className="text-lg font-bold mb-1">{data.name}</h3>
                          <p className="text-[#94a3b8] text-xs italic">{data.description?.substring(0, 60)}...</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2 text-[#cbd5e1]">
                            <span className="w-4 text-[#f46d1b]">📍</span> {data.address}
                          </p>
                          <p className="flex items-center gap-2 text-[#cbd5e1]">
                            <span className="w-4 text-[#f46d1b]">📞</span> {data.phone}
                          </p>
                          <p className="flex items-center gap-2 text-[#cbd5e1]">
                            <span className="w-4 text-[#f46d1b]">✉️</span> {data.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DownloadPdfButton 
                      elementId="card-back-dark" 
                      filename={`${slug}-business-card-back-dark`} 
                      widthMm={91} 
                      heightMm={55} 
                    />
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Back Side - Light</p>
                      <div 
                        id="card-back-light"
                        className="bg-[#ffffff] shadow-xl overflow-hidden p-8 flex flex-col justify-between text-[#0f172a] relative border border-[#e2e8f0]"
                        style={{ width: '91mm', height: '55mm' }}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f46d1b] opacity-5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div>
                          <h3 className="text-lg font-bold mb-1">{data.name}</h3>
                          <p className="text-[#64748b] text-xs italic">{data.description?.substring(0, 60)}...</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2 text-[#334155]">
                            <span className="w-4 text-[#f46d1b]">📍</span> {data.address}
                          </p>
                          <p className="flex items-center gap-2 text-[#334155]">
                            <span className="w-4 text-[#f46d1b]">📞</span> {data.phone}
                          </p>
                          <p className="flex items-center gap-2 text-[#334155]">
                            <span className="w-4 text-[#f46d1b]">✉️</span> {data.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DownloadPdfButton 
                      elementId="card-back-light" 
                      filename={`${slug}-business-card-back-light`} 
                      widthMm={91} 
                      heightMm={55} 
                    />
                  </div>
              </div>
            </section>

            {/* Flyer Section */}
            <section>
              <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
                
                <div 
                  id="marketing-flyer"
                  className="bg-[#ffffff] shadow-2xl overflow-hidden border border-[#e2e8f0] p-12 flex flex-col"
                  style={{ width: '148mm', height: '210mm' }}
                >
                  {/* Flyer Header */}
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-[#0f172a] mb-4 tracking-tighter uppercase">{data.name}</h1>
                    <div className="h-1.5 w-24 bg-[#f46d1b] mx-auto mb-6" />
                    <p className="text-2xl font-medium text-[#475569] italic">Experience Fine Dining at its Best</p>
                  </div>

                  {/* Flyer Content */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                    <div className="w-full h-64 bg-[#f1f5f9] flex items-center justify-center border-2 border-dashed border-[#cbd5e1]">
                      <p className="text-[#94a3b8] font-medium">Place your best dish image here</p>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-[#1e293b] underline decoration-[#f46d1b] decoration-4 underline-offset-8">Visit Us Today!</h2>
                      <p className="text-lg text-[#475569] max-w-md">
                        Discover the flavors of {data.name}. We serve authentic dishes 
                        prepared with fresh, local ingredients.
                      </p>
                    </div>
                  </div>

                  {/* Flyer Footer */}
                  <div className="mt-12 pt-8 border-t border-[#f1f5f9] grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-bold text-[#0f172a] uppercase tracking-tighter">Location</p>
                      <p className="text-[#475569]">{data.address}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-bold text-[#0f172a] uppercase tracking-tighter">Contact</p>
                      <p className="text-[#475569]">{data.phone}</p>
                      <p className="text-[#475569]">{data.email}</p>
                    </div>
                  </div>
                </div>

                <DownloadPdfButton 
                  elementId="marketing-flyer" 
                  filename={`${slug}-flyer-a5`} 
                  widthMm={148} 
                  heightMm={210} 
                />
              </div>
            </section>
          </div>

          <div className="mt-20 p-8 bg-primary/5 border border-primary/10 text-center">
            <h3 className="text-xl font-bold mb-2">Need Custom Designs?</h3>
            <p className="text-muted-foreground mb-6">Contact our support team for personalized marketing materials and branding consultations.</p>
            <Button asChild>
              <a href={`/${slug}/contact`}>Contact Us</a>
            </Button>
          </div>
        </div>
      </main>

      <Footer restaurantName={data.name || slug} restaurantSlug={slug} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, footer, .no-print, button {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-5xl {
            max-width: none !important;
          }
          section {
            page-break-after: always;
          }
        }
      `}} />
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { StepIndicator } from '@/components/sitebuilder/StepIndicator'
import { ImageUpload } from '@/components/sitebuilder/ImageUpload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Badge } from '@workspace/ui/components/badge'
import { Plus, Download, Save, X, ChevronLeft, ChevronRight, Trash2, Globe, Search, MapPin, Camera, Info, Building, Settings, Menu, MessageSquare } from 'lucide-react'
import { useToast } from '@workspace/ui/hooks/use-toast'
import { SiteBuilderData, saveCurrentSite, saveSites, getSites } from '@/lib/storage'
import { mapBuilderToDataJson } from '@/lib/site-mapper'

const STEP_TITLES = [
  'Basic Info',
  'SEO & Metadata',
  'Local SEO',
  'Brand Assets',
  'About Us',
  'Company Info',
  'Operational',
  'Menu Builder',
  'Reviews'
]

export function SiteBuilderForm({ initialData }: { initialData?: SiteBuilderData }) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [sites, setSites] = useState<SiteBuilderData[]>([])

  const [formData, setFormData] = useState<SiteBuilderData>(initialData || {
    // Step 1: Basic Info
    siteName: '',
    siteSlug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    language: 'EN',
    currency: 'USD',
    menuLink: '',
    foundingDate: '',

    // Step 2: SEO
    seoTitle: '',
    seoDescription: '',
    keywords: [],
    seoMenuTitle: '',
    seoMenuDescription: '',
    seoAboutTitle: '',
    seoAboutDescription: '',
    seoContactTitle: '',
    seoContactDescription: '',
    seoBrandTitle: '',
    seoBrandDescription: '',
    seoCompanyTitle: '',
    seoCompanyDescription: '',
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',

    // Step 3: Local SEO
    neighborhood: '',
    city: '',
    region: '',
    country: '',
    countryCode: '',
    postalCode: '',
    googleMapsUrl: '',
    timezone: 'Asia/Tokyo',

    // Step 4: Images & Hero
    logoImage: null,
    heroImage: null,
    coverImage: null,
    imagesGallery: [],
    heroSlides: [],

    // Step 5: About Us
    aboutContent: '',
    aboutAdditionalContent: [],
    foundedYear: new Date().getFullYear(),
    founderName: '',
    founderRole: '',
    founderBio: '',
    founderImage: null,
    team: [],

    // Step 6: Company Info
    companyName: '',
    companyLegalName: '',
    registrationNumber: '',
    representative: '',
    companyAddress: '',
    companyPhone: '',
    establishedDate: '',
    capital: '',
    fiscalYearEnd: '',

    // Step 7: operational
    openingHours: [
      { day: 'Monday - Thursday', lunch: '11:30 - 15:00', lunchLO: '14:30', dinner: '17:00 - 22:00', dinnerLO: '21:30' },
      { day: 'Friday - Saturday', lunch: '11:30 - 15:00', lunchLO: '14:30', dinner: '17:00 - 23:30', dinnerLO: '23:00' },
      { day: 'Sunday', lunch: '12:00 - 15:30', lunchLO: '15:00', dinner: '17:00 - 21:00', dinnerLO: '20:30' },
    ],
    holidayNotes: '',
    priceRange: '$$',
    cuisineTypes: [],
    acceptsReservations: true,
    isTakeout: true,
    isDelivery: false,
    priceCurrency: 'USD',
    socialInstagram: '',
    socialFacebook: '',
    socialTwitter: '',
    socialTabelog: '',

    // Step 8: Menu
    menuCategories: [],

    // Step 9: Reviews
    reviews: []
  })

  useEffect(() => {
    const loadSites = async () => {
      const storedSites = await getSites()
      setSites(storedSites)
    }
    loadSites()
  }, [])

  useEffect(() => {
    const autoSave = async () => {
      try {
        await saveCurrentSite(formData)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
    autoSave()
  }, [formData])

  const updateFormData = (field: keyof SiteBuilderData, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveToSites = async () => {
    if (!formData.siteName || !formData.siteSlug) {
      toast({ title: 'Error', description: 'Name and Slug are required', variant: 'destructive' })
      return
    }

    const updatedSites = sites.filter(s => s.siteSlug !== formData.siteSlug)
    updatedSites.push(formData)
    setSites(updatedSites)
    await saveSites(updatedSites)

    toast({ title: 'Saved', description: `"${formData.siteName}" saved successfully.` })
  }

  const handleExportSite = () => {
    const finalJson = mapBuilderToDataJson(formData)
    const jsonStr = JSON.stringify(finalJson, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data.json` // Standard name as requested
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({ title: 'Exported!', description: 'data.json has been downloaded.' })
  }

  const downloadAllImages = async () => {
    if (!formData.siteSlug) {
      toast({ title: 'Error', description: 'Slug is required for image prefixing', variant: 'destructive' })
      return
    }

    const imagesToDownload: Array<{ name: string; dataUrl: string; filename: string }> = []
    if (formData.logoImage) imagesToDownload.push({ name: 'logo', dataUrl: formData.logoImage, filename: `${formData.siteSlug}_logo.jpg` })
    if (formData.heroImage) imagesToDownload.push({ name: 'hero', dataUrl: formData.heroImage, filename: `${formData.siteSlug}_hero.jpg` })
    if (formData.coverImage) imagesToDownload.push({ name: 'cover', dataUrl: formData.coverImage, filename: `${formData.siteSlug}_cover.jpg` })
    formData.imagesGallery.forEach((img, i) => imagesToDownload.push({ name: `gallery-${i+1}`, dataUrl: img, filename: `${formData.siteSlug}_gallery_${i+1}.jpg` }))

    imagesToDownload.forEach(img => {
      const link = document.createElement('a')
      link.href = img.dataUrl
      link.download = img.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })

    toast({ title: 'Images downloaded!', description: `Downloaded ${imagesToDownload.length} images.` })
  }

  // Helper components for steps
  const SectionTitle = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-xl border border-border/50">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg leading-none mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Globe} title="Basic Information" description="Set your restaurant's identity and primary contact details." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Restaurant Name *</Label>
          <Input value={formData.siteName} onChange={e => updateFormData('siteName', e.target.value)} placeholder="e.g. Ramen Taro" />
        </div>
        <div className="space-y-2">
          <Label>Site Slug (URL Path) *</Label>
          <Input value={formData.siteSlug} onChange={e => updateFormData('siteSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. ramen-taro" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Short Description</Label>
        <Textarea value={formData.description} onChange={e => updateFormData('description', e.target.value)} placeholder="A brief catchphrase or summary..." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Primary Phone</Label>
          <Input value={formData.phone} onChange={e => updateFormData('phone', e.target.value)} placeholder="+81 3-..." />
        </div>
        <div className="space-y-2">
          <Label>Primary Email</Label>
          <Input value={formData.email} onChange={e => updateFormData('email', e.target.value)} placeholder="contact@..." />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Language</Label>
          <Input value={formData.language} onChange={e => updateFormData('language', e.target.value)} placeholder="EN, JA, etc." />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input value={formData.currency} onChange={e => updateFormData('currency', e.target.value)} placeholder="USD, JPY, etc." />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Search} title="SEO & Metadata" description="Optimize how your site appears in search engines like Google." />
      
      <Card className="border-primary/20">
        <CardHeader className="py-3 bg-primary/5"><CardTitle className="text-sm">Global SEO</CardTitle></CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Meta Title (Homepage)</Label>
            <Input value={formData.seoTitle} onChange={e => updateFormData('seoTitle', e.target.value)} placeholder="Ramen Taro | Best Hakata Ramen in Tokyo" />
          </div>
          <div className="space-y-2">
            <Label>Meta Description (Homepage)</Label>
            <Textarea value={formData.seoDescription} onChange={e => updateFormData('seoDescription', e.target.value)} placeholder="Detailed description for search results..." />
          </div>
          <div className="space-y-2">
            <Label>Keywords (comma-separated)</Label>
            <Input value={formData.keywords.join(', ')} onChange={e => updateFormData('keywords', e.target.value.split(',').map(s => s.trim()))} placeholder="ramen, sushi, tokyo..." />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="py-3 bg-muted/30"><CardTitle className="text-sm">Page-Specific SEO</CardTitle></CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Menu Page Title</Label>
              <Input value={formData.seoMenuTitle} onChange={e => updateFormData('seoMenuTitle', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>About Page Title</Label>
              <Input value={formData.seoAboutTitle} onChange={e => updateFormData('seoAboutTitle', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact Page Title</Label>
              <Input value={formData.seoContactTitle} onChange={e => updateFormData('seoContactTitle', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company Info Title</Label>
              <Input value={formData.seoCompanyTitle} onChange={e => updateFormData('seoCompanyTitle', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>OG Locale</Label>
          <Input value={formData.ogLocale || ''} onChange={e => updateFormData('ogLocale', e.target.value)} placeholder="en_US" />
        </div>
        <div className="space-y-2">
          <Label>Twitter Card Type</Label>
          <Select value={formData.twitterCard} onValueChange={v => updateFormData('twitterCard', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="summary_large_image">Large Image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={MapPin} title="Local SEO" description="Tell search engines exactly where you are located." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Neighborhood</Label>
          <Input value={formData.neighborhood || ''} onChange={e => updateFormData('neighborhood', e.target.value)} placeholder="Kiyohara" />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={formData.city || ''} onChange={e => updateFormData('city', e.target.value)} placeholder="Higashiyamato" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Region/State</Label>
          <Input value={formData.region || ''} onChange={e => updateFormData('region', e.target.value)} placeholder="Tokyo" />
        </div>
        <div className="space-y-2">
          <Label>Postal Code</Label>
          <Input value={formData.postalCode || ''} onChange={e => updateFormData('postalCode', e.target.value)} placeholder="207-0011" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Country</Label>
          <Input value={formData.country || ''} onChange={e => updateFormData('country', e.target.value)} placeholder="Japan" />
        </div>
        <div className="space-y-2">
          <Label>Country Code (ISO)</Label>
          <Input value={formData.countryCode || ''} onChange={e => updateFormData('countryCode', e.target.value)} placeholder="JP" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Google Maps URL</Label>
        <Input value={formData.googleMapsUrl || ''} onChange={e => updateFormData('googleMapsUrl', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Camera} title="Brand Assets & Hero" description="Upload your primary images and configure the homepage hero." />
      
      <div className="grid gap-6 md:grid-cols-3">
        <ImageUpload label="Logo" image={formData.logoImage} onImageSelect={(_, d) => updateFormData('logoImage', d)} onImageRemove={() => updateFormData('logoImage', null)} slugPrefix={formData.siteSlug} canDownload={false} />
        <ImageUpload label="Main Hero" image={formData.heroImage} onImageSelect={(_, d) => updateFormData('heroImage', d)} onImageRemove={() => updateFormData('heroImage', null)} slugPrefix={formData.siteSlug} canDownload={false} />
        <ImageUpload label="Cover" image={formData.coverImage} onImageSelect={(_, d) => updateFormData('coverImage', d)} onImageRemove={() => updateFormData('coverImage', null)} slugPrefix={formData.siteSlug} canDownload={false} />
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-bold">Hero Slides (Optional)</Label>
          <Button variant="outline" size="sm" onClick={() => updateFormData('heroSlides', [...formData.heroSlides, { image: null, title: '', subtitle: '', ctaText: 'View Menu', ctaLink: '#menu' }])}>
            <Plus className="mr-2 h-4 w-4" /> Add Slide
          </Button>
        </div>
        <div className="space-y-4">
          {formData.heroSlides.map((slide, i) => (
            <div key={i} className="p-4 border rounded-xl bg-muted/10 relative grid gap-4 md:grid-cols-[150px_1fr]">
              <ImageUpload label={`Slide ${i+1}`} image={slide.image} onImageSelect={(_, d) => { const ns = [...formData.heroSlides]; ns[i].image = d; updateFormData('heroSlides', ns); }} onImageRemove={() => { const ns = [...formData.heroSlides]; ns[i].image = null; updateFormData('heroSlides', ns); }} slugPrefix={formData.siteSlug} canDownload={false} />
              <div className="space-y-3">
                <Input placeholder="Slide Title" value={slide.title} onChange={e => { const ns = [...formData.heroSlides]; ns[i].title = e.target.value; updateFormData('heroSlides', ns); }} />
                <Input placeholder="Slide Subtitle" value={slide.subtitle} onChange={e => { const ns = [...formData.heroSlides]; ns[i].subtitle = e.target.value; updateFormData('heroSlides', ns); }} />
                <div className="grid grid-cols-2 gap-2">
                   <Input placeholder="CTA Text" value={slide.ctaText} onChange={e => { const ns = [...formData.heroSlides]; ns[i].ctaText = e.target.value; updateFormData('heroSlides', ns); }} />
                   <Input placeholder="CTA Link" value={slide.ctaLink} onChange={e => { const ns = [...formData.heroSlides]; ns[i].ctaLink = e.target.value; updateFormData('heroSlides', ns); }} />
                </div>
              </div>
              <button onClick={() => updateFormData('heroSlides', formData.heroSlides.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <Label>Gallery Images ({formData.imagesGallery.length})</Label>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {formData.imagesGallery.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <Image src={img} alt={`Gallery image ${i + 1}`} fill className="object-cover" />
              <button onClick={() => updateFormData('imagesGallery', formData.imagesGallery.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <ImageUpload label="Add Gallery" image={null} onImageSelect={(_, d) => updateFormData('imagesGallery', [...formData.imagesGallery, d])} onImageRemove={() => {}} slugPrefix={formData.siteSlug} canDownload={false} />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="secondary" onClick={downloadAllImages}>
          <Download className="mr-2 h-4 w-4" />
          Download All with Prefix
        </Button>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Info} title="About Us" description="Share your story, founder details, and team members." />
      <div className="space-y-2">
        <Label>Main Story</Label>
        <Textarea className="min-h-[120px]" value={formData.aboutContent} onChange={e => updateFormData('aboutContent', e.target.value)} placeholder="Tell your customers about your heritage..." />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-bold">Additional Story Paragraphs</Label>
          <Button variant="ghost" size="sm" onClick={() => updateFormData('aboutAdditionalContent', [...formData.aboutAdditionalContent, ''])}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.aboutAdditionalContent.map((text, i) => (
          <div key={i} className="relative">
            <Textarea value={text} onChange={e => { const nac = [...formData.aboutAdditionalContent]; nac[i] = e.target.value; updateFormData('aboutAdditionalContent', nac); }} placeholder="Next paragraph..." />
            <button onClick={() => updateFormData('aboutAdditionalContent', formData.aboutAdditionalContent.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t">
        <Label className="mb-4 block text-lg font-bold">Founder Details</Label>
        <div className="grid gap-6 md:grid-cols-[150px_1fr]">
          <ImageUpload label="Founder" image={formData.founderImage} onImageSelect={(_, d) => updateFormData('founderImage', d)} onImageRemove={() => updateFormData('founderImage', null)} slugPrefix={formData.siteSlug} canDownload={false} />
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" value={formData.founderName || ''} onChange={e => updateFormData('founderName', e.target.value)} />
              <Input placeholder="Role" value={formData.founderRole || ''} onChange={e => updateFormData('founderRole', e.target.value)} />
            </div>
            <Textarea placeholder="Bio..." value={formData.founderBio || ''} onChange={e => updateFormData('founderBio', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-bold">Team Members</Label>
          <Button variant="outline" size="sm" onClick={() => updateFormData('team', [...formData.team, { name: '', role: '', bio: '', image: null }])}>
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Button>
        </div>
        <div className="grid gap-4">
          {formData.team.map((member, i) => (
            <div key={i} className="p-4 border rounded-xl bg-muted/20 relative grid gap-4 md:grid-cols-[100px_1fr]">
              <ImageUpload label={`Member ${i+1}`} image={member.image} onImageSelect={(_, d) => { const nt = [...formData.team]; nt[i].image = d; updateFormData('team', nt); }} onImageRemove={() => { const nt = [...formData.team]; nt[i].image = null; updateFormData('team', nt); }} slugPrefix={formData.siteSlug} canDownload={false} />
              <div className="space-y-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="Name" value={member.name} onChange={e => { const nt = [...formData.team]; nt[i].name = e.target.value; updateFormData('team', nt); }} />
                  <Input placeholder="Role" value={member.role} onChange={e => { const nt = [...formData.team]; nt[i].role = e.target.value; updateFormData('team', nt); }} />
                </div>
                <Textarea placeholder="Bio..." value={member.bio} onChange={e => { const nt = [...formData.team]; nt[i].bio = e.target.value; updateFormData('team', nt); }} />
              </div>
              <button onClick={() => updateFormData('team', formData.team.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Building} title="Company Information" description="Legal and corporate details for trust and compliance." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Company Name (e.g., Narayani Co., Ltd.)</Label>
          <Input value={formData.companyName} onChange={e => updateFormData('companyName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Legal Name</Label>
          <Input value={formData.companyLegalName || ''} onChange={e => updateFormData('companyLegalName', e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Registration Number</Label>
          <Input value={formData.registrationNumber || ''} onChange={e => updateFormData('registrationNumber', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Representative</Label>
          <Input value={formData.representative || ''} onChange={e => updateFormData('representative', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Company Address</Label>
        <Input value={formData.companyAddress || ''} onChange={e => updateFormData('companyAddress', e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Established Date</Label>
          <Input value={formData.establishedDate || ''} onChange={e => updateFormData('establishedDate', e.target.value)} placeholder="May 21, 2009" />
        </div>
        <div className="space-y-2">
          <Label>Capital</Label>
          <Input value={formData.capital || ''} onChange={e => updateFormData('capital', e.target.value)} placeholder="5,000,000 JPY" />
        </div>
        <div className="space-y-2">
          <Label>Fiscal Year End</Label>
          <Input value={formData.fiscalYearEnd || ''} onChange={e => updateFormData('fiscalYearEnd', e.target.value)} placeholder="End of March" />
        </div>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Settings} title="Operational Settings" description="Configure hours, pricing, and services." />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="py-2 bg-muted/30"><CardTitle className="text-sm">Pricing</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Price Range</Label>
              <Select value={formData.priceRange} onValueChange={v => updateFormData('priceRange', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Inexpensive</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Currency</Label>
              <Input value={formData.priceCurrency} onChange={e => updateFormData('priceCurrency', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="py-2 bg-muted/30"><CardTitle className="text-sm">Services</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label className="text-xs">Reservations</Label>
              <Switch checked={formData.acceptsReservations} onCheckedChange={v => updateFormData('acceptsReservations', v)} />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label className="text-xs">Takeout</Label>
              <Switch checked={formData.isTakeout} onCheckedChange={v => updateFormData('isTakeout', v)} />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label className="text-xs">Delivery</Label>
              <Switch checked={formData.isDelivery} onCheckedChange={v => updateFormData('isDelivery', v)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Cuisine Types</Label>
          <div className="flex gap-2">
            <Input id="newCuisine" placeholder="e.g. Japanese" className="h-8 w-40" />
            <Button size="sm" onClick={() => {
              const val = (document.getElementById('newCuisine') as HTMLInputElement).value;
              if (val) { updateFormData('cuisineTypes', [...formData.cuisineTypes, val]); (document.getElementById('newCuisine') as HTMLInputElement).value = ''; }
            }}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.cuisineTypes.map((c, i) => (
            <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
              {c}
              <button onClick={() => updateFormData('cuisineTypes', formData.cuisineTypes.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Opening Hours</Label>
          <Button variant="ghost" size="sm" onClick={() => updateFormData('openingHours', [...formData.openingHours, { day: '', lunch: '', lunchLO: '', dinner: '', dinnerLO: '' }])}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {formData.openingHours.map((h, i) => (
            <div key={i} className="p-4 border rounded-xl bg-muted/5 relative">
              <button onClick={() => updateFormData('openingHours', formData.openingHours.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-1"><Label className="text-[10px]">Day(s)</Label><Input value={h.day} onChange={e => { const nh = [...formData.openingHours]; nh[i].day = e.target.value; updateFormData('openingHours', nh); }} /></div>
                <div className="space-y-1"><Label className="text-[10px]">Lunch</Label><Input value={h.lunch} onChange={e => { const nh = [...formData.openingHours]; nh[i].lunch = e.target.value; updateFormData('openingHours', nh); }} /></div>
                <div className="space-y-1"><Label className="text-[10px]">Lunch LO</Label><Input value={h.lunchLO} onChange={e => { const nh = [...formData.openingHours]; nh[i].lunchLO = e.target.value; updateFormData('openingHours', nh); }} /></div>
                <div className="space-y-1"><Label className="text-[10px]">Dinner</Label><Input value={h.dinner} onChange={e => { const nh = [...formData.openingHours]; nh[i].dinner = e.target.value; updateFormData('openingHours', nh); }} /></div>
                <div className="space-y-1"><Label className="text-[10px]">Dinner LO</Label><Input value={h.dinnerLO} onChange={e => { const nh = [...formData.openingHours]; nh[i].dinnerLO = e.target.value; updateFormData('openingHours', nh); }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Label>Holiday Notes</Label>
        <Textarea value={formData.holidayNotes} onChange={e => updateFormData('holidayNotes', e.target.value)} placeholder="e.g. Closed on New Year's Day..." />
      </div>

      <div className="pt-6 border-t space-y-4">
        <Label className="text-lg font-bold">Social Links (Handles/IDs)</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Instagram Handle</Label><Input value={formData.socialInstagram} onChange={e => updateFormData('socialInstagram', e.target.value)} placeholder="ramentaro" /></div>
          <div className="space-y-2"><Label>Facebook Handle</Label><Input value={formData.socialFacebook} onChange={e => updateFormData('socialFacebook', e.target.value)} placeholder="ramentaro" /></div>
          <div className="space-y-2"><Label>Twitter Handle</Label><Input value={formData.socialTwitter} onChange={e => updateFormData('socialTwitter', e.target.value)} placeholder="ramentaro" /></div>
          <div className="space-y-2"><Label>Tabelog URL (Optional)</Label><Input value={formData.socialTabelog} onChange={e => updateFormData('socialTabelog', e.target.value)} /></div>
        </div>
      </div>
    </div>
  )

  const renderStep8 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={Menu} title="Menu Builder" description="Create categories and add your delicious dishes." />
      <div className="flex gap-2">
        <Input id="newCat" placeholder="New Category Name..." />
        <Button onClick={() => {
          const name = (document.getElementById('newCat') as HTMLInputElement).value;
          if (name) { updateFormData('menuCategories', [...formData.menuCategories, { name, items: [] }]); (document.getElementById('newCat') as HTMLInputElement).value = ''; }
        }}>Add Category</Button>
      </div>
      <div className="space-y-8">
        {formData.menuCategories.map((cat, ci) => (
          <Card key={ci} className="overflow-hidden border-primary/20">
            <CardHeader className="py-3 bg-primary/5 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-md font-bold">{cat.name}</CardTitle>
              <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => updateFormData('menuCategories', formData.menuCategories.filter((_, i) => i !== ci))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
               <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-primary/30 space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-primary">Add New Item to {cat.name}</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input id={`ni-${ci}`} placeholder="Item Name" />
                    <Input id={`np-${ci}`} placeholder="Price (e.g. 15.00)" />
                    <Button onClick={() => {
                      const name = (document.getElementById(`ni-${ci}`) as HTMLInputElement).value;
                      const price = (document.getElementById(`np-${ci}`) as HTMLInputElement).value;
                      if (name) {
                        const nmc = [...formData.menuCategories];
                        nmc[ci].items.push({ name, price, description: '', isPopular: false, image: null });
                        updateFormData('menuCategories', nmc);
                        (document.getElementById(`ni-${ci}`) as HTMLInputElement).value = '';
                        (document.getElementById(`np-${ci}`) as HTMLInputElement).value = '';
                      }
                    }}>Add Item</Button>
                  </div>
               </div>
               
               <div className="space-y-4">
                 {cat.items.map((item, ii) => (
                   <div key={ii} className="p-4 border rounded-xl bg-muted/5 relative grid gap-4 md:grid-cols-[80px_1fr]">
                      <ImageUpload label="" image={item.image || null} onImageSelect={(_, d) => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].image = d; updateFormData('menuCategories', nmc); }} onImageRemove={() => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].image = null; updateFormData('menuCategories', nmc); }} slugPrefix={formData.siteSlug} canDownload={false} />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Input className="h-8 font-bold" value={item.name} onChange={e => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].name = e.target.value; updateFormData('menuCategories', nmc); }} />
                              <Input className="h-8 w-20 text-primary" value={item.price} onChange={e => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].price = e.target.value; updateFormData('menuCategories', nmc); }} />
                           </div>
                           <div className="flex items-center gap-2">
                              <Label className="text-[10px]">Popular?</Label>
                              <Switch checked={item.isPopular} onCheckedChange={v => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].isPopular = v; updateFormData('menuCategories', nmc); }} />
                           </div>
                        </div>
                        <Textarea placeholder="Item description..." className="h-16 text-xs" value={item.description} onChange={e => { const nmc = [...formData.menuCategories]; nmc[ci].items[ii].description = e.target.value; updateFormData('menuCategories', nmc); }} />
                      </div>
                      <button onClick={() => {
                         const nmc = [...formData.menuCategories];
                         nmc[ci].items = nmc[ci].items.filter((_, idx) => idx !== ii);
                         updateFormData('menuCategories', nmc);
                      }} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg"><X className="h-3 w-3" /></button>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStep9 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon={MessageSquare} title="Reviews" description="Add some sample reviews to boost SEO and trust." />
      <Button variant="outline" className="w-full" onClick={() => updateFormData('reviews', [...formData.reviews, { author: '', rating: 5, date: new Date().toISOString().split('T')[0], comment: '', source: 'Google Reviews' }])}>
        <Plus className="mr-2 h-4 w-4" /> Add Review
      </Button>
      <div className="space-y-4">
        {formData.reviews.map((rev, i) => (
          <div key={i} className="p-4 border rounded-xl space-y-3 relative">
            <button onClick={() => updateFormData('reviews', formData.reviews.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Author" value={rev.author} onChange={e => { const nr = [...formData.reviews]; nr[i].author = e.target.value; updateFormData('reviews', nr); }} />
              <Input type="number" max="5" min="1" placeholder="Rating" value={rev.rating} onChange={e => { const nr = [...formData.reviews]; nr[i].rating = parseInt(e.target.value); updateFormData('reviews', nr); }} />
            </div>
            <Textarea placeholder="Review comment..." value={rev.comment} onChange={e => { const nr = [...formData.reviews]; nr[i].comment = e.target.value; updateFormData('reviews', nr); }} />
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderStep1(); case 1: return renderStep2(); case 2: return renderStep3();
      case 3: return renderStep4(); case 4: return renderStep5(); case 5: return renderStep6();
      case 6: return renderStep7(); case 7: return renderStep8(); case 8: return renderStep9();
      default: return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl border-primary/10 overflow-hidden">
      <div className="bg-primary h-1.5 w-full" style={{ width: `${((currentStep + 1) / 9) * 100}%`, transition: 'width 0.5s ease' }} />
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
           <Building className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Site Builder</CardTitle>
        <CardDescription>Configure your restaurant&apos;s digital presence in minutes.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-4">
        <StepIndicator currentStep={currentStep} totalSteps={9} stepTitles={STEP_TITLES} />

        <div className="min-h-[500px] py-4">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-border/50">
          <Button variant="ghost" onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveToSites}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            
            {currentStep < 8 ? (
              <Button onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8" onClick={handleExportSite}>
                <Download className="mr-2 h-4 w-4" /> Export data.json
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

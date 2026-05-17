"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { SiteBuilderData } from "@/lib/storage"
import { mapDataJsonToBuilder } from "@/lib/site-mapper"
import { Upload, FileJson, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ImportJsonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess?: (site: SiteBuilderData) => void
}

const FIELD_LABELS: Record<string, string> = {
  siteName: "Site Name",
  siteSlug: "Site Slug",
  description: "Description",
  tagline: "Tagline",
  address: "Address",
  phone: "Phone",
  email: "Email",
  menuLink: "Menu Link",
  foundingDate: "Founding Date",
  language: "Language",
  currency: "Currency",
  seoTitle: "SEO Title",
  seoDescription: "SEO Description",
  keywords: "Keywords",
  menuTitle: "Menu Page Title",
  menuDescription: "Menu Page Description",
  aboutTitle: "About Page Title",
  aboutDescription: "About Page Description",
  contactTitle: "Contact Page Title",
  contactDescription: "Contact Page Description",
  brandTitle: "Brand Title",
  brandDescription: "Brand Description",
  companyTitle: "Company Title",
  companyDescription: "Company Description",
  ogLocale: "OG Locale",
  twitterCard: "Twitter Card",
  twitterSite: "Twitter Site",
  noindex: "No Index",
  neighborhood: "Neighborhood",
  city: "City",
  region: "Region",
  country: "Country",
  countryCode: "Country Code",
  postalCode: "Postal Code",
  googleMapsUrl: "Google Maps URL",
  embedUrl: "Embed URL",
  placeId: "Place ID",
  timezone: "Timezone",
  lat: "Latitude",
  lng: "Longitude",
  plusCode: "Plus Code",
  priceRange: "Price Range",
  cuisineTypes: "Cuisine Types",
  acceptsReservations: "Accepts Reservations",
  isTakeout: "Takeout",
  isDelivery: "Delivery",
  priceCurrency: "Price Currency",
  aggregateRating: "Aggregate Rating",
  logoImage: "Logo Image",
  heroImage: "Hero Image",
  coverImage: "Cover Image",
  imagesGallery: "Gallery Images",
  heroSlides: "Hero Slides",
  aboutContent: "About Content",
  aboutShortDescription: "About Short Description",
  aboutMission: "Mission",
  aboutPhilosophy: "Philosophy",
  aboutAdditionalContent: "Additional Content",
  foundedYear: "Founded Year",
  foundingLocation: "Founding Location",
  founderName: "Founder Name",
  founderRole: "Founder Role",
  founderBio: "Founder Bio",
  founderImage: "Founder Image",
  founderQualifications: "Founder Qualifications",
  founderSocial: "Founder Social",
  founderSince: "Founder Since",
  awards: "Awards",
  keywordsByPage: "Keywords by Page",
  team: "Team",
  companyName: "Company Name",
  companyLegalName: "Company Legal Name",
  registrationNumber: "Registration Number",
  representative: "Representative",
  companyAddress: "Company Address",
  companyPhone: "Company Phone",
  establishedDate: "Established Date",
  capital: "Capital",
  fiscalYearEnd: "Fiscal Year End",
  businessPurpose: "Business Purpose",
  annualReportUrl: "Annual Report URL",
  numberOfEmployees: "Number of Employees",
  openingHours: "Opening Hours",
  holidayNotes: "Holiday Notes",
  paymentMethods: "Payment Methods",
  dietaryOptions: "Dietary Options",
  features: "Features",
  services: "Services",
  socialInstagram: "Instagram",
  socialFacebook: "Facebook",
  socialTwitter: "Twitter",
  socialTabelog: "Tabelog",
  menuCategories: "Menu Categories",
  reviews: "Reviews",
  videos: "Videos",
  virtualTour: "Virtual Tour",
  knowLanguages: "Languages",
  cuisineType: "Cuisine Type",
  reservation: "Reservation",
  advancedSchema: "Advanced Schema",
  uid: "UID",
}

export function ImportJsonDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportJsonDialogProps) {
  const { toast } = useToast()
  const [jsonInput, setJsonInput] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [parsedFields, setParsedFields] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const parseAndPreview = useCallback((text: string) => {
    if (!text.trim()) {
      setParsedFields([])
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(text)
      const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

      if (items.length === 0) {
        setError("JSON is empty")
        setParsedFields([])
        return
      }

      const allFields = new Set<string>()
      items.forEach((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const mapped = mapDataJsonToBuilder(item as Record<string, unknown>)
          Object.keys(mapped).forEach((key) => allFields.add(key))
        }
      })

      const labels = Array.from(allFields).map((f) => FIELD_LABELS[f] || f)
      setParsedFields(labels)
      setError(null)
    } catch (e: unknown) {
      setError(`Invalid JSON: ${(e as Error).message}`)
      setParsedFields([])
    }
  }, [])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setFileName(file.name)
      setError(null)
      setParsedFields([])

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setJsonInput(text)
        parseAndPreview(text)
      }
      reader.onerror = () => {
        setError("Failed to read file")
      }
      reader.readAsText(file)
    },
    [parseAndPreview]
  )

  const handlePaste = useCallback(
    (text: string) => {
      setJsonInput(text)
      setFileName("")
      setError(null)
      parseAndPreview(text)
    },
    [parseAndPreview]
  )

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setError("Please provide JSON data")
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

      setIsSaving(true)

      // Load existing sites to merge
      const { getSites, saveSites } = await import("@/lib/storage")
      const existingSites = await getSites()

      for (const item of items) {
        const mapped = mapDataJsonToBuilder(
          item as Record<string, unknown>
        ) as SiteBuilderData

        // Generate UID if missing
        if (!mapped.uid) {
          mapped.uid =
            mapped.siteSlug ||
            `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        }
        // Generate slug if missing
        if (!mapped.siteSlug && mapped.siteName) {
          mapped.siteSlug = mapped.siteName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        }

        // Remove old entry if exists, add new
        const filtered = existingSites.filter(
          (s) => s.siteSlug !== mapped.siteSlug
        )
        filtered.push(mapped)

        await saveSites(filtered)

        // Pass imported data directly to parent to avoid storage timing issues
        if (items.length === 1 && onImportSuccess) {
          onImportSuccess(mapped)
        }
      }

      toast({
        title: "Import successful",
        description: `Imported ${items.length} site${items.length > 1 ? "s" : ""} successfully.`,
      })

      setIsSaving(false)
      setJsonInput("")
      setFileName("")
      setParsedFields([])
      setError(null)
      onOpenChange(false)
    } catch (e: unknown) {
      setError(`Import failed: ${(e as Error).message}`)
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import JSON
          </DialogTitle>
          <DialogDescription>
            Import a site from a data.json file. Upload a file or paste JSON
            content below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label>Upload JSON File</Label>
            <div className="relative">
              <Input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="cursor-pointer file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:hover:bg-primary/90"
              />
              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileJson className="h-4 w-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-3 left-4 bg-background px-2 text-xs text-muted-foreground">
              Or paste JSON here
            </div>
            <Textarea
              className="mt-4 min-h-[200px] font-mono text-xs"
              placeholder={`{\n  "name": "Restaurant Name",\n  "seo": {\n    "title": "...",\n    "description": "..."\n  },\n  ...\n}`}
              value={jsonInput}
              onChange={(e) => handlePaste(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {parsedFields.length > 0 && !error && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Detected Fields ({parsedFields.length}):
              </Label>
              <div className="flex flex-wrap gap-2">
                {parsedFields.map((field, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!jsonInput.trim() || !!error || isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import & Autofill"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

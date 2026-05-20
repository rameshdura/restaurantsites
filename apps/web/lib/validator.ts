/**
 * Simple schema validator for the restaurant data.json structure.
 * This can be expanded to a full JSON Schema validator (using ajv) as the platform scales.
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateRestaurantData(data: unknown): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid restaurant data object"],
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any

  // Check required fields (handle both builder format and final data.json format)
  const name = d.name || d.siteName
  if (!name) errors.push("Restaurant name is missing")

  if (!d.uid) errors.push("UID is missing")

  const address = d.address
  if (!address) errors.push("Address is missing")

  const phone = d.phone
  if (!phone) errors.push("Phone number is missing")

  // Check SEO sections
  const seoTitle = d.seo?.title || d.seoTitle
  if (!seoTitle) errors.push("SEO title is missing")

  const seoDescription = d.seo?.description || d.seoDescription
  if (!seoDescription) errors.push("SEO description is missing")

  // Check Local SEO
  const city = d.localSEO?.city || d.city
  if (!city) errors.push("City is missing")

  const placeId = d.localSEO?.placeId || d.placeId
  if (!placeId) errors.push("Google Maps Place ID is missing")

  // Check Menu Categories
  if (!Array.isArray(d.menuCategories)) {
    errors.push("Menu categories must be an array")
  }

  // Optional Operational checks
  const paymentMethods = d.operations?.paymentMethods || d.paymentMethods
  if (paymentMethods && !Array.isArray(paymentMethods)) {
    errors.push("Payment methods must be an array")
  }

  const deliveryPlatforms =
    d.operations?.services?.deliveryPlatforms || d.services?.deliveryPlatforms
  if (deliveryPlatforms && !Array.isArray(deliveryPlatforms)) {
    errors.push("Delivery platforms must be an array")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

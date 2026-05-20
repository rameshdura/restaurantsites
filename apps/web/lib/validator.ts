/**
 * Simple schema validator for the restaurant data.json structure.
 * This can be expanded to a full JSON Schema validator (using ajv) as the platform scales.
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateRestaurantData(data: any): ValidationResult {
  const errors: string[] = []

  // Check required fields (handle both builder format and final data.json format)
  const name = data.name || data.siteName
  if (!name) errors.push("Restaurant name is missing")

  if (!data.uid) errors.push("UID is missing")

  const address = data.address
  if (!address) errors.push("Address is missing")

  const phone = data.phone
  if (!phone) errors.push("Phone number is missing")

  // Check SEO sections
  const seoTitle = data.seo?.title || data.seoTitle
  if (!seoTitle) errors.push("SEO title is missing")

  const seoDescription = data.seo?.description || data.seoDescription
  if (!seoDescription) errors.push("SEO description is missing")

  // Check Local SEO
  const city = data.localSEO?.city || data.city
  if (!city) errors.push("City is missing")

  const placeId = data.localSEO?.placeId || data.placeId
  if (!placeId) errors.push("Google Maps Place ID is missing")

  // Check Menu Categories
  if (!Array.isArray(data.menuCategories)) {
    errors.push("Menu categories must be an array")
  }

  // Optional Operational checks
  const paymentMethods = data.operations?.paymentMethods || data.paymentMethods
  if (paymentMethods && !Array.isArray(paymentMethods)) {
    errors.push("Payment methods must be an array")
  }

  const deliveryPlatforms =
    data.operations?.services?.deliveryPlatforms ||
    data.services?.deliveryPlatforms
  if (deliveryPlatforms && !Array.isArray(deliveryPlatforms)) {
    errors.push("Delivery platforms must be an array")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

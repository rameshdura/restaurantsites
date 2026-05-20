/**
 * Simple schema validator for the restaurant data.json structure.
 * This can be expanded to a full JSON Schema validator (using ajv) as the platform scales.
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

import { SiteBuilderData } from "./storage"

export function validateRestaurantData(
  data: SiteBuilderData
): ValidationResult {
  const errors: string[] = []

  // Check required fields (checking both draft field and final name field)
  if (!data.siteName) errors.push("Restaurant name is missing")
  if (!data.uid) errors.push("UID is missing")
  if (!data.address) errors.push("Address is missing")
  if (!data.phone) errors.push("Phone number is missing")

  // Check SEO sections
  if (!data.seoTitle) errors.push("SEO title is missing")
  if (!data.seoDescription) errors.push("SEO description is missing")

  // Check Local SEO
  if (!data.city) errors.push("City is missing")
  if (!data.placeId) errors.push("Google Maps Place ID is missing")

  // Check Menu Categories
  if (!Array.isArray(data.menuCategories)) {
    errors.push("Menu categories must be an array")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

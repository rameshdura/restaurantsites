'use client'

import Script from 'next/script'
import { RestaurantData } from '@/lib/restaurant'
import {
  generateRestaurantSchema,
  generateMenuSchema,
  generateContactSchema,
  generateAboutPageSchema,
  generatePersonSchema,
  generateOrganizationSchema,
} from '@/lib/seo'

interface JsonLdProps {
  restaurant: RestaurantData
  slug: string
  pageType: 'home' | 'about' | 'menu' | 'contact' | 'brand' | 'company'
}

/**
 * JsonLd Component
 * 
 * Injects structured data (JSON-LD) for SEO rich results.
 * Automatically generates appropriate schema.org markup based on page type.
 * 
 * @example
 * <JsonLd 
 *   restaurant={restaurant} 
 *   slug="ramen-taro" 
 *   pageType="home" 
 * />
 */
export function JsonLd({ restaurant, slug, pageType }: JsonLdProps) {
  // Build schema based on page type
  const schemas: Record<string, any> = {}

  // Always include Restaurant schema (base for all restaurant pages)
  schemas.restaurant = generateRestaurantSchema(restaurant, slug)

  switch (pageType) {
    case 'home':
      // Home: Restaurant + BreadcrumbList (handled separately in page)
      break

    case 'about':
      // About: AboutPage + Person (founder) + Restaurant
      schemas.aboutPage = generateAboutPageSchema(restaurant, slug)
      
      // Add founder as Person schema if exists
      if (restaurant.about?.founder) {
        schemas.founder = generatePersonSchema(restaurant.about.founder)
      }
      break

    case 'menu':
      // Menu: Menu schema
      schemas.menu = generateMenuSchema(restaurant, slug)
      break

    case 'contact':
      // Contact: Add ContactPoint to Restaurant schema
      {
        const contactPoints = generateContactSchema(restaurant)
        if (contactPoints.length > 0) {
          schemas.restaurant.contactPoint = contactPoints
        }
      }
      break

    case 'company':
      // Company: Organization schema (overrides Restaurant for this page)
      schemas.organization = generateOrganizationSchema(restaurant)
      break

    case 'brand':
      // Brand page: minimal schema
      // Typically noindex, so no structured data needed
      break
  }

  // If only one schema, render single Script
  const schemaKeys = Object.keys(schemas)
  
  if (schemaKeys.length === 0) {
    return null
  }

   return (
     <>
       {schemaKeys.map((key) => (
         <Script
           key={key}
           id={`json-ld-${key}`}
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify(schemas[key], null, 2),
           }}
         />
       ))}
     </>
   )
}

/**
 * BreadcrumbJsonLd Component
 * Separate component for breadcrumb schema (used on inner pages)
 */
export function BreadcrumbJsonLd({ 
  slug, 
  pageName 
}: { 
  slug: string
  pageName: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${DOMAIN}/${slug}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageName,
        item: `${DOMAIN}/${slug}${pageName.toLowerCase()}`,
      },
    ],
  }

  return (
    <Script
      id="breadcrumb-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  )
}

/**
 * QAPageJsonLd Component (for future FAQ section)
 */
export function QAPageJsonLd({
  questions
}: {
  questions: Array<{
    question: string
    answer: string
  }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question' as const,
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: q.answer,
      },
    })),
  }

  return (
    <Script
      id="qa-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  )
}

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://restaurantsite.io'

/**
 * Validate structured data against schema.org
 * Use in development for debugging
 */
export function validateStructuredData(schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic validation
  if (!schema['@context']) {
    errors.push('Missing @context')
  }
  if (!schema['@type']) {
    errors.push('Missing @type')
  }
  
  // Check for required fields based on type
  const type = schema['@type'] as string
  switch (type) {
    case 'Restaurant':
      if (!schema['name']) errors.push('Restaurant missing name')
      if (!schema['address']) errors.push('Restaurant missing address')
      if (!schema['telephone']) errors.push('Restaurant missing telephone')
      break
    case 'Menu':
      // Validate menu structure
      break
    case 'AboutPage':
      // Validate about page
      break
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

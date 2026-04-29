/**
 * JsonLd Component
 * 
 * Renders JSON-LD structured data as a <script> tag in the page head.
 * Used by all restaurant pages to inject Schema.org structured data
 * for better search engine understanding and rich results.
 */

interface JsonLdProps {
  data: object | object[]
}

export function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {jsonLdData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}

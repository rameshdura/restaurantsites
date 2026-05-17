import React, { Suspense } from "react"
import SiteBuilderClient from "./SiteBuilderClient"

export default function SiteBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SiteBuilderClient />
    </Suspense>
  )
}

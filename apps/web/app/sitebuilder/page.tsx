'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SiteBuilderForm } from './SiteBuilderForm'
import { SiteList } from '@/components/sitebuilder/SiteList'
import { SiteBuilderHeader } from '@/components/sitebuilder/SiteBuilderHeader'
import { Button } from '@workspace/ui/components/button'
import { Plus } from 'lucide-react'
import { SiteBuilderData, getSites } from '@/lib/storage'

export default function SiteBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const action = searchParams.get('action')
  const slug = searchParams.get('slug')
  
  const [siteToEdit, setSiteToEdit] = useState<SiteBuilderData | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (action === 'edit' && slug) {
        const sites = await getSites()
        const found = sites.find(s => s.siteSlug === slug)
        setSiteToEdit(found)
      } else {
        setSiteToEdit(undefined)
      }
      setIsLoading(false)
    }
    init()
  }, [action, slug])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (action === 'edit' || action === 'create') {
    return (
      <>
        <SiteBuilderHeader />
        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{action === 'edit' ? 'Edit Site' : 'Create New Site'}</h2>
            <Button variant="outline" onClick={() => router.push('/sitebuilder')}>
              Back to Dashboard
            </Button>
          </div>
          <SiteBuilderForm initialData={siteToEdit} />
        </main>
      </>
    )
  }

  // Default: Show site list
  return (
    <>
      <SiteBuilderHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Site Builder Dashboard</h2>
          <Button onClick={() => router.push('/sitebuilder?action=create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Site
          </Button>
        </div>
        <SiteList
          onSelectSite={(site) => {
            router.push(`/sitebuilder?action=edit&slug=${site.siteSlug}`)
          }}
          onCreateNew={() => {
            router.push('/sitebuilder?action=create')
          }}
        />
      </main>
    </>
  )
}

'use client'

import React from 'react'
import { Button } from '@workspace/ui/components/button'
import { Edit, Trash2, Plus, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog'
import { useToast } from '@workspace/ui/hooks/use-toast'
import { SiteBuilderData, getSites, saveSites } from '@/lib/storage'

interface SiteListProps {
  onSelectSite: (site: SiteBuilderData) => void
  onCreateNew: () => void
}

export function SiteList({ onSelectSite, onCreateNew }: SiteListProps) {
  const { toast } = useToast()
  const [sites, setSites] = React.useState<SiteBuilderData[]>([])
  const [deleteSiteId, setDeleteSiteId] = React.useState<string | null>(null)
  const [deleteSiteName, setDeleteSiteName] = React.useState<string>('')

  React.useEffect(() => {
    const loadSites = async () => {
      const storedSites = await getSites()
      setSites(storedSites)
    }
    loadSites()
  }, [])

  const handleDelete = async () => {
    if (deleteSiteId) {
      const updatedSites = sites.filter(s => s.siteSlug !== deleteSiteId)
      setSites(updatedSites)
      await saveSites(updatedSites)
      setDeleteSiteId(null)
      setDeleteSiteName('')
      toast({
        title: 'Site deleted',
        description: 'The site has been removed from your list.',
      })
    }
  }

  const handleEdit = (site: SiteBuilderData) => {
    // Save current site to storage
    onSelectSite(site)
  }

  const handleExportAll = () => {
    if (sites.length === 0) {
      toast({
        title: 'No sites',
        description: 'Create some sites first before exporting.',
        variant: 'destructive',
      })
      return
    }

    const exportData = sites.map(site => ({
      [site.siteSlug]: site,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'restaurant-sites-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export successful',
      description: `Downloaded ${sites.length} sites.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Sites</h2>
          <p className="text-muted-foreground">Manage and edit your previously created restaurant sites</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Site
          </Button>
        </div>
      </div>

      {sites.length === 0 ? (
        <Card className="border-dashed border-2 text-center py-16">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No sites yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            You haven&apos;t created any restaurant sites yet. Start building your first site!
          </p>
          <Button onClick={onCreateNew}>Create Your First Site</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site, index) => (
            <Card key={index} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate max-w-[200px]">{site.siteName}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{site.siteSlug}</span>
                </CardTitle>
                <CardDescription>{site.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Address:</span>
                    <span className="truncate flex-1">{site.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Phone:</span>
                    <span className="truncate flex-1">{site.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Email:</span>
                    <span className="truncate flex-1">{site.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-20">Cuisine:</span>
                    <span className="truncate flex-1">{site.cuisineTypes.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 bg-muted/30">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => handleEdit(site)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  size="sm"
                  onClick={() => {
                    setDeleteSiteId(site.siteSlug)
                    setDeleteSiteName(site.siteName)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteSiteId} onOpenChange={(open) => !open && setDeleteSiteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteSiteName}&rdquo;? This action cannot be undone and all site data will be permanently removed from your browser storage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteSiteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

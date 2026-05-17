"use client"

import { useState } from "react"
import { MenuCategory } from "./types"
import { CategoryNav } from "./category-nav"
import { MenuSection } from "./menu-section"
import { MOCK_MENU } from "./mock-data"
import { SectionHeader } from "@workspace/ui/components/section-header"

interface FoodMenuProps {
  categories?: MenuCategory[]
  hideHeader?: boolean
  menuLink?: string
  translations?: {
    common?: {
      foodMenu?: {
        subtitle?: string
        title?: string
        description?: string
        backgroundTitle?: string
        downloadButton?: string
      }
    }
  }
}

export function FoodMenu({
  categories = MOCK_MENU,
  hideHeader = false,
  menuLink,
  translations,
}: FoodMenuProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "")

  const navItems = categories.map((c) => ({ id: c.id, title: c.title }))
  const activeCategory = categories.find((c) => c.id === activeTab)

  const t = translations?.common?.foodMenu || {}

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {!hideHeader && (
        <div className="mb-10 text-center">
          <SectionHeader
            subtitle={t.subtitle || "Delicacies"}
            title={t.title || "Our Menu"}
            description={
              <>
                {t.description || "Artisanal dishes crafted with passion."}
                {menuLink && (
                  <>
                    {" "}
                    <a
                      href={menuLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {t.downloadButton || "Download Menu PDF"}
                    </a>
                  </>
                )}
              </>
            }
            backgroundTitle={t.backgroundTitle || "Flavors"}
            align="center"
          />
        </div>
      )}

      <CategoryNav
        categories={navItems}
        activeId={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[400px]">
        {activeCategory && (
          <MenuSection key={activeCategory.id} category={activeCategory} />
        )}
      </div>
    </div>
  )
}

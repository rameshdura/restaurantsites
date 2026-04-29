"use client";

import { useState } from "react";
import { MenuCategory } from "./types";
import { CategoryNav } from "./category-nav";
import { MenuSection } from "./menu-section";
import { MOCK_MENU } from "./mock-data";
import { SectionHeader } from "@workspace/ui/components/section-header";
import { Download } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface FoodMenuProps {
  categories?: MenuCategory[];
  hideHeader?: boolean;
  menuLink?: string;
}

export function FoodMenu({ categories = MOCK_MENU, hideHeader = false, menuLink }: FoodMenuProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "");
  
  const navItems = categories.map((c) => ({ id: c.id, title: c.title }));
  const activeCategory = categories.find((c) => c.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!hideHeader && (
        <SectionHeader 
          subtitle="Delicacies"
          title="Our Menu"
          description="Artisanal dishes crafted with passion."
          backgroundTitle="Flavors"
          align="center"
          className="mb-10"
        />
      )}

      <CategoryNav 
        categories={navItems} 
        activeId={activeTab} 
        onTabChange={setActiveTab} 
      >
        {menuLink && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 whitespace-nowrap"
            asChild
          >
            <a href={menuLink} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              Menu PDF
            </a>
          </Button>
        )}
      </CategoryNav>

       <div className="min-h-[400px]">
         {activeCategory && (
           <MenuSection key={activeCategory.id} category={activeCategory} />
         )}
       </div>
     </div>
   );
 }

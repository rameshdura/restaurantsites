"use client"

import { Button } from "@workspace/ui/components/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2" 
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4" />
      Print Assets
    </Button>
  )
}

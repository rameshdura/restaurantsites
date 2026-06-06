"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { LayoutGrid, UserX, CheckCircle2 } from "lucide-react"

interface TableListSidebarProps {
  restaurantSlug: string
  tables: { id: string | number; label: string; persons?: number }[]
  sessions: { table_number: string; status: string; persons?: number }[]
  onTableSelect?: () => void
}

export function TableListSidebar({
  restaurantSlug,
  tables,
  sessions,
  onTableSelect,
}: TableListSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTableId = searchParams.get("tableId")

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <button
          onClick={() => {
            router.push(`/${restaurantSlug}/owner/tables`)
            onTableSelect?.()
          }}
          className="flex items-center gap-2 text-lg font-bold transition-colors hover:text-primary"
        >
          <LayoutGrid className="h-5 w-5" />
          Tables
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tables.map((table) => {
          const activeSession = sessions.find(
            (s) => String(s.table_number) === String(table.id)
          )
          const isPacked = !!activeSession
          const isSelected = String(table.id) === String(currentTableId)

          return (
            <button
              key={table.id}
              onClick={() => {
                router.push(`?tableId=${table.id}`)
                onTableSelect?.()
              }}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {isPacked ? (
                <UserX className="h-5 w-5 opacity-70" />
              ) : (
                <CheckCircle2 className="h-5 w-5 opacity-70" />
              )}
              <span className="font-semibold break-words">{table.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

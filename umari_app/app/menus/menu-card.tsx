"use client"

import type { Menu } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface MenuCardProps {
  menu: Menu
  onDelete: (menuId: string) => void
}

export function MenuCard({ menu, onDelete }: MenuCardProps) {
  const formattedDate = new Date(menu.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const itemCount = menu.items_count || 0
  const itemText = itemCount === 1 ? 'item' : 'items'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-secondary/40 hover:border-secondary/60 rounded-xl p-6 transition-all duration-200 h-full flex flex-col shadow-lg"
    >
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {menu.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-2">
        {itemCount} {itemText}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Created {formattedDate}
      </p>
      
      <div className="flex gap-2 mt-auto">
        <Link href={`/menus/${menu.id}/edit`} className="flex-1">
          <Button
            variant="outline"
            className="w-full border-secondary/40 hover:border-secondary/60 text-foreground"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => onDelete(menu.id)}
          className="border-destructive/40 hover:border-destructive/60 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}


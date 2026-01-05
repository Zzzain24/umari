"use client"

import type { Menu } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, Share2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface MenuCardProps {
  menu: Menu
  onDelete: (menuId: string) => void
}

export function MenuCard({ menu, onDelete }: MenuCardProps) {
  const { toast } = useToast()
  const formattedDate = new Date(menu.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const itemCount = menu.items_count || 0
  const itemText = itemCount === 1 ? 'item' : 'items'

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/view/${menu.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Menu link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

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
      
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex gap-2">
          <Link href={`/view/${menu.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-secondary/40 hover:border-secondary/60 text-foreground"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </Link>
          <Link href={`/menus/${menu.id}/edit`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-secondary/40 hover:border-secondary/60 text-foreground"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-secondary/40 hover:border-secondary/60 text-foreground"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(menu.id)}
            className="border-destructive/40 hover:border-destructive/60 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


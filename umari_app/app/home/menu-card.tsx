"use client"

import type { Menu } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, Share2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface MenuCardProps {
  menu: Menu
  onDelete?: (menuId: string) => void
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
    <div className="bg-card border border-secondary/40 hover:border-secondary/60 rounded-xl p-4 transition-all duration-200 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-2">
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
          <Link href={`/view/${menu.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-secondary/40 hover:border-secondary/60 text-foreground text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </Link>
          <Link href={`/menus/${menu.id}/edit`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-secondary/40 hover:border-secondary/60 text-foreground text-xs"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 border-secondary/40 hover:border-secondary/60 text-foreground text-xs"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(menu.id)}
              className="border-destructive/40 hover:border-destructive/60 text-destructive hover:text-destructive text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

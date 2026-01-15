"use client"

import type { Menu } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { deleteMenu } from "@/app/menus/actions"
import { Separator } from "@/components/ui/separator"
import { Eye, Pencil, Share2, Trash2, MoreHorizontal, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MenuCarouselContentProps {
  menus: Menu[]
}

export function MenuCarouselContent({ menus }: MenuCarouselContentProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (menuId: string) => {
    setDeleteMenuId(menuId)
  }

  const handleShare = async (menuId: string) => {
    const shareUrl = `${window.location.origin}/view/${menuId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Menu link has been copied to clipboard.",
      })
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteMenuId) return

    setIsDeleting(true)
    try {
      const result = await deleteMenu(deleteMenuId)
      if (result.success) {
        toast({
          title: "Menu deleted",
          description: "The menu has been deleted successfully.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete menu",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteMenuId(null)
    }
  }

  return (
    <>
      <div className="space-y-0">
        {/* Table Header - Desktop Only */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Menu Name</div>
          <div className="col-span-2">Items</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <Separator />

        {/* Menu Rows - Show up to 5 menus */}
        {menus.slice(0, 5).map((menu, index) => {
          const formattedDate = new Date(menu.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
          const itemCount = menu.items_count || 0
          const itemText = itemCount === 1 ? 'item' : 'items'

          return (
            <div key={menu.id}>
              {/* Desktop Row */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center px-4 py-3 group hover:bg-accent/50 rounded-lg transition-colors">
                <div className="col-span-5">
                  <Link href={`/menus/${menu.id}/edit`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {menu.name}
                  </Link>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">{itemCount} {itemText}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-muted-foreground">{formattedDate}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Link href={`/view/${menu.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/menus/${menu.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleShare(menu.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(menu.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Row */}
              <div className="sm:hidden flex items-center justify-between py-3 px-4 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/menus/${menu.id}/edit`} className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate">
                    {menu.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {itemCount} {itemText} · {formattedDate}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/view/${menu.id}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/menus/${menu.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(menu.id)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(menu.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {index < Math.min(menus.length, 5) - 1 && <Separator />}
            </div>
          )
        })}

        {/* Footer Actions */}
        <Separator className="mt-2" />
        <div className="pt-4 flex justify-center gap-3">
          <Link href="/menus/new?from=home">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />
              Create Menu
            </Button>
          </Link>
          <Link href="/menus">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View All Menus
            </Button>
          </Link>
        </div>
      </div>

      <AlertDialog open={deleteMenuId !== null} onOpenChange={(open) => !open && setDeleteMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

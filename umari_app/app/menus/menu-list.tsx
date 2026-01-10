"use client"

import type { Menu } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { MenuCard } from "./menu-card"
import { MenusEmpty } from "./menus-empty"
import { deleteMenu } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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
import { useState } from "react"

interface MenuListProps {
  menus: Menu[]
}

export function MenuList({ menus }: MenuListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (menuId: string) => {
    setDeleteMenuId(menuId)
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

  if (menus.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MenusEmpty />
      </main>
    )
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your Menus
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your menus
            </p>
          </div>
          <Link href="/menus/new" className="self-start sm:self-auto">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create New Menu
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} onDelete={handleDeleteClick} />
          ))}
        </div>
      </main>

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


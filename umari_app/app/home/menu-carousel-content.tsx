"use client"

import type { Menu } from "@/lib/types"
import { MenuCard } from "./menu-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { deleteMenu } from "@/app/menus/actions"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
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
      <div className="space-y-6">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {menus.slice(0, 3).map((menu) => (
              <CarouselItem key={menu.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <MenuCard menu={menu} onDelete={handleDeleteClick} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {menus.length > 0 && (
          <div className="flex justify-center">
            <Link href="/menus">
              <Button variant="outline" className="border-secondary/40 hover:border-secondary/60 text-foreground">
                View All Menus
              </Button>
            </Link>
          </div>
        )}
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

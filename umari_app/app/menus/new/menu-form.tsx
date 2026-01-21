"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Plus, ArrowLeft } from "lucide-react"
import { createMenu } from "./actions"
import { updateMenu } from "../[id]/edit/actions"
import { MenuItemEditor } from "./menu-item-editor"
import type { MenuItemOption } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { QRCodeDisplay } from "@/components/ui/qr-code-display"

interface MenuItem {
  id?: string
  name: string
  price: number
  is_sold_out?: boolean
  allow_special_instructions?: boolean
  options?: MenuItemOption[]
}

interface MenuFormProps {
  menuId?: string
  initialMenuName?: string
  initialItems?: MenuItem[]
}

export function MenuForm({ menuId, initialMenuName = '', initialItems }: MenuFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isEditMode = !!menuId
  const fromHome = searchParams.get('from') === 'home'
  const backUrl = fromHome ? '/home' : '/menus'
  const [menuName, setMenuName] = useState(initialMenuName)
  const [items, setItems] = useState<MenuItem[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [
          {
            name: '',
            price: 0,
            is_sold_out: false,
            allow_special_instructions: true,
            options: [],
          },
        ]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (menuId) {
      setQrUrl(`${window.location.origin}/view/${menuId}`)
    }
  }, [menuId])

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        price: 0,
        is_sold_out: false,
        allow_special_instructions: true,
        options: [],
      },
    ])
  }

  const handleUpdateItem = (index: number, updatedItem: MenuItem) => {
    const newItems = [...items]
    newItems[index] = updatedItem
    setItems(newItems)
  }

  const handleDeleteItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    } else {
      toast({
        title: "Cannot delete",
        description: "At least one menu item is required.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!menuName.trim()) {
      setError("Menu name is required")
      return
    }

    if (items.length === 0) {
      setError("At least one menu item is required")
      return
    }

    // Validate all items
    for (const item of items) {
      if (!item.name || !item.name.trim()) {
        setError("All items must have a name")
        return
      }
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
        setError("All items must have a valid price greater than 0")
        return
      }

      // Validate options
      if (item.options) {
        for (const option of item.options) {
          if (!option.name.trim()) {
            setError("All option names must be filled")
            return
          }
          if (!option.options || option.options.length === 0 || option.options.every(v => !v.value || !v.value.trim())) {
            setError("All options must have at least one value")
            return
          }
        }
      }
    }

    setIsLoading(true)

    try {
      if (isEditMode && menuId) {
        const result = await updateMenu(menuId, {
          name: menuName.trim(),
          items: items.map(item => ({
            id: item.id,
            name: item.name.trim(),
            price: item.price,
            is_sold_out: item.is_sold_out || false,
            allow_special_instructions: item.allow_special_instructions ?? true,
            options: item.options?.map(opt => ({
              id: opt.id,
              name: opt.name.trim(),
              options: opt.options
                .filter(v => v.value && v.value.trim().length > 0)
                .map(v => ({
                  value: v.value.trim(),
                  price: v.price !== undefined && v.price > 0 ? v.price : undefined,
                })),
              is_required: opt.is_required,
            })),
          })),
        })

        if (!result.success) {
          setError(result.error || "Failed to update menu")
          setIsLoading(false)
          return
        }

        toast({
          title: "Menu updated",
          description: "Your menu has been updated successfully.",
        })

        router.push('/menus')
        router.refresh()
      } else {
        const result = await createMenu({
          name: menuName.trim(),
          items: items.map(item => ({
            name: item.name.trim(),
            price: item.price,
            is_sold_out: item.is_sold_out || false,
            allow_special_instructions: item.allow_special_instructions ?? true,
            options: item.options?.map(opt => ({
              name: opt.name.trim(),
              options: opt.options
                .filter(v => v.value && v.value.trim().length > 0)
                .map(v => ({
                  value: v.value.trim(),
                  price: v.price !== undefined && v.price > 0 ? v.price : undefined,
                })),
              is_required: opt.is_required,
            })),
          })),
        })

        toast({
          title: "Menu created",
          description: "Your menu has been created successfully.",
        })

        router.push('/menus')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || (isEditMode ? "Failed to update menu" : "Failed to create menu"))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={backUrl}
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {fromHome ? 'Back to Home' : 'Back to Menus'}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditMode ? "Edit Menu" : "Create New Menu"}
            </h1>
            <p className="text-muted-foreground">
              Add items and customize options for your menu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="menu-name" className="text-foreground">
                Menu Name
              </Label>
              <Input
                id="menu-name"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="e.g., Coffee Menu, Dinner Menu"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                required
              />
            </div>

            {/* Menu Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Menu Items</h2>
                  <p className="text-sm text-muted-foreground">
                    Add items to your menu with names, prices, and options
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="border-border hover:bg-secondary/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <MenuItemEditor
                    key={item.id || index}
                    item={item}
                    onUpdate={(updatedItem) => handleUpdateItem(index, updatedItem)}
                    onDelete={() => handleDeleteItem(index)}
                  />
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Link href={backUrl}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="border-border hover:bg-secondary/10"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Menu"
                    : "Create Menu"}
              </Button>
            </div>
          </form>

          <Separator className="my-8" />

          {isEditMode && menuId && qrUrl ? (
            <div className="flex flex-col items-center space-y-4 pb-8">
              <h2 className="text-lg font-semibold text-foreground">
                QR Code for Menu
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Share this QR code to let customers view your menu
              </p>
              <QRCodeDisplay
                url={qrUrl}
                menuName={menuName}
                size={180}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 pb-8">
              <p className="text-sm text-muted-foreground text-center">
                A shareable QR code will be generated once your menu is created
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}


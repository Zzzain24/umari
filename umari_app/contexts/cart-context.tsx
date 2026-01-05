"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import type { CartItem, CartContextType } from "@/lib/types"
import { generateCartItemId, isLocalStorageAvailable } from "@/lib/cart-utils"
import { useToast } from "@/hooks/use-toast"

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
  menuId: string
}

export function CartProvider({ children, menuId }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { toast } = useToast()

  const storageKey = `umari-cart-${menuId}`

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      console.warn("localStorage is not available")
      return
    }

    try {
      const savedCart = localStorage.getItem(storageKey)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      localStorage.removeItem(storageKey)
    }
  }, [menuId, storageKey])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      return
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(cart))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
      if (error instanceof Error && error.name === "QuotaExceededError") {
        toast({
          title: "Storage Full",
          description: "Cart won't persist. Clear browser data or reduce cart size.",
          variant: "destructive",
        })
      }
    }
  }, [cart, storageKey, toast])

  // Computed values
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [cart])

  // Cart actions
  const addToCart = (item: Omit<CartItem, "id">) => {
    const newItem: CartItem = {
      ...item,
      id: generateCartItemId(),
    }

    setCart((prevCart) => [...prevCart, newItem])

    toast({
      title: "Added to cart",
      description: `${item.itemName} (Qty: ${item.quantity})`,
      duration: 1000,
    })
  }

  const removeFromCart = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId)

    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))

    if (item) {
      toast({
        title: "Item removed",
        description: `${item.itemName} removed from cart`,
        duration: 1000,
      })
    }
  }

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    )

    toast({
      title: "Cart updated",
      description: "Item has been updated",
      duration: 2000,
    })
  }

  const clearCart = () => {
    setCart([])
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
      duration: 2000,
    })
  }

  const openCart = () => {
    setIsCartOpen(true)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const value: CartContextType = {
    cart,
    isCartOpen,
    totalItems,
    subtotal,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

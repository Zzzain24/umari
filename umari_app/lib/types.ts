export interface Menu {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  items_count?: number // Computed from menu_items count
}

export interface MenuItemOptionValue {
  value: string
  price?: number // Optional price difference for this option value
}

export interface MenuItemOption {
  id?: string
  menu_item_id?: string
  name: string
  options: MenuItemOptionValue[] // Array of option values with optional prices
  is_required: boolean
  created_at?: string
  updated_at?: string
}

export interface MenuItem {
  id: string
  menu_id: string
  name: string
  price: number
  created_at: string
  updated_at: string
  options?: MenuItemOption[]
}

// Cart Types
export interface SelectedOption {
  optionName: string
  selectedValue: string
  additionalPrice: number
}

export interface CartItem {
  id: string
  menuItemId: string
  itemName: string
  basePrice: number
  quantity: number
  selectedOptions: SelectedOption[]
  totalPrice: number
}

export interface CartContextType {
  cart: CartItem[]
  isCartOpen: boolean
  totalItems: number
  subtotal: number
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

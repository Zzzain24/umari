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

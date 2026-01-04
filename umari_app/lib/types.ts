export interface Menu {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  items_count?: number // Computed from menu_items count
}

export interface MenuItem {
  id: string
  menu_id: string
  name: string
  price: number
  created_at: string
  updated_at: string
}

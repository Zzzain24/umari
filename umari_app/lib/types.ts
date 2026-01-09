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

export interface MenuItemForCart {
  id: string
  name: string
  price: number
  options?: MenuItemOption[]
}

export interface CartContextType {
  cart: CartItem[]
  isCartOpen: boolean
  totalItems: number
  subtotal: number
  getMenuItem: (menuItemId: string) => MenuItemForCart | undefined
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

// Stripe & Payment Types
export interface StripeAccount {
  id: string
  user_id: string
  stripe_account_id: string
  stripe_user_id: string | null
  access_token: string
  refresh_token: string | null
  scope: string | null
  account_type: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  country: string | null
  currency: string | null
  email: string | null
  business_name: string | null
  connected_at: string
  updated_at: string
}

export interface PaymentSettings {
  id: string
  user_id: string
  monetization_model: 'application_fee' | 'subscription' | 'none'
  application_fee_percentage: number
  subscription_tier: string | null
  accepts_cards: boolean
  accepts_apple_pay: boolean
  accepts_google_pay: boolean
  default_currency: string
  supported_currencies: string[]
  statement_descriptor: string | null
  auto_payout_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  menu_id: string
  customer_user_id: string | null
  business_user_id: string
  items: CartItem[]
  subtotal: number
  platform_fee: number
  total: number
  stripe_payment_intent_id: string | null
  stripe_account_id: string | null
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  order_status: 'received' | 'ready' | 'cancelled'
  order_type: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

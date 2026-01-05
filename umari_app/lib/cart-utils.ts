import type { MenuItemOption, SelectedOption } from "./types"

/**
 * Generate a unique ID for a cart item
 */
export function generateCartItemId(): string {
  return crypto.randomUUID()
}

/**
 * Calculate the total price for a cart item
 * @param basePrice - Base price of the menu item
 * @param selectedOptions - Array of selected options with their prices
 * @param quantity - Quantity of the item
 * @returns Total price (basePrice + option prices) * quantity
 */
export function calculateItemPrice(
  basePrice: number,
  selectedOptions: SelectedOption[],
  quantity: number
): number {
  const optionsPrice = selectedOptions.reduce(
    (sum, opt) => sum + opt.additionalPrice,
    0
  )
  return (basePrice + optionsPrice) * quantity
}

/**
 * Validate that all required options have been selected
 * @param menuOptions - Array of menu item options
 * @param selectedOptions - Array of user-selected options
 * @returns true if all required options are selected, false otherwise
 */
export function validateRequiredOptions(
  menuOptions: MenuItemOption[],
  selectedOptions: SelectedOption[]
): boolean {
  const requiredOptions = menuOptions.filter((opt) => opt.is_required)

  return requiredOptions.every((reqOpt) =>
    selectedOptions.some((selOpt) => selOpt.optionName === reqOpt.name)
  )
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = "__test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

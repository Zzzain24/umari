"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import type { MenuItemOption, SelectedOption } from "@/lib/types"

interface MenuItemOptionsProps {
  options: MenuItemOption[]
  selectedOptions: SelectedOption[]
  onChange: (selectedOptions: SelectedOption[]) => void
}

export function MenuItemOptions({
  options,
  selectedOptions,
  onChange,
}: MenuItemOptionsProps) {
  const handleOptionChange = (optionName: string, value: string) => {
    // Find the option configuration
    const optionConfig = options.find((opt) => opt.name === optionName)
    if (!optionConfig) return

    // Find the selected value configuration
    const valueConfig = optionConfig.options.find(
      (optVal) => optVal.value === value
    )
    if (!valueConfig) return

    // Create new selected option
    const newSelection: SelectedOption = {
      optionName,
      selectedValue: value,
      additionalPrice: valueConfig.price || 0,
    }

    // Update selected options array
    const updatedOptions = selectedOptions.filter(
      (opt) => opt.optionName !== optionName
    )
    onChange([...updatedOptions, newSelection])
  }

  return (
    <div className="space-y-6 mt-4">
      {options.map((option) => {
        const currentSelection = selectedOptions.find(
          (sel) => sel.optionName === option.name
        )

        return (
          <div key={option.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold text-foreground">
                {option.name}
              </Label>
              {option.is_required && (
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            <RadioGroup
              value={currentSelection?.selectedValue || ""}
              onValueChange={(value) => handleOptionChange(option.name, value)}
              aria-required={option.is_required}
              aria-label={option.name}
            >
              {option.options.map((optValue) => (
                <div
                  key={optValue.value}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={optValue.value}
                    id={`${option.name}-${optValue.value}`}
                  />
                  <Label
                    htmlFor={`${option.name}-${optValue.value}`}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {optValue.value}
                    {optValue.price !== undefined && optValue.price > 0 && (
                      <span className="text-muted-foreground ml-2">
                        +${optValue.price.toFixed(2)}
                      </span>
                    )}
                    {optValue.price !== undefined && optValue.price < 0 && (
                      <span className="text-muted-foreground ml-2">
                        -${Math.abs(optValue.price).toFixed(2)}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      })}
    </div>
  )
}

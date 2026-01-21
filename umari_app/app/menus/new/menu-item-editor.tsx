"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react"
import type { MenuItemOption } from "@/lib/types"
import { MenuItemOptionEditor } from "./menu-item-option-editor"
import { Switch } from "@/components/ui/switch"

interface MenuItemEditorProps {
  item: {
    id?: string
    name: string
    price: number
    is_sold_out?: boolean
    allow_special_instructions?: boolean
    options?: MenuItemOption[]
  }
  onUpdate: (item: { id?: string; name: string; price: number; is_sold_out?: boolean; allow_special_instructions?: boolean; options?: MenuItemOption[] }) => void
  onDelete: () => void
}

export function MenuItemEditor({ item, onUpdate, onDelete }: MenuItemEditorProps) {
  const [showOptions, setShowOptions] = useState(item.options && item.options.length > 0)
  const [priceInput, setPriceInput] = useState<string>(item.price > 0 ? item.price.toString() : '')

  // Sync priceInput when item.price changes externally
  useEffect(() => {
    if (item.price > 0) {
      setPriceInput(item.price.toString())
    } else if (item.price === 0 && priceInput === '') {
      // Keep empty if it was empty
      setPriceInput('')
    }
  }, [item.price])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...item,
      name: e.target.value,
    })
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Limit to 2 decimal places in real-time
    if (inputValue.includes('.')) {
      const parts = inputValue.split('.')
      if (parts.length === 2 && parts[1].length > 2) {
        inputValue = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }

    // Update the input display value
    setPriceInput(inputValue)

    // Convert to number and update state
    if (inputValue === '' || inputValue === '.') {
      onUpdate({
        ...item,
        price: 0,
      })
      return
    }

    const value = parseFloat(inputValue)
    if (!isNaN(value) && value >= 0) {
      onUpdate({
        ...item,
        price: value,
      })
    }
  }

  const handleAddOption = () => {
    const newOption: MenuItemOption = {
      name: '',
      options: [{ value: '', price: undefined }],
      is_required: false,
    }
    onUpdate({
      ...item,
      options: [...(item.options || []), newOption],
    })
    setShowOptions(true)
  }

  const handleUpdateOption = (index: number, option: MenuItemOption) => {
    const newOptions = [...(item.options || [])]
    newOptions[index] = option
    onUpdate({
      ...item,
      options: newOptions,
    })
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = (item.options || []).filter((_, i) => i !== index)
    onUpdate({
      ...item,
      options: newOptions,
    })
  }

  return (
    <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
      <div className="space-y-3">
        {/* Header Row: Title + Delete */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">Menu Item</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 md:w-auto p-0 md:px-3"
          >
            <X className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Delete Item</span>
          </Button>
        </div>

        {/* Toggles Row: Always visible, stacks on mobile */}
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
          {/* Sold Out Toggle */}
          <div className="flex items-center justify-between xs:justify-start gap-2">
            <Label htmlFor={`sold-out-${item.id || 'new'}`} className="text-sm text-muted-foreground">
              Sold Out
            </Label>
            <Switch
              id={`sold-out-${item.id || 'new'}`}
              checked={item.is_sold_out || false}
              onCheckedChange={(checked) => onUpdate({ ...item, is_sold_out: checked })}
            />
          </div>

          {/* Special Instructions Toggle */}
          <div className="flex items-center justify-between xs:justify-start gap-2">
            <Label htmlFor={`allow-instructions-${item.id || 'new'}`} className="text-sm text-muted-foreground">
              Special Instructions
            </Label>
            <Switch
              id={`allow-instructions-${item.id || 'new'}`}
              checked={item.allow_special_instructions ?? true}
              onCheckedChange={(checked) => onUpdate({ ...item, allow_special_instructions: checked })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`item-name-${item.id || Math.random()}`} className="text-foreground">
            Item Name
          </Label>
          <Input
            id={`item-name-${item.id || Math.random()}`}
            value={item.name}
            onChange={handleNameChange}
            placeholder="e.g., Coffee, Pizza"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`item-price-${item.id || Math.random()}`} className="text-foreground">
            Price ($)
          </Label>
          <Input
            id={`item-price-${item.id || Math.random()}`}
            type="text"
            inputMode="decimal"
            value={priceInput}
            onChange={handlePriceChange}
            placeholder="0.00"
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div>
              <h4 className="text-sm font-medium text-foreground">Options/Variations</h4>
              <p className="text-xs text-muted-foreground">Add options like size, milk type, etc.</p>
            </div>
            {item.options && item.options.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="h-8 w-8 p-0 shrink-0"
              >
                {showOptions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="border-border hover:bg-secondary/10 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>

        {item.options && item.options.length > 0 && showOptions && (
          <div className="space-y-3">
            {item.options.map((option, index) => (
              <MenuItemOptionEditor
                key={option.id || index}
                option={option}
                onUpdate={(updatedOption) => handleUpdateOption(index, updatedOption)}
                onDelete={() => handleDeleteOption(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


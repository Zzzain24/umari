"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { MenuItemOption } from "@/lib/types"

interface MenuItemOptionEditorProps {
  option: MenuItemOption
  onUpdate: (option: MenuItemOption) => void
  onDelete: () => void
}

export function MenuItemOptionEditor({ option, onUpdate, onDelete }: MenuItemOptionEditorProps) {
  // State to track price input values for each option value
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {}
    option.options.forEach((opt, idx) => {
      if (opt.price !== undefined && opt.price > 0) {
        initial[idx] = opt.price.toString()
      }
    })
    return initial
  })

  // Sync price inputs when option changes externally
  useEffect(() => {
    const newInputs: Record<number, string> = {}
    option.options.forEach((opt, idx) => {
      if (opt.price !== undefined && opt.price > 0) {
        const formatted = opt.price.toFixed(2).replace(/\.?0+$/, '')
        newInputs[idx] = formatted
      } else {
        newInputs[idx] = ''
      }
    })
    setPriceInputs(newInputs)
  }, [option.options.map(opt => opt.price).join(',')])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...option,
      name: e.target.value,
    })
  }

  const handleOptionValueChange = (index: number, value: string) => {
    const newOptions = [...option.options]
    newOptions[index] = {
      ...newOptions[index],
      value: value,
    }
    onUpdate({
      ...option,
      options: newOptions,
    })
  }

  const handleOptionPriceChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Limit to 2 decimal places in real-time
    if (inputValue.includes('.')) {
      const parts = inputValue.split('.')
      if (parts.length === 2 && parts[1].length > 2) {
        inputValue = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }

    // Update the input display value
    setPriceInputs(prev => ({
      ...prev,
      [index]: inputValue,
    }))

    // Convert to number and update state
    if (inputValue === '' || inputValue === '.') {
      const newOptions = [...option.options]
      newOptions[index] = {
        ...newOptions[index],
        price: undefined,
      }
      onUpdate({
        ...option,
        options: newOptions,
      })
      return
    }

    const priceValue = parseFloat(inputValue)
    if (!isNaN(priceValue) && priceValue >= 0) {
      const newOptions = [...option.options]
      newOptions[index] = {
        ...newOptions[index],
        price: priceValue,
      }
      onUpdate({
        ...option,
        options: newOptions,
      })
    }
  }

  const handleAddOptionValue = () => {
    onUpdate({
      ...option,
      options: [...option.options, { value: '', price: undefined }],
    })
  }

  const handleRemoveOptionValue = (index: number) => {
    const newOptions = option.options.filter((_, i) => i !== index)
    onUpdate({
      ...option,
      options: newOptions.length > 0 ? newOptions : [{ value: '', price: undefined }],
    })
  }

  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...option,
      is_required: e.target.checked,
    })
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-background">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">Option Details</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`option-name-${option.id || Math.random()}`} className="text-sm text-foreground">
          Option Name (e.g., "Size", "Milk Type")
        </Label>
        <Input
          id={`option-name-${option.id || Math.random()}`}
          value={option.name}
          onChange={handleNameChange}
          placeholder="Size"
          className="bg-background border-border text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Option Values</Label>
        <div className="space-y-2">
          {option.options.map((optionValue, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={optionValue.value || ''}
                onChange={(e) => handleOptionValueChange(index, e.target.value)}
                placeholder={`Value ${index + 1}`}
                className="bg-background border-border text-foreground flex-1"
              />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={priceInputs[index] || ''}
                    onChange={(e) => handleOptionPriceChange(index, e)}
                    placeholder="0.00"
                    className="bg-background border-border text-foreground w-24 pl-8"
                  />
                </div>
                {option.options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOptionValue(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOptionValue}
          className="w-full border-border hover:bg-secondary/10"
        >
          Add Value
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`option-required-${option.id || Math.random()}`}
          checked={option.is_required}
          onChange={handleRequiredChange}
          className="rounded border-border bg-background text-primary focus:ring-primary/20"
        />
        <Label htmlFor={`option-required-${option.id || Math.random()}`} className="text-sm text-foreground cursor-pointer">
          Required selection
        </Label>
      </div>
    </div>
  )
}


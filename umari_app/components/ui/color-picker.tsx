"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Gray", value: "#9CA3AF" },
] as const

const DEFAULT_COLOR = "#9CA3AF"

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value = DEFAULT_COLOR, onChange, className }: ColorPickerProps) {
  const [hexInput, setHexInput] = React.useState(value.toUpperCase())
  const [isValid, setIsValid] = React.useState(true)

  // Sync hexInput when value changes externally
  React.useEffect(() => {
    setHexInput(value.toUpperCase())
  }, [value])

  const validateHex = (hex: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(hex)
  }

  const handlePresetClick = (colorValue: string) => {
    setHexInput(colorValue.toUpperCase())
    setIsValid(true)
    onChange(colorValue)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Ensure it starts with #
    if (inputValue && !inputValue.startsWith("#")) {
      inputValue = "#" + inputValue
    }

    // Limit to 7 characters (# + 6 hex digits)
    if (inputValue.length > 7) {
      inputValue = inputValue.substring(0, 7)
    }

    // Convert to uppercase
    inputValue = inputValue.toUpperCase()

    setHexInput(inputValue)

    // Validate if complete (7 characters)
    if (inputValue.length === 7) {
      const valid = validateHex(inputValue)
      setIsValid(valid)
      if (valid) {
        onChange(inputValue)
      }
    } else {
      setIsValid(true) // Don't show error while typing
    }
  }

  const handleHexBlur = () => {
    // On blur, validate and fix if needed
    if (hexInput.length === 7 && validateHex(hexInput)) {
      onChange(hexInput)
    } else if (hexInput.length > 0 && hexInput.length < 7) {
      // If incomplete, reset to current value
      setHexInput(value.toUpperCase())
      setIsValid(true)
    } else if (!validateHex(hexInput)) {
      // If invalid, reset to current value
      setHexInput(value.toUpperCase())
      setIsValid(true)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label className="text-foreground">Label Color</Label>
        <div className="flex items-center gap-3">
          {/* Preview Circle */}
          <div
            className="w-10 h-10 rounded-full border-2 border-border shrink-0"
            style={{ backgroundColor: isValid ? hexInput : value }}
          />
          {/* Hex Input */}
          <div className="flex-1">
            <Input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              placeholder="#9CA3AF"
              className={cn(
                "bg-background border-border text-foreground font-mono",
                !isValid && "border-destructive"
              )}
              maxLength={7}
            />
            {!isValid && hexInput.length === 7 && (
              <p className="text-xs text-destructive mt-1">Invalid hex color</p>
            )}
          </div>
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Preset Colors</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handlePresetClick(color.value)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                value.toUpperCase() === color.value.toUpperCase()
                  ? "border-foreground ring-2 ring-ring ring-offset-2"
                  : "border-border"
              )}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} color`}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter } from "lucide-react"

interface OrderFilterPopoverProps {
  statusFilter: ('received' | 'ready' | 'cancelled')[]
  labelFilter: string[]
  availableLabels: Array<{ name: string; color: string }>
  onStatusFilterChange: (statuses: ('received' | 'ready' | 'cancelled')[]) => void
  onLabelFilterChange: (labels: string[]) => void
  onClearFilters: () => void
}

export function OrderFilterPopover({
  statusFilter,
  labelFilter,
  availableLabels,
  onStatusFilterChange,
  onLabelFilterChange,
  onClearFilters,
}: OrderFilterPopoverProps) {
  const activeFilterCount = statusFilter.length + labelFilter.length

  const toggleStatusFilter = (status: 'received' | 'ready' | 'cancelled') => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status))
    } else {
      onStatusFilterChange([...statusFilter, status])
    }
  }

  const toggleLabelFilter = (label: string) => {
    if (labelFilter.includes(label)) {
      onLabelFilterChange(labelFilter.filter(l => l !== label))
    } else {
      onLabelFilterChange([...labelFilter, label])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border/60 hover:bg-accent/50"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-3">Filter Items</h4>
          </div>

          {/* Status Filter Section */}
          <div>
            <div className="text-sm font-medium mb-2 text-muted-foreground">Status</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-received"
                  checked={statusFilter.includes('received')}
                  onCheckedChange={() => toggleStatusFilter('received')}
                />
                <label
                  htmlFor="filter-received"
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Received
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-ready"
                  checked={statusFilter.includes('ready')}
                  onCheckedChange={() => toggleStatusFilter('ready')}
                />
                <label
                  htmlFor="filter-ready"
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ready
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-cancelled"
                  checked={statusFilter.includes('cancelled')}
                  onCheckedChange={() => toggleStatusFilter('cancelled')}
                />
                <label
                  htmlFor="filter-cancelled"
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cancelled
                </label>
              </div>
            </div>
          </div>

          {/* Label Filter Section */}
          {availableLabels.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 text-muted-foreground">Category</div>
              <div className="space-y-2">
                {availableLabels.map((label) => {
                  return (
                    <div key={label.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-label-${label.name}`}
                        checked={labelFilter.includes(label.name)}
                        onCheckedChange={() => toggleLabelFilter(label.name)}
                      />
                      <label
                        htmlFor={`filter-label-${label.name}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

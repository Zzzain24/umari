"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Mail, Phone } from "lucide-react"

interface CustomerPopoverProps {
  name: string | null
  email: string | null
  phone: string | null
}

export function CustomerPopover({ name, email, phone }: CustomerPopoverProps) {
  const displayName = name || 'Guest'
  const hasContactInfo = email || phone

  if (!hasContactInfo) {
    return <span className="text-sm text-foreground">{displayName}</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-foreground text-left truncate max-w-[150px] underline underline-offset-2">
          {displayName}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">{displayName}</p>

          {email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href={`mailto:${email}`}
                className="text-sm text-foreground hover:underline truncate"
              >
                {email}
              </a>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href={`tel:${phone}`}
                className="text-sm text-foreground hover:underline"
              >
                {phone}
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

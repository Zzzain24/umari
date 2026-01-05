"use client"

import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MenuCarouselEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <LayoutGrid className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No menus yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Create your first menu to get started with managing your offerings
      </p>
      <Link href="/menus/new">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Create Your First Menu
        </Button>
      </Link>
    </div>
  )
}

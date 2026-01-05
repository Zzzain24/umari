"use client"

import type { Menu } from "@/lib/types"
import { MenuCard } from "./menu-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

interface MenuCarouselContentProps {
  menus: Menu[]
}

export function MenuCarouselContent({ menus }: MenuCarouselContentProps) {
  return (
    <div className="space-y-6">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {menus.slice(0, 3).map((menu) => (
            <CarouselItem key={menu.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <MenuCard menu={menu} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {menus.length > 0 && (
        <div className="flex justify-center">
          <Link href="/menus">
            <Button variant="outline" className="border-secondary/40 hover:border-secondary/60 text-foreground">
              View All Menus
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

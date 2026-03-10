"use client"

import { motion } from "framer-motion"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export function DemoVideo() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center mb-10"
        >
          <h2
            className={cn(
              "via-foreground mb-4 bg-gradient-to-b from-neutral-800 to-neutral-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
              geist.className,
            )}
          >
            See it in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Watch how Umari makes it simple to run your business from a single link.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative w-full overflow-hidden rounded-2xl border-2 border-foreground/10 shadow-xl aspect-video">
            <iframe
              src="https://www.youtube.com/embed/Zp3nZPmcVsw"
              title="Umari Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

const VIDEO_ID = "Zp3nZPmcVsw"

export function DemoVideo() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let player: any

    import("plyr").then(({ default: Plyr }) => {
      if (!containerRef.current) return

      player = new Plyr(containerRef.current, {
        controls: ["play", "progress", "current-time", "mute", "volume", "fullscreen"],
        youtube: {
          noCookie: true,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
      })
    })

    return () => {
      player?.destroy()
    }
  }, [])

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
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-foreground/10 plyr-umari">
            <div
              ref={containerRef}
              data-plyr-provider="youtube"
              data-plyr-embed-id={VIDEO_ID}
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        .plyr-umari .plyr {
          --plyr-color-main: hsl(30 70% 50%);
          --plyr-control-radius: 6px;
          --plyr-font-family: inherit;
          border-radius: 1rem;
        }
        .plyr-umari .plyr--youtube.plyr--paused .plyr__poster {
          opacity: 1;
        }
      `}</style>
    </section>
  )
}

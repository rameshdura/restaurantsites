"use client"

import Image from "next/image"
import { SectionHeader } from "./section-header"
import { motion } from "framer-motion"

interface TeamMember {
  name: string
  role: string
  image: string
  bio?: string
}

interface TeamSectionProps {
  team: TeamMember[]
  translations?: {
    common?: {
      team?: {
        subtitle?: string
        title?: string
        backgroundTitle?: string
      }
    }
  }
}

export function TeamSection({ team, translations }: TeamSectionProps) {
  const membersWithImages = team?.filter((member) => member.image) || []

  if (membersWithImages.length === 0) return null

  const t = translations?.common?.team || {}

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          subtitle={t.subtitle || "Meet the Experts"}
          title={t.title || "Our Dedicated Team"}
          backgroundTitle={t.backgroundTitle || "Experts"}
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {membersWithImages.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="relative mb-6 aspect-4/5 overflow-hidden rounded-3xl shadow-lg transition-all duration-500 group-hover:shadow-2xl">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <p className="translate-y-4 transform text-sm leading-relaxed text-white/90 transition-transform delay-100 duration-500 group-hover:translate-y-0">
                    {member.bio}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">
                  {member.name}
                </h3>
                <p className="text-sm font-medium tracking-wide text-primary uppercase">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

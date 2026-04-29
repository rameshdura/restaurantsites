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
}

export function TeamSection({ team }: TeamSectionProps) {
  const membersWithImages = team?.filter(member => member.image) || []
  
  if (membersWithImages.length === 0) return null

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader 
          subtitle="Meet the Experts"
          title="Our Dedicated Team"
          backgroundTitle="Experts"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {membersWithImages.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-white/90 text-sm leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    {member.bio}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">{member.name}</h3>
                <p className="text-primary font-medium tracking-wide uppercase text-sm">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

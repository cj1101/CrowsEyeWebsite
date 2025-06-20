'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Hero } from "@/components/home/Hero";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI Content Generation",
    description: "Leverage Google's Gemini for context-aware captions, engaging post ideas, and insightful analytics that resonate with your audience."
  },
  {
    title: "Advanced Video Editing",
    description: "Produce professional-grade videos with AI-powered tools. Generate highlight reels, add audio, and select the perfect thumbnail automatically."
  },
  {
    title: "Multi-Platform Publishing",
    description: "Publish across all major social platforms from one unified dashboard. Schedule posts, track performance, and manage your entire online presence."
  },
];

const FeatureSection = ({ title, description }: { title: string, description: string }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
        className="h-screen flex flex-col justify-center items-center text-center max-w-4xl mx-auto px-4"
    >
      <h2 className="text-4xl md:text-6xl font-bold text-white text-glow mb-4">
          <span className="glowing-line">{title}</span>
      </h2>
      <p className="text-lg md:text-xl text-white/70">{description}</p>
    </motion.div>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      
      const xPercent = (clientX / innerWidth) * 100
      const yPercent = (clientY / innerHeight) * 100
      
      document.documentElement.style.setProperty('--mouse-x', `${xPercent}%`)
      document.documentElement.style.setProperty('--mouse-y', `${yPercent}%`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="bg-slate-900 text-white">
      <Hero />
      
      <div className="relative z-10">
        {features.map((feature, index) => (
          <FeatureSection key={index} title={feature.title} description={feature.description} />
        ))}
      </div>

      <div className="h-screen flex flex-col items-center justify-center gap-8 text-center px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white text-glow">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-xl text-white/60">
              Launch the app and start creating in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Link href="/pricing" passHref>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg px-8 py-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
              >
                Start Your Free Trial
              </Button>
            </Link>
          </motion.div>
        </div>
    </main>
  )
}

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Eye, Star } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    id: 'ai-generation',
    title: "Advanced AI Content Generation",
    subtitle: "Powered by Google's Gemini",
    description: "Deep analysis of images and videos for context-aware captions, posts, and narratives that resonate with your audience.",
    visual: {
      colors: ['#8B5CF6', '#EC4899'],
      position: { top: '5%', left: '5%' },
      scale: 1.2,
    }
  },
  {
    id: 'ai-editing',
    title: "AI-Instructed Media Editing",
    subtitle: "Natural Language Commands",
    description: "Transform your visuals using simple text commands. No complex software needed—just describe the change, and our AI handles the rest.",
    visual: {
      colors: ['#3B82F6', '#67E8F9'],
      position: { top: '20%', left: '60%' },
      scale: 1.0,
    }
  },
  {
    id: 'video-suite',
    title: "Video Processing Suite",
    subtitle: "Professional-Grade Tools",
    description: "Generate highlight reels, overlay audio, and select optimal thumbnails. Turn raw footage into captivating content.",
    visual: {
      colors: ['#22C55E', '#A3E635'],
      position: { top: '50%', left: '10%' },
      scale: 1.3,
    }
  },
  {
    id: 'multi-platform',
    title: "Multi-Platform Management",
    subtitle: "Unified Dashboard",
    description: "Direct posting and management for Instagram, Facebook, BlueSky, Snapchat & Pinterest, with seamless expansion capabilities.",
    visual: {
      colors: ['#F97316', '#F43F5E'],
      position: { top: '70%', left: '70%' },
      scale: 1.1,
    }
  },
  {
    id: 'analytics',
    title: "Performance Analytics",
    subtitle: "Data-Driven Insights",
    description: "Track your content performance with integrated Meta Insights. Make informed decisions with real-time analytics.",
    visual: {
      colors: ['#EF4444', '#FBBF24'],
      position: { top: '85%', left: '25%' },
      scale: 0.9,
    }
  },
];

type FeatureProps = (typeof features)[0] & {
    setActiveFeatureId: (id: string) => void;
};

const FeatureSection = ({ title, subtitle, description, id, setActiveFeatureId }: FeatureProps) => {
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
  });

  React.useEffect(() => {
    if (inView) {
      setActiveFeatureId(id);
    }
  }, [inView, id, setActiveFeatureId]);
  
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.section 
        ref={ref}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="h-screen flex flex-col justify-center max-w-3xl mx-auto px-4"
    >
      <h2 className="text-4xl md:text-5xl font-bold tech-heading mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-glow">{title}</h2>
      <h3 className="text-xl md:text-2xl font-semibold text-purple-300 mb-6 tech-subheading text-glow">{subtitle}</h3>
      <p className="text-lg md:text-xl text-gray-400 leading-relaxed tech-body text-glow">{description}</p>
    </motion.section>
  );
};

// Fix nested anchor issue by wrapping Next.js Link with Framer Motion (cast to any to satisfy TS)
const MotionLink = motion(Link as any);

export default function FeaturesPage() {
  const [activeFeatureId, setActiveFeatureId] = useState(features[0].id);
  
  const activeFeature = useMemo(
    () => features.find(f => f.id === activeFeatureId), 
    [activeFeatureId]
  );

  return (
    <div className="min-h-screen bg-[#02020A] text-white">
      {/* Background Visual */}
      <div className="fixed inset-0 w-full h-full overflow-hidden" style={{zIndex: 0}}>
        <AnimatePresence>
            {activeFeature && (
                <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                        opacity: 1, 
                        scale: activeFeature.visual.scale,
                        top: activeFeature.visual.position.top, 
                        left: activeFeature.visual.position.left
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 80 }}
                    style={{
                        position: 'absolute',
                        width: '50vw',
                        height: '50vw',
                        maxWidth: '600px',
                        maxHeight: '600px',
                        background: `radial-gradient(circle, ${activeFeature.visual.colors[0]} 0%, ${activeFeature.visual.colors[1]} 100%)`,
                        filter: 'blur(100px)',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            )}
        </AnimatePresence>
      </div>
      
      {/* Content */}
      <div className="relative" style={{zIndex: 1}}>
          {/* Simplified Hero Section */}
          <header className="h-screen flex flex-col justify-center items-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-6xl md:text-8xl font-bold tech-heading gradient-text-animated text-glow">
                The Future of Marketing
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto tech-body text-glow mt-4 mb-12">
                Explore the powerful, AI-driven tools designed to elevate your social media strategy and streamline your creative workflow.
              </p>
              <motion.img 
                  src="/crows_eye_logo_transparent.png" 
                  alt="Crow's Eye Logo" 
                  className="h-48 w-48 md:h-64 md:w-64"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.div>
          </header>

          {/* Interactive Features Showcase */}
          <main>
              {features.map((feature) => (
                  <FeatureSection 
                      key={feature.id} 
                      {...feature} 
                      setActiveFeatureId={setActiveFeatureId} 
                  />
              ))}
          </main>

          {/* CTA Section */}
          <footer className="h-screen flex flex-col justify-center items-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className="relative p-10 md:p-12 rounded-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/10"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tech-heading">
                  Ready to Revolutionize Your Content?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto tech-body">
                  Get started with a 7-day free trial and experience the future of social media management.
                </p>
                <div className="flex justify-center">
                  <MotionLink 
                    href="/pricing"
                    className="inline-flex items-center gap-2 vision-button bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.4)" }}
                  >
                    <Star className="h-5 w-5" />
                    Start Free Trial
                  </MotionLink>
                </div>
              </motion.div>
            </div>
          </footer>
      </div>
    </div>
  )
} 
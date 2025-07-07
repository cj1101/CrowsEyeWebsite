'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { AnimatedGrid } from './AnimatedGrid';
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim"; 


export const Hero = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log(container);
  }, []);
  
  return (
    <div className="relative flex h-[40rem] flex-col items-center justify-center overflow-hidden bg-slate-900">
      <div className="relative z-20 flex flex-col items-center text-center pt-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-5xl font-bold text-white text-glow"
        >
          AI-Powered Marketing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          className="mt-4 text-xl md:text-2xl text-white/70 max-w-2xl"
        >
          The all-in-one suite to generate content, edit media, and manage your social platforms with the power of Google's Gemini.
        </motion.p>

        {/* Prominent Center Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.1 }}
          className="mt-24"
        >
          <img
            src="/crows_eye_logo_transparent.png"
            alt="Crow's Eye Logo"
            width={380}
            height={380}
            className="drop-shadow-[0_0_60px_rgba(139,92,246,0.7)]"
          />
        </motion.div>
      </div>

      {/* Background Logo */}
      <div className="absolute inset-0 z-5 flex items-start justify-center pointer-events-none" style={{ paddingTop: 'calc(6rem + 6rem)' }}>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.12, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-[420px] h-[420px]"
        >
            <img 
                src="/crows_eye_logo_transparent.png"
                alt="Crow's Eye Background Logo"
                width={420}
                height={420}
                className="drop-shadow-[0_0_80px_rgba(139,92,246,0.3)] w-full h-full object-contain"
            />
        </motion.div>
      </div>

      <div className="absolute inset-0 z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: {
              color: { value: "transparent" },
            },
            fpsLimit: 120,
            particles: {
              number: {
                value: 100,
                density: { enable: true, value_area: 800 }
              },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              opacity: {
                value: 0.5,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
              },
              size: {
                value: 2,
                random: true,
                anim: { enable: false }
              },
              move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false }
              }
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: { enable: true, mode: "bubble" },
                onclick: { enable: true, mode: "push" },
                resize: true
              },
              modes: {
                bubble: {
                  distance: 200,
                  size: 5,
                  duration: 2,
                  opacity: 0.8,
                },
                push: { particles_nb: 4 },
              }
            },
            retina_detect: true
          }}
        />
      </div>

      <AnimatedGrid className="absolute inset-0 z-0" />
    </div>
  );
}; 
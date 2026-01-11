"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function AuthIllustration() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 40%, rgba(139, 92, 246, 0.1) 50%, transparent 60%),
              linear-gradient(-45deg, transparent 40%, rgba(139, 92, 246, 0.1) 50%, transparent 60%)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Animated Geometric Shapes */}
      {/* Hexagon Outline */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))" }}
        >
          <motion.polygon
            points="100,20 180,60 180,140 100,180 20,140 20,60"
            fill="none"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Floating Torus (Donut) */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-32 h-32"
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, -20, 0],
          rotate: 360,
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      >
        <div className="w-full h-full rounded-full border-4 border-brand-400/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-brand-400/40" />
      </motion.div>

      {/* Crystal Shape (Top Left) */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-24 h-24"
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
          rotate: [-45, -30, -45],
        }}
        transition={{
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-purple-600/30 transform rotate-45" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-700/20 transform -rotate-45" />
        </div>
      </motion.div>

      {/* Yellow Diamond (Top Right) */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-16 h-16"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="w-full h-full bg-yellow-400/30 transform rotate-45" />
      </motion.div>

      {/* Green Triangle (Bottom Left) */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-20 h-20"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          opacity: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.polygon
            points="50,10 90,80 10,80"
            fill="none"
            stroke="rgba(34, 197, 94, 0.4)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Central Logo with Animation */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link href="/" className="block">
            <div className="relative">
              {/* Glowing Background Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-brand-500/30 via-purple-500/20 to-brand-600/30 rounded-3xl blur-3xl -z-10"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Glassmorphism Container */}
              <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.3)",
                      "0 0 40px rgba(139, 92, 246, 0.5)",
                      "0 0 20px rgba(139, 92, 246, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="rounded-2xl"
                >
                  <Image
                    width={300}
                    height={300}
                    src="/images/logo/carton.png"
                    alt="Logo"
                    className="drop-shadow-2xl filter brightness-110"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-brand-400/40 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Gradient Overlay with Animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/60 via-transparent to-purple-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
      </motion.div>
    </div>
  );
}

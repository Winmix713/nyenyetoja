"use client"

import type React from "react"
import { motion } from "framer-motion"

interface CompactLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const CompactFingmAILogo: React.FC<CompactLogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  }

  return (
    <motion.div
      className={`flex items-center ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Compact Logo */}
      <div className="relative flex items-center">
        {/* Animated Circle */}
        <motion.div
          className="absolute w-8 h-8 rounded-full border border-border/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Logo Text */}
        <div className="relative z-10 ml-10">
          <motion.span
            className={`font-bold tracking-tight ${sizeClasses[size]}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-foreground">Fingm</span>
            <motion.span
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              AI
            </motion.span>
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

export default CompactFingmAILogo

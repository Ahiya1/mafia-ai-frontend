// src/components/feature-card.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group glass-card p-6 h-full"
    >
      <div
        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <div className="text-white">{icon}</div>
      </div>

      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      <p className="text-gray-400 leading-relaxed">{description}</p>

      <motion.div
        className="mt-4 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        layoutId={`feature-line-${title}`}
      />
    </motion.div>
  );
}

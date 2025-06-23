// src/components/animated-counter.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(displayValue, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    const unsubscribe = display.onChange((latest) => {
      // Update happens automatically via useTransform
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

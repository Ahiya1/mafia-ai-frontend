// src/components/game-phase-display.tsx
"use client";

import { motion } from "framer-motion";
import { Moon, Sun, MessageCircle, Vote, Trophy, Clock } from "lucide-react";

interface GamePhaseDisplayProps {
  phase: string;
}

export function GamePhaseDisplay({ phase }: GamePhaseDisplayProps) {
  const getPhaseInfo = () => {
    switch (phase) {
      case "waiting":
        return {
          icon: <Clock className="w-5 h-5" />,
          name: "Waiting",
          color: "text-gray-400",
          bg: "bg-gray-500/20",
        };
      case "night":
        return {
          icon: <Moon className="w-5 h-5" />,
          name: "Night",
          color: "text-purple-400",
          bg: "bg-purple-500/20",
        };
      case "revelation":
        return {
          icon: <Sun className="w-5 h-5" />,
          name: "Revelation",
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
        };
      case "discussion":
        return {
          icon: <MessageCircle className="w-5 h-5" />,
          name: "Discussion",
          color: "text-blue-400",
          bg: "bg-blue-500/20",
        };
      case "voting":
        return {
          icon: <Vote className="w-5 h-5" />,
          name: "Voting",
          color: "text-orange-400",
          bg: "bg-orange-500/20",
        };
      case "game_over":
        return {
          icon: <Trophy className="w-5 h-5" />,
          name: "Game Over",
          color: "text-green-400",
          bg: "bg-green-500/20",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          name: "Unknown",
          color: "text-gray-400",
          bg: "bg-gray-500/20",
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div
      key={phase}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${phaseInfo.bg} ${phaseInfo.color}`}
    >
      <motion.div
        animate={{ rotate: phase === "night" ? 360 : 0 }}
        transition={{ duration: 2, repeat: phase === "night" ? Infinity : 0 }}
      >
        {phaseInfo.icon}
      </motion.div>
      <span className="font-semibold">{phaseInfo.name}</span>
    </motion.div>
  );
}

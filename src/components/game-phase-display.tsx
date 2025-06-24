// src/components/game-phase-display.tsx - FIXED: Enhanced Phase Transitions with Animations
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  MessageCircle,
  Vote,
  Trophy,
  Clock,
  Zap,
  Eye,
  Users,
  Timer,
} from "lucide-react";
import { useState, useEffect } from "react";

interface GamePhaseDisplayProps {
  phase: string;
  timeRemaining?: number;
  round?: number;
  currentSpeaker?: string;
  totalPlayers?: number;
  alivePlayers?: number;
}

interface PhaseInfo {
  icon: React.ReactNode;
  name: string;
  color: string;
  bg: string;
  description: string;
  gradient: string;
  pulseColor: string;
}

export function GamePhaseDisplay({
  phase,
  timeRemaining,
  round = 0,
  currentSpeaker,
  totalPlayers = 0,
  alivePlayers = 0,
}: GamePhaseDisplayProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPhase, setPreviousPhase] = useState<string | null>(null);

  // Handle phase transitions with animation
  useEffect(() => {
    if (previousPhase && previousPhase !== phase) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 1000);
      return () => clearTimeout(timer);
    }
    setPreviousPhase(phase);
  }, [phase, previousPhase]);

  const getPhaseInfo = (phaseName: string): PhaseInfo => {
    switch (phaseName) {
      case "waiting":
        return {
          icon: <Clock className="w-5 h-5" />,
          name: "Waiting",
          color: "text-gray-400",
          bg: "bg-gray-500/20",
          description: "Waiting for players to join",
          gradient: "from-gray-500/20 to-gray-600/20",
          pulseColor: "animate-pulse",
        };
      case "role_assignment":
        return {
          icon: <Users className="w-5 h-5" />,
          name: "Role Assignment",
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          description: "Roles are being assigned",
          gradient: "from-blue-500/20 to-blue-600/20",
          pulseColor: "animate-pulse",
        };
      case "night":
        return {
          icon: <Moon className="w-5 h-5" />,
          name: "Night",
          color: "text-purple-400",
          bg: "bg-purple-500/20",
          description: "Mafia and Healer make their moves",
          gradient: "from-purple-500/20 to-indigo-600/20",
          pulseColor: "animate-pulse",
        };
      case "revelation":
        return {
          icon: <Sun className="w-5 h-5" />,
          name: "Revelation",
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
          description: "Night results are revealed",
          gradient: "from-yellow-500/20 to-orange-500/20",
          pulseColor: "animate-pulse",
        };
      case "discussion":
        return {
          icon: <MessageCircle className="w-5 h-5" />,
          name: "Discussion",
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          description: "Players discuss and share suspicions",
          gradient: "from-blue-500/20 to-cyan-500/20",
          pulseColor: "animate-pulse",
        };
      case "voting":
        return {
          icon: <Vote className="w-5 h-5" />,
          name: "Voting",
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          description: "Players vote to eliminate someone",
          gradient: "from-orange-500/20 to-red-500/20",
          pulseColor: "animate-pulse",
        };
      case "game_over":
        return {
          icon: <Trophy className="w-5 h-5" />,
          name: "Game Over",
          color: "text-green-400",
          bg: "bg-green-500/20",
          description: "The game has concluded",
          gradient: "from-green-500/20 to-emerald-500/20",
          pulseColor: "animate-bounce",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          name: "Unknown",
          color: "text-gray-400",
          bg: "bg-gray-500/20",
          description: "Unknown phase",
          gradient: "from-gray-500/20 to-gray-600/20",
          pulseColor: "",
        };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!timeRemaining) return 0;

    // Estimate total phase duration based on phase type
    const phaseDurations: Record<string, number> = {
      waiting: 300000, // 5 minutes
      night: 60000, // 1 minute
      revelation: 10000, // 10 seconds
      discussion: 180000, // 3 minutes
      voting: 90000, // 1.5 minutes
      role_assignment: 5000, // 5 seconds
    };

    const totalDuration = phaseDurations[phase] || 60000;
    const elapsed = totalDuration - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  return (
    <div className="flex items-center gap-3">
      {/* FIXED: Main Phase Indicator with Enhanced Animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${phaseInfo.gradient} ${phaseInfo.color} border border-current/20 backdrop-blur-sm`}
        >
          {/* Background Glow Effect */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${phaseInfo.gradient} opacity-50 blur-md`}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Icon with Special Animations */}
          <motion.div
            animate={{
              rotate: phase === "night" ? [0, 360] : 0,
              scale: isTransitioning ? [1, 1.2, 1] : [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: phase === "night" ? Infinity : 0,
                ease: "linear",
              },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-10"
          >
            {phaseInfo.icon}
          </motion.div>

          {/* Phase Name and Round */}
          <div className="relative z-10 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{phaseInfo.name}</span>
              {round > 0 && (
                <motion.span
                  className="text-xs px-1.5 py-0.5 bg-black/20 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Round {round}
                </motion.span>
              )}
            </div>

            {/* Phase Description */}
            <motion.span
              className="text-xs opacity-80 hidden md:block"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {phaseInfo.description}
            </motion.span>
          </div>

          {/* Progress Ring for Timed Phases */}
          {timeRemaining && timeRemaining > 0 && (
            <motion.div
              className="relative z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={75.4}
                  initial={{ strokeDashoffset: 75.4 }}
                  animate={{
                    strokeDashoffset:
                      75.4 - (75.4 * getProgressPercentage()) / 100,
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Timer className="w-3 h-3" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FIXED: Time Remaining Display */}
      {timeRemaining && timeRemaining > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-600/50"
        >
          <Timer className="w-4 h-4 text-gray-400" />
          <span
            className={`font-mono text-sm ${
              timeRemaining < 10000
                ? "text-red-400 animate-pulse"
                : "text-gray-300"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </motion.div>
      )}

      {/* FIXED: Current Speaker Indicator */}
      {currentSpeaker && (phase === "discussion" || phase === "voting") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <span className="text-xs text-blue-400 font-medium">
            {phase === "discussion" ? "Speaking:" : "Voting:"} {currentSpeaker}
          </span>
        </motion.div>
      )}

      {/* FIXED: Player Count Display */}
      {totalPlayers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-600/50"
        >
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-300">
            {alivePlayers}/{totalPlayers}
          </span>
          {alivePlayers !== totalPlayers && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-red-400 rounded-full"
            />
          )}
        </motion.div>
      )}

      {/* FIXED: Phase Transition Effect */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [0, 1.5, 0], rotate: 360 }}
            exit={{ scale: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute right-0 pointer-events-none"
          >
            <Zap className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

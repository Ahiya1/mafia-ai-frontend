// src/components/player-card.tsx - Enhanced with Observer Data
"use client";

import { motion } from "framer-motion";
import {
  User,
  Bot,
  Crown,
  Shield,
  Users,
  Skull,
  Eye,
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Player } from "@/types/game";
import { usePlayerSuspicion } from "@/stores/game-store";

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showRole?: boolean;
  onClick?: () => void;
  compact?: boolean;
  showObserverData?: boolean;
}

export function PlayerCard({
  player,
  isCurrentPlayer = false,
  showRole = false,
  onClick,
  compact = false,
  showObserverData = false,
}: PlayerCardProps) {
  const { suspicion, trust } = usePlayerSuspicion(player.id);

  const getRoleIcon = () => {
    switch (player.role) {
      case "mafia_leader":
        return <Crown className="w-4 h-4 text-red-400" />;
      case "mafia_member":
        return <Skull className="w-4 h-4 text-red-400" />;
      case "healer":
        return <Shield className="w-4 h-4 text-green-400" />;
      case "citizen":
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (player.role) {
      case "mafia_leader":
      case "mafia_member":
        return "border-red-500/30 bg-red-500/10";
      case "healer":
        return "border-green-500/30 bg-green-500/10";
      case "citizen":
        return "border-blue-500/30 bg-blue-500/10";
      default:
        return "border-gray-600 bg-gray-800";
    }
  };

  const getSuspicionIcon = (level: number) => {
    if (level > 7) return <TrendingUp className="w-3 h-3 text-red-400" />;
    if (level < 4) return <TrendingDown className="w-3 h-3 text-green-400" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getSuspicionColor = (level: number) => {
    if (level > 7) return "text-red-400";
    if (level < 4) return "text-green-400";
    return "text-gray-400";
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer
          ${
            player.isAlive
              ? isCurrentPlayer
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-gray-600 bg-gray-800"
              : "border-gray-700 bg-gray-900 opacity-60"
          }
          ${onClick ? "hover:border-gray-500" : ""}
        `}
      >
        {/* Status Indicator */}
        <div
          className={`w-2 h-2 rounded-full ${
            player.isAlive ? "bg-green-400" : "bg-red-400"
          }`}
        />

        {/* Player Type Icon */}
        {player.type === "ai" ? (
          <Bot className="w-4 h-4 text-orange-400" />
        ) : (
          <User className="w-4 h-4 text-blue-400" />
        )}

        {/* Name */}
        <span className="font-medium text-white text-sm truncate">
          {player.name}
        </span>

        {/* Role Icon */}
        {showRole && getRoleIcon()}

        {/* AI Model Badge */}
        {player.type === "ai" && player.model && (
          <span className="text-xs px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
            {player.model.split("-")[0]}
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition-all
        ${
          player.isAlive
            ? isCurrentPlayer
              ? "border-purple-500/50 bg-purple-500/10"
              : getRoleColor()
            : "border-gray-700 bg-gray-900 opacity-60"
        }
        ${onClick ? "cursor-pointer hover:border-gray-500" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`w-3 h-3 rounded-full ${
              player.isAlive ? "bg-green-400" : "bg-red-400"
            }`}
          />

          {/* Player Name */}
          <span className="font-medium text-white">{player.name}</span>

          {/* Current Player Badge */}
          {isCurrentPlayer && (
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
              You
            </span>
          )}
        </div>

        {/* Player Type */}
        <div className="flex items-center gap-1">
          {player.type === "ai" ? (
            <Bot className="w-4 h-4 text-orange-400" />
          ) : (
            <User className="w-4 h-4 text-blue-400" />
          )}
        </div>
      </div>

      {/* Role Display */}
      {showRole && player.role && (
        <div className="flex items-center gap-2 mb-3">
          {getRoleIcon()}
          <span className="text-sm font-medium capitalize">
            {player.role.replace("_", " ")}
          </span>
        </div>
      )}

      {/* AI Model Badge */}
      {player.type === "ai" && player.model && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
            <Brain className="w-3 h-3" />
            {player.model}
          </span>
        </div>
      )}

      {/* Observer Data */}
      {showObserverData && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
          {/* Suspicion Level */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Suspicion</span>
            </div>
            <div
              className={`flex items-center gap-1 ${getSuspicionColor(
                suspicion
              )}`}
            >
              {getSuspicionIcon(suspicion)}
              <span className="font-medium">{suspicion.toFixed(1)}/10</span>
            </div>
          </div>

          {/* Trust Level */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Trust</span>
            </div>
            <div
              className={`flex items-center gap-1 ${getSuspicionColor(
                10 - trust
              )}`}
            >
              {getSuspicionIcon(10 - trust)}
              <span className="font-medium">{trust.toFixed(1)}/10</span>
            </div>
          </div>

          {/* Activity Level */}
          {player.gameStats && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">Activity</span>
              </div>
              <span className="text-white font-medium">
                {player.gameStats.gamesPlayed || 0} actions
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ready Status */}
      {!player.isAlive && (
        <div className="mt-3 text-center">
          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
            Eliminated
          </span>
        </div>
      )}

      {player.isAlive && player.isReady && (
        <div className="mt-3 text-center">
          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
            Ready
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Specialized component for observer view
export function ObserverPlayerCard({
  player,
  showAllData = true,
}: {
  player: Player;
  showAllData?: boolean;
}) {
  const { suspicion, trust } = usePlayerSuspicion(player.id);

  return (
    <div
      className={`
      p-3 rounded-lg border
      ${
        player.isAlive
          ? "border-gray-600 bg-gray-800"
          : "border-gray-700 bg-gray-900 opacity-60"
      }
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              player.isAlive ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="font-medium text-white text-sm">{player.name}</span>
        </div>

        {player.type === "ai" ? (
          <Bot className="w-3 h-3 text-orange-400" />
        ) : (
          <User className="w-3 h-3 text-blue-400" />
        )}
      </div>

      {/* Role */}
      {player.role && (
        <div className="flex items-center gap-1 mb-2">
          {player.role === "mafia_leader" && (
            <Crown className="w-3 h-3 text-red-400" />
          )}
          {player.role === "mafia_member" && (
            <Skull className="w-3 h-3 text-red-400" />
          )}
          {player.role === "healer" && (
            <Shield className="w-3 h-3 text-green-400" />
          )}
          {player.role === "citizen" && (
            <Users className="w-3 h-3 text-blue-400" />
          )}
          <span className="text-xs text-gray-300 capitalize">
            {player.role.replace("_", " ")}
          </span>
        </div>
      )}

      {/* AI Model */}
      {player.type === "ai" && player.model && (
        <div className="mb-2">
          <span className="text-xs px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
            {player.model}
          </span>
        </div>
      )}

      {/* Observer Stats */}
      {showAllData && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Suspicion</div>
            <div className={`font-medium ${getSuspicionColor(suspicion)}`}>
              {suspicion.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Trust</div>
            <div className={`font-medium ${getSuspicionColor(10 - trust)}`}>
              {trust.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for suspicion color (extracted for reuse)
function getSuspicionColor(level: number): string {
  if (level > 7) return "text-red-400";
  if (level < 4) return "text-green-400";
  return "text-gray-400";
}

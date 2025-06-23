// src/components/player-card.tsx
"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Users, Skull, Bot, User, Mic } from "lucide-react";
import { Player } from "@/types/game";

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  currentSpeaker: boolean;
  showRole: boolean;
}

export function PlayerCard({
  player,
  isCurrentPlayer,
  currentSpeaker,
  showRole,
}: PlayerCardProps) {
  const getRoleIcon = () => {
    switch (player.role) {
      case "mafia_leader":
        return <Crown className="w-4 h-4" />;
      case "mafia_member":
        return <Skull className="w-4 h-4" />;
      case "healer":
        return <Shield className="w-4 h-4" />;
      case "citizen":
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (player.role) {
      case "mafia_leader":
      case "mafia_member":
        return "border-red-500 bg-red-500/10";
      case "healer":
        return "border-green-500 bg-green-500/10";
      case "citizen":
        return "border-blue-500 bg-blue-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        player-card relative overflow-hidden
        ${isCurrentPlayer ? "ring-2 ring-blue-400" : ""}
        ${currentSpeaker ? "ring-2 ring-orange-400 ring-pulse" : ""}
        ${!player.isAlive ? "eliminated" : "alive"}
        ${showRole && player.role ? getRoleColor() : ""}
      `}
    >
      {/* Speaking indicator */}
      {currentSpeaker && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full"
        />
      )}

      {/* Player info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            ${
              player.type === "ai"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-blue-500/20 text-blue-400"
            }
          `}
          >
            {player.type === "ai" ? (
              <Bot className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          {!player.isAlive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Skull className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate ${
                !player.isAlive ? "text-gray-500" : "text-white"
              }`}
            >
              {player.name}
            </span>
            {isCurrentPlayer && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                You
              </span>
            )}
          </div>

          {showRole && player.role && (
            <div className="flex items-center gap-1 mt-1">
              {getRoleIcon()}
              <span className="text-xs capitalize">
                {player.role.replace("_", " ")}
              </span>
            </div>
          )}

          {player.type === "ai" && (
            <div className="text-xs text-orange-400 mt-1">AI Player</div>
          )}
        </div>

        {currentSpeaker && (
          <Mic className="w-4 h-4 text-orange-400 animate-pulse" />
        )}
      </div>

      {/* Voting indicator */}
      {player.votedFor && (
        <div className="mt-2 text-xs text-gray-400">
          Voted for: <span className="text-red-400">{player.votedFor}</span>
        </div>
      )}
    </motion.div>
  );
}

// src/components/night-action-panel.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Skull, Shield, Moon, Target } from "lucide-react";
import { Player } from "@/types/game";

interface NightActionPanelProps {
  role: "mafia_leader" | "healer";
  players: Player[];
  onActionPerformed: (action: string, targetId: string) => void;
}

export function NightActionPanel({
  role,
  players,
  onActionPerformed,
}: NightActionPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  const handleAction = () => {
    if (!selectedTarget) return;

    const action = role === "mafia_leader" ? "kill" : "heal";
    onActionPerformed(action, selectedTarget);
    setSelectedTarget("");
  };

  const actionInfo =
    role === "mafia_leader"
      ? {
          icon: <Skull className="w-12 h-12 text-red-400" />,
          title: "Choose Your Target",
          description: "Select a player to eliminate tonight",
          buttonText: "Eliminate Player",
          buttonClass: "btn-danger",
          color: "red",
        }
      : {
          icon: <Shield className="w-12 h-12 text-green-400" />,
          title: "Choose Who to Protect",
          description: "Select a player to protect from elimination",
          buttonText: "Protect Player",
          buttonClass: "btn-detective",
          color: "green",
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Moon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
        <div className="mb-4">{actionInfo.icon}</div>
        <h3 className="text-2xl font-bold mb-2">{actionInfo.title}</h3>
        <p className="text-gray-400">{actionInfo.description}</p>
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Available targets:
        </label>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {players.map((player) => (
            <motion.button
              key={player.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTarget(player.id)}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${
                  selectedTarget === player.id
                    ? `border-${actionInfo.color}-500 bg-${actionInfo.color}-500/20 text-${actionInfo.color}-400`
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">{player.name}</span>
                {player.type === "ai" && (
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    AI
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAction}
        disabled={!selectedTarget}
        className={`w-full ${actionInfo.buttonClass} py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {actionInfo.icon}
        {actionInfo.buttonText}
      </motion.button>

      {selectedTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-3 text-center text-sm"
        >
          <span className="text-gray-400">Target selected: </span>
          <span className={`text-${actionInfo.color}-400 font-semibold`}>
            {players.find((p) => p.id === selectedTarget)?.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

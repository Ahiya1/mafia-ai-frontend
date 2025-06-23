// src/components/voting-panel.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Vote, AlertTriangle, Users } from "lucide-react";
import { Player } from "@/types/game";

interface VotingPanelProps {
  players: Player[];
  currentVoter: boolean;
  onVote: (targetId: string, reasoning: string) => void;
}

export function VotingPanel({
  players,
  currentVoter,
  onVote,
}: VotingPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [reasoning, setReasoning] = useState("");

  const handleVote = () => {
    if (!selectedTarget || !reasoning.trim()) return;

    onVote(selectedTarget, reasoning);
    setSelectedTarget("");
    setReasoning("");
  };

  if (!currentVoter) {
    return (
      <div className="text-center py-8">
        <Vote className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Voting Phase</h3>
        <p className="text-gray-400">Wait for your turn to vote</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Vote className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Cast Your Vote</h3>
        <p className="text-gray-400">
          Choose who you think should be eliminated
        </p>
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Who do you want to eliminate?
        </label>
        <div className="grid grid-cols-2 gap-3">
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
                    ? "border-orange-500 bg-orange-500/20 text-orange-400"
                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
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

      {/* Reasoning */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Explain your reasoning
        </label>
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="Why do you think this player should be eliminated?"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-orange-500"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-gray-500 mt-1">
          {reasoning.length}/200 characters
        </div>
      </div>

      {/* Vote Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVote}
        disabled={!selectedTarget || !reasoning.trim()}
        className="w-full btn-detective py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <AlertTriangle className="w-5 h-5" />
        Cast Vote to Eliminate
      </motion.button>

      {selectedTarget && reasoning.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-3 text-center text-sm"
        >
          <span className="text-gray-400">You are voting to eliminate: </span>
          <span className="text-orange-400 font-semibold">
            {players.find((p) => p.id === selectedTarget)?.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

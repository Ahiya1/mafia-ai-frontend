// src/components/game-stats.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Target,
  MessageCircle,
  Vote,
  Clock,
  Users,
  Bot,
  Crown,
  Shield,
  Skull,
} from "lucide-react";
import { GameState, Player } from "../types/game";

interface GameStatsProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onCloseAction: () => void;
}

export function GameStats({
  gameState,
  currentPlayer,
  onCloseAction,
}: GameStatsProps) {
  const calculateStats = () => {
    const totalPlayers = gameState.players.length;
    const alivePlayers = gameState.players.filter((p) => p.isAlive).length;
    const eliminatedPlayers = gameState.eliminatedPlayers.length;
    const aiPlayers = gameState.players.filter((p) => p.type === "ai").length;
    const humanPlayers = gameState.players.filter(
      (p) => p.type === "human"
    ).length;

    const mafiaMembers = gameState.players.filter(
      (p) => p.role === "mafia_leader" || p.role === "mafia_member"
    );
    const aliveMafia = mafiaMembers.filter((p) => p.isAlive).length;

    const gameStartTime = new Date(gameState.phaseStartTime);
    const now = new Date();
    const gameDuration = Math.floor(
      (now.getTime() - gameStartTime.getTime()) / 1000 / 60
    );

    return {
      totalPlayers,
      alivePlayers,
      eliminatedPlayers,
      aiPlayers,
      humanPlayers,
      aliveMafia,
      totalMafia: mafiaMembers.length,
      gameDuration,
      currentRound: gameState.currentRound,
      totalMessages: gameState.messages?.length || 0,
      totalVotes: gameState.votes?.length || 0,
    };
  };

  const stats = calculateStats();

  const getRoleIcon = (role: string) => {
    switch (role) {
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

  const getWinnerInfo = () => {
    if (!gameState.winner) return null;

    return {
      winner: gameState.winner,
      icon: gameState.winner === "citizens" ? "👮‍♂️" : "🕴️",
      color: gameState.winner === "citizens" ? "text-blue-400" : "text-red-400",
      message:
        gameState.winner === "citizens"
          ? "Citizens successfully identified the mafia!"
          : "Mafia achieved numerical superiority!",
    };
  };

  const winnerInfo = getWinnerInfo();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCloseAction}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-orange-400" />
              <h2 className="text-2xl font-bold">Game Statistics</h2>
            </div>
            <button
              onClick={onCloseAction}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Winner Announcement */}
            {winnerInfo && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-orange-500/30"
              >
                <div className="text-6xl mb-4">{winnerInfo.icon}</div>
                <h3 className={`text-3xl font-bold mb-2 ${winnerInfo.color}`}>
                  {winnerInfo.winner === "citizens"
                    ? "Citizens Win!"
                    : "Mafia Wins!"}
                </h3>
                <p className="text-gray-300">{winnerInfo.message}</p>
              </motion.div>
            )}

            {/* Game Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">
                  {stats.currentRound}
                </div>
                <div className="text-sm text-gray-400">Rounds</div>
              </div>

              <div className="glass-card p-4 text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">
                  {stats.alivePlayers}
                </div>
                <div className="text-sm text-gray-400">Alive</div>
              </div>

              <div className="glass-card p-4 text-center">
                <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">
                  {stats.totalMessages}
                </div>
                <div className="text-sm text-gray-400">Messages</div>
              </div>

              <div className="glass-card p-4 text-center">
                <Vote className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-400">
                  {stats.totalVotes}
                </div>
                <div className="text-sm text-gray-400">Votes Cast</div>
              </div>
            </div>

            {/* Player Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Players */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Player Status
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.isAlive ? "bg-gray-700/50" : "bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(player.role || "")}
                          <span
                            className={`font-medium ${
                              player.isAlive ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {player.name}
                          </span>
                          {player.id === currentPlayer?.id && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {player.type === "ai" && (
                          <Bot className="w-4 h-4 text-orange-400" />
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            player.isAlive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {player.isAlive ? "Alive" : "Eliminated"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Breakdown */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  Game Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Human Players:</span>
                    <span className="font-bold text-blue-400">
                      {stats.humanPlayers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">AI Players:</span>
                    <span className="font-bold text-orange-400">
                      {stats.aiPlayers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mafia Remaining:</span>
                    <span className="font-bold text-red-400">
                      {stats.aliveMafia}/{stats.totalMafia}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Game Duration:</span>
                    <span className="font-bold text-green-400">
                      {stats.gameDuration}m
                    </span>
                  </div>

                  {currentPlayer && (
                    <>
                      <hr className="border-gray-700" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-400">
                          Your Performance
                        </h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Role:</span>
                          <span className="capitalize">
                            {currentPlayer.role?.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span
                            className={
                              currentPlayer.isAlive
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {currentPlayer.isAlive ? "Alive" : "Eliminated"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Game Outcome */}
            {gameState.phase === "game_over" && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Game Summary</h3>
                <div className="text-gray-300 space-y-2">
                  <p>
                    This {stats.currentRound}-round game lasted{" "}
                    {stats.gameDuration} minutes with {stats.totalMessages}{" "}
                    messages exchanged and {stats.totalVotes} votes cast.
                  </p>
                  <p>
                    {stats.aiPlayers} AI personalities played alongside{" "}
                    {stats.humanPlayers} human players.
                  </p>
                  {winnerInfo && (
                    <p className={`font-semibold ${winnerInfo.color}`}>
                      The {winnerInfo.winner} achieved victory through superior
                      strategy and deduction!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 text-center">
            <button onClick={onCloseAction} className="btn-detective px-8 py-3">
              Close Statistics
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

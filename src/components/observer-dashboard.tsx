// src/components/observer-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Brain,
  MessageSquare,
  Shield,
  Skull,
  Users,
  Activity,
  BarChart3,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { useSocket } from "@/lib/socket-context";

interface ObserverUpdate {
  type: "mafia_chat" | "healer_thoughts" | "private_action" | "ai_reasoning";
  content: string;
  playerId: string;
  timestamp: string;
  phase: string;
}

interface Player {
  id: string;
  name: string;
  type: "human" | "ai";
  role?: string;
  isAlive: boolean;
  model?: string;
  suspicionLevel?: number;
  trustLevel?: number;
  actionCount?: number;
}

interface ObserverDashboardProps {
  gameState: any;
  players: Player[];
  observerUpdates: ObserverUpdate[];
  gameAnalytics: any;
}

export function ObserverDashboard({
  gameState,
  players,
  observerUpdates,
  gameAnalytics,
}: ObserverDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "private" | "analytics" | "players"
  >("private");
  const [filter, setFilter] = useState<"all" | "mafia" | "healer" | "ai">(
    "all"
  );
  const { socket } = useSocket();

  const tabs = [
    { id: "private", label: "Private Actions", icon: Eye },
    { id: "analytics", label: "Game Analytics", icon: BarChart3 },
    { id: "players", label: "Player Details", icon: Users },
  ];

  const getFilteredUpdates = () => {
    if (!observerUpdates) return [];

    return observerUpdates
      .filter((update) => {
        if (filter === "all") return true;
        if (filter === "mafia") return update.type === "mafia_chat";
        if (filter === "healer") return update.type === "healer_thoughts";
        if (filter === "ai") return update.type === "ai_reasoning";
        return true;
      })
      .slice(-20) // Show last 20 updates
      .reverse(); // Most recent first
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "mafia_chat":
        return <Skull className="w-4 h-4 text-red-400" />;
      case "healer_thoughts":
        return <Shield className="w-4 h-4 text-green-400" />;
      case "private_action":
        return <Target className="w-4 h-4 text-purple-400" />;
      case "ai_reasoning":
        return <Brain className="w-4 h-4 text-blue-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "mafia_chat":
        return "border-red-500/30 bg-red-500/10";
      case "healer_thoughts":
        return "border-green-500/30 bg-green-500/10";
      case "private_action":
        return "border-purple-500/30 bg-purple-500/10";
      case "ai_reasoning":
        return "border-blue-500/30 bg-blue-500/10";
      default:
        return "border-gray-500/30 bg-gray-500/10";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getPlayerByName = (name: string) => {
    return players.find((p) => p.name === name);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border border-gray-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Observer Dashboard</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Live Spectating</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-purple-400 border-b-2 border-purple-400 bg-purple-500/10"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "private" && (
            <motion.div
              key="private"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Filter Bar */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex gap-2">
                  {[
                    { id: "all", label: "All", icon: Eye },
                    { id: "mafia", label: "Mafia", icon: Skull },
                    { id: "healer", label: "Healer", icon: Shield },
                    { id: "ai", label: "AI Reasoning", icon: Brain },
                  ].map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id as any)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors ${
                        filter === filterOption.id
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-gray-800 text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <filterOption.icon className="w-3 h-3" />
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Updates List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {getFilteredUpdates().map((update, index) => {
                    const player = getPlayerByName(
                      update.content.match(/\[(.*?)\]/)?.[1] || ""
                    );

                    return (
                      <motion.div
                        key={`${update.timestamp}-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`p-3 rounded-lg border ${getUpdateColor(
                          update.type
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getUpdateIcon(update.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                  {update.type
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                {player?.model && (
                                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                    {player.model}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(update.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 break-words">
                              {update.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>Phase: {update.phase}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {getFilteredUpdates().length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {filter === "all" ? "" : filter} updates yet</p>
                    <p className="text-sm">Private actions will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-4 space-y-4"
            >
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Duration
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {gameAnalytics?.duration
                      ? Math.floor(gameAnalytics.duration / 60000) + "m"
                      : "0m"}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Rounds
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {gameAnalytics?.rounds || 0}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Messages
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {gameAnalytics?.totalMessages || 0}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Actions
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {gameAnalytics?.totalNightActions || 0}
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              {gameAnalytics?.playerStats && (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Player Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {gameAnalytics.playerStats.ai}
                      </div>
                      <div className="text-sm text-gray-400">AI Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {gameAnalytics.playerStats.human}
                      </div>
                      <div className="text-sm text-gray-400">Human Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {gameAnalytics.playerStats.total -
                          gameAnalytics.playerStats.alive}
                      </div>
                      <div className="text-sm text-gray-400">Eliminated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {gameAnalytics.playerStats.alive}
                      </div>
                      <div className="text-sm text-gray-400">Alive</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase Stats */}
              {gameAnalytics?.phaseStats && (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Phase Activity
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(gameAnalytics.phaseStats).map(
                      ([phase, count]) => (
                        <div
                          key={phase}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-300 capitalize">
                            {phase.replace("_", " ")}
                          </span>
                          <span className="text-white font-medium">
                            {count as number} actions
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "players" && (
            <motion.div
              key="players"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-4 space-y-3"
            >
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border ${
                    player.isAlive
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-700 bg-gray-900 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          player.isAlive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      <span className="font-medium text-white">
                        {player.name}
                      </span>
                      {player.type === "ai" && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          AI
                        </span>
                      )}
                      {player.model && (
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                          {player.model}
                        </span>
                      )}
                    </div>
                    {player.role && (
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          player.role.includes("mafia")
                            ? "bg-red-500/20 text-red-400"
                            : player.role === "healer"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {player.role.replace("_", " ").toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Player Stats */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Suspicion</div>
                      <div className="font-medium text-white">
                        {player.suspicionLevel?.toFixed(1) || "5.0"}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Trust</div>
                      <div className="font-medium text-white">
                        {player.trustLevel?.toFixed(1) || "5.0"}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Actions</div>
                      <div className="font-medium text-white">
                        {player.actionCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

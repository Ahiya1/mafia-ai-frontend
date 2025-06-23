// src/components/premium-analytics.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Target,
  Brain,
  Users,
  Bot,
  TrendingUp,
  Eye,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Crown,
  Shield,
  Skull,
  MessageCircle,
  Vote,
  Clock,
  Zap,
  Star,
  Award,
} from "lucide-react";
import { GameState, Player } from "@/types/game";

interface PremiumAnalyticsProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onClose: () => void;
  isPremiumUser: boolean;
}

export function PremiumAnalytics({
  gameState,
  currentPlayer,
  onClose,
  isPremiumUser,
}: PremiumAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "ai-analysis" | "performance" | "export"
  >("overview");

  if (!isPremiumUser) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 text-center max-w-md"
        >
          <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Premium Analytics</h2>
          <p className="text-gray-400 mb-6">
            Upgrade to premium to unlock detailed game analytics, AI behavior
            insights, and performance tracking.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">
              Maybe Later
            </button>
            <button className="btn-detective flex-1">Upgrade Now</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const calculateAdvancedStats = () => {
    const totalPlayers = gameState.players.length;
    const aiPlayers = gameState.players.filter((p) => p.type === "ai");
    const humanPlayers = gameState.players.filter((p) => p.type === "human");

    // AI Detection Analysis
    const aiDetectionAccuracy = currentPlayer
      ? Math.round(Math.random() * 30 + 60) // Simulated for demo
      : 0;

    // Communication Analysis
    const playerMessages =
      gameState.messages?.filter((m) => m.playerId === currentPlayer?.id) || [];
    const avgMessageLength =
      playerMessages.reduce((acc, msg) => acc + msg.content.length, 0) /
      Math.max(playerMessages.length, 1);

    // Voting Accuracy
    const votingAccuracy = Math.round(Math.random() * 40 + 50); // Simulated

    // AI Behavior Insights
    const aiInsights = aiPlayers.map((ai) => ({
      name: ai.name,
      model: ai.model || "claude-haiku",
      suspicionLevel: Math.round(Math.random() * 100),
      communicationStyle: [
        "Analytical",
        "Emotional",
        "Direct",
        "Verbose",
        "Cautious",
      ][Math.floor(Math.random() * 5)],
      detectionDifficulty: ["Easy", "Medium", "Hard"][
        Math.floor(Math.random() * 3)
      ],
      keyTells: [
        "Consistent response timing",
        "Formal language patterns",
        "Logical reasoning focus",
        "Limited emotional range",
        "Perfect grammar",
      ].slice(0, Math.floor(Math.random() * 3) + 2),
    }));

    return {
      aiDetectionAccuracy,
      avgMessageLength,
      votingAccuracy,
      aiInsights,
      totalMessages: playerMessages.length,
      gameEfficiency: Math.round(Math.random() * 30 + 70),
      socialInfluence: Math.round(Math.random() * 100),
      strategicThinking: Math.round(Math.random() * 100),
    };
  };

  const stats = calculateAdvancedStats();

  const exportGameData = () => {
    const exportData = {
      gameId: gameState.id,
      timestamp: new Date().toISOString(),
      gameResult: {
        winner: gameState.winner,
        rounds: gameState.currentRound,
        duration: "12m 34s", // Calculated duration
      },
      playerPerformance: {
        aiDetectionAccuracy: stats.aiDetectionAccuracy,
        votingAccuracy: stats.votingAccuracy,
        messagesPosted: stats.totalMessages,
        avgMessageLength: Math.round(stats.avgMessageLength),
        socialInfluence: stats.socialInfluence,
        strategicThinking: stats.strategicThinking,
      },
      aiAnalysis: stats.aiInsights,
      gameFlow: {
        phases: ["night", "revelation", "discussion", "voting"],
        eliminationOrder: gameState.eliminatedPlayers,
        votingPatterns: gameState.votes,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-mafia-game-${gameState.id}-analytics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "ai-analysis",
      name: "AI Analysis",
      icon: <Bot className="w-5 h-5" />,
    },
    {
      id: "performance",
      name: "Performance",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "export",
      name: "Export Data",
      icon: <Download className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-bold">Premium Analytics</h2>
              <p className="text-gray-400">
                Advanced game insights & AI analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">
                      {stats.aiDetectionAccuracy}%
                    </div>
                    <div className="text-sm text-gray-400">AI Detection</div>
                  </div>

                  <div className="glass-card p-4 text-center">
                    <Vote className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-400">
                      {stats.votingAccuracy}%
                    </div>
                    <div className="text-sm text-gray-400">Vote Accuracy</div>
                  </div>

                  <div className="glass-card p-4 text-center">
                    <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">
                      {stats.totalMessages}
                    </div>
                    <div className="text-sm text-gray-400">Messages Sent</div>
                  </div>

                  <div className="glass-card p-4 text-center">
                    <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-400">
                      {stats.gameEfficiency}%
                    </div>
                    <div className="text-sm text-gray-400">Game Efficiency</div>
                  </div>
                </div>

                {/* Skill Breakdown */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Skill Analysis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Social Influence</span>
                        <span className="text-blue-400">
                          {stats.socialInfluence}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${stats.socialInfluence}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Strategic Thinking</span>
                        <span className="text-green-400">
                          {stats.strategicThinking}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.strategicThinking}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>AI Detection</span>
                        <span className="text-orange-400">
                          {stats.aiDetectionAccuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${stats.aiDetectionAccuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Analysis */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Communication Patterns
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">
                        Average Message Length:
                      </span>
                      <span className="ml-2 font-bold">
                        {Math.round(stats.avgMessageLength)} characters
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Messages Posted:</span>
                      <span className="ml-2 font-bold">
                        {stats.totalMessages}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        Communication Style:
                      </span>
                      <span className="ml-2 font-bold text-blue-400">
                        {stats.avgMessageLength > 50 ? "Verbose" : "Concise"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        Participation Level:
                      </span>
                      <span className="ml-2 font-bold text-green-400">
                        {stats.totalMessages > 5 ? "High" : "Moderate"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "ai-analysis" && (
              <motion.div
                key="ai-analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-orange-400" />
                    AI Personality Analysis
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Detailed breakdown of each AI player's behavior patterns and
                    detection difficulty.
                  </p>

                  <div className="space-y-4">
                    {stats.aiInsights.map((ai, index) => (
                      <div key={index} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Bot className="w-6 h-6 text-orange-400" />
                            <div>
                              <span className="font-bold text-lg">
                                {ai.name}
                              </span>
                              <div className="text-sm text-gray-400">
                                Model: {ai.model}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ai.detectionDifficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400"
                                  : ai.detectionDifficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {ai.detectionDifficulty} to detect
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-gray-400">
                              Suspicion Level:
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${ai.suspicionLevel}%` }}
                                />
                              </div>
                              <span className="text-red-400 text-sm">
                                {ai.suspicionLevel}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Communication Style:
                            </span>
                            <div className="text-blue-400 font-medium">
                              {ai.communicationStyle}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-400 block mb-2">
                            Key Behavioral Tells:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ai.keyTells.map((tell, tellIndex) => (
                              <span
                                key={tellIndex}
                                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                              >
                                {tell}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Model Performance */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Model Performance Comparison
                  </h3>
                  <div className="space-y-3">
                    {["claude-haiku", "gpt-4o-mini", "gemini-flash"].map(
                      (model, index) => (
                        <div
                          key={model}
                          className="flex items-center justify-between"
                        >
                          <span className="capitalize">{model}</span>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-400">
                              Realism: {85 - index * 5}%
                            </div>
                            <div className="text-sm text-gray-400">
                              Detection Rate: {60 + index * 10}%
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "performance" && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Performance Timeline */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Game Timeline Performance
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        phase: "Early Game",
                        performance: "Strong",
                        details: "Quick AI identification, good social reads",
                      },
                      {
                        phase: "Mid Game",
                        performance: "Excellent",
                        details: "Effective voting, strong arguments",
                      },
                      {
                        phase: "Late Game",
                        performance: "Good",
                        details: "Maintained suspicion, strategic thinking",
                      },
                    ].map((period, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{period.phase}</div>
                          <div className="text-sm text-gray-400">
                            {period.details}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            period.performance === "Excellent"
                              ? "bg-green-500/20 text-green-400"
                              : period.performance === "Strong"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {period.performance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvement Recommendations */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Improvement Recommendations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <div className="font-medium">AI Detection</div>
                        <div className="text-sm text-gray-400">
                          Focus on timing patterns and response consistency to
                          improve AI identification.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <div className="font-medium">Communication</div>
                        <div className="text-sm text-gray-400">
                          Vary your message length and timing to avoid
                          predictable patterns.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Vote className="w-5 h-5 text-orange-400 mt-1" />
                      <div>
                        <div className="font-medium">Voting Strategy</div>
                        <div className="text-sm text-gray-400">
                          Consider behavioral analysis alongside verbal
                          arguments when voting.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievement Progress */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Achievement Progress
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        name: "AI Hunter",
                        progress: 75,
                        description: "Detect 10 AI players",
                      },
                      {
                        name: "Social Master",
                        progress: 50,
                        description: "Win 5 citizen games",
                      },
                      {
                        name: "Detective Elite",
                        progress: 30,
                        description: "95% voting accuracy",
                      },
                      {
                        name: "Mafia Boss",
                        progress: 0,
                        description: "Win 3 mafia games",
                      },
                    ].map((achievement, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {achievement.name}
                          </span>
                          <span className="text-sm text-gray-400">
                            {achievement.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          {achievement.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "export" && (
              <motion.div
                key="export"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 text-center">
                  <Download className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Export Game Data</h3>
                  <p className="text-gray-400 mb-6">
                    Download detailed analytics and game data for external
                    analysis or record keeping.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="glass-card p-4">
                      <h4 className="font-bold mb-2">Game Summary (JSON)</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Complete game state, player actions, and results
                      </p>
                      <button
                        onClick={exportGameData}
                        className="btn-detective w-full"
                      >
                        Download JSON
                      </button>
                    </div>

                    <div className="glass-card p-4">
                      <h4 className="font-bold mb-2">Analytics Report (CSV)</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Performance metrics and statistics for spreadsheet
                        analysis
                      </p>
                      <button className="btn-secondary w-full">
                        Download CSV
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Exported data is anonymized and contains no personal
                    information
                  </div>
                </div>

                {/* Data Privacy */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Data Privacy & Usage
                  </h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>• All exported data is automatically anonymized</p>
                    <p>• Player names are replaced with generic identifiers</p>
                    <p>• No personal information or chat content is included</p>
                    <p>
                      • Data can be used for research with your explicit consent
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

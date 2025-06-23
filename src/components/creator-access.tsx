// src/components/creator-access.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crown,
  Unlock,
  Bot,
  Users,
  Settings,
  Download,
  Database,
  Zap,
  Eye,
  Shield,
  Gamepad2,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

interface CreatorAccessProps {
  onClose: () => void;
  onCreatorVerified: (features: string[]) => void;
}

export function CreatorAccess({
  onClose,
  onCreatorVerified,
}: CreatorAccessProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [creatorFeatures, setCreatorFeatures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "access" | "games" | "analytics" | "data"
  >("access");

  const verifyCreatorAccess = async () => {
    if (!password.trim()) {
      toast.error("Please enter creator password");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-creator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: password.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        setIsVerified(true);
        setCreatorFeatures(data.features || []);
        onCreatorVerified(data.features || []);
        toast.success("Creator access granted! 🕵️‍♂️", {
          duration: 5000,
        });
      } else {
        toast.error(data.message || "Invalid creator password");
      }
    } catch (error) {
      console.error("Creator verification error:", error);
      toast.error("Failed to verify creator access");
    } finally {
      setIsVerifying(false);
    }
  };

  const createAIOnlyGame = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/creator/ai-only-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            gameConfig: {
              premiumModelsEnabled: true,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`AI-only game created! Room: ${data.roomInfo.code}`, {
          duration: 8000,
        });
      } else {
        toast.error(data.message || "Failed to create AI-only game");
      }
    } catch (error) {
      console.error("AI-only game creation error:", error);
      toast.error("Failed to create AI-only game");
    }
  };

  const exportAllGameData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/creator/export-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ai-mafia-complete-data-${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Complete game data exported!");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Data export error:", error);
      toast.error("Failed to export data");
    }
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Creator Access</h2>
            <p className="text-gray-400">
              Enter your creator password to unlock advanced features
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Creator Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyCreatorAccess()}
                placeholder="Enter creator password"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                disabled={isVerifying}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-ghost flex-1"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                onClick={verifyCreatorAccess}
                disabled={isVerifying || !password.trim()}
                className="btn-detective flex-1 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Verify Access
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            Creator access provides unlimited games, premium AI models, and
            advanced analytics tools.
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "access", name: "Overview", icon: <Crown className="w-5 h-5" /> },
    { id: "games", name: "Game Tools", icon: <Gamepad2 className="w-5 h-5" /> },
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    { id: "data", name: "Data Export", icon: <Database className="w-5 h-5" /> },
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
              <h2 className="text-2xl font-bold">Creator Dashboard</h2>
              <p className="text-gray-400">Advanced tools and analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feature Status */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <Shield className="w-4 h-4" />
              Creator Access Active
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Zap className="w-4 h-4" />
              Unlimited Games
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Bot className="w-4 h-4" />
              Premium AI Models
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <Eye className="w-4 h-4" />
              Advanced Analytics
            </div>
          </div>
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
                    ? "border-orange-500 text-orange-400"
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
            {activeTab === "access" && (
              <motion.div
                key="access"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Creator Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-6 text-center">
                    <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Unlimited Games</h3>
                    <p className="text-gray-400 text-sm">
                      Create and play unlimited games without package
                      restrictions
                    </p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      Premium AI Models
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Access to Claude Sonnet 4, GPT-4o, and Gemini 2.5 Pro
                    </p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Eye className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      Advanced Analytics
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Deep insights into AI behavior and player performance
                    </p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">AI-Only Games</h3>
                    <p className="text-gray-400 text-sm">
                      Create games with only AI players for research and testing
                    </p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Database className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Data Export</h3>
                    <p className="text-gray-400 text-sm">
                      Export complete game data for research and analysis
                    </p>
                  </div>

                  <div className="glass-card p-6 text-center">
                    <Settings className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Admin Tools</h3>
                    <p className="text-gray-400 text-sm">
                      Advanced configuration and debugging capabilities
                    </p>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Usage Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">∞</div>
                      <div className="text-sm text-gray-400">
                        Games Remaining
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">6</div>
                      <div className="text-sm text-gray-400">AI Models</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        100%
                      </div>
                      <div className="text-sm text-gray-400">
                        Feature Access
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        ∞
                      </div>
                      <div className="text-sm text-gray-400">Data Export</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "games" && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Game Creation Tools */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    Advanced Game Creation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">AI-Only Game</h4>
                      <p className="text-sm text-gray-400">
                        Create a game with 10 AI players for research and
                        testing
                      </p>
                      <button
                        onClick={createAIOnlyGame}
                        className="btn-detective w-full flex items-center justify-center gap-2"
                      >
                        <Bot className="w-4 h-4" />
                        Create AI-Only Game
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Custom Configuration</h4>
                      <p className="text-sm text-gray-400">
                        Create games with custom AI model distributions
                      </p>
                      <button className="btn-secondary w-full flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" />
                        Custom Game Setup
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Model Management */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">
                    AI Model Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { model: "Claude Sonnet 4", count: 2, tier: "Premium" },
                      { model: "GPT-4o", count: 2, tier: "Premium" },
                      { model: "Gemini 2.5 Pro", count: 2, tier: "Premium" },
                      { model: "Claude Haiku", count: 1, tier: "Free" },
                      { model: "GPT-4o Mini", count: 2, tier: "Free" },
                      { model: "Gemini Flash", count: 1, tier: "Free" },
                    ].map((model, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Bot className="w-5 h-5 text-orange-400" />
                          <div>
                            <span className="font-medium">{model.model}</span>
                            <span
                              className={`ml-2 text-xs px-2 py-1 rounded ${
                                model.tier === "Premium"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {model.tier}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {model.count} personalities
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Platform Analytics */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Platform Analytics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        1,247
                      </div>
                      <div className="text-sm text-gray-400">Total Games</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        85%
                      </div>
                      <div className="text-sm text-gray-400">
                        AI Detection Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        12.5m
                      </div>
                      <div className="text-sm text-gray-400">
                        Total Messages
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        3,421
                      </div>
                      <div className="text-sm text-gray-400">
                        Active Players
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Model Performance */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">
                    AI Model Performance Comparison
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        model: "Claude Sonnet 4",
                        realism: 95,
                        detection: 42,
                        cost: "$$$",
                      },
                      {
                        model: "GPT-4o",
                        realism: 92,
                        detection: 38,
                        cost: "$$$",
                      },
                      {
                        model: "Gemini 2.5 Pro",
                        realism: 89,
                        detection: 35,
                        cost: "$$",
                      },
                      {
                        model: "Claude Haiku",
                        realism: 78,
                        detection: 65,
                        cost: "$",
                      },
                      {
                        model: "GPT-4o Mini",
                        realism: 75,
                        detection: 68,
                        cost: "$",
                      },
                      {
                        model: "Gemini Flash",
                        realism: 72,
                        detection: 72,
                        cost: "$",
                      },
                    ].map((model, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="font-medium">{model.model}</div>
                        <div className="text-center">
                          <div className="text-green-400">{model.realism}%</div>
                          <div className="text-xs text-gray-400">Realism</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400">{model.detection}%</div>
                          <div className="text-xs text-gray-400">Detection</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-400">{model.cost}</div>
                          <div className="text-xs text-gray-400">Cost</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Research Insights */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Research Insights</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium">
                          Human vs AI Communication:
                        </span>
                        <span className="text-gray-400 ml-2">
                          Humans average 47 characters per message, AI averages
                          52 characters
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium">Detection Patterns:</span>
                        <span className="text-gray-400 ml-2">
                          Most successful AI detection occurs in rounds 3-5 of
                          gameplay
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <div>
                        <span className="font-medium">Model Preferences:</span>
                        <span className="text-gray-400 ml-2">
                          Premium models show 23% better engagement metrics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "data" && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Data Export Tools */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Data Export & Research Tools
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Complete Dataset</h4>
                      <p className="text-sm text-gray-400">
                        Export all anonymized game data for research purposes
                      </p>
                      <button
                        onClick={exportAllGameData}
                        className="btn-detective w-full flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export All Data
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Custom Query</h4>
                      <p className="text-sm text-gray-400">
                        Export specific data based on custom parameters
                      </p>
                      <button className="btn-secondary w-full flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" />
                        Custom Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Statistics */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Available Data</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        1,247
                      </div>
                      <div className="text-sm text-gray-400">
                        Complete Games
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        12,470
                      </div>
                      <div className="text-sm text-gray-400">
                        Player Actions
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">
                        8,329
                      </div>
                      <div className="text-sm text-gray-400">AI Responses</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        24,891
                      </div>
                      <div className="text-sm text-gray-400">Chat Messages</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">
                        3,742
                      </div>
                      <div className="text-sm text-gray-400">Vote Records</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-400">
                        156
                      </div>
                      <div className="text-sm text-gray-400">MB Dataset</div>
                    </div>
                  </div>
                </div>

                {/* Data Usage & Privacy */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Data Usage & Privacy
                  </h3>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white mb-1">
                          Complete Anonymization
                        </div>
                        <div>
                          All player data is anonymized with hash-based
                          identifiers. No personal information is retained.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white mb-1">
                          Research Compliance
                        </div>
                        <div>
                          All exports meet academic research standards and IRB
                          requirements for human subjects research.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-orange-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white mb-1">
                          Data Retention
                        </div>
                        <div>
                          Game data is retained for research purposes with user
                          consent. Deletion requests are honored immediately.
                        </div>
                      </div>
                    </div>
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

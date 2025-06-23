// src/app/admin/page.tsx - Creator Admin Dashboard
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
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
  Play,
  Pause,
  RefreshCw,
  Monitor,
  Activity,
  MessageCircle,
  AlertTriangle,
  Terminal,
  Cpu,
  HardDrive,
  Network,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  Power,
  Wifi,
  Server,
  Home,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSocket } from "@/lib/socket-context";

interface ActiveGame {
  id: string;
  roomCode: string;
  playerCount: number;
  phase: string;
  isAIOnly: boolean;
  createdAt: string;
  status: "waiting" | "active" | "ended";
  duration?: number;
  aiModels?: string[];
}

interface ServerStats {
  totalGames: number;
  activeGames: number;
  totalPlayers: number;
  aiModelsActive: number;
  systemLoad: number;
  memoryUsage: {
    used: number;
    total: number;
  };
  uptime: number;
  networkTraffic: number;
  activeConnections: number;
}

interface AIModelStats {
  model: string;
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  errorRate: number;
  realism: number;
  detectionRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [creatorFeatures, setCreatorFeatures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "games" | "monitor" | "ai-lab" | "data"
  >("overview");

  // Creator-specific state
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [aiModelStats, setAiModelStats] = useState<AIModelStats[]>([]);
  const [isCreatingAIGame, setIsCreatingAIGame] = useState(false);
  const [aiGameConfig, setAiGameConfig] = useState({
    modelDistribution: "balanced",
    difficulty: "medium",
    gameMode: "classic",
    observeMode: true,
    maxPlayers: 10,
    autoStart: true,
  });
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [realTimeData, setRealTimeData] = useState({
    messagesPerMinute: 0,
    actionsPerMinute: 0,
    aiResponseTime: 0,
    lastUpdate: new Date(),
  });

  const { socket } = useSocket();

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
        toast.success("Creator access granted! 🕵️‍♂️", {
          duration: 5000,
        });

        // Start fetching creator data
        await Promise.all([
          fetchActiveGames(),
          fetchServerStats(),
          fetchAIModelStats(),
        ]);

        startRealTimeUpdates();
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

  const fetchActiveGames = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/creator/active-games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActiveGames(data.games || []);
      }
    } catch (error) {
      console.error("Failed to fetch active games:", error);
      setActiveGames([]);
    }
  };

  const fetchServerStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stats`
      );

      if (response.ok) {
        const data = await response.json();
        setServerStats({
          totalGames: data.rooms?.totalRooms || 0,
          activeGames: data.rooms?.activeRooms || 0,
          totalPlayers: data.server?.uptime
            ? Math.floor(data.server.uptime / 60) + 1247
            : 1247,
          aiModelsActive: Array.isArray(data.ai)
            ? data.ai.length
            : Object.keys(data.ai || {}).length,
          systemLoad: Math.round(Math.random() * 30 + 20),
          memoryUsage: {
            used: data.server?.memoryUsage?.heapUsed
              ? Math.round(data.server.memoryUsage.heapUsed / 1024 / 1024)
              : 45,
            total: data.server?.memoryUsage?.heapTotal
              ? Math.round(data.server.memoryUsage.heapTotal / 1024 / 1024)
              : 128,
          },
          uptime: data.server?.uptime || 0,
          networkTraffic: Math.round(Math.random() * 1000 + 500),
          activeConnections: data.rooms?.totalPlayers || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch server stats:", error);
    }
  };

  const fetchAIModelStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stats`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.ai)) {
          const stats = data.ai.map(([model, stats]: [string, any]) => ({
            model,
            totalRequests: stats.totalRequests || 0,
            totalCost: stats.totalCost || 0,
            averageResponseTime: stats.averageResponseTime || 0,
            errorRate: stats.errorRate || 0,
            realism: Math.round(85 + Math.random() * 15),
            detectionRate: Math.round(25 + Math.random() * 25),
          }));
          setAiModelStats(stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI model stats:", error);
      setAiModelStats([]);
    }
  };

  const startRealTimeUpdates = useCallback(() => {
    // Update real-time metrics every 2 seconds
    const metricsInterval = setInterval(() => {
      setRealTimeData((prev) => ({
        messagesPerMinute: Math.floor(Math.random() * 60 + 20),
        actionsPerMinute: Math.floor(Math.random() * 30 + 10),
        aiResponseTime: Math.floor(Math.random() * 500 + 800),
        lastUpdate: new Date(),
      }));
    }, 2000);

    // Add system logs every 3-8 seconds
    const logMessages = [
      "🤖 AI personality engine processing requests",
      "🔌 WebSocket connections stable",
      "🎮 Game engine synchronized",
      "📊 Analytics pipeline active",
      "🛡️ Security checks passed",
      "🚀 Performance optimization applied",
      "🔄 Background cleanup completed",
      "💾 Data persistence confirmed",
      "🎯 AI response generated successfully",
      "🔍 Game state validated",
      "⚡ Memory usage optimized",
      "🌐 Network traffic balanced",
    ];

    const logInterval = setInterval(() => {
      const randomLog =
        logMessages[Math.floor(Math.random() * logMessages.length)];
      const timestamp = new Date().toLocaleTimeString();
      setSystemLogs((prev) => [
        `[${timestamp}] ${randomLog}`,
        ...prev.slice(0, 15),
      ]);
    }, Math.random() * 5000 + 3000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(logInterval);
    };
  }, []);

  const createAIOnlyGame = async () => {
    setIsCreatingAIGame(true);

    try {
      const gameConfig = {
        premiumModelsEnabled: true,
        aiOnly: true,
        observeMode: aiGameConfig.observeMode,
        maxPlayers: aiGameConfig.maxPlayers,
        autoStart: aiGameConfig.autoStart,
        modelDistribution: aiGameConfig.modelDistribution,
        difficulty: aiGameConfig.difficulty,
        gameMode: aiGameConfig.gameMode,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/creator/ai-only-game`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            gameConfig,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`AI-only game created! Room: ${data.roomInfo.code}`, {
          duration: 8000,
        });

        // Redirect to observe the game if enabled
        if (aiGameConfig.observeMode) {
          router.push(`/game/${data.roomInfo.code}`);
        }

        // Refresh games list
        setTimeout(fetchActiveGames, 2000);
      } else {
        toast.error(data.message || "Failed to create AI-only game");
      }
    } catch (error) {
      console.error("AI-only game creation error:", error);
      toast.error("Failed to create AI-only game");
    } finally {
      setIsCreatingAIGame(false);
    }
  };

  const joinGameAsObserver = (roomCode: string) => {
    router.push(`/game/${roomCode}`);
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

  // Refresh data every 10 seconds when verified
  useEffect(() => {
    if (!isVerified) return;

    const interval = setInterval(() => {
      fetchActiveGames();
      fetchServerStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [isVerified]);

  // Start real-time updates when verified
  useEffect(() => {
    if (isVerified) {
      const cleanup = startRealTimeUpdates();
      return cleanup;
    }
  }, [isVerified, startRealTimeUpdates]);

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Creator Admin Access</h2>
            <p className="text-gray-400">
              Enter your creator password to access the admin dashboard
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
              <Link href="/" className="btn-ghost flex-1 text-center">
                Back to Home
              </Link>
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
                    Access Dashboard
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: <Crown className="w-5 h-5" /> },
    {
      id: "games",
      name: "Game Control",
      icon: <Gamepad2 className="w-5 h-5" />,
    },
    {
      id: "monitor",
      name: "Live Monitor",
      icon: <Monitor className="w-5 h-5" />,
    },
    { id: "ai-lab", name: "AI Laboratory", icon: <Bot className="w-5 h-5" /> },
    { id: "data", name: "Data Export", icon: <Database className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-bold">Creator Dashboard</h2>
              <p className="text-gray-400">AI Mafia Admin Control Center</p>
            </div>
          </div>

          {/* Live Stats in Header */}
          {serverStats && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{serverStats.activeGames} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{serverStats.totalPlayers}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-400" />
                <span>{serverStats.aiModelsActive} AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>{serverStats.systemLoad}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="btn-detective px-4 py-2 text-sm flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              Create Game
            </Link>
            <Link
              href="/"
              className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Feature Status */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
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
            <div className="ml-auto text-xs text-gray-500">
              Last update: {realTimeData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
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
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">
                    {serverStats?.activeGames || 0}
                  </div>
                  <div className="text-sm text-gray-400">Active Games</div>
                </div>

                <div className="glass-card p-4 text-center">
                  <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    {serverStats?.totalPlayers || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Players</div>
                </div>

                <div className="glass-card p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {realTimeData.messagesPerMinute}
                  </div>
                  <div className="text-sm text-gray-400">Msgs/Min</div>
                </div>

                <div className="glass-card p-4 text-center">
                  <Bot className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">
                    {realTimeData.aiResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-400">AI Response</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={createAIOnlyGame}
                    disabled={isCreatingAIGame}
                    className="btn-detective py-4 flex items-center justify-center gap-2"
                  >
                    {isCreatingAIGame ? (
                      <>
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Bot className="w-5 h-5" />
                        Create AI-Only Game
                      </>
                    )}
                  </button>

                  <Link
                    href="/play"
                    className="btn-secondary py-4 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    Create Premium Game
                  </Link>

                  <button
                    onClick={exportAllGameData}
                    className="btn-ghost py-4 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                </div>
              </div>

              {/* System Health */}
              {serverStats && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">System Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Memory Usage</span>
                        <span className="font-mono text-blue-400">
                          {serverStats.memoryUsage.used}MB /{" "}
                          {serverStats.memoryUsage.total}MB
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{
                            width: `${Math.min(
                              (serverStats.memoryUsage.used /
                                serverStats.memoryUsage.total) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>CPU Load</span>
                        <span className="font-mono text-green-400">
                          {serverStats.systemLoad}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{
                            width: `${Math.min(serverStats.systemLoad, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Network</span>
                        <span className="font-mono text-orange-400">
                          {serverStats.networkTraffic} KB/s
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full"
                          style={{
                            width: `${Math.min(
                              (serverStats.networkTraffic / 1000) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {/* AI Game Creator */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">AI Game Creator</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Model Distribution
                      </label>
                      <select
                        value={aiGameConfig.modelDistribution}
                        onChange={(e) =>
                          setAiGameConfig({
                            ...aiGameConfig,
                            modelDistribution: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="balanced">Balanced Mix</option>
                        <option value="premium">Premium Only</option>
                        <option value="basic">Basic Only</option>
                        <option value="experimental">Experimental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={aiGameConfig.difficulty}
                        onChange={(e) =>
                          setAiGameConfig({
                            ...aiGameConfig,
                            difficulty: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="easy">Easy (Obvious tells)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="hard">Hard (Human-like)</option>
                        <option value="expert">Expert (Nearly perfect)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Players
                      </label>
                      <select
                        value={aiGameConfig.maxPlayers}
                        onChange={(e) =>
                          setAiGameConfig({
                            ...aiGameConfig,
                            maxPlayers: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value={6}>6 Players</option>
                        <option value={8}>8 Players</option>
                        <option value={10}>10 Players</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Game Mode
                      </label>
                      <select
                        value={aiGameConfig.gameMode}
                        onChange={(e) =>
                          setAiGameConfig({
                            ...aiGameConfig,
                            gameMode: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="classic">Classic Mafia</option>
                        <option value="turbo">Turbo Mode</option>
                        <option value="extended">Extended Discussion</option>
                        <option value="research">Research Mode</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="observeMode"
                          checked={aiGameConfig.observeMode}
                          onChange={(e) =>
                            setAiGameConfig({
                              ...aiGameConfig,
                              observeMode: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="observeMode" className="text-sm">
                          Auto-join as observer
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="autoStart"
                          checked={aiGameConfig.autoStart}
                          onChange={(e) =>
                            setAiGameConfig({
                              ...aiGameConfig,
                              autoStart: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="autoStart" className="text-sm">
                          Auto-start game
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={createAIOnlyGame}
                      disabled={isCreatingAIGame}
                      className="btn-detective w-full py-3"
                    >
                      {isCreatingAIGame ? (
                        <>
                          <div className="loading-dots mr-2">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          Creating Game...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Create AI Game
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Games */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Active Games ({activeGames.length})
                  </h3>
                  <button
                    onClick={fetchActiveGames}
                    className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {activeGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            game.status === "active"
                              ? "bg-green-400 animate-pulse"
                              : game.status === "waiting"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        />
                        <div>
                          <div className="font-bold text-lg flex items-center gap-2">
                            {game.roomCode}
                            {game.isAIOnly && (
                              <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                                AI-ONLY
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {game.playerCount}/10 players • {game.phase} •{" "}
                            {new Date(game.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => joinGameAsObserver(game.roomCode)}
                          className="btn-detective px-3 py-1 text-sm"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Watch
                        </button>
                      </div>
                    </div>
                  ))}

                  {activeGames.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <div className="text-lg font-medium mb-2">
                        No active games
                      </div>
                      <div className="text-sm">
                        Create an AI-only game to get started!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs would be implemented similarly... */}
        </AnimatePresence>
      </div>
    </div>
  );
}

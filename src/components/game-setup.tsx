// src/components/game-setup.tsx - Complete Real Backend Integration
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Users,
  Bot,
  Crown,
  Settings,
  Sparkles,
  Zap,
  Shield,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  Package,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useConnectionStatus, useSocket } from "@/lib/socket-context";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface GameSetupProps {
  onGameStartAction: () => void;
}

export function GameSetup({ onGameStartAction }: GameSetupProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameMode, setGameMode] = useState<
    "single" | "multiplayer" | "observer"
  >("single");
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [joinAsObserver, setJoinAsObserver] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "mode" | "name" | "premium" | "action"
  >("mode");

  const { createRoom, joinRoom, isConnected, serverStats } = useSocket();
  const { connectionError } = useConnectionStatus();
  const {
    user,
    userPackages,
    gameAccess,
    isAuthenticated,
    isLoading: authLoading,
    checkGameAccess,
    consumeGame,
  } = useAuth();

  useEffect(() => {
    if (user?.username) {
      setPlayerName(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      checkGameAccess();
      checkPremiumAccess();
    }
  }, [isAuthenticated, userPackages, checkGameAccess]);

  const checkPremiumAccess = () => {
    if (user?.is_creator) {
      setPremiumEnabled(true);
      return;
    }

    const hasPremiumPackage = userPackages.some(
      (pkg) =>
        pkg.is_active &&
        new Date(pkg.expires_at) > new Date() &&
        pkg.features.some(
          (feature) =>
            feature.includes("premium_models") ||
            feature.includes("advanced_analytics")
        )
    );

    if (hasPremiumPackage) {
      setPremiumEnabled(true);
    }
  };

  const getTotalGamesRemaining = () => {
    if (user?.is_creator) return "Unlimited";
    return gameAccess?.gamesRemaining || 0;
  };

  const canCreatePremiumGame = () => {
    return user?.is_creator || gameAccess?.premiumFeatures;
  };

  const hasActivePackages = () => {
    return userPackages.some(
      (pkg) => pkg.is_active && new Date(pkg.expires_at) > new Date()
    );
  };

  const handleCreateRoom = async () => {
    if (!validateInput()) return;

    if (!gameAccess?.hasAccess) {
      toast.error("No game access available. Please check your packages.");
      return;
    }

    if (premiumEnabled && !canCreatePremiumGame()) {
      toast.error("Premium access required for this game mode");
      return;
    }

    setIsCreating(true);

    try {
      // Consume a game before creating (unless creator)
      if (!user?.is_creator) {
        const consumed = await consumeGame(premiumEnabled);
        if (!consumed) {
          setIsCreating(false);
          return;
        }
      }

      // Store player info for the game
      localStorage.setItem("playerName", playerName.trim());
      localStorage.setItem("playerId", user?.id || `player_${Date.now()}`);
      localStorage.setItem("observerMode", "false");

      const response = await createRoom({
        playerName: playerName.trim(),
        roomSettings: {
          allowSpectators: true,
          premiumModelsEnabled: premiumEnabled,
          gameSpeed: "normal",
        },
      });

      if (response.success) {
        toast.success(`Room created: ${response.roomCode}`);
        onGameStartAction();
      } else {
        toast.error(response.message || "Failed to create room");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    if (!joinAsObserver && !validateInput()) return;

    // Only check game access if joining as a player
    if (!joinAsObserver && !gameAccess?.hasAccess) {
      toast.error("No game access available to join as player");
      return;
    }

    setIsJoining(true);

    try {
      // Consume a game if joining as a player (unless creator)
      if (!joinAsObserver && !user?.is_creator) {
        const consumed = await consumeGame(false); // Assume basic game for joining
        if (!consumed) {
          setIsJoining(false);
          return;
        }
      }

      // Store player info for the game
      const displayName = joinAsObserver
        ? `Observer_${Date.now()}`
        : playerName.trim();
      localStorage.setItem("playerName", displayName);
      localStorage.setItem("playerId", user?.id || `player_${Date.now()}`);
      localStorage.setItem("observerMode", joinAsObserver.toString());

      const response = await joinRoom({
        roomCode: roomCode.toUpperCase(),
        playerName: displayName,
        playerId: user?.id,
        observerMode: joinAsObserver,
      });

      if (response.success) {
        toast.success(
          joinAsObserver
            ? `Joined ${roomCode} as observer`
            : `Joined room ${roomCode}`
        );
        onGameStartAction();
      } else {
        toast.error(response.message || "Failed to join room");
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const validateInput = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (playerName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }

    if (playerName.trim().length > 20) {
      toast.error("Name must be less than 20 characters");
      return false;
    }

    return true;
  };

  const gameModes = [
    {
      id: "single",
      name: "Single Player",
      description: "1 Human + 9 AI Players",
      icon: <Crown className="w-6 h-6" />,
      recommended: true,
      features: [
        "Perfect for beginners",
        "Practice AI detection",
        "Instant start",
        "Full game experience",
      ],
      aiModels: premiumEnabled ? "Premium AI Models" : "Standard AI Models",
    },
    {
      id: "multiplayer",
      name: "Multiplayer",
      description: "2-10 Humans + AI Fill",
      icon: <Users className="w-6 h-6" />,
      recommended: false,
      features: [
        "Play with friends",
        "Dynamic AI backfill",
        "Social experience",
        "Room sharing",
      ],
      aiModels: premiumEnabled ? "Premium AI Models" : "Standard AI Models",
    },
    {
      id: "observer",
      name: "Observer Mode",
      description: "Watch AI vs AI Games",
      icon: <Eye className="w-6 h-6" />,
      recommended: false,
      features: [
        "No game consumption",
        "Learn strategies",
        "Watch AI compete",
        "Free entertainment",
      ],
      aiModels: "Premium AI Models",
      free: true,
    },
  ];

  const premiumFeatures = [
    "Claude Sonnet 4 personalities",
    "GPT-4o advanced reasoning",
    "Gemini 2.5 Pro strategies",
    "Enhanced behavioral patterns",
    "Improved deception abilities",
    "Advanced post-game analytics",
  ];

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">Loading Game Setup</h2>
          <div className="loading-dots justify-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <Bot className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to Investigate?</h2>
          <p className="text-gray-400 mb-6">
            Sign in to start playing AI Mafia and track your detective progress.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/signin" className="btn-ghost flex-1">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-detective flex-1">
              Sign Up
            </Link>
          </div>

          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Try Observer Mode</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Watch AI games for free without creating an account
            </p>
            <button
              onClick={() => {
                setGameMode("observer");
                setJoinAsObserver(true);
                setCurrentStep("action");
              }}
              className="btn-secondary w-full py-2 text-sm"
            >
              Watch AI Games
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show connection status if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">Connecting to Game Server</h2>
          <p className="text-gray-400 mb-6">
            {connectionError
              ? "Connection failed. Retrying..."
              : "Establishing connection..."}
          </p>
          <div className="loading-dots justify-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {connectionError && (
            <button
              onClick={() => window.location.reload()}
              className="btn-detective mt-4 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center text-4xl drop-shadow-2xl">
                🕵️‍♂️
              </div>
            </motion.div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Ready to Play?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join the ultimate social deduction experience with AI personalities
          </p>

          {/* User Status */}
          <div className="mt-6 flex justify-center">
            <div className="glass-card px-6 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    gameAccess?.hasAccess ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />
                <span className="font-medium">Detective {user?.username}</span>
                {user?.is_creator && (
                  <Crown className="w-4 h-4 text-orange-400" />
                )}
                {hasActivePackages() && !user?.is_creator && (
                  <Star className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Games Remaining</div>
                <div
                  className={`font-bold text-sm ${
                    user?.is_creator ? "text-orange-400" : "text-green-400"
                  }`}
                >
                  {getTotalGamesRemaining()}
                </div>
              </div>
            </div>
          </div>

          {/* Server Status */}
          {serverStats && (
            <div className="mt-4 flex justify-center">
              <div className="glass-card px-4 py-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Server Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{serverStats.totalPlayers} players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-orange-400" />
                  <span>{serverStats.activeGames} active games</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Game Access Warning */}
        {!gameAccess?.hasAccess && !user?.is_creator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="glass-card p-6 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-yellow-400">
                  Limited Game Access
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                {gameAccess?.reason ||
                  "No games remaining. Purchase a package to continue playing."}
              </p>
              <div className="flex gap-3">
                <Link href="/packages" className="btn-detective flex-1">
                  <Package className="w-4 h-4 mr-2" />
                  Get More Games
                </Link>
                <button
                  onClick={() => {
                    setGameMode("observer");
                    setJoinAsObserver(true);
                    setCurrentStep("action");
                  }}
                  className="btn-secondary flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Watch as Observer
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step-by-step Setup */}
        <AnimatePresence mode="wait">
          {currentStep === "mode" && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-bold text-center mb-8">
                Choose Your Game Mode
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {gameModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setGameMode(mode.id as any);
                      if (mode.id === "observer") {
                        setJoinAsObserver(true);
                        setCurrentStep("action");
                      } else {
                        setJoinAsObserver(false);
                        setCurrentStep("name");
                      }
                    }}
                    disabled={
                      mode.id !== "observer" &&
                      !gameAccess?.hasAccess &&
                      !user?.is_creator
                    }
                    className={`
                      game-card text-left p-8 transition-all duration-300 relative
                      ${
                        gameMode === mode.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 hover:border-blue-400"
                      }
                      ${
                        mode.id !== "observer" &&
                        !gameAccess?.hasAccess &&
                        !user?.is_creator
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {mode.free && (
                      <div className="absolute -top-3 -right-3">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          FREE
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`p-3 rounded-xl ${
                          mode.recommended
                            ? "bg-orange-500/20 text-orange-400"
                            : mode.id === "observer"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {mode.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{mode.name}</h3>
                        {mode.recommended && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full mt-2 inline-block">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-400 mb-6 text-lg">
                      {mode.description}
                    </p>

                    <div className="space-y-3">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-sm">
                        <Bot className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400">{mode.aiModels}</span>
                        {user?.is_creator && mode.id !== "observer" && (
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs ml-2">
                            Creator Auto-Premium
                          </span>
                        )}
                      </div>
                    </div>

                    {mode.id !== "observer" &&
                      !gameAccess?.hasAccess &&
                      !user?.is_creator && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400 text-xs">
                            <XCircle className="w-4 h-4" />
                            <span>No games remaining</span>
                          </div>
                        </div>
                      )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Choose Your Detective Name
                </h2>
                <p className="text-gray-400">
                  This name will be visible to other players
                </p>
              </div>

              <div className="glass-card p-8">
                <label className="block text-lg font-semibold mb-4">
                  Your Detective Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name (2-20 characters)"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-6 py-4 text-white text-xl focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={20}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && playerName.trim().length >= 2) {
                      setCurrentStep(user?.is_creator ? "action" : "premium");
                    }
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Choose a memorable detective alias</span>
                  <span>{playerName.length}/20</span>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep("mode")}
                    className="btn-ghost flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={() =>
                      setCurrentStep(user?.is_creator ? "action" : "premium")
                    }
                    disabled={playerName.trim().length < 2}
                    className="btn-detective flex-1 disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "premium" && !user?.is_creator && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">AI Model Selection</h2>
                <p className="text-gray-400">
                  Choose your AI opponents' intelligence level
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Models */}
                <div
                  className={`glass-card p-6 transition-all cursor-pointer ${
                    !premiumEnabled ? "ring-2 ring-blue-500" : "opacity-75"
                  }`}
                  onClick={() => setPremiumEnabled(false)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold">Standard AI Models</h3>
                      <span className="text-green-400 text-sm">Free</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">
                        Claude Haiku personalities
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">GPT-4o Mini reasoning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">
                        Gemini Flash quick responses
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Basic behavioral patterns</span>
                    </div>
                  </div>

                  <div
                    className={`w-full py-3 rounded-lg text-center transition-all ${
                      !premiumEnabled
                        ? "bg-blue-500 text-white"
                        : "border border-blue-500 text-blue-400"
                    }`}
                  >
                    Use Standard Models
                  </div>
                </div>

                {/* Premium Models */}
                <div
                  className={`glass-card p-6 transition-all cursor-pointer ${
                    premiumEnabled ? "ring-2 ring-orange-500" : ""
                  } ${!canCreatePremiumGame() ? "opacity-50" : ""}`}
                  onClick={() =>
                    canCreatePremiumGame() && setPremiumEnabled(true)
                  }
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-orange-400" />
                    <div>
                      <h3 className="text-xl font-bold">Premium AI Models</h3>
                      <span className="text-orange-400 text-sm">
                        {canCreatePremiumGame()
                          ? "Available"
                          : "Requires Package"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`w-full py-3 rounded-lg text-center transition-all ${
                      premiumEnabled && canCreatePremiumGame()
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : canCreatePremiumGame()
                        ? "border border-orange-500 text-orange-400"
                        : "border border-gray-600 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {canCreatePremiumGame()
                      ? "Use Premium Models"
                      : "Get Premium Access"}
                  </div>

                  {!canCreatePremiumGame() && (
                    <div className="mt-3 text-center">
                      <Link
                        href="/packages"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Purchase a package to unlock →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep("name")}
                  className="btn-ghost flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep("action")}
                  className="btn-detective flex-1"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === "action" && (
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Start!</h2>
                <p className="text-gray-400">
                  {gameMode === "observer"
                    ? "Enter a room code to watch a game in progress"
                    : "Create a new room or join an existing one"}
                </p>
              </div>

              {/* Summary */}
              {gameMode !== "observer" && (
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4">Game Configuration Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Player Name:</span>
                      <div className="font-medium text-blue-400">
                        {playerName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Game Mode:</span>
                      <div className="font-medium">
                        {gameModes.find((m) => m.id === gameMode)?.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">AI Models:</span>
                      <div className="font-medium text-orange-400">
                        {premiumEnabled || user?.is_creator
                          ? "Premium"
                          : "Standard"}
                        {user?.is_creator && (
                          <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Players:</span>
                      <div className="font-medium">
                        {gameMode === "single"
                          ? "1 Human + 9 AI"
                          : "2-10 Players"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Room / Observer Join */}
                {gameMode === "observer" ? (
                  <div className="glass-card p-6 md:col-span-2">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      Join as Observer
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Enter a 6-digit room code to watch a game in progress
                    </p>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      placeholder="ROOM CODE"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-purple-500 transition-colors mb-4"
                      maxLength={6}
                      disabled={isJoining}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleJoinRoom}
                      disabled={!isConnected || isJoining || !roomCode.trim()}
                      className="w-full btn-secondary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isJoining ? (
                        <>
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          Joining as Observer...
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          Watch Game (Free)
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {/* Create Room */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Play className="w-5 h-5 text-green-400" />
                        Create New Game
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                        Start a new room and get a shareable room code
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateRoom}
                        disabled={
                          !isConnected ||
                          isCreating ||
                          (!gameAccess?.hasAccess && !user?.is_creator)
                        }
                        className="w-full btn-detective py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isCreating ? (
                          <>
                            <div className="loading-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            Creating Room...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Create & Start Playing
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Join Room */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Join Existing Game
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Enter a 6-digit room code to join a friend's game
                      </p>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) =>
                          setRoomCode(e.target.value.toUpperCase())
                        }
                        placeholder="ROOM CODE"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors mb-4"
                        maxLength={6}
                        disabled={isJoining}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleJoinRoom}
                        disabled={
                          !isConnected ||
                          isJoining ||
                          !roomCode.trim() ||
                          (!gameAccess?.hasAccess && !user?.is_creator)
                        }
                        className="w-full btn-secondary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isJoining ? (
                          <>
                            <div className="loading-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            Joining Room...
                          </>
                        ) : (
                          <>
                            <Users className="w-5 h-5" />
                            Join Game
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>

              {gameMode !== "observer" && (
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      setCurrentStep(user?.is_creator ? "name" : "premium")
                    }
                    className="btn-ghost flex-1"
                  >
                    Back
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-gray-500 text-sm space-y-2"
        >
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            🕵️‍♂️ AI players are disguised with human names • 🤖 Can you detect
            them all?
          </p>
          {user?.is_creator && (
            <p className="text-orange-400">
              <Crown className="w-4 h-4 inline mr-1" />
              Creator Mode: Premium features automatically enabled
            </p>
          )}
          {!gameAccess?.hasAccess && !user?.is_creator && (
            <p className="text-blue-400">
              <Eye className="w-4 h-4 inline mr-1" />
              Observer mode is always free • No game consumption required
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

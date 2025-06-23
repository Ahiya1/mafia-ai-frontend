// src/components/game-setup.tsx - Updated with Creator Auto-Premium
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/lib/socket-context";
import toast from "react-hot-toast";

interface GameSetupProps {
  onGameStartAction: () => void;
}

interface PackageInfo {
  id: string;
  name: string;
  gamesRemaining: number;
  premiumModelsEnabled: boolean;
  features: string[];
}

export function GameSetup({ onGameStartAction }: GameSetupProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameMode, setGameMode] = useState<"single" | "multiplayer">("single");
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "mode" | "name" | "premium" | "action"
  >("mode");
  const [userPackages, setUserPackages] = useState<PackageInfo[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [hasFreePremium, setHasFreePremium] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const { createRoom, joinRoom, isConnected, connectionStatus, serverStats } =
    useSocket();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setIsLoadingPackages(true);
    try {
      // Check if user is a creator first
      const creatorCheck = await checkCreatorStatus();

      if (creatorCheck) {
        setIsCreator(true);
        setHasFreePremium(true);
        setPremiumEnabled(true);
        setIsLoadingPackages(false);
        toast.success("Creator access detected! Premium features enabled.", {
          icon: "👑",
          duration: 4000,
        });
        return;
      }

      // Check user packages if not creator
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/packages`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const packages = data.packages || [];
        setUserPackages(packages);

        const hasPremium = packages.some(
          (pkg: PackageInfo) =>
            pkg.premiumModelsEnabled && pkg.gamesRemaining > 0
        );
        setHasFreePremium(hasPremium);

        if (hasPremium) {
          setPremiumEnabled(true);
          toast.success("Premium AI models available!", {
            icon: "👑",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check user status:", error);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const checkCreatorStatus = async (): Promise<boolean> => {
    // Check if creator password is stored in localStorage or session
    const storedCreatorStatus = localStorage.getItem(
      "ai_mafia_creator_verified"
    );

    if (storedCreatorStatus === "true") {
      return true;
    }

    // Check URL params for creator access
    const urlParams = new URLSearchParams(window.location.search);
    const creatorParam = urlParams.get("creator");

    if (creatorParam === "true") {
      localStorage.setItem("ai_mafia_creator_verified", "true");
      return true;
    }

    return false;
  };

  const handleCreateRoom = async () => {
    if (!validateInput()) return;

    setIsCreating(true);

    try {
      const settings = {
        premiumModelsEnabled: premiumEnabled,
        gameMode,
        allowSpectators: false,
        maxPlayers: 10,
        isCreator: isCreator,
      };

      createRoom(playerName.trim(), settings);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!validateInput() || !roomCode.trim()) return;

    setIsJoining(true);

    try {
      joinRoom(roomCode.toUpperCase(), playerName.trim());
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room");
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
  ];

  const premiumFeatures = [
    "Claude Sonnet 4 personalities",
    "GPT-4o advanced reasoning",
    "Gemini 2.5 Pro strategies",
    "Enhanced behavioral patterns",
    "Improved deception abilities",
    "Advanced post-game analytics",
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">Connecting to Game Server</h2>
          <p className="text-gray-400 mb-6">
            {connectionStatus === "connecting" && "Establishing connection..."}
            {connectionStatus === "error" && "Connection failed. Retrying..."}
            {connectionStatus === "disconnected" &&
              "Disconnected. Attempting to reconnect..."}
          </p>
          <div className="loading-dots justify-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {connectionStatus === "error" && (
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
              <Image
                src="/detective-logo.png"
                alt="AI Mafia Detective"
                width={80}
                height={80}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Ready to Play?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join the ultimate social deduction experience with AI personalities
          </p>

          {/* Creator Badge */}
          {isCreator && (
            <div className="mt-6 flex justify-center">
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <Crown className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold">
                  Creator Mode Active
                </span>
                <Link
                  href="/admin"
                  className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded hover:bg-orange-500/30"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Server Status */}
          {serverStats && (
            <div className="mt-6 flex justify-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {gameModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setGameMode(mode.id as any);
                      setCurrentStep("name");
                    }}
                    className={`
                      game-card text-left p-8 transition-all duration-300
                      ${
                        gameMode === mode.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 hover:border-blue-400"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`p-3 rounded-xl ${
                          mode.recommended
                            ? "bg-orange-500/20 text-orange-400"
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
                        {isCreator && (
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs ml-2">
                            Creator Auto-Premium
                          </span>
                        )}
                      </div>
                    </div>
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
                      setCurrentStep(isCreator ? "action" : "premium");
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
                      setCurrentStep(isCreator ? "action" : "premium")
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

          {currentStep === "premium" && !isCreator && (
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
                  className={`glass-card p-6 transition-all ${
                    !premiumEnabled ? "ring-2 ring-blue-500" : "opacity-75"
                  }`}
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

                  <button
                    onClick={() => setPremiumEnabled(false)}
                    className={`w-full py-3 rounded-lg transition-all ${
                      !premiumEnabled
                        ? "bg-blue-500 text-white"
                        : "border border-blue-500 text-blue-400 hover:bg-blue-500/20"
                    }`}
                  >
                    Use Standard Models
                  </button>
                </div>

                {/* Premium Models */}
                <div
                  className={`glass-card p-6 transition-all ${
                    premiumEnabled ? "ring-2 ring-orange-500" : ""
                  } ${!hasFreePremium ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-orange-400" />
                    <div>
                      <h3 className="text-xl font-bold">Premium AI Models</h3>
                      <span className="text-orange-400 text-sm">
                        {hasFreePremium ? "Available" : "Requires Package"}
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

                  <button
                    onClick={() => setPremiumEnabled(true)}
                    disabled={!hasFreePremium}
                    className={`w-full py-3 rounded-lg transition-all ${
                      premiumEnabled
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : hasFreePremium
                        ? "border border-orange-500 text-orange-400 hover:bg-orange-500/20"
                        : "border border-gray-600 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {hasFreePremium
                      ? "Use Premium Models"
                      : "Get Premium Access"}
                  </button>

                  {!hasFreePremium && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Purchase a package to unlock premium AI models
                    </p>
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
                  Create a new room or join an existing one
                </p>
              </div>

              {/* Summary */}
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
                      {premiumEnabled || isCreator ? "Premium" : "Standard"}
                      {isCreator && (
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    disabled={!isConnected || isCreating}
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
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ROOM CODE"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors mb-4"
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
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(isCreator ? "name" : "premium")}
                  className="btn-ghost flex-1"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            🕵️‍♂️ AI players are disguised with human names • 🤖 Can you detect
            them all?
          </p>
          {isCreator && (
            <p className="mt-2 text-orange-400">
              <Crown className="w-4 h-4 inline mr-1" />
              Creator Mode: Premium features automatically enabled
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

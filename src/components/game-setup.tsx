// src/components/game-setup.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Users, Bot, Crown, Settings, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { useSocket } from "@/lib/socket-context";
import toast from "react-hot-toast";

interface GameSetupProps {
  onGameStartAction: () => void;
}

export function GameSetup({ onGameStartAction }: GameSetupProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameMode, setGameMode] = useState<"single" | "multiplayer">("single");
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const { createRoom, joinRoom, isConnected } = useSocket();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (playerName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setIsCreating(true);

    try {
      createRoom(playerName.trim(), {
        premiumModelsEnabled: premiumEnabled,
        gameMode,
      });
      onGameStartAction();
    } catch (error) {
      toast.error("Failed to create room");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      toast.error("Please enter room code");
      return;
    }

    if (roomCode.trim().length !== 6) {
      toast.error("Room code must be 6 digits");
      return;
    }

    setIsJoining(true);

    try {
      joinRoom(roomCode.toUpperCase(), playerName.trim());
      onGameStartAction();
    } catch (error) {
      toast.error("Failed to join room");
      setIsJoining(false);
    }
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
      ],
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
      ],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl w-full">
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
        </motion.div>

        {/* Game Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Choose Your Game Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameModes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameMode(mode.id as any)}
                className={`
                  game-card text-left p-6 transition-all
                  ${
                    gameMode === mode.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-blue-400"
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      gameMode === mode.id
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {mode.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{mode.name}</h3>
                    {mode.recommended && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded mt-1 inline-block">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 mb-4">{mode.description}</p>

                <div className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Setup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          {/* Player Name Input */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-3">
              Your Detective Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name (2-20 characters)"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={20}
              disabled={isCreating || isJoining}
            />
            <div className="text-sm text-gray-500 mt-2">
              This name will be visible to other players
            </div>
          </div>

          {/* Premium Models Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold">Premium AI Models</span>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    Beta
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Enable Claude Sonnet 4, GPT-4o, and Gemini 2.5 Pro for
                  enhanced AI personalities
                </p>
              </div>
              <button
                onClick={() => setPremiumEnabled(!premiumEnabled)}
                className={`
                  relative w-14 h-8 rounded-full transition-colors
                  ${premiumEnabled ? "bg-blue-500" : "bg-gray-600"}
                `}
              >
                <motion.div
                  animate={{ x: premiumEnabled ? 24 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full"
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Room */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-green-400" />
                Create New Game
              </h3>
              <p className="text-gray-400 text-sm">
                Start a new room and invite friends with a room code
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || !isConnected || isCreating}
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
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Join Existing Game
              </h3>
              <p className="text-gray-400 text-sm">
                Enter a 6-digit room code to join a friend's game
              </p>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={6}
                disabled={isCreating || isJoining}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinRoom}
                disabled={
                  !playerName.trim() ||
                  !roomCode.trim() ||
                  !isConnected ||
                  isJoining
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
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Not connected to game server
              </div>
            </div>
          )}
        </motion.div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>
            🕵️‍♂️ AI players are disguised with human names • 🤖 Can you detect
            them all?
          </p>
        </motion.div>
      </div>
    </div>
  );
}

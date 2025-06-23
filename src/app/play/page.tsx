// src/app/play/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageCircle,
  Vote as VoteIcon, // Fixed: Renamed from Vote to avoid conflict with Vote type
  Crown,
  Shield,
  Skull,
  Clock,
  Send,
  Settings,
  ExternalLink,
  Copy,
  Share2,
  Home,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BarChart3,
  Package,
  Unlock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/lib/socket-context";
import { GameState, Player, Message, Vote } from "@/types/game";
import { PlayerCard } from "@/components/player-card";
import { ChatArea } from "@/components/chat-area";
import { GamePhaseDisplay } from "@/components/game-phase-display";
import { VotingPanel } from "@/components/voting-panel";
import { NightActionPanel } from "@/components/night-action-panel";
import { GameSetup } from "@/components/game-setup";
import { GameStats } from "@/components/game-stats";
import { PremiumAnalytics } from "@/components/premium-analytics";
import { CreatorAccess } from "@/components/creator-access";
import { PackageManagement } from "@/components/package-management"; // Fixed: Correct spelling
import { useGameStore } from "@/stores/game-store";
import toast from "react-hot-toast";

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isInGame, setIsInGame] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showPremiumAnalytics, setShowPremiumAnalytics] = useState(false);
  const [showCreatorAccess, setShowCreatorAccess] = useState(false);
  const [showPackageManagement, setShowPackageManagement] = useState(false);

  // Premium & Creator state
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorFeatures, setCreatorFeatures] = useState<string[]>([]);
  const [userPackages, setUserPackages] = useState<any[]>([]);

  const { socket, isConnected, connectionStatus } = useSocket();
  const gameStore = useGameStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room_joined", (data) => {
      setIsInGame(true);
      setRoomCode(data.roomCode);
      setCurrentPlayer({ ...data.player });
      toast.success(`Welcome to room ${data.roomCode}!`);
    });

    socket.on("room_created", (data) => {
      setIsInGame(true);
      setRoomCode(data.roomCode);
      setCurrentPlayer({ ...data.player });
      toast.success(
        `Room ${data.roomCode} created! Share this code with friends.`
      );
    });

    socket.on("game_state_update", (state: GameState) => {
      setGameState(state);
      gameStore.setGameState(state);
    });

    socket.on("message_received", (data) => {
      setMessages((prev) => [...prev, data.message]);

      if (soundEnabled && data.message.playerId !== currentPlayer?.id) {
        playSound("message");
      }
    });

    socket.on("vote_cast", (data) => {
      setVotes((prev) => [...prev, data.vote]);

      if (soundEnabled) {
        playSound("vote");
      }
    });

    socket.on("phase_changed", (data) => {
      if (soundEnabled) {
        playSound("phase_change");
      }
    });

    socket.on("player_eliminated", (data) => {
      if (soundEnabled) {
        playSound("elimination");
      }
    });

    socket.on("game_ended", (data) => {
      if (soundEnabled) {
        playSound(data.winner === "citizens" ? "victory" : "defeat");
      }

      // Show premium analytics if user is premium, otherwise basic stats
      if (isPremiumUser || isCreator) {
        setShowPremiumAnalytics(true);
      } else {
        setShowStats(true);
      }
    });

    socket.on("error", (error) => {
      toast.error(error.message);
    });

    return () => {
      socket.off("room_joined");
      socket.off("room_created");
      socket.off("game_state_update");
      socket.off("message_received");
      socket.off("vote_cast");
      socket.off("phase_changed");
      socket.off("player_eliminated");
      socket.off("game_ended");
      socket.off("error");
    };
  }, [
    socket,
    currentPlayer,
    soundEnabled,
    gameStore,
    isPremiumUser,
    isCreator,
  ]);

  // Check user premium status on load
  useEffect(() => {
    checkUserStatus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameState?.phaseEndTime) return;

    const updateTimer = () => {
      const endTime = new Date(gameState.phaseEndTime).getTime();
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameState?.phaseEndTime]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkUserStatus = async () => {
    try {
      // Check if user has premium packages
      const packagesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/packages`,
        {
          credentials: "include",
        }
      );

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setUserPackages(packagesData.packages || []);
        setIsPremiumUser(packagesData.packages?.length > 0);
      }
    } catch (error) {
      console.error("Failed to check user status:", error);
    }
  };

  const playSound = (type: string) => {
    if (!soundEnabled) return;

    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently handle audio play failures (browser autoplay policies)
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
  };

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my AI Mafia game!",
        text: `Join me in playing AI Mafia! Room code: ${roomCode}`,
        url: window.location.href,
      });
    } else {
      copyRoomCode();
    }
  };

  const leaveGame = () => {
    if (socket) {
      socket.emit("leave_room");
      setIsInGame(false);
      setGameState(null);
      setCurrentPlayer(null);
      setMessages([]);
      setVotes([]);
      setRoomCode("");
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCreatorVerified = (features: string[]) => {
    setIsCreator(true);
    setCreatorFeatures(features);
    setIsPremiumUser(true); // Creators get premium access
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
        </div>
      </div>
    );
  }

  if (!isInGame) {
    return <GameSetup onGameStartAction={() => setIsInGame(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/detective-logo.png"
                alt="AI Mafia"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gradient">AI Mafia</span>
            </Link>

            {roomCode && (
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <span className="text-sm font-medium">Room:</span>
                <span className="text-lg font-bold text-blue-400">
                  {roomCode}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  title="Copy room code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={shareRoom}
                  className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  title="Share room"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Premium/Creator Badge */}
            {(isPremiumUser || isCreator) && (
              <div className="glass-card px-3 py-1 flex items-center gap-2">
                <Crown className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">
                  {isCreator ? "Creator" : "Premium"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Game Phase & Timer */}
            {gameState && (
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <GamePhaseDisplay phase={gameState.phase} />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="font-mono text-orange-400">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-700 text-gray-400"
                }`}
                title={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  micEnabled
                    ? "bg-red-500/20 text-red-400"
                    : "bg-gray-700 text-gray-400"
                }`}
                title={micEnabled ? "Disable microphone" : "Enable microphone"}
              >
                {micEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </button>

              {/* Analytics Button */}
              <button
                onClick={() =>
                  isPremiumUser || isCreator
                    ? setShowPremiumAnalytics(!showPremiumAnalytics)
                    : setShowStats(!showStats)
                }
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title={
                  isPremiumUser || isCreator
                    ? "Premium Analytics"
                    : "Game Statistics"
                }
              >
                <BarChart3 className="w-5 h-5" />
              </button>

              {/* Package Management */}
              <button
                onClick={() => setShowPackageManagement(!showPackageManagement)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Manage packages"
              >
                <Package className="w-5 h-5" />
              </button>

              {/* Creator Access */}
              <button
                onClick={() => setShowCreatorAccess(!showCreatorAccess)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Creator access"
              >
                <Unlock className="w-5 h-5" />
              </button>

              <button
                onClick={leaveGame}
                className="btn-danger px-4 py-2 text-sm flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Leave Game
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-120px)]">
        {/* Players Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Players ({gameState?.players.length || 0}/10)
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameState?.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.id === currentPlayer?.id}
                  currentSpeaker={gameState.currentSpeaker === player.id}
                  showRole={gameState.phase === "game_over" || !player.isAlive}
                />
              ))}
            </div>
          </div>

          {/* Current Player Info */}
          {currentPlayer && (
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold mb-3">Your Role</h3>
              <div className="text-center">
                {currentPlayer.role === "mafia_leader" && (
                  <div className="badge-mafia p-3 text-base">
                    <Crown className="w-5 h-5 inline mr-2" />
                    Mafia Leader
                  </div>
                )}
                {currentPlayer.role === "mafia_member" && (
                  <div className="badge-mafia p-3 text-base">
                    <Skull className="w-5 h-5 inline mr-2" />
                    Mafia Member
                  </div>
                )}
                {currentPlayer.role === "healer" && (
                  <div className="badge-healer p-3 text-base">
                    <Shield className="w-5 h-5 inline mr-2" />
                    Healer
                  </div>
                )}
                {currentPlayer.role === "citizen" && (
                  <div className="badge-citizen p-3 text-base">
                    <Users className="w-5 h-5 inline mr-2" />
                    Citizen
                  </div>
                )}
              </div>

              {/* Role descriptions */}
              {currentPlayer.role === "mafia_leader" && (
                <p className="text-sm text-red-300 mt-2 text-center">
                  You choose who to eliminate each night. Work with your mafia
                  partner!
                </p>
              )}
              {currentPlayer.role === "mafia_member" && (
                <p className="text-sm text-red-300 mt-2 text-center">
                  Support your Mafia Leader and help stay hidden!
                </p>
              )}
              {currentPlayer.role === "healer" && (
                <p className="text-sm text-green-300 mt-2 text-center">
                  Protect someone each night from elimination!
                </p>
              )}
              {currentPlayer.role === "citizen" && (
                <p className="text-sm text-blue-300 mt-2 text-center">
                  Find and eliminate the mafia members!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Chat & Game Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chat Area */}
          <div className="glass-card h-96 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Game Chat
                {gameState?.phase === "discussion" &&
                  gameState.currentSpeaker && (
                    <span className="text-sm text-orange-400">
                      (
                      {
                        gameState.players.find(
                          (p) => p.id === gameState.currentSpeaker
                        )?.name
                      }
                      's turn)
                    </span>
                  )}
              </h3>
            </div>

            <ChatArea
              messages={messages}
              players={gameState?.players || []}
              gamePhase={gameState?.phase}
              canSendMessage={
                gameState?.phase === "discussion" &&
                gameState.currentSpeaker === currentPlayer?.id &&
                Boolean(currentPlayer?.isAlive)
              }
            />
            <div ref={chatEndRef} />
          </div>

          {/* Game Actions */}
          <AnimatePresence mode="wait">
            {gameState?.phase === "voting" && currentPlayer?.isAlive && (
              <motion.div
                key="voting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-4"
              >
                <VotingPanel
                  players={gameState.players.filter(
                    (p) => p.isAlive && p.id !== currentPlayer?.id
                  )}
                  currentVoter={gameState.currentSpeaker === currentPlayer?.id}
                  onVoteAction={(targetId: string, reasoning: string) => {
                    if (socket) {
                      socket.emit("game_action", {
                        type: "CAST_VOTE",
                        targetId,
                        reasoning,
                      });
                    }
                  }}
                />
              </motion.div>
            )}

            {gameState?.phase === "night" &&
              currentPlayer?.isAlive &&
              (currentPlayer.role === "mafia_leader" ||
                currentPlayer.role === "healer") && (
                <motion.div
                  key="night-action"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-4"
                >
                  <NightActionPanel
                    role={currentPlayer.role}
                    players={gameState.players.filter(
                      (p) =>
                        p.isAlive &&
                        (currentPlayer.role === "healer" ||
                          (p.role !== "mafia_leader" &&
                            p.role !== "mafia_member"))
                    )}
                    onActionPerformed={(action: string, targetId: string) => {
                      if (socket) {
                        socket.emit("game_action", {
                          type: "NIGHT_ACTION",
                          action,
                          targetId,
                        });
                      }
                    }}
                  />
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Game Info & Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Round Info */}
          {gameState && (
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold mb-3">Game Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Round:</span>
                  <span className="font-bold text-blue-400">
                    {gameState.currentRound}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Alive:</span>
                  <span className="font-bold text-green-400">
                    {gameState.players.filter((p) => p.isAlive).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Eliminated:</span>
                  <span className="font-bold text-red-400">
                    {gameState.eliminatedPlayers.length}
                  </span>
                </div>
                {gameState.phase !== "waiting" && (
                  <div className="flex justify-between">
                    <span>Phase:</span>
                    <span className="font-bold text-orange-400 capitalize">
                      {gameState.phase.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voting Results */}
          {votes.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <VoteIcon className="w-5 h-5 text-orange-400" />
                Current Votes
              </h3>
              <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                {votes.map((vote, index) => {
                  const voter = gameState?.players.find(
                    (p) => p.id === vote.voterId
                  );
                  const target = gameState?.players.find(
                    (p) => p.id === vote.targetId
                  );
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span>{voter?.name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-red-400">{target?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Premium Features Teaser */}
          {!isPremiumUser && !isCreator && (
            <div className="glass-card p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-400" />
                Premium Features
              </h3>
              <div className="text-sm text-gray-400 space-y-2 mb-4">
                <p>🔍 Advanced AI detection analysis</p>
                <p>📊 Detailed performance metrics</p>
                <p>🎯 Personalized improvement tips</p>
                <p>💾 Game data export</p>
              </div>
              <button
                onClick={() => setShowPackageManagement(true)}
                className="btn-detective w-full text-sm"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Game Help */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold mb-3">How to Play</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p>
                🕵️‍♂️ <strong>Citizens:</strong> Find and eliminate the mafia
              </p>
              <p>
                🕴️ <strong>Mafia:</strong> Eliminate citizens without being
                caught
              </p>
              <p>
                🛡️ <strong>Healer:</strong> Protect players from elimination
              </p>
              <p>
                🤖 <strong>AI Players:</strong> Some players are AI - can you
                tell?
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showStats && gameState && (
          <GameStats
            gameState={gameState}
            currentPlayer={currentPlayer}
            onCloseAction={() => setShowStats(false)}
          />
        )}

        {showPremiumAnalytics && gameState && (
          <PremiumAnalytics
            gameState={gameState}
            currentPlayer={currentPlayer}
            onClose={() => setShowPremiumAnalytics(false)}
            isPremiumUser={isPremiumUser || isCreator}
          />
        )}

        {showCreatorAccess && (
          <CreatorAccess
            onClose={() => setShowCreatorAccess(false)}
            onCreatorVerified={handleCreatorVerified}
          />
        )}

        {showPackageManagement && (
          <PackageManagement
            onClose={() => setShowPackageManagement(false)}
            currentUserId={currentPlayer?.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

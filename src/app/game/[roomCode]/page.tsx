// src/app/game/[roomCode]/page.tsx - FIXED: Complete Observer Persistence and Rejoin Logic
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Eye,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Monitor,
  User,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Clock,
} from "lucide-react";
import { useSocket } from "@/lib/socket-context";
import { useGameStore } from "@/stores/game-store";
import { Message } from "@/types/game";
import { ChatArea } from "@/components/chat-area";
import { VotingPanel } from "@/components/voting-panel";
import { NightActionPanel } from "@/components/night-action-panel";
import { GamePhaseDisplay } from "@/components/game-phase-display";
import { ObserverDashboard } from "@/components/observer-dashboard";
import { PlayerCard } from "@/components/player-card";

// Creator Tools Component
const CreatorObserverPanel = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createAIOnlyGame = async () => {
    setIsCreating(true);

    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        "https://mafia-ai-production.up.railway.app";
      const response = await fetch(`${serverUrl}/api/creator/ai-only-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password:
            process.env.NEXT_PUBLIC_CREATOR_PASSWORD ||
            "detective_ai_mafia_2025",
          gameConfig: {
            maxPlayers: 10,
            aiCount: 10,
            humanCount: 0,
            premiumModelsEnabled: true,
            allowSpectators: true,
            nightPhaseDuration: 60,
            discussionPhaseDuration: 180,
            votingPhaseDuration: 90,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("🤖 AI-only game created:", data);
        // Navigate to the game as observer
        const observerUrl = `/game/${data.roomInfo.code}?observer=true`;
        window.location.href = observerUrl;
      } else {
        console.error("Failed to create AI-only game:", data.message);
        alert("Failed to create AI-only game: " + data.message);
      }
    } catch (error) {
      console.error("Error creating AI-only game:", error);
      alert("Error creating AI-only game. Check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="glass-card p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-purple-400" />
        Creator Tools
      </h3>
      <button
        onClick={createAIOnlyGame}
        disabled={isCreating}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Creating AI Game...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Create AI-Only Game & Spectate
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 mt-2">
        Creates a game with 10 AI players using premium models
      </p>
    </div>
  );
};

// FIXED: Enhanced Connection Status Component
const ConnectionStatus = ({
  isConnected,
  error,
  isObserver,
  hasStoredData,
}: {
  isConnected: boolean;
  error?: string | null;
  isObserver: boolean;
  hasStoredData: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <span className={isConnected ? "text-green-400" : "text-red-400"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {isObserver && (
        <>
          <span className="text-gray-500">•</span>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400">
              {hasStoredData ? "Data Cached" : "No Cache"}
            </span>
          </div>
        </>
      )}

      {error && (
        <>
          <span className="text-gray-500">•</span>
          <span className="text-red-400 truncate max-w-32" title={error}>
            {error}
          </span>
        </>
      )}
    </div>
  );
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const {
    socket,
    isConnected,
    joinRoom,
    sendMessage,
    castVote,
    performNightAction,
  } = useSocket();

  const {
    gameState,
    currentPlayer,
    isObserver,
    observerData,
    showObserverPanel,
    soundEnabled,
    setGameState,
    setCurrentPlayer,
    setObserver,
    setObserverData,
    setShowObserverPanel,
    setSoundEnabled,
    setRoomCode,
    addObserverUpdate,
    mergeObserverData,
    loadObserverDataFromStorage,
    saveObserverDataToStorage,
  } = useGameStore();

  const [autoScroll, setAutoScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [rejoinAttempts, setRejoinAttempts] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // FIXED: Enhanced room joining with comprehensive observer mode detection and persistence
  useEffect(() => {
    if (!isConnected || !roomCode) return;

    const playerName =
      localStorage.getItem("playerName") || `Player_${Date.now()}`;
    const playerId = localStorage.getItem("playerId") ?? undefined;

    // FIXED: Comprehensive observer mode detection from multiple sources
    const urlParams = new URLSearchParams(window.location.search);
    const observerMode =
      urlParams.get("observer") === "true" ||
      urlParams.get("spectate") === "true" ||
      urlParams.get("watch") === "true" ||
      localStorage.getItem("observerMode") === "true" ||
      localStorage.getItem(`observer_${roomCode}`) === "true";

    console.log("🔍 Enhanced join parameters:", {
      roomCode,
      playerName,
      playerId,
      observerMode,
      urlParams: Object.fromEntries(urlParams.entries()),
      localStorage: {
        observerMode: localStorage.getItem("observerMode"),
        roomSpecificObserver: localStorage.getItem(`observer_${roomCode}`),
      },
    });

    // Set observer mode immediately for UI updates
    setObserver(observerMode);
    setRoomCode(roomCode);

    // FIXED: Pre-load observer data from storage if available
    if (observerMode) {
      const storedData = loadObserverDataFromStorage(roomCode);
      if (storedData) {
        console.log(`📂 Pre-loaded observer data for room ${roomCode}:`, {
          updates: storedData.observerUpdates?.length || 0,
          lastUpdated: storedData.lastUpdated,
        });
        setObserverData(storedData);
      }
    }

    joinRoom({
      roomCode,
      playerName,
      playerId,
      observerMode,
    })
      .then((response) => {
        setIsLoading(false);
        setConnectionError(null);
        setRejoinAttempts(0);
        setLastSyncTime(new Date());

        console.log("✅ Enhanced join response:", response);

        if (response.success) {
          if (observerMode) {
            console.log(
              "✅ Successfully joined as observer with enhanced persistence"
            );
            localStorage.setItem("observerMode", "true");
            localStorage.setItem(`observer_${roomCode}`, "true");

            // FIXED: Handle complete observer data from server
            if (response.observerData) {
              console.log(
                "🔄 Merging server observer data with local cache..."
              );
              mergeObserverData(response.observerData);
              setLastSyncTime(new Date());
            }
          } else {
            setCurrentPlayer(response.player);
            console.log("✅ Successfully joined as player");
            localStorage.setItem("observerMode", "false");
            localStorage.removeItem(`observer_${roomCode}`);
          }

          // Set game state if provided
          if (response.gameState) {
            setGameState(response.gameState);
          }
        } else {
          console.error("❌ Join failed:", response.message);
          setConnectionError(response.message || "Failed to join room");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("❌ Join error:", error);
        setConnectionError(error.message || "Connection failed");

        // FIXED: Increment rejoin attempts for potential retry logic
        setRejoinAttempts((prev) => prev + 1);
      });
  }, [isConnected, roomCode, rejoinAttempts]);

  // FIXED: Enhanced observer event handler with complete data merging
  useEffect(() => {
    if (!socket) return;

    const handleObserverJoined = (data: any) => {
      console.log("👁️ Observer joined successfully with enhanced data:", {
        observerData: !!data.observerData,
        gameState: !!data.gameState,
        players: data.players?.length || 0,
      });

      setObserver(true);
      setLastSyncTime(new Date());

      if (data.gameState) {
        setGameState(data.gameState);
      }

      // FIXED: Comprehensive observer data handling
      if (data.observerData) {
        console.log("🔄 Processing complete observer data from server...");
        mergeObserverData(data.observerData);

        // Save to storage immediately
        setTimeout(() => {
          saveObserverDataToStorage();
        }, 100);
      }

      // Ensure observer mode is persisted
      localStorage.setItem("observerMode", "true");
      localStorage.setItem(`observer_${roomCode}`, "true");
    };

    const handleRoomJoined = (data: any) => {
      console.log("🏠 Room joined successfully:", data);

      if (data.gameState) {
        setGameState(data.gameState);
      }

      // Ensure player mode is set
      localStorage.setItem("observerMode", "false");
      localStorage.removeItem(`observer_${roomCode}`);
      setLastSyncTime(new Date());
    };

    // Register both handlers
    socket.on("observer_joined", handleObserverJoined);
    socket.on("room_joined", handleRoomJoined);

    return () => {
      socket.off("observer_joined", handleObserverJoined);
      socket.off("room_joined", handleRoomJoined);
    };
  }, [socket, setGameState, setObserverData, roomCode]);

  // FIXED: Enhanced socket event handlers with observer persistence
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (newGameState: any) => {
      console.log("📊 Game state update received:", {
        phase: newGameState.phase,
        round: newGameState.currentRound,
        players: newGameState.players?.length || 0,
        observerData: !!newGameState.observerData,
      });

      setGameState(newGameState);
      setLastSyncTime(new Date());

      // Extract and merge observer data if present
      if (newGameState.observerData && isObserver) {
        mergeObserverData(newGameState.observerData);
      }
    };

    const handleObserverUpdate = (data: any) => {
      if (isObserver) {
        console.log("👁️ Observer update received:", {
          type: data.update?.type,
          playerName: data.update?.playerName,
          content: data.update?.content?.substring(0, 50) + "...",
        });

        if (data.update) {
          addObserverUpdate(data.update);
          setLastSyncTime(new Date());
        }

        // Play notification sound
        if (soundEnabled) {
          playNotificationSound();
        }
      }
    };

    const handlePhaseChanged = (data: any) => {
      console.log("🔄 Phase changed:", data);
      setLastSyncTime(new Date());

      // Update game state with new phase
      if (gameState) {
        setGameState({
          ...gameState,
          phase: data.newPhase,
          currentRound: data.round,
          phaseStartTime: new Date().toISOString(),
          phaseEndTime: new Date(
            Date.now() + (data.duration || 60000)
          ).toISOString(),
        });
      }

      // Play phase transition sound
      if (soundEnabled) {
        playPhaseSound(data.newPhase);
      }
    };

    // FIXED: Handle phase separators for better chat visualization
    const handlePhaseSeparator = (data: any) => {
      console.log("📏 Phase separator received:", data);

      // Add phase separator as a special message type
      if (gameState) {
        // Create a properly typed Message object
        const phaseSeparatorMessage: Message = {
          id: `phase-sep-${Date.now()}`,
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
          messageType: "phase_transition" as const,
          phase: data.phase,
          round: data.round,
          playerId: "system",
        };

        const updatedGameState = {
          ...gameState,
          messages: [...(gameState.messages || []), phaseSeparatorMessage],
        };
        setGameState(updatedGameState);
      }
    };

    const handlePlayerEliminated = (data: any) => {
      console.log("💀 Player eliminated:", data);
      setLastSyncTime(new Date());

      // Play elimination sound
      if (soundEnabled) {
        playEliminationSound();
      }
    };

    const handleGameEnded = (data: any) => {
      console.log("🏁 Game ended:", data);
      setLastSyncTime(new Date());

      // Play game end sound
      if (soundEnabled) {
        playGameEndSound(data.winner);
      }
    };

    const handleRoomTerminated = (data: any) => {
      console.log("🔥 Room terminated:", data);
      setConnectionError(`Room was terminated: ${data.message}`);

      // Clear observer storage for this room
      if (isObserver) {
        localStorage.removeItem(`observer_data_${roomCode}`);
        localStorage.removeItem(`observer_${roomCode}`);
      }

      setTimeout(() => {
        router.push("/");
      }, 3000);
    };

    const handleError = (error: any) => {
      console.error("🔥 Socket error:", error);
      setConnectionError(error.message || "Socket error occurred");
      setLastSyncTime(new Date());
    };

    // Register event listeners
    socket.on("game_state_update", handleGameStateUpdate);
    socket.on("observer_update", handleObserverUpdate);
    socket.on("phase_changed", handlePhaseChanged);
    socket.on("phase_separator", handlePhaseSeparator);
    socket.on("player_eliminated", handlePlayerEliminated);
    socket.on("game_ended", handleGameEnded);
    socket.on("room_terminated", handleRoomTerminated);
    socket.on("error", handleError);

    return () => {
      socket.off("game_state_update", handleGameStateUpdate);
      socket.off("observer_update", handleObserverUpdate);
      socket.off("phase_changed", handlePhaseChanged);
      socket.off("phase_separator", handlePhaseSeparator);
      socket.off("player_eliminated", handlePlayerEliminated);
      socket.off("game_ended", handleGameEnded);
      socket.off("room_terminated", handleRoomTerminated);
      socket.off("error", handleError);
    };
  }, [
    socket,
    isObserver,
    soundEnabled,
    gameState,
    setGameState,
    roomCode,
    router,
  ]);

  // FIXED: Auto-save observer data periodically
  useEffect(() => {
    if (!isObserver || !observerData || !roomCode) return;

    const saveInterval = setInterval(() => {
      saveObserverDataToStorage();
      console.log("💾 Auto-saved observer data");
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [isObserver, observerData, roomCode]);

  // Sound effects
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch (error) {
      // Ignore sound errors
    }
  };

  const playPhaseSound = (phase: string) => {
    try {
      const soundMap: Record<string, string> = {
        night: "/sounds/night.mp3",
        discussion: "/sounds/discussion.mp3",
        voting: "/sounds/voting.mp3",
        revelation: "/sounds/revelation.mp3",
      };

      const soundFile = soundMap[phase];
      if (soundFile) {
        const audio = new Audio(soundFile);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (error) {
      // Ignore sound errors
    }
  };

  const playEliminationSound = () => {
    try {
      const audio = new Audio("/sounds/elimination.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (error) {
      // Ignore sound errors
    }
  };

  const playGameEndSound = (winner: string) => {
    try {
      const audio = new Audio(
        winner === "citizens" ? "/sounds/victory.mp3" : "/sounds/defeat.mp3"
      );
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch (error) {
      // Ignore sound errors
    }
  };

  // Game actions
  const handleSendMessage = (content: string) => {
    if (currentPlayer && !isObserver) {
      sendMessage(content);
    }
  };

  const handleCastVote = (targetId: string, reasoning: string) => {
    if (currentPlayer && !isObserver) {
      castVote(targetId, reasoning);
    }
  };

  const handleNightAction = (action: string, targetId: string) => {
    if (currentPlayer && !isObserver) {
      performNightAction(action as "kill" | "heal", targetId);
    }
  };

  const handleLeaveRoom = () => {
    // Clear observer mode when leaving
    localStorage.removeItem("observerMode");
    localStorage.removeItem(`observer_${roomCode}`);
    router.push("/");
  };

  // FIXED: Manual reconnection function
  const handleReconnect = () => {
    setIsLoading(true);
    setConnectionError(null);
    setRejoinAttempts((prev) => prev + 1);
    window.location.reload();
  };

  // Helper functions
  const getAlivePlayers = () => {
    if (!gameState?.players) return [];
    return gameState.players.filter((p: any) => p.isAlive);
  };

  const getAllPlayers = () => {
    if (!gameState?.players) return [];
    return gameState.players;
  };

  const canSendMessage = () => {
    if (isObserver || !currentPlayer) return false;
    if (gameState?.phase === "discussion") {
      return gameState?.currentSpeaker === currentPlayer.id;
    }
    return false;
  };

  const isCurrentVoter = () => {
    if (isObserver || !currentPlayer) return false;
    return (
      gameState?.phase === "voting" &&
      gameState?.currentSpeaker === currentPlayer.id
    );
  };

  const shouldShowNightPanel = () => {
    if (isObserver || !currentPlayer) return false;
    return (
      gameState?.phase === "night" &&
      (currentPlayer.role === "mafia_leader" || currentPlayer.role === "healer")
    );
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to game...</p>
          <p className="text-sm text-gray-500 mt-2">Room: {roomCode}</p>
          {rejoinAttempts > 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              Attempt {rejoinAttempts}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">Connection Error</div>
          <p className="text-gray-400 mb-6">{connectionError}</p>
          <div className="space-y-3">
            <button
              onClick={handleReconnect}
              className="btn-detective px-6 py-2 w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reconnect
            </button>
            <button
              onClick={handleLeaveRoom}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors w-full"
            >
              Return to Lobby
            </button>
          </div>
          {rejoinAttempts > 2 && (
            <div className="mt-4 text-xs text-gray-500">
              <p>Having trouble connecting?</p>
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Show debug info
              </button>
              {showDebugInfo && (
                <div className="mt-2 text-left bg-gray-800 p-2 rounded text-xs">
                  <div>Room: {roomCode}</div>
                  <div>Observer: {isObserver ? "Yes" : "No"}</div>
                  <div>Attempts: {rejoinAttempts}</div>
                  <div>Cached Data: {observerData ? "Yes" : "No"}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* FIXED: Enhanced Header with Connection Status */}
      <div className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLeaveRoom}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Leave Room"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-white">
                  Room {roomCode}
                </div>
                {isObserver ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Observer</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Player</span>
                  </div>
                )}
                {lastSyncTime && (
                  <div
                    className="text-xs text-gray-500"
                    title={`Last sync: ${lastSyncTime.toLocaleTimeString()}`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    {lastSyncTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Enhanced Phase Display */}
              {gameState?.phase && (
                <GamePhaseDisplay
                  phase={gameState.phase}
                  round={gameState.currentRound}
                  currentSpeaker={
                    gameState.currentSpeaker
                      ? getAllPlayers().find(
                          (p) => p.id === gameState.currentSpeaker
                        )?.name
                      : undefined
                  }
                  totalPlayers={getAllPlayers().length}
                  alivePlayers={getAlivePlayers().length}
                />
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                {isObserver && (
                  <button
                    onClick={() => setShowObserverPanel(!showObserverPanel)}
                    className={`p-2 rounded-lg transition-colors ${
                      showObserverPanel
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-gray-800 text-gray-400 hover:text-gray-300"
                    }`}
                    title="Toggle Observer Panel"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled
                      ? "bg-gray-800 text-gray-400 hover:text-gray-300"
                      : "bg-red-500/20 text-red-400"
                  }`}
                  title={soundEnabled ? "Disable Sound" : "Enable Sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                <div className="flex items-center gap-2 text-sm">
                  <ConnectionStatus
                    isConnected={isConnected}
                    error={connectionError}
                    isObserver={isObserver}
                    hasStoredData={!!observerData?.observerUpdates?.length}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="container mx-auto px-4 py-6">
        <div
          className={`grid gap-6 ${
            isObserver && showObserverPanel ? "grid-cols-3" : "grid-cols-4"
          }`}
        >
          {/* Players Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({getAlivePlayers().length}/{getAllPlayers().length})
            </h3>
            <div className="space-y-2">
              {getAllPlayers().map((player: any) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={
                    !isObserver && currentPlayer?.id === player.id
                  }
                  showRole={isObserver || gameState?.phase === "game_over"}
                />
              ))}
            </div>
          </div>

          {/* Chat/Actions Panel */}
          <div
            className={`${
              isObserver && showObserverPanel ? "col-span-1" : "col-span-2"
            } space-y-4`}
          >
            {/* Game Phase Content */}
            <AnimatePresence mode="wait">
              {shouldShowNightPanel() && (
                <motion.div
                  key="night-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <NightActionPanel
                    role={currentPlayer?.role as "mafia_leader" | "healer"}
                    players={getAlivePlayers().filter((p: any) =>
                      currentPlayer?.role === "mafia_leader"
                        ? !p.role?.includes("mafia")
                        : true
                    )}
                    onActionPerformed={handleNightAction}
                  />
                </motion.div>
              )}

              {isCurrentVoter() && (
                <motion.div
                  key="voting-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <VotingPanel
                    players={getAlivePlayers().filter(
                      (p: any) => p.id !== currentPlayer?.id
                    )}
                    currentVoter={true}
                    onVoteAction={handleCastVote}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Chat Area */}
            <div className="glass-card h-96">
              <ChatArea
                messages={gameState?.messages || []}
                players={getAllPlayers()}
                gamePhase={gameState?.phase}
                canSendMessage={canSendMessage()}
                onSendMessage={handleSendMessage}
                observerMode={isObserver}
                observerUpdates={observerData?.observerUpdates || []}
              />
            </div>
          </div>

          {/* Observer Dashboard */}
          {isObserver && showObserverPanel && (
            <motion.div
              key="observer-dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="col-span-1"
            >
              <ObserverDashboard
                gameState={gameState}
                players={getAllPlayers()}
                observerUpdates={observerData?.observerUpdates || []}
                gameAnalytics={observerData?.gameAnalytics}
              />
            </motion.div>
          )}

          {/* Game Info Panel */}
          {(!isObserver || !showObserverPanel) && (
            <div className="space-y-4">
              {/* Creator Tools - Only show if creator password is available */}
              {process.env.NEXT_PUBLIC_CREATOR_PASSWORD && (
                <CreatorObserverPanel />
              )}

              <div className="glass-card p-4">
                <h3 className="text-lg font-bold text-white mb-4">Game Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Round:</span>
                    <span className="text-white font-medium">
                      {gameState?.currentRound || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alive:</span>
                    <span className="text-white font-medium">
                      {getAlivePlayers().length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eliminated:</span>
                    <span className="text-white font-medium">
                      {getAllPlayers().length - getAlivePlayers().length}
                    </span>
                  </div>
                  {isObserver && observerData && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Observer Updates:</span>
                      <span className="text-purple-400 font-medium">
                        {observerData.observerUpdates?.length || 0}
                      </span>
                    </div>
                  )}
                  {gameState?.winner && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="text-green-400 font-bold text-center">
                        {gameState.winner.toUpperCase()} WIN!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Role (for players only) */}
              {!isObserver && currentPlayer?.role && (
                <div className="glass-card p-4">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Your Role
                  </h3>
                  <div
                    className={`p-3 rounded-lg border ${
                      currentPlayer.role.includes("mafia")
                        ? "bg-red-500/20 border-red-500/30 text-red-400"
                        : currentPlayer.role === "healer"
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-blue-500/20 border-blue-500/30 text-blue-400"
                    }`}
                  >
                    <div className="font-bold text-center">
                      {currentPlayer.role.replace("_", " ").toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Connection Status */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-bold text-white mb-2">Status</h3>
                <div className="space-y-2 text-xs">
                  <ConnectionStatus
                    isConnected={isConnected}
                    error={connectionError}
                    isObserver={isObserver}
                    hasStoredData={!!observerData?.observerUpdates?.length}
                  />
                  {lastSyncTime && (
                    <div className="text-gray-500">
                      Last sync: {lastSyncTime.toLocaleTimeString()}
                    </div>
                  )}
                  {isObserver && observerData?.lastUpdated && (
                    <div className="text-gray-500">
                      Cache:{" "}
                      {new Date(observerData.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

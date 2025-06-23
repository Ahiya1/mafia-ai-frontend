// src/app/game/[roomCode]/page.tsx - Updated with Observer Mode
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
} from "lucide-react";
import { useSocket } from "@/lib/socket-context";
import { useGameStore } from "@/stores/game-store";
import { ChatArea } from "@/components/chat-area";
import { VotingPanel } from "@/components/voting-panel";
import { NightActionPanel } from "@/components/night-action-panel";
import { GamePhaseDisplay } from "@/components/game-phase-display";
import { ObserverDashboard } from "@/components/observer-dashboard";
import { PlayerCard } from "@/components/player-card";

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
  const { gameState, currentPlayer, setGameState, setCurrentPlayer } =
    useGameStore();

  const [isObserver, setIsObserver] = useState(false);
  const [observerData, setObserverData] = useState<any>(null);
  const [showObserverPanel, setShowObserverPanel] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize connection and join room
  useEffect(() => {
    if (!isConnected || !roomCode) return;

    const playerName =
      localStorage.getItem("playerName") || `Player_${Date.now()}`;
    const playerId = localStorage.getItem("playerId") ?? undefined;
    const observerMode = localStorage.getItem("observerMode") === "true";

    setIsObserver(observerMode);

    joinRoom({
      roomCode,
      playerName,
      playerId,
      observerMode,
    })
      .then((response) => {
        setIsLoading(false);
        if (response.success) {
          if (observerMode) {
            console.log("✅ Joined as observer");
          } else {
            setCurrentPlayer(response.player);
            console.log("✅ Joined as player");
          }
        } else {
          setConnectionError(response.message || "Failed to join room");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setConnectionError(error.message || "Connection failed");
      });
  }, [isConnected, roomCode, joinRoom, setCurrentPlayer]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (newGameState: any) => {
      setGameState(newGameState);

      // Extract observer data if present
      if (newGameState.observerData) {
        setObserverData(newGameState.observerData);
      }
    };

    const handleObserverUpdate = (update: any) => {
      if (isObserver) {
        setObserverData((prev: { observerUpdates: any }) => ({
          ...prev,
          observerUpdates: [
            ...(prev?.observerUpdates || []),
            update.update,
          ].slice(-50), // Keep last 50 updates
        }));

        // Play notification sound
        if (soundEnabled) {
          playNotificationSound();
        }
      }
    };

    const handlePhaseChanged = (data: any) => {
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

    const handlePlayerEliminated = (data: any) => {
      // Play elimination sound
      if (soundEnabled) {
        playEliminationSound();
      }
    };

    const handleGameEnded = (data: any) => {
      // Play game end sound
      if (soundEnabled) {
        playGameEndSound(data.winner);
      }
    };

    const handleRoomTerminated = (data: any) => {
      setConnectionError(`Room was terminated: ${data.message}`);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    };

    // Register event listeners
    socket.on("game_state_update", handleGameStateUpdate);
    socket.on("observer_update", handleObserverUpdate);
    socket.on("phase_changed", handlePhaseChanged);
    socket.on("player_eliminated", handlePlayerEliminated);
    socket.on("game_ended", handleGameEnded);
    socket.on("room_terminated", handleRoomTerminated);

    return () => {
      socket.off("game_state_update", handleGameStateUpdate);
      socket.off("observer_update", handleObserverUpdate);
      socket.off("phase_changed", handlePhaseChanged);
      socket.off("player_eliminated", handlePlayerEliminated);
      socket.off("game_ended", handleGameEnded);
      socket.off("room_terminated", handleRoomTerminated);
    };
  }, [socket, isObserver, soundEnabled, gameState, setGameState, router]);

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
    router.push("/");
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
          <button onClick={handleLeaveRoom} className="btn-detective px-6 py-2">
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLeaveRoom}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Phase Display */}
              {gameState?.phase && <GamePhaseDisplay phase={gameState.phase} />}

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

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{getAllPlayers().length}</span>
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
            <h3 className="text-lg font-bold text-white mb-4">Players</h3>
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

            {/* Chat Area */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

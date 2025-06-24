// src/lib/socket-context.tsx - FIXED: Complete Enhanced Socket Context with Observer Support
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/stores/game-store";

interface ServerStats {
  totalRooms: number;
  activeRooms: number;
  totalPlayers: number;
  activeGames: number;
  aiCount?: number;
  humanCount?: number;
  uptime?: number;
  memoryUsage?: any;
  timestamp?: string;
}

// FIXED: Enhanced interfaces to match backend responses
interface ObserverUpdate {
  type: "mafia_chat" | "healer_thoughts" | "private_action" | "ai_reasoning";
  content: string;
  playerId: string;
  timestamp: string;
  phase: string;
  playerName?: string;
  playerType?: string;
  playerModel?: string;
  playerRole?: string;
  round?: number;
  context?: any;
}

interface ObserverData {
  observerUpdates: ObserverUpdate[];
  suspicionMatrix: Record<string, Record<string, number>>;
  gameAnalytics: any;
  phaseHistory?: Array<{
    phase: string;
    timestamp: string;
    round: number;
    duration?: number;
    actions?: number;
  }>;
  lastUpdated?: string;
  roomCode?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  serverStats: ServerStats | null;
  joinRoom: (data: JoinRoomData) => Promise<JoinRoomResponse>;
  createRoom: (data: CreateRoomData) => Promise<CreateRoomResponse>;
  sendMessage: (content: string) => void;
  castVote: (targetId: string, reasoning: string) => void;
  performNightAction: (action: "kill" | "heal", targetId: string) => void;
  readyUp: () => void;
  startGame: () => void;
  disconnect: () => void;
  reconnect: () => void;
  refreshStats: () => void;
}

interface JoinRoomData {
  roomCode: string;
  playerName: string;
  playerId?: string;
  observerMode?: boolean;
}

// FIXED: Complete JoinRoomResponse interface with observer support
interface JoinRoomResponse {
  success: boolean;
  message?: string;
  player?: any;
  roomInfo?: any;
  gameState?: any;
  observerData?: ObserverData;
  players?: any[];
  roomId?: string;
  playerId?: string;
  observerName?: string;
  observerMode?: boolean;
  joinTimestamp?: string;
}

interface CreateRoomData {
  playerName: string;
  roomSettings: {
    allowSpectators?: boolean;
    premiumModelsEnabled?: boolean;
    gameSpeed?: "slow" | "normal" | "fast";
  };
}

interface CreateRoomResponse {
  success: boolean;
  message?: string;
  roomCode?: string;
  roomId?: string;
  player?: any;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;

  const {
    setGameState,
    setConnectionState,
    addObserverUpdate,
    setObserverData,
    mergeObserverData,
    currentPlayer,
    isObserver,
    setSoundEnabled,
  } = useGameStore();

  // Fetch server stats
  const fetchServerStats = useCallback(async () => {
    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        "https://mafia-ai-production.up.railway.app";
      const response = await fetch(`${serverUrl}/api/stats`);

      if (response.ok) {
        const data = await response.json();

        // Extract relevant stats
        const stats: ServerStats = {
          totalRooms: data.rooms?.totalRooms || 0,
          activeRooms: data.rooms?.activeRooms || 0,
          totalPlayers: data.rooms?.totalPlayers || 0,
          activeGames: data.rooms?.activeRooms || 0,
          uptime: data.server?.uptime,
          memoryUsage: data.server?.memoryUsage,
          timestamp: data.server?.timestamp,
        };

        setServerStats(stats);
      }
    } catch (error) {
      console.warn("Failed to fetch server stats:", error);
      // Set fallback stats for demo purposes
      setServerStats({
        totalRooms: 42,
        activeRooms: 12,
        totalPlayers: 1247,
        activeGames: 89,
      });
    }
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      "https://mafia-ai-production.up.railway.app";

    console.log("🔌 Initializing socket connection to:", serverUrl);

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionState(true);
      reconnectAttemptsRef.current = 0;

      // Fetch initial stats
      fetchServerStats();
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionState(false, `Disconnected: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error);
      setIsConnected(false);
      setConnectionState(false, `Connection error: ${error.message}`);

      // Attempt manual reconnection after delay
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        );

        console.log(
          `🔄 Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, delay);
      }
    });

    // FIXED: Enhanced game events with observer support
    newSocket.on("room_joined", (data) => {
      console.log("🏠 Room joined:", data);
      if (data.gameState) {
        setGameState(data.gameState);
      }
      // Refresh stats when rooms change
      fetchServerStats();
    });

    // FIXED: Enhanced observer joined handler
    newSocket.on("observer_joined", (data) => {
      console.log("👁️ Observer joined with complete data:", {
        observerData: !!data.observerData,
        gameState: !!data.gameState,
        players: data.players?.length || 0,
      });

      if (data.gameState) {
        setGameState(data.gameState);
      }

      // Handle observer data if present
      if (data.observerData) {
        console.log("🔄 Merging observer data from server...");
        mergeObserverData(data.observerData);
      }
    });

    newSocket.on("room_created", (data) => {
      console.log("🆕 Room created:", data);
      // Refresh stats when rooms change
      fetchServerStats();
    });

    newSocket.on("game_started", (data) => {
      console.log("🚀 Game started:", data);
      if (data.gameState) {
        setGameState(data.gameState);
      }
      // Refresh stats when games start
      fetchServerStats();
    });

    newSocket.on("game_state_update", (gameState) => {
      console.log("📊 Game state update:", gameState);
      setGameState(gameState);

      // Extract observer data if present and in observer mode
      if (gameState.observerData && isObserver) {
        mergeObserverData(gameState.observerData);
      }
    });

    newSocket.on("phase_changed", (data) => {
      console.log("🔄 Phase changed:", data);
      // Phase changes are handled by game_state_update
    });

    // FIXED: Enhanced phase separator handler
    newSocket.on("phase_separator", (data) => {
      console.log("📏 Phase separator received:", data);
      // Phase separators are handled in the game page component
    });

    newSocket.on("message_received", (data) => {
      console.log("💬 Message received:", data);
      // Messages are included in game_state_update
    });

    newSocket.on("vote_cast", (data) => {
      console.log("🗳️ Vote cast:", data);
      // Votes are included in game_state_update
    });

    newSocket.on("night_action_received", (data) => {
      console.log("🌙 Night action received:", data);
      // Night actions are included in game_state_update
    });

    newSocket.on("player_eliminated", (data) => {
      console.log("💀 Player eliminated:", data);
      // Player eliminations are included in game_state_update
    });

    newSocket.on("game_ended", (data) => {
      console.log("🏁 Game ended:", data);
      if (data.finalState) {
        setGameState(data.finalState);
      }
      // Refresh stats when games end
      fetchServerStats();
    });

    newSocket.on("player_left", (data) => {
      console.log("👋 Player left:", data);
      // Refresh stats when players leave
      fetchServerStats();
    });

    newSocket.on("room_deleted", (data) => {
      console.log("🗑️ Room deleted:", data);
      // Refresh stats when rooms are deleted
      fetchServerStats();
    });

    // FIXED: Enhanced observer-specific events
    newSocket.on("observer_update", (data) => {
      console.log("👁️ Observer update:", {
        type: data.update?.type,
        playerName: data.update?.playerName,
        content: data.update?.content?.substring(0, 50) + "...",
      });

      if (isObserver && data.update) {
        addObserverUpdate(data.update);
      }
    });

    // AI-specific events for enhanced dashboard
    newSocket.on("ai_message", (data) => {
      console.log("🤖 AI message:", data);
      // Add AI message to observer updates
      if (isObserver) {
        addObserverUpdate({
          type: "ai_reasoning",
          content: `${data.playerName}: ${data.content}`,
          playerId: data.playerId || "",
          timestamp: data.timestamp,
          phase: data.phase || "unknown",
          playerName: data.playerName,
          playerType: "ai",
          playerModel: data.playerModel,
          playerRole: data.playerRole,
        });
      }
    });

    newSocket.on("ai_vote", (data) => {
      console.log("🤖 AI vote:", data);
      // Add AI vote reasoning to observer updates
      if (isObserver) {
        addObserverUpdate({
          type: "ai_reasoning",
          content: `${data.voterName} voted for ${data.targetName}: ${data.reasoning}`,
          playerId: data.voterId || "",
          timestamp: data.timestamp,
          phase: "voting",
          playerName: data.voterName,
          playerType: "ai",
        });
      }
    });

    newSocket.on("ai_night_action", (data) => {
      console.log("🤖 AI night action:", data);
      // Add AI night action to observer updates
      if (isObserver) {
        addObserverUpdate({
          type: "private_action",
          content: `${data.actorName} is planning to ${data.action} ${
            data.targetName || "someone"
          }`,
          playerId: data.actorId || "",
          timestamp: data.timestamp,
          phase: "night",
          playerName: data.actorName,
          playerType: "ai",
        });
      }
    });

    newSocket.on("ai_private_action", (data) => {
      console.log("🤖 AI private action:", data);
      // Add AI private action to observer updates
      if (isObserver && data.update) {
        addObserverUpdate(data.update);
      }
    });

    // Enhanced stats events from server
    newSocket.on("stats_update", (data) => {
      if (data.rooms) {
        const stats: ServerStats = {
          totalRooms: data.rooms.totalRooms || 0,
          activeRooms: data.rooms.activeRooms || 0,
          totalPlayers: data.rooms.totalPlayers || 0,
          activeGames: data.rooms.activeRooms || 0,
          uptime: data.server?.uptime,
          memoryUsage: data.server?.memoryUsage,
          timestamp: data.server?.timestamp,
        };
        setServerStats(stats);
      }
    });

    // Room/player count updates
    newSocket.on("player_joined", () => {
      fetchServerStats();
    });

    newSocket.on("ai_players_added", () => {
      fetchServerStats();
    });

    // Error handling
    newSocket.on("error", (error) => {
      console.error("🔥 Socket error:", error);
      setConnectionState(false, error.message || "Socket error");
    });

    newSocket.on("room_terminated", (data) => {
      console.log("🔥 Room terminated:", data);
      setConnectionState(false, `Room terminated: ${data.message}`);
      fetchServerStats();
    });

    // Store socket
    setSocket(newSocket);

    return newSocket;
  }, [
    setGameState,
    setConnectionState,
    addObserverUpdate,
    mergeObserverData,
    isObserver,
    fetchServerStats,
  ]);

  // Initialize socket on mount
  useEffect(() => {
    const socketInstance = initializeSocket();

    // Start periodic stats fetching
    statsIntervalRef.current = setInterval(() => {
      fetchServerStats();
    }, 30000); // Update every 30 seconds

    // Initial stats fetch
    fetchServerStats();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      socketInstance?.disconnect();
    };
  }, [initializeSocket, fetchServerStats]);

  // FIXED: Enhanced socket action functions with observer support
  const joinRoom = useCallback(
    async (data: JoinRoomData): Promise<JoinRoomResponse> => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Join room timeout"));
        }, 10000);

        socket.emit("join_room", data);

        // FIXED: Enhanced success handler for both player and observer modes
        const handleSuccess = (response: any) => {
          clearTimeout(timeout);
          socket.off("room_joined", handleSuccess);
          socket.off("observer_joined", handleObserverSuccess);
          socket.off("error", handleError);

          resolve({
            success: true,
            player: response.player,
            roomInfo: response.roomInfo,
            gameState: response.gameState,
            players: response.players,
            roomId: response.roomId,
            playerId: response.playerId,
          });
        };

        // FIXED: Enhanced observer success handler
        const handleObserverSuccess = (response: any) => {
          clearTimeout(timeout);
          socket.off("room_joined", handleSuccess);
          socket.off("observer_joined", handleObserverSuccess);
          socket.off("error", handleError);

          resolve({
            success: true,
            observerData: response.observerData,
            gameState: response.gameState,
            players: response.players,
            roomInfo: { code: response.roomCode, id: response.roomId },
            roomId: response.roomId,
            observerName: response.observerName,
            playerId: response.playerId,
            observerMode: true,
            joinTimestamp: response.joinTimestamp,
          });
        };

        const handleError = (error: any) => {
          clearTimeout(timeout);
          socket.off("room_joined", handleSuccess);
          socket.off("observer_joined", handleObserverSuccess);
          socket.off("error", handleError);
          resolve({
            success: false,
            message: error.message || "Failed to join room",
          });
        };

        socket.on("room_joined", handleSuccess);
        socket.on("observer_joined", handleObserverSuccess);
        socket.on("error", handleError);
      });
    },
    [socket, isConnected]
  );

  const createRoom = useCallback(
    async (data: CreateRoomData): Promise<CreateRoomResponse> => {
      if (!socket || !isConnected) {
        throw new Error("Socket not connected");
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Create room timeout"));
        }, 10000);

        socket.emit("create_room", data);

        const handleSuccess = (response: any) => {
          clearTimeout(timeout);
          socket.off("room_created", handleSuccess);
          socket.off("error", handleError);
          resolve({
            success: true,
            roomCode: response.roomCode,
            roomId: response.roomId,
            player: response.player,
          });
        };

        const handleError = (error: any) => {
          clearTimeout(timeout);
          socket.off("room_created", handleSuccess);
          socket.off("error", handleError);
          resolve({
            success: false,
            message: error.message || "Failed to create room",
          });
        };

        socket.on("room_created", handleSuccess);
        socket.on("error", handleError);
      });
    },
    [socket, isConnected]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected || !currentPlayer) {
        console.warn("Cannot send message: not connected or no current player");
        return;
      }

      socket.emit("game_action", {
        type: "SEND_MESSAGE",
        playerId: currentPlayer.id,
        content,
      });
    },
    [socket, isConnected, currentPlayer]
  );

  const castVote = useCallback(
    (targetId: string, reasoning: string) => {
      if (!socket || !isConnected || !currentPlayer) {
        console.warn("Cannot cast vote: not connected or no current player");
        return;
      }

      socket.emit("game_action", {
        type: "CAST_VOTE",
        playerId: currentPlayer.id,
        targetId,
        reasoning,
      });
    },
    [socket, isConnected, currentPlayer]
  );

  const performNightAction = useCallback(
    (action: "kill" | "heal", targetId: string) => {
      if (!socket || !isConnected || !currentPlayer) {
        console.warn(
          "Cannot perform night action: not connected or no current player"
        );
        return;
      }

      socket.emit("game_action", {
        type: "NIGHT_ACTION",
        playerId: currentPlayer.id,
        action,
        targetId,
      });
    },
    [socket, isConnected, currentPlayer]
  );

  const readyUp = useCallback(() => {
    if (!socket || !isConnected || !currentPlayer) {
      console.warn("Cannot ready up: not connected or no current player");
      return;
    }

    socket.emit("ready_up", {
      playerId: currentPlayer.id,
    });
  }, [socket, isConnected, currentPlayer]);

  const startGame = useCallback(() => {
    if (!socket || !isConnected || !currentPlayer) {
      console.warn("Cannot start game: not connected or no current player");
      return;
    }

    socket.emit("game_action", {
      type: "START_GAME",
      playerId: currentPlayer.id,
    });
  }, [socket, isConnected, currentPlayer]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    if (socket) {
      reconnectAttemptsRef.current = 0;
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [socket, initializeSocket]);

  const refreshStats = useCallback(() => {
    fetchServerStats();
  }, [fetchServerStats]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    serverStats,
    joinRoom,
    createRoom,
    sendMessage,
    castVote,
    performNightAction,
    readyUp,
    startGame,
    disconnect,
    reconnect,
    refreshStats,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

// Hook for connection status with auto-reconnection
export function useConnectionStatus() {
  const { isConnected, reconnect } = useSocket();
  const { connectionError } = useGameStore();

  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return {
    isConnected,
    connectionError,
    reconnect: handleReconnect,
  };
}

// Hook for real-time game actions
export function useGameActions() {
  const { sendMessage, castVote, performNightAction, readyUp, startGame } =
    useSocket();
  const { currentPlayer, canPlayerAct } = useGameStore();

  const canSendMessage = currentPlayer ? canPlayerAct(currentPlayer.id) : false;
  const canVote = currentPlayer ? canPlayerAct(currentPlayer.id) : false;
  const canPerformNightAction = currentPlayer
    ? canPlayerAct(currentPlayer.id)
    : false;

  return {
    sendMessage,
    castVote,
    performNightAction,
    readyUp,
    startGame,
    canSendMessage,
    canVote,
    canPerformNightAction,
  };
}

// Hook for server stats
export function useServerStats() {
  const { serverStats, refreshStats } = useSocket();

  return {
    serverStats,
    refreshStats,
    isLoading: !serverStats,
  };
}

// Hook for live game statistics
export function useLiveStats() {
  const { serverStats } = useSocket();

  return {
    totalPlayers: serverStats?.totalPlayers || 0,
    activeGames: serverStats?.activeGames || 0,
    totalRooms: serverStats?.totalRooms || 0,
    activeRooms: serverStats?.activeRooms || 0,
    uptime: serverStats?.uptime || 0,
    lastUpdated: serverStats?.timestamp,
  };
}

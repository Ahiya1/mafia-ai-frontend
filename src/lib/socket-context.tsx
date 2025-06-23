// src/lib/socket-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface ServerStats {
  totalPlayers: number;
  activeGames: number;
  totalRooms: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  serverStats: ServerStats | null;
  joinRoom: (roomCode: string, playerName: string) => void;
  createRoom: (playerName: string, settings?: any) => void;
  sendMessage: (message: string) => void;
  castVote: (targetId: string, reasoning: string) => void;
  nightAction: (action: string, targetId?: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

    console.log("🔌 Connecting to:", socketUrl);
    setConnectionStatus("connecting");

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      retries: 3,
      query: {
        clientType: "game",
      },
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to game server");
      setIsConnected(true);
      setConnectionStatus("connected");
      toast.success("Connected to game server!", {
        icon: "🕵️‍♂️",
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") {
        toast.error("Server disconnected. Attempting to reconnect...");
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      setConnectionStatus("error");
      toast.error("Failed to connect to game server. Retrying...");
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      toast.success("Reconnected to game server!");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection failed:", error);
      toast.error("Failed to reconnect. Please refresh the page.");
    });

    // Game event handlers
    newSocket.on("room_joined", (data) => {
      console.log("🏠 Joined room:", data);
      toast.success(`Joined room ${data.roomCode}!`, {
        icon: "🎮",
      });
    });

    newSocket.on("room_created", (data) => {
      console.log("🏗️ Room created:", data);
      toast.success(`Room ${data.roomCode} created!`, {
        icon: "🎯",
      });
    });

    newSocket.on("player_joined", (data) => {
      console.log("👋 Player joined:", data);
      toast(`${data.player.name} joined the game`, {
        icon: "👋",
      });
    });

    newSocket.on("player_left", (data) => {
      console.log("🚪 Player left:", data);
      toast(`A player left the game`, {
        icon: "🚪",
      });
    });

    newSocket.on("game_started", (data) => {
      console.log("🚀 Game started!", data);
      toast.success("The game has begun! Good luck, detective!", {
        icon: "🕵️‍♂️",
        duration: 6000,
      });
    });

    newSocket.on("phase_changed", (data) => {
      console.log("🔄 Phase changed:", data);
      const phaseMessages = {
        night: "Night falls... 🌙",
        revelation: "Morning reveals the truth... ☀️",
        discussion: "Time for discussion! 💬",
        voting: "Time to vote! 🗳️",
        game_over: "Game Over! 🎮",
      };

      const message =
        phaseMessages[data.newPhase as keyof typeof phaseMessages] ||
        `Phase: ${data.newPhase}`;
      toast(message, {
        icon: "⏰",
        duration: 3000,
      });
    });

    newSocket.on("player_eliminated", (data) => {
      console.log("💀 Player eliminated:", data);
      toast.error(
        `${data.playerName} was eliminated! They were a ${data.role}`,
        {
          icon: "💀",
          duration: 8000,
        }
      );
    });

    newSocket.on("game_ended", (data) => {
      console.log("🏁 Game ended:", data);
      const winnerMessage =
        data.winner === "citizens" ? "Citizens won!" : "Mafia won!";
      toast.success(`Game Over! ${winnerMessage}`, {
        icon: data.winner === "citizens" ? "👮‍♂️" : "🕴️",
        duration: 10000,
      });
    });

    newSocket.on("error", (error) => {
      console.error("🔴 Game error:", error);
      toast.error(error.message || "An error occurred");
    });

    // Stats updates
    newSocket.on("stats_update", (stats) => {
      setServerStats({
        totalPlayers: stats.server?.activeConnections || 0,
        activeGames: stats.rooms?.activeRooms || 0,
        totalRooms: stats.rooms?.totalRooms || 0,
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []);

  // Periodically fetch server stats
  useEffect(() => {
    if (!socket || !isConnected) return;

    const fetchStats = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`)
        .then((res) => res.json())
        .then((data) => {
          setServerStats({
            totalPlayers: data.server?.activeConnections || 0,
            activeGames: data.rooms?.activeRooms || 0,
            totalRooms: data.rooms?.totalRooms || 0,
          });
        })
        .catch(console.error);
    };

    // Fetch immediately and then every 5 seconds
    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [socket, isConnected]);

  const joinRoom = (roomCode: string, playerName: string) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit("join_room", {
      roomCode: roomCode.toUpperCase(),
      playerName: playerName.trim(),
    });
  };

  const createRoom = (playerName: string, settings = {}) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit("create_room", {
      playerName: playerName.trim(),
      roomSettings: {
        allowSpectators: false,
        premiumModelsEnabled: false,
        ...settings,
      },
    });
  };

  const sendMessage = (message: string) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit("game_action", {
      type: "SEND_MESSAGE",
      content: message.trim(),
    });
  };

  const castVote = (targetId: string, reasoning: string) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit("game_action", {
      type: "CAST_VOTE",
      targetId,
      reasoning: reasoning.trim(),
    });
  };

  const nightAction = (action: string, targetId?: string) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    socket.emit("game_action", {
      type: "NIGHT_ACTION",
      action,
      targetId,
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    serverStats,
    joinRoom,
    createRoom,
    sendMessage,
    castVote,
    nightAction,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

// ---

// src/types/game.ts
export interface Player {
  id: string;
  name: string;
  type: "human" | "ai";
  role?: "mafia_leader" | "mafia_member" | "healer" | "citizen";
  isAlive: boolean;
  isReady: boolean;
  model?: string;
  votedFor?: string;
  lastActive: string;
  gameStats: {
    gamesPlayed: number;
    wins: number;
    accurateVotes: number;
    aiDetectionRate: number;
  };
}

export interface GameState {
  id: string;
  roomId: string;
  phase:
    | "waiting"
    | "role_assignment"
    | "night"
    | "revelation"
    | "discussion"
    | "voting"
    | "game_over";
  currentRound: number;
  players: Player[];
  votes: Vote[];
  messages: Message[];
  eliminatedPlayers: string[];
  winner?: "citizens" | "mafia";
  phaseStartTime: string;
  phaseEndTime: string;
  speakingOrder?: string[];
  currentSpeaker?: string;
}

export interface Vote {
  voterId: string;
  targetId: string;
  reasoning: string;
  timestamp: string;
}

export interface Message {
  id: string;
  playerId: string;
  content: string;
  timestamp: string;
  phase: string;
  messageType?: "discussion" | "vote" | "action" | "system";
}

export interface Room {
  id: string;
  code: string;
  name?: string;
  playerCount: number;
  maxPlayers: number;
  gameInProgress: boolean;
  createdAt: string;
}

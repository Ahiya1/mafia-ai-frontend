// src/lib/socket-context.tsx - Updated without mock data
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
    const isProduction = process.env.NODE_ENV === "production";
    const socketUrl = isProduction
      ? process.env.NEXT_PUBLIC_WS_URL ||
        "wss://mafia-ai-production.up.railway.app"
      : "ws://localhost:3001";

    console.log("🔌 Connecting to WebSocket:", socketUrl);
    console.log("🌍 Environment:", process.env.NODE_ENV);

    setConnectionStatus("connecting");

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      retries: 5,
      autoConnect: true,
      forceNew: true,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
      query: {
        clientType: "game",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "server",
      },
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to AI Mafia server:", newSocket.id);
      setIsConnected(true);
      setConnectionStatus("connected");
      toast.success("Connected to game server!", {
        icon: "🕵️‍♂️",
        duration: 3000,
      });

      fetchServerStats();
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");

      if (reason === "io server disconnect") {
        toast.error("Server disconnected. Attempting to reconnect...");
      } else {
        toast("Connection lost. Reconnecting...", {
          icon: "🔄",
        });
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      setConnectionStatus("error");

      if (error.message.includes("CORS")) {
        toast.error("Connection blocked by CORS policy");
      } else if (error.message.includes("timeout")) {
        toast.error("Connection timeout. Server may be down.");
      } else if (error.message.includes("Transport unknown")) {
        toast.error("WebSocket transport not supported");
      } else {
        toast.error(`Failed to connect: ${error.message}`);
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      toast.success("Reconnected to game server!");
      fetchServerStats();
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection failed:", error);
      toast.error("Failed to reconnect. Please refresh the page.");
    });

    newSocket.on("reconnect_failed", () => {
      console.error("🔴 Reconnection failed permanently");
      toast.error("Unable to reconnect. Please check your connection.");
    });

    // Game event handlers
    newSocket.on("room_joined", (data) => {
      console.log("🏠 Joined room:", data);
      toast.success(`Joined room ${data.roomCode}!`, {
        icon: "🎮",
      });
    });

    newSocket.on("observer_joined", (data) => {
      console.log("👁️ Joined as observer:", data);
      toast.success(`Watching room ${data.roomCode}`, {
        icon: "👁️",
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

    // Stats updates from real backend
    newSocket.on("stats_update", (stats) => {
      if (stats && stats.server && stats.rooms) {
        setServerStats({
          totalPlayers: stats.server.activeConnections || 0,
          activeGames: stats.rooms.activeRooms || 0,
          totalRooms: stats.rooms.totalRooms || 0,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []);

  // Fetch server stats from HTTP endpoint
  const fetchServerStats = async () => {
    try {
      const isProduction = process.env.NODE_ENV === "production";
      const apiUrl = isProduction
        ? process.env.NEXT_PUBLIC_API_URL ||
          "https://mafia-ai-production.up.railway.app"
        : "http://localhost:3001";

      console.log("📊 Fetching stats from:", `${apiUrl}/api/stats`);

      const response = await fetch(`${apiUrl}/api/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServerStats({
          totalPlayers: data.server?.activeConnections || 0,
          activeGames: data.rooms?.activeRooms || 0,
          totalRooms: data.rooms?.totalRooms || 0,
        });
        console.log("📊 Stats updated:", data);
      } else {
        console.warn("📊 Failed to fetch stats - server response not OK");
        // Don't set fallback stats - leave as null
      }
    } catch (error) {
      console.warn("📊 Failed to fetch server stats:", error);
      // Don't set fallback stats - leave as null
    }
  };

  // Periodically fetch server stats
  useEffect(() => {
    if (!isConnected) return;

    fetchServerStats();
    const interval = setInterval(fetchServerStats, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const joinRoom = (roomCode: string, playerName: string) => {
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    console.log("🎮 Joining room:", roomCode, "as", playerName);
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

    console.log(
      "🏗️ Creating room for:",
      playerName,
      "with settings:",
      settings
    );
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

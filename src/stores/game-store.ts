// src/stores/game-store.ts - Enhanced with Observer Support
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, Player } from "../types/game";

interface ObserverUpdate {
  type: "mafia_chat" | "healer_thoughts" | "private_action" | "ai_reasoning";
  content: string;
  playerId: string;
  timestamp: string;
  phase: string;
}

interface GameAnalytics {
  duration: number;
  rounds: number;
  totalMessages: number;
  totalVotes: number;
  totalNightActions: number;
  eliminations: number;
  playerStats: {
    total: number;
    ai: number;
    human: number;
    alive: number;
  };
  phaseStats: Record<string, number>;
  playerActivity: Record<string, any>;
}

interface ObserverData {
  observerUpdates: ObserverUpdate[];
  suspicionMatrix: Record<string, Record<string, number>>;
  gameAnalytics: GameAnalytics;
}

interface EnhancedGameState extends GameState {
  phaseStatus?: {
    phase: string;
    timeRemaining: number;
    completionStatus: any;
    nextActions: string[];
  };
  observerData?: ObserverData;
}

interface GameStore {
  // Core game state
  gameState: EnhancedGameState | null;
  currentPlayer: Player | null;

  // Observer state
  isObserver: boolean;
  observerData: ObserverData | null;

  // UI state
  selectedPlayer: Player | null;
  showObserverPanel: boolean;
  soundEnabled: boolean;
  autoScroll: boolean;

  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  roomCode: string | null;

  // Actions
  setGameState: (gameState: EnhancedGameState) => void;
  setCurrentPlayer: (player: Player) => void;
  setObserver: (isObserver: boolean) => void;
  setObserverData: (data: ObserverData) => void;
  addObserverUpdate: (update: ObserverUpdate) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setShowObserverPanel: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoScroll: (enabled: boolean) => void;
  setConnectionState: (connected: boolean, error?: string) => void;
  setRoomCode: (code: string) => void;
  clearGame: () => void;

  // Computed getters
  getAlivePlayers: () => Player[];
  getAllPlayers: () => Player[];
  getEliminatedPlayers: () => Player[];
  getPlayerById: (id: string) => Player | undefined;
  getPlayersByRole: (role: string) => Player[];
  getMafiaPlayers: () => Player[];
  getCitizenPlayers: () => Player[];
  getCurrentPhaseTimeRemaining: () => number;
  isGameActive: () => boolean;
  isGameOver: () => boolean;
  canPlayerAct: (playerId: string) => boolean;

  // Observer helpers
  getLatestObserverUpdates: (count?: number) => ObserverUpdate[];
  getObserverUpdatesByType: (type: string) => ObserverUpdate[];
  getSuspicionLevel: (playerId: string) => number;
  getTrustLevel: (playerId: string) => number;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: null,
    currentPlayer: null,
    isObserver: false,
    observerData: null,
    selectedPlayer: null,
    showObserverPanel: true,
    soundEnabled: true,
    autoScroll: true,
    isConnected: false,
    connectionError: null,
    roomCode: null,

    // Actions
    setGameState: (gameState) => {
      set({ gameState });

      // Extract observer data if present
      if (gameState.observerData) {
        set({ observerData: gameState.observerData });
      }
    },

    setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),

    setObserver: (isObserver) => set({ isObserver }),

    setObserverData: (observerData) => set({ observerData }),

    addObserverUpdate: (update) => {
      const { observerData } = get();
      const currentUpdates = observerData?.observerUpdates || [];

      set({
        observerData: {
          ...observerData,
          observerUpdates: [...currentUpdates, update].slice(-100), // Keep last 100 updates
        } as ObserverData,
      });
    },

    setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),

    setShowObserverPanel: (showObserverPanel) => set({ showObserverPanel }),

    setSoundEnabled: (soundEnabled) => {
      set({ soundEnabled });
      // Persist to localStorage
      localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
    },

    setAutoScroll: (autoScroll) => set({ autoScroll }),

    setConnectionState: (isConnected, connectionError) =>
      set({ isConnected, connectionError }),

    setRoomCode: (roomCode) => set({ roomCode }),

    clearGame: () =>
      set({
        gameState: null,
        currentPlayer: null,
        isObserver: false,
        observerData: null,
        selectedPlayer: null,
        connectionError: null,
        roomCode: null,
      }),

    // Computed getters
    getAlivePlayers: () => {
      const { gameState } = get();
      if (!gameState?.players) return [];
      return gameState.players.filter((p: Player) => p.isAlive);
    },

    getAllPlayers: () => {
      const { gameState } = get();
      return gameState?.players || [];
    },

    getEliminatedPlayers: () => {
      const { gameState } = get();
      if (!gameState?.players) return [];
      return gameState.players.filter((p: Player) => !p.isAlive);
    },

    getPlayerById: (id) => {
      const { gameState } = get();
      return gameState?.players?.find((p: Player) => p.id === id);
    },

    getPlayersByRole: (role) => {
      const { gameState } = get();
      if (!gameState?.players) return [];
      return gameState.players.filter((p: Player) => p.role === role);
    },

    getMafiaPlayers: () => {
      const { gameState } = get();
      if (!gameState?.players) return [];
      return gameState.players.filter(
        (p: Player) => p.role === "mafia_leader" || p.role === "mafia_member"
      );
    },

    getCitizenPlayers: () => {
      const { gameState } = get();
      if (!gameState?.players) return [];
      return gameState.players.filter(
        (p: Player) => p.role === "citizen" || p.role === "healer"
      );
    },

    getCurrentPhaseTimeRemaining: () => {
      const { gameState } = get();
      if (!gameState?.phaseEndTime) return 0;

      const endTime = new Date(gameState.phaseEndTime).getTime();
      const now = Date.now();
      return Math.max(0, endTime - now);
    },

    isGameActive: () => {
      const { gameState } = get();
      return (
        gameState?.phase !== "waiting" &&
        gameState?.phase !== "game_over" &&
        !!gameState
      );
    },

    isGameOver: () => {
      const { gameState } = get();
      return gameState?.phase === "game_over" || !!gameState?.winner;
    },

    canPlayerAct: (playerId) => {
      const { gameState, currentPlayer } = get();
      if (!gameState || !currentPlayer || currentPlayer.id !== playerId) {
        return false;
      }

      const player = gameState.players?.find((p: Player) => p.id === playerId);
      if (!player || !player.isAlive) return false;

      switch (gameState.phase) {
        case "discussion":
          return gameState.currentSpeaker === playerId;
        case "voting":
          return gameState.currentSpeaker === playerId;
        case "night":
          return player.role === "mafia_leader" || player.role === "healer";
        default:
          return false;
      }
    },

    // Observer helpers
    getLatestObserverUpdates: (count = 10) => {
      const { observerData } = get();
      if (!observerData?.observerUpdates) return [];

      return observerData.observerUpdates.slice(-count).reverse(); // Most recent first
    },

    getObserverUpdatesByType: (type) => {
      const { observerData } = get();
      if (!observerData?.observerUpdates) return [];

      return observerData.observerUpdates.filter(
        (update) => update.type === type
      );
    },

    getSuspicionLevel: (playerId) => {
      const { observerData } = get();
      if (!observerData?.suspicionMatrix) return 5.0;

      // Calculate average suspicion from other players
      let totalSuspicion = 0;
      let count = 0;

      Object.values(observerData.suspicionMatrix).forEach((suspicions) => {
        if (suspicions[playerId] !== undefined) {
          totalSuspicion += suspicions[playerId];
          count++;
        }
      });

      return count > 0 ? totalSuspicion / count : 5.0;
    },

    getTrustLevel: (playerId) => {
      const suspicionLevel = get().getSuspicionLevel(playerId);
      return 10 - suspicionLevel; // Inverse of suspicion
    },
  }))
);

// Subscribe to changes for persistence and side effects
useGameStore.subscribe(
  (state) => state.soundEnabled,
  (soundEnabled) => {
    // Persist sound setting
    localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
  }
);

useGameStore.subscribe(
  (state) => state.currentPlayer,
  (currentPlayer) => {
    // Persist current player
    if (currentPlayer) {
      localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
    } else {
      localStorage.removeItem("currentPlayer");
    }
  }
);

useGameStore.subscribe(
  (state) => state.isObserver,
  (isObserver) => {
    // Persist observer mode
    localStorage.setItem("observerMode", JSON.stringify(isObserver));
  }
);

// Initialize store from localStorage
if (typeof window !== "undefined") {
  const soundEnabled = localStorage.getItem("soundEnabled");
  if (soundEnabled) {
    useGameStore.getState().setSoundEnabled(JSON.parse(soundEnabled));
  }

  const currentPlayer = localStorage.getItem("currentPlayer");
  if (currentPlayer) {
    try {
      useGameStore.getState().setCurrentPlayer(JSON.parse(currentPlayer));
    } catch (error) {
      console.warn("Failed to restore current player from localStorage");
    }
  }

  const observerMode = localStorage.getItem("observerMode");
  if (observerMode) {
    try {
      useGameStore.getState().setObserver(JSON.parse(observerMode));
    } catch (error) {
      console.warn("Failed to restore observer mode from localStorage");
    }
  }
}

// Export selectors for better performance
export const useGameState = () => useGameStore((state) => state.gameState);
export const useCurrentPlayer = () =>
  useGameStore((state) => state.currentPlayer);
export const useIsObserver = () => useGameStore((state) => state.isObserver);
export const useObserverData = () =>
  useGameStore((state) => state.observerData);
export const useAlivePlayers = () =>
  useGameStore((state) => state.getAlivePlayers());
export const useAllPlayers = () =>
  useGameStore((state) => state.getAllPlayers());
export const useIsGameActive = () =>
  useGameStore((state) => state.isGameActive());
export const useCanPlayerAct = (playerId: string) =>
  useGameStore((state) => state.canPlayerAct(playerId));
export const usePhaseTimeRemaining = () =>
  useGameStore((state) => state.getCurrentPhaseTimeRemaining());

// Hook for observer updates with real-time updates
export const useObserverUpdates = (type?: string, count = 10) => {
  return useGameStore((state) => {
    if (type) {
      return state.getObserverUpdatesByType(type);
    }
    return state.getLatestObserverUpdates(count);
  });
};

// Hook for player suspicion/trust levels
export const usePlayerSuspicion = (playerId: string) => {
  return useGameStore((state) => ({
    suspicion: state.getSuspicionLevel(playerId),
    trust: state.getTrustLevel(playerId),
  }));
};

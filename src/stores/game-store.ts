// src/stores/game-store.ts - FIXED: Enhanced Observer Persistence with localStorage
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, Player } from "../types/game";

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

interface GameAnalytics {
  gameId?: string;
  duration: number;
  currentPhaseDuration?: number;
  rounds: number;
  currentPhase?: string;
  totalMessages: number;
  totalVotes: number;
  totalNightActions: number;
  eliminations: number;
  observerUpdates?: number;
  playerStats: {
    total: number;
    ai: number;
    human: number;
    alive: number;
    eliminated?: number;
  };
  aiModelDistribution?: Record<string, number>;
  phaseStats: Record<string, any>;
  playerActivity: Record<string, any>;
  suspicionAnalytics?: any;
  roleDistribution?: Record<string, number>;
}

interface ObserverData {
  observerUpdates: ObserverUpdate[];
  suspicionMatrix: Record<string, Record<string, number>>;
  gameAnalytics: GameAnalytics;
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
  messageFilter: "all" | "discussion" | "observer" | "system";

  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  roomCode: string | null;

  // FIXED: Observer persistence settings
  observerPersistenceEnabled: boolean;
  lastObserverSync: string | null;

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
  setMessageFilter: (
    filter: "all" | "discussion" | "observer" | "system"
  ) => void;
  setConnectionState: (connected: boolean, error?: string) => void;
  setRoomCode: (code: string) => void;
  clearGame: () => void;

  // FIXED: Observer persistence actions
  saveObserverDataToStorage: () => void;
  loadObserverDataFromStorage: (roomCode: string) => ObserverData | null;
  mergeObserverData: (newData: ObserverData) => void;
  clearObserverStorage: (roomCode?: string) => void;

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
  getObserverUpdatesByPhase: (phase: string) => ObserverUpdate[];
  getSuspicionLevel: (playerId: string) => number;
  getTrustLevel: (playerId: string) => number;
  getObserverUpdateStats: () => Record<string, number>;
}

// FIXED: Helper function to get localStorage key for observer data
const getObserverStorageKey = (roomCode: string): string => {
  return `observer_data_${roomCode}`;
};

// FIXED: Helper function to sanitize observer data for storage
const sanitizeObserverDataForStorage = (data: ObserverData): any => {
  return {
    ...data,
    lastUpdated: new Date().toISOString(),
    // Limit stored updates to prevent localStorage bloat
    observerUpdates: data.observerUpdates.slice(-50),
  };
};

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
    messageFilter: "all",
    isConnected: false,
    connectionError: null,
    roomCode: null,
    observerPersistenceEnabled: true,
    lastObserverSync: null,

    // Actions
    setGameState: (gameState) => {
      set({ gameState });

      // Extract observer data if present
      if (gameState.observerData) {
        get().mergeObserverData(gameState.observerData);
      }

      // Save to storage if observer mode and persistence enabled
      const { isObserver, observerPersistenceEnabled, roomCode } = get();
      if (isObserver && observerPersistenceEnabled && roomCode) {
        setTimeout(() => get().saveObserverDataToStorage(), 100);
      }
    },

    setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),

    setObserver: (isObserver) => {
      set({ isObserver });

      // Load observer data from storage when becoming observer
      if (isObserver) {
        const { roomCode } = get();
        if (roomCode) {
          const storedData = get().loadObserverDataFromStorage(roomCode);
          if (storedData) {
            console.log(
              `✅ Loaded observer data from storage for room ${roomCode}`
            );
            set({ observerData: storedData });
          }
        }
      }
    },

    setObserverData: (observerData) => {
      set({
        observerData: {
          ...observerData,
          roomCode: get().roomCode || observerData.roomCode,
        },
        lastObserverSync: new Date().toISOString(),
      });

      // Save to storage if persistence enabled
      const { observerPersistenceEnabled, roomCode } = get();
      if (observerPersistenceEnabled && roomCode) {
        setTimeout(() => get().saveObserverDataToStorage(), 100);
      }
    },

    addObserverUpdate: (update) => {
      const { observerData, observerPersistenceEnabled, roomCode } = get();
      const currentUpdates = observerData?.observerUpdates || [];

      // Avoid duplicates based on timestamp and content
      const isDuplicate = currentUpdates.some(
        (existing) =>
          existing.timestamp === update.timestamp &&
          existing.content === update.content &&
          existing.playerId === update.playerId
      );

      if (!isDuplicate) {
        const newObserverData: ObserverData = {
          ...observerData,
          observerUpdates: [...currentUpdates, update].slice(-100), // Keep last 100 updates
          lastUpdated: new Date().toISOString(),
          roomCode: roomCode || observerData?.roomCode,
        } as ObserverData;

        set({ observerData: newObserverData });

        // Save to storage if persistence enabled
        if (observerPersistenceEnabled && roomCode) {
          setTimeout(() => get().saveObserverDataToStorage(), 50);
        }

        console.log(
          `📊 Added observer update: ${update.type} from ${
            update.playerName || update.playerId
          }`
        );
      }
    },

    setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),

    setShowObserverPanel: (showObserverPanel) => set({ showObserverPanel }),

    setSoundEnabled: (soundEnabled) => {
      set({ soundEnabled });
      // Persist to localStorage
      localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));
    },

    setAutoScroll: (autoScroll) => set({ autoScroll }),

    setMessageFilter: (messageFilter) => set({ messageFilter }),

    setConnectionState: (isConnected, connectionError) =>
      set({ isConnected, connectionError }),

    setRoomCode: (roomCode) => {
      set({ roomCode });

      // Load observer data for new room if in observer mode
      const { isObserver } = get();
      if (isObserver && roomCode) {
        const storedData = get().loadObserverDataFromStorage(roomCode);
        if (storedData) {
          console.log(`✅ Loaded observer data for room ${roomCode}`);
          set({ observerData: storedData });
        }
      }
    },

    clearGame: () => {
      const { roomCode } = get();

      set({
        gameState: null,
        currentPlayer: null,
        isObserver: false,
        observerData: null,
        selectedPlayer: null,
        connectionError: null,
        roomCode: null,
        lastObserverSync: null,
      });

      // Clear observer storage for this room
      if (roomCode) {
        get().clearObserverStorage(roomCode);
      }
    },

    // FIXED: Observer persistence methods
    saveObserverDataToStorage: () => {
      const { observerData, roomCode, observerPersistenceEnabled } = get();

      if (!observerPersistenceEnabled || !roomCode || !observerData) {
        return;
      }

      try {
        const storageKey = getObserverStorageKey(roomCode);
        const sanitizedData = sanitizeObserverDataForStorage(observerData);

        localStorage.setItem(storageKey, JSON.stringify(sanitizedData));

        console.log(
          `💾 Saved observer data for room ${roomCode} (${observerData.observerUpdates.length} updates)`
        );
      } catch (error) {
        console.warn("Failed to save observer data to localStorage:", error);
      }
    },

    loadObserverDataFromStorage: (roomCode: string): ObserverData | null => {
      const { observerPersistenceEnabled } = get();

      if (!observerPersistenceEnabled) {
        return null;
      }

      try {
        const storageKey = getObserverStorageKey(roomCode);
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log(
            `📂 Loaded observer data for room ${roomCode} (${
              parsed.observerUpdates?.length || 0
            } updates)`
          );
          return parsed;
        }
      } catch (error) {
        console.warn("Failed to load observer data from localStorage:", error);
      }

      return null;
    },

    mergeObserverData: (newData: ObserverData) => {
      const { observerData } = get();

      if (!observerData) {
        get().setObserverData(newData);
        return;
      }

      // Merge observer updates, avoiding duplicates
      const existingUpdates = observerData.observerUpdates || [];
      const newUpdates = newData.observerUpdates || [];

      const existingTimestamps = new Set(
        existingUpdates.map((u) => `${u.timestamp}-${u.playerId}-${u.type}`)
      );

      const uniqueNewUpdates = newUpdates.filter(
        (update) =>
          !existingTimestamps.has(
            `${update.timestamp}-${update.playerId}-${update.type}`
          )
      );

      const mergedUpdates = [...existingUpdates, ...uniqueNewUpdates]
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .slice(-100); // Keep last 100

      const mergedData: ObserverData = {
        ...newData,
        observerUpdates: mergedUpdates,
        suspicionMatrix: {
          ...observerData.suspicionMatrix,
          ...newData.suspicionMatrix,
        },
        gameAnalytics: {
          ...observerData.gameAnalytics,
          ...newData.gameAnalytics,
        },
        phaseHistory: [
          ...(observerData.phaseHistory || []),
          ...(newData.phaseHistory || []),
        ].slice(-20), // Keep last 20 phases
        lastUpdated: new Date().toISOString(),
        roomCode: get().roomCode || newData.roomCode,
      };

      set({ observerData: mergedData });

      console.log(
        `🔄 Merged observer data: ${uniqueNewUpdates.length} new updates`
      );
    },

    clearObserverStorage: (roomCode?: string) => {
      if (roomCode) {
        try {
          const storageKey = getObserverStorageKey(roomCode);
          localStorage.removeItem(storageKey);
          console.log(`🗑️ Cleared observer storage for room ${roomCode}`);
        } catch (error) {
          console.warn("Failed to clear observer storage:", error);
        }
      } else {
        // Clear all observer storage
        try {
          const keys = Object.keys(localStorage).filter((key) =>
            key.startsWith("observer_data_")
          );
          keys.forEach((key) => localStorage.removeItem(key));
          console.log(
            `🗑️ Cleared all observer storage (${keys.length} entries)`
          );
        } catch (error) {
          console.warn("Failed to clear all observer storage:", error);
        }
      }
    },

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

    getObserverUpdatesByPhase: (phase) => {
      const { observerData } = get();
      if (!observerData?.observerUpdates) return [];

      return observerData.observerUpdates.filter(
        (update) => update.phase === phase
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

    getObserverUpdateStats: () => {
      const { observerData } = get();
      if (!observerData?.observerUpdates) return {};

      const stats: Record<string, number> = {};
      observerData.observerUpdates.forEach((update) => {
        stats[update.type] = (stats[update.type] || 0) + 1;
      });

      return stats;
    },
  }))
);

// FIXED: Subscribe to changes for persistence and side effects
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

// FIXED: Subscribe to observer data changes for auto-save
useGameStore.subscribe(
  (state) => state.observerData,
  (observerData) => {
    const state = useGameStore.getState();
    if (
      observerData &&
      state.isObserver &&
      state.observerPersistenceEnabled &&
      state.roomCode
    ) {
      // Debounced save to avoid excessive localStorage writes
      setTimeout(() => {
        state.saveObserverDataToStorage();
      }, 500);
    }
  }
);

// FIXED: Initialize store from localStorage with enhanced observer support
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
      localStorage.removeItem("currentPlayer");
    }
  }

  const observerMode = localStorage.getItem("observerMode");
  if (observerMode) {
    try {
      useGameStore.getState().setObserver(JSON.parse(observerMode));
    } catch (error) {
      console.warn("Failed to restore observer mode from localStorage");
      localStorage.removeItem("observerMode");
    }
  }

  // FIXED: Cleanup old observer data on startup (older than 24 hours)
  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("observer_data_")
    );

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    keys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const lastUpdated = new Date(data.lastUpdated || 0).getTime();

        if (lastUpdated < oneDayAgo) {
          localStorage.removeItem(key);
          console.log(`🧹 Cleaned up old observer data: ${key}`);
        }
      } catch (error) {
        // Remove corrupted data
        localStorage.removeItem(key);
        console.log(`🧹 Removed corrupted observer data: ${key}`);
      }
    });
  } catch (error) {
    console.warn("Failed to cleanup old observer data:", error);
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

// FIXED: Enhanced hook for observer updates with real-time updates and filtering
export const useObserverUpdates = (
  type?: string,
  count = 10,
  phase?: string
) => {
  return useGameStore((state) => {
    if (!state.observerData?.observerUpdates) return [];

    let updates = state.observerData.observerUpdates;

    if (type) {
      updates = updates.filter((update) => update.type === type);
    }

    if (phase) {
      updates = updates.filter((update) => update.phase === phase);
    }

    return updates.slice(-count).reverse(); // Most recent first
  });
};

// Hook for player suspicion/trust levels
export const usePlayerSuspicion = (playerId: string) => {
  return useGameStore((state) => ({
    suspicion: state.getSuspicionLevel(playerId),
    trust: state.getTrustLevel(playerId),
  }));
};

// FIXED: Hook for observer update statistics
export const useObserverUpdateStats = () => {
  return useGameStore((state) => state.getObserverUpdateStats());
};

// FIXED: Hook for observer persistence status
export const useObserverPersistence = () => {
  return useGameStore((state) => ({
    isEnabled: state.observerPersistenceEnabled,
    lastSync: state.lastObserverSync,
    hasStoredData: !!state.observerData?.observerUpdates?.length,
    roomCode: state.roomCode,
  }));
};

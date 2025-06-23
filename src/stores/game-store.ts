// src/stores/game-store.ts
import { create } from "zustand";
import { GameState, Player } from "@/types/game";

interface GameStore {
  gameState: GameState | null;
  currentPlayer: Player | null;
  setGameState: (gameState: GameState) => void;
  setCurrentPlayer: (player: Player) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  currentPlayer: null,
  setGameState: (gameState) => set({ gameState }),
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  clearGame: () => set({ gameState: null, currentPlayer: null }),
}));

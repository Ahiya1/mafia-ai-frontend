// src/types/game.ts
export interface Player {
  id: string;
  name: string;
  type: "human" | "ai";
  role?: "mafia_leader" | "mafia_member" | "healer" | "citizen";
  isAlive: boolean;
  isReady: boolean;
  model?: string; // AI model for AI players
  votedFor?: string;
  lastActive: string; // ISO date
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
  gameConfig?: GameConfig;
}

export interface Vote {
  id?: string;
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

export interface GameConfig {
  maxPlayers: number;
  aiCount: number;
  humanCount: number;
  nightPhaseDuration: number; // 90 seconds
  discussionPhaseDuration: number; // 300 seconds
  votingPhaseDuration: number; // 120 seconds
  revelationPhaseDuration: number; // 10 seconds
  speakingTimePerPlayer: number; // 35 seconds
  allowSpectators: boolean;
  premiumModelsEnabled: boolean;
}

export interface RoomInfo {
  id: string;
  code: string;
  playerCount: number;
  maxPlayers: number;
  gameInProgress: boolean;
  createdAt: string;
}

export interface GameAction {
  type:
    | "START_GAME"
    | "SEND_MESSAGE"
    | "CAST_VOTE"
    | "NIGHT_ACTION"
    | "READY_UP";
  playerId?: string;
  content?: string;
  targetId?: string;
  reasoning?: string;
  action?: string;
}

export interface ServerStats {
  totalPlayers: number;
  activeGames: number;
  totalRooms: number;
}

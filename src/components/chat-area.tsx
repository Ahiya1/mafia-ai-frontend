// src/components/chat-area.tsx - FIXED: Enhanced Observer Support with Visual Distinction
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Eye,
  Brain,
  Shield,
  Skull,
  MessageSquare,
  Filter,
  Users,
  Clock,
  Crown,
  Zap,
  AlertTriangle,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Message, Player } from "@/types/game";
import { useSocket } from "@/lib/socket-context";

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

interface ChatAreaProps {
  messages: Message[];
  players: Player[];
  gamePhase?: string;
  canSendMessage: boolean;
  onSendMessage?: (content: string) => void;
  observerMode?: boolean;
  observerUpdates?: ObserverUpdate[];
}

type MessageFilter = "all" | "discussion" | "observer" | "system";

// FIXED: Enhanced message type for unified display
interface UnifiedMessage {
  id: string;
  type: "regular" | "observer" | "system" | "phase_separator";
  content: string;
  timestamp: Date;
  playerId?: string;
  playerName?: string;
  playerType?: string;
  playerRole?: string;
  playerModel?: string;
  phase?: string;
  round?: number;
  observerType?: string;
  messageType?:
    | "discussion"
    | "vote"
    | "action"
    | "system"
    | "phase_transition";
  isObserverUpdate?: boolean;
  context?: any;
}

export function ChatArea({
  messages,
  players,
  gamePhase,
  canSendMessage,
  onSendMessage,
  observerMode = false,
  observerUpdates = [],
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageFilter, setMessageFilter] = useState<MessageFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [observerTypeFilters, setObserverTypeFilters] = useState({
    mafia_chat: true,
    healer_thoughts: true,
    ai_reasoning: true,
    private_action: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const emojis = [
    "😀",
    "😂",
    "🤔",
    "😱",
    "🤨",
    "😠",
    "👍",
    "👎",
    "❤️",
    "💀",
    "🕵️‍♂️",
    "🎯",
    "🔍",
    "⚡",
    "🎭",
    "👑",
    "🔥",
    "💎",
    "⭐",
    "🌟",
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, observerUpdates, autoScroll]);

  // Handle manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom !== autoScroll) {
      setAutoScroll(isNearBottom);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !canSendMessage || !onSendMessage) return;

    onSendMessage(newMessage);
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || "Unknown";
  };

  const formatTime = (timestamp: string | Date) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // FIXED: Convert all messages to unified format for better sorting and display
  const convertToUnifiedMessages = (): UnifiedMessage[] => {
    const unified: UnifiedMessage[] = [];

    // Add regular messages
    if (messageFilter === "all" || messageFilter === "discussion") {
      messages.forEach((message) => {
        const player = players.find((p) => p.id === message.playerId);

        // FIXED: Handle phase separators - check for phase_transition messageType
        if (
          message.messageType === "phase_transition" ||
          message.content?.includes("--- ")
        ) {
          unified.push({
            id: message.id || `phase-${message.timestamp}`,
            type: "phase_separator",
            content: message.content,
            timestamp: new Date(message.timestamp),
            phase: message.phase,
            round: (message as any).round,
            messageType: "phase_transition",
          });
        } else {
          unified.push({
            id: message.id || `msg-${message.timestamp}`,
            type: message.messageType === "system" ? "system" : "regular",
            content: message.content,
            timestamp: new Date(message.timestamp),
            playerId: message.playerId,
            playerName: player?.name || getPlayerName(message.playerId),
            playerType: player?.type,
            playerRole: player?.role,
            playerModel: player?.model,
            phase: message.phase,
            messageType: message.messageType,
          });
        }
      });
    }

    // Add observer updates if in observer mode
    if (
      observerMode &&
      (messageFilter === "all" || messageFilter === "observer")
    ) {
      observerUpdates.forEach((update, index) => {
        // Check if this observer type is enabled in filters
        if (
          !observerTypeFilters[update.type as keyof typeof observerTypeFilters]
        ) {
          return;
        }

        const player = players.find((p) => p.id === update.playerId);

        unified.push({
          id: `obs-${update.timestamp}-${index}`,
          type: "observer",
          content: update.content,
          timestamp: new Date(update.timestamp),
          playerId: update.playerId,
          playerName:
            update.playerName || player?.name || getPlayerName(update.playerId),
          playerType: update.playerType || player?.type,
          playerRole: update.playerRole || player?.role,
          playerModel: update.playerModel || player?.model,
          phase: update.phase,
          round: update.round,
          observerType: update.type,
          isObserverUpdate: true,
          context: update.context,
        });
      });
    }

    // Sort by timestamp
    return unified.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  };

  // FIXED: Enhanced message icon with better visual distinction
  const getMessageIcon = (message: UnifiedMessage) => {
    if (message.type === "phase_separator") {
      return <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />;
    }

    if (message.isObserverUpdate) {
      switch (message.observerType) {
        case "mafia_chat":
          return <Skull className="w-4 h-4 text-red-400" />;
        case "healer_thoughts":
          return <Shield className="w-4 h-4 text-green-400" />;
        case "ai_reasoning":
          return <Brain className="w-4 h-4 text-blue-400" />;
        case "private_action":
          return <Eye className="w-4 h-4 text-purple-400" />;
        default:
          return <Eye className="w-4 h-4 text-gray-400" />;
      }
    } else if (message.type === "system") {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    } else {
      const isAI = message.playerType === "ai";
      const isMafia = message.playerRole?.includes("mafia");
      const isHealer = message.playerRole === "healer";

      if (isMafia) return <Crown className="w-4 h-4 text-red-400" />;
      if (isHealer) return <Shield className="w-4 h-4 text-green-400" />;
      if (isAI) return <Brain className="w-4 h-4 text-blue-400" />;
      return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  // FIXED: Enhanced message styling with better visual hierarchy
  const getMessageStyle = (message: UnifiedMessage) => {
    if (message.type === "phase_separator") {
      return "border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-center py-3 px-4 rounded-lg my-4";
    }

    if (message.isObserverUpdate) {
      switch (message.observerType) {
        case "mafia_chat":
          return "border-l-4 border-red-500 bg-gradient-to-r from-red-500/15 to-red-500/5 pl-4 pr-3 py-2";
        case "healer_thoughts":
          return "border-l-4 border-green-500 bg-gradient-to-r from-green-500/15 to-green-500/5 pl-4 pr-3 py-2";
        case "ai_reasoning":
          return "border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/15 to-blue-500/5 pl-4 pr-3 py-2";
        case "private_action":
          return "border-l-4 border-purple-500 bg-gradient-to-r from-purple-500/15 to-purple-500/5 pl-4 pr-3 py-2";
        default:
          return "border-l-4 border-gray-500 bg-gradient-to-r from-gray-500/15 to-gray-500/5 pl-4 pr-3 py-2";
      }
    } else if (message.type === "system") {
      return "border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/15 to-yellow-500/5 pl-4 pr-3 py-2";
    } else {
      // Style based on player role for regular messages
      const isMafia = message.playerRole?.includes("mafia");
      const isHealer = message.playerRole === "healer";

      if (isMafia) {
        return "border-l-4 border-red-600 bg-gradient-to-r from-red-600/10 to-gray-800/50 pl-4 pr-3 py-2";
      } else if (isHealer) {
        return "border-l-4 border-green-600 bg-gradient-to-r from-green-600/10 to-gray-800/50 pl-4 pr-3 py-2";
      } else {
        return "border-l-4 border-gray-600 bg-gradient-to-r from-gray-600/10 to-gray-800/50 pl-4 pr-3 py-2";
      }
    }
  };

  // FIXED: Enhanced message label with role and model information
  const getMessageLabel = (message: UnifiedMessage) => {
    if (message.type === "phase_separator") {
      return message.content;
    }

    if (message.isObserverUpdate) {
      const typeLabels = {
        mafia_chat: "🔴 Mafia Chat",
        healer_thoughts: "🟢 Healer Thoughts",
        ai_reasoning: "🔵 AI Reasoning",
        private_action: "🟣 Private Action",
      };

      const typeLabel =
        typeLabels[message.observerType as keyof typeof typeLabels] ||
        "👁️ Observer";
      const playerInfo = message.playerName || "Unknown";
      const modelInfo = message.playerModel ? ` (${message.playerModel})` : "";

      return `${typeLabel} • ${playerInfo}${modelInfo}`;
    } else if (message.type === "system") {
      return "🎮 System";
    } else {
      const playerName = message.playerName || "Unknown";
      const roleEmoji = message.playerRole?.includes("mafia")
        ? "👑"
        : message.playerRole === "healer"
        ? "🛡️"
        : message.playerType === "ai"
        ? "🤖"
        : "👤";
      const modelInfo = message.playerModel ? ` (${message.playerModel})` : "";

      return `${roleEmoji} ${playerName}${modelInfo}`;
    }
  };

  const getMessageContent = (message: UnifiedMessage) => {
    if (message.type === "phase_separator") {
      return null; // Content is already in the label
    }
    return message.content;
  };

  const filteredMessages = convertToUnifiedMessages();

  // FIXED: Enhanced filter options with observer type controls
  const filterOptions = [
    {
      id: "all",
      label: "All",
      icon: MessageSquare,
      count: filteredMessages.length,
    },
    {
      id: "discussion",
      label: "Discussion",
      icon: Users,
      count: filteredMessages.filter(
        (m) => !m.isObserverUpdate && m.type !== "phase_separator"
      ).length,
    },
  ];

  if (observerMode) {
    filterOptions.push({
      id: "observer",
      label: "Observer",
      icon: Eye,
      count: filteredMessages.filter((m) => m.isObserverUpdate).length,
    });
  }

  const toggleObserverTypeFilter = (type: keyof typeof observerTypeFilters) => {
    setObserverTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const observerTypeLabels = {
    mafia_chat: { label: "Mafia Chat", icon: Skull, color: "text-red-400" },
    healer_thoughts: {
      label: "Healer Thoughts",
      icon: Shield,
      color: "text-green-400",
    },
    ai_reasoning: {
      label: "AI Reasoning",
      icon: Brain,
      color: "text-blue-400",
    },
    private_action: {
      label: "Private Actions",
      icon: Eye,
      color: "text-purple-400",
    },
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* FIXED: Enhanced Header with Filter Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-white">
            {observerMode ? "Game Chat & Observer Feed" : "Game Chat"}
          </span>
          {gamePhase && (
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {gamePhase.replace("_", " ").toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Message Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setMessageFilter(option.id as MessageFilter)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all duration-200 ${
                  messageFilter === option.id
                    ? "bg-purple-500/20 text-purple-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <option.icon className="w-3 h-3" />
                {option.label}
                <span className="text-xs bg-gray-600/50 px-1 rounded">
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* Observer Type Filters */}
          {observerMode && messageFilter === "observer" && (
            <div className="relative">
              <button
                onClick={() => setShowFilterSettings(!showFilterSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilterSettings
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-gray-800 text-gray-400 hover:text-gray-300"
                }`}
                title="Observer Filter Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showFilterSettings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg p-3 z-20 w-48"
                  >
                    <div className="text-xs font-medium text-gray-300 mb-2">
                      Observer Types
                    </div>
                    {Object.entries(observerTypeLabels).map(
                      ([type, config]) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-700/50 rounded px-1"
                        >
                          <input
                            type="checkbox"
                            checked={
                              observerTypeFilters[
                                type as keyof typeof observerTypeFilters
                              ]
                            }
                            onChange={() =>
                              toggleObserverTypeFilter(
                                type as keyof typeof observerTypeFilters
                              )
                            }
                            className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                          />
                          <config.icon className={`w-3 h-3 ${config.color}`} />
                          <span className="text-xs text-gray-300">
                            {config.label}
                          </span>
                        </label>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg transition-colors ${
              autoScroll
                ? "text-green-400 hover:text-green-300"
                : "text-gray-400 hover:text-gray-300"
            }`}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          >
            <motion.div
              animate={{ rotate: autoScroll ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className={`message rounded-lg transition-all duration-200 hover:shadow-sm ${getMessageStyle(
                message
              )}`}
            >
              {message.type === "phase_separator" ? (
                <div className="flex items-center justify-center gap-2 font-semibold text-yellow-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                  {getMessageLabel(message)}
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    {getMessageIcon(message)}
                    <span className="font-semibold text-sm text-white">
                      {getMessageLabel(message)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.round && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-600/50 text-gray-300 rounded">
                        R{message.round}
                      </span>
                    )}
                    {message.phase && (
                      <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                        {message.phase}
                      </span>
                    )}
                  </div>
                  {getMessageContent(message) && (
                    <div className="text-gray-200 break-words leading-relaxed">
                      {getMessageContent(message)}
                    </div>
                  )}
                  {message.context && (
                    <div className="mt-2 text-xs text-gray-500 border-t border-gray-600/30 pt-2">
                      Context: {message.context.alivePlayers} players alive •
                      Phase: {message.context.phase}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">
              {messageFilter === "observer"
                ? "Observer updates will appear here during the game"
                : messageFilter === "discussion"
                ? "Chat messages will appear here when players speak"
                : "All game messages and updates will appear here"}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800/30">
        {canSendMessage && onSendMessage ? (
          <div className="space-y-3">
            {/* Input Area */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message... (${
                    gamePhase || "waiting"
                  })`}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  rows={2}
                  maxLength={500}
                />

                {/* Emoji Picker Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-3 p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Add Emoji"
                >
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-10 shadow-lg"
                    >
                      <div className="grid grid-cols-10 gap-2">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-lg transition-colors hover:scale-110 transform"
                            title={`Add ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="btn-detective px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>

            {/* Character Count & Status */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {gamePhase === "discussion" ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>🎤 Your turn to speak</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>
                      💬 {gamePhase?.replace("_", " ") || "waiting"} phase
                    </span>
                  </>
                )}
              </div>
              <div
                className={`${
                  newMessage.length > 450
                    ? "text-yellow-400"
                    : newMessage.length > 480
                    ? "text-red-400"
                    : ""
                }`}
              >
                {newMessage.length}/500 characters
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {observerMode
                  ? "Observing game - chat disabled"
                  : gamePhase === "discussion"
                  ? "Wait for your turn to speak"
                  : gamePhase === "voting"
                  ? "Voting phase - use voting panel"
                  : gamePhase === "night"
                  ? "Night phase - use action panel"
                  : "Chat not available"}
              </span>
            </div>
            {!observerMode && gamePhase === "discussion" && (
              <div className="text-xs text-gray-600">
                You'll be notified when it's your turn to contribute to the
                discussion
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

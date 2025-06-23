// src/components/chat-area.tsx - Enhanced with Observer Support
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
} from "lucide-react";
import { Message, Player } from "@/types/game";
import { useSocket } from "@/lib/socket-context";

interface ObserverUpdate {
  type: "mafia_chat" | "healer_thoughts" | "private_action" | "ai_reasoning";
  content: string;
  playerId: string;
  timestamp: string;
  phase: string;
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

  // Combine and filter messages
  const getAllMessages = () => {
    const combinedMessages: Array<
      Message | (ObserverUpdate & { isObserverUpdate: true })
    > = [];

    // Add regular messages
    if (messageFilter === "all" || messageFilter === "discussion") {
      messages.forEach((message) => {
        combinedMessages.push(message);
      });
    }

    // Add observer updates if in observer mode
    if (
      observerMode &&
      (messageFilter === "all" || messageFilter === "observer")
    ) {
      observerUpdates.forEach((update) => {
        combinedMessages.push({
          ...update,
          isObserverUpdate: true,
        });
      });
    }

    // Sort by timestamp
    return combinedMessages.sort((a, b) => {
      const getTimestamp = (
        msg: Message | (ObserverUpdate & { isObserverUpdate: true })
      ) => {
        if ("isObserverUpdate" in msg) {
          return msg.timestamp;
        } else {
          return (msg as Message).timestamp;
        }
      };
      const timeA = new Date(getTimestamp(a)).getTime();
      const timeB = new Date(getTimestamp(b)).getTime();
      return timeA - timeB;
    });
  };

  const getMessageIcon = (message: any) => {
    if ("isObserverUpdate" in message) {
      switch (message.type) {
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
    } else if (message.messageType === "system") {
      return <MessageSquare className="w-4 h-4 text-yellow-400" />;
    } else {
      const player = players.find((p) => p.id === message.playerId);
      return player?.type === "ai" ? (
        <Brain className="w-4 h-4 text-blue-400" />
      ) : (
        <Users className="w-4 h-4 text-gray-400" />
      );
    }
  };

  const getMessageStyle = (message: any) => {
    if ("isObserverUpdate" in message) {
      switch (message.type) {
        case "mafia_chat":
          return "border-l-4 border-red-500 bg-red-500/10 pl-3";
        case "healer_thoughts":
          return "border-l-4 border-green-500 bg-green-500/10 pl-3";
        case "ai_reasoning":
          return "border-l-4 border-blue-500 bg-blue-500/10 pl-3";
        case "private_action":
          return "border-l-4 border-purple-500 bg-purple-500/10 pl-3";
        default:
          return "border-l-4 border-gray-500 bg-gray-500/10 pl-3";
      }
    } else if (message.messageType === "system") {
      return "border-l-4 border-yellow-500 bg-yellow-500/10 pl-3";
    } else {
      return "border-l-4 border-gray-600 bg-gray-800/50 pl-3";
    }
  };

  const getMessageLabel = (message: any) => {
    if ("isObserverUpdate" in message) {
      switch (message.type) {
        case "mafia_chat":
          return "🔴 Mafia Chat";
        case "healer_thoughts":
          return "🟢 Healer Thoughts";
        case "ai_reasoning":
          return "🔵 AI Reasoning";
        case "private_action":
          return "🟣 Private Action";
        default:
          return "👁️ Observer";
      }
    } else if (message.messageType === "system") {
      return "🎮 System";
    } else {
      return getPlayerName(message.playerId);
    }
  };

  const getMessageContent = (message: any) => {
    if ("isObserverUpdate" in message) {
      return message.content;
    } else {
      return message.content;
    }
  };

  const filteredMessages = getAllMessages();

  const filterOptions = [
    { id: "all", label: "All", icon: MessageSquare },
    { id: "discussion", label: "Discussion", icon: Users },
  ];

  if (observerMode) {
    filterOptions.push({ id: "observer", label: "Observer", icon: Eye });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Filter */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-white">
            {observerMode ? "Game Chat & Observer Feed" : "Game Chat"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Message Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setMessageFilter(option.id as MessageFilter)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  messageFilter === option.id
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <option.icon className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded transition-colors ${
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
              ⬇️
            </motion.div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={`${"isObserverUpdate" in message ? "obs" : "msg"}-${index}-${
                message.timestamp
              }`}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`message p-3 rounded-lg ${getMessageStyle(message)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getMessageIcon(message)}
                <span className="font-semibold text-sm text-white">
                  {getMessageLabel(message)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
                {"isObserverUpdate" in message && (
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    {message.phase}
                  </span>
                )}
              </div>
              <div className="text-gray-200 break-words">
                {getMessageContent(message)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">
              {messageFilter === "observer"
                ? "Observer updates will appear here"
                : "Chat messages will appear here"}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4">
        {canSendMessage && onSendMessage ? (
          <div className="space-y-3">
            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message... (${
                    gamePhase || "waiting"
                  })`}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  rows={2}
                  maxLength={500}
                />

                {/* Emoji Picker Button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-2 p-1 hover:bg-gray-700 rounded transition-colors"
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
                      className="absolute bottom-full right-0 mb-2 glass-card p-3 z-10"
                    >
                      <div className="grid grid-cols-8 gap-2">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-700 rounded text-lg transition-colors"
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
                className="btn-detective px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                {gamePhase === "discussion"
                  ? "🎤 Your turn to speak"
                  : "💬 Discussion phase"}
              </div>
              <div>{newMessage.length}/500 characters</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span>
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
                You'll be notified when it's your turn
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// src/components/chat-area.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile } from "lucide-react";
import { Message, Player } from "@/types/game";
import { useSocket } from "@/lib/socket-context";

interface ChatAreaProps {
  messages: Message[];
  players: Player[];
  gamePhase?: string;
  canSendMessage: boolean;
}

export function ChatArea({
  messages,
  players,
  gamePhase,
  canSendMessage,
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !canSendMessage) return;

    sendMessage(newMessage);
    setNewMessage("");
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`message ${
                message.messageType === "system" ? "system" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {message.messageType === "system"
                    ? "🎮 System"
                    : getPlayerName(message.playerId)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="text-gray-200">{message.content}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4">
        {canSendMessage ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:border-blue-500"
                rows={1}
                maxLength={500}
              />

              {/* Emoji Picker Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-2 p-1 hover:bg-gray-700 rounded"
              >
                <Smile className="w-4 h-4 text-gray-400" />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-full right-0 mb-2 glass-card p-3"
                >
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="p-2 hover:bg-gray-700 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="btn-detective px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            {gamePhase === "discussion"
              ? "Wait for your turn to speak"
              : "Discussion not active"}
          </div>
        )}
      </div>
    </div>
  );
}

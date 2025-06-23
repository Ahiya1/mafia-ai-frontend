// src/components/server-status.tsx
"use client";

import { motion } from "framer-motion";
import { useSocket } from "@/lib/socket-context";

export function ServerStatus() {
  const { isConnected, connectionStatus } = useSocket();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          text: "Online",
          icon: "🟢",
        };
      case "connecting":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          text: "Connecting",
          icon: "🟡",
        };
      case "error":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          text: "Error",
          icon: "🔴",
        };
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          text: "Offline",
          icon: "⚫",
        };
    }
  };

  const status = getStatusInfo();

  return (
    <motion.div
      animate={{ scale: isConnected ? 1 : [1, 1.05, 1] }}
      transition={{
        scale: { duration: 1, repeat: isConnected ? 0 : Infinity },
      }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}
    >
      <span>{status.icon}</span>
      <span className="font-medium text-sm">{status.text}</span>
    </motion.div>
  );
}

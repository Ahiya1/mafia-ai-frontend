// src/app/play/page.tsx - Updated Game Setup Only
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GameSetup } from "@/components/game-setup";
import { useSocket } from "@/lib/socket-context";

export default function PlayPage() {
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for successful room creation/joining
    const handleRoomJoined = (data: any) => {
      // Redirect to the specific game room
      router.push(`/game/${data.roomCode}`);
    };

    const handleRoomCreated = (data: any) => {
      // Redirect to the specific game room
      router.push(`/game/${data.roomCode}`);
    };

    socket.on("room_joined", handleRoomJoined);
    socket.on("room_created", handleRoomCreated);

    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("room_created", handleRoomCreated);
    };
  }, [socket, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <GameSetup onGameStartAction={() => {}} />
    </div>
  );
}

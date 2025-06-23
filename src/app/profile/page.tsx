// src/app/profile/page.tsx - Enhanced Profile Page
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  Crown,
  Shield,
  Star,
  GamepadIcon,
  Edit3,
  Camera,
  Settings,
  Award,
  Activity,
  Clock,
  Users,
  Bot,
  Zap,
  CheckCircle,
  Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "stats" | "achievements" | "settings"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin?redirect=/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="loading-dots justify-center">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "stats",
      name: "Statistics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "achievements",
      name: "Achievements",
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const achievements = [
    {
      id: "first_game",
      name: "First Investigation",
      description: "Complete your first game",
      icon: "🕵️‍♂️",
      unlocked: true,
      unlockedAt: "2024-01-15",
    },
    {
      id: "ai_hunter",
      name: "AI Hunter",
      description: "Correctly identify 10 AI players",
      icon: "🤖",
      unlocked: true,
      progress: 7,
      maxProgress: 10,
    },
    {
      id: "social_master",
      name: "Social Master",
      description: "Win 5 games as a citizen",
      icon: "👥",
      unlocked: false,
      progress: 3,
      maxProgress: 5,
    },
    {
      id: "mafia_boss",
      name: "Mafia Boss",
      description: "Win 3 games as mafia",
      icon: "🕴️",
      unlocked: false,
      progress: 1,
      maxProgress: 3,
    },
    {
      id: "detective_elite",
      name: "Detective Elite",
      description: "Achieve 90%+ voting accuracy",
      icon: "🏆",
      unlocked: false,
      progress: 85,
      maxProgress: 90,
    },
    {
      id: "streak_master",
      name: "Streak Master",
      description: "Win 5 games in a row",
      icon: "🔥",
      unlocked: false,
      progress: 2,
      maxProgress: 5,
    },
  ];

  const recentGames = [
    {
      id: "1",
      result: "win",
      role: "citizen",
      duration: "12m 34s",
      players: 10,
      aiDetected: 3,
      date: "2 hours ago",
    },
    {
      id: "2",
      result: "loss",
      role: "healer",
      duration: "8m 16s",
      players: 8,
      aiDetected: 2,
      date: "5 hours ago",
    },
    {
      id: "3",
      result: "win",
      role: "mafia_member",
      duration: "15m 42s",
      players: 10,
      aiDetected: 4,
      date: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {user.username[0].toUpperCase()}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                {user.role === "creator" && (
                  <Crown className="w-6 h-6 text-orange-400" />
                )}
                {user.packages.length > 0 && (
                  <Star className="w-6 h-6 text-yellow-400" />
                )}
              </div>

              <p className="text-gray-400 mb-4">{user.email}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {user.stats.gamesPlayed}
                  </div>
                  <div className="text-sm text-gray-400">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {user.stats.wins}
                  </div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {Math.round(user.stats.winRate)}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {user.stats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary px-4 py-2 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              <Link
                href="/profile/settings"
                className="btn-detective px-4 py-2 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Recent Activity */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Games
                </h2>

                <div className="space-y-4">
                  {recentGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            game.result === "win"
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                        />
                        <div>
                          <div className="font-medium">
                            {game.result === "win" ? "Victory" : "Defeat"} as{" "}
                            <span className="capitalize">
                              {game.role.replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {game.duration} • {game.players} players •{" "}
                            {game.aiDetected} AI detected
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{game.date}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/profile/stats"
                    className="btn-detective px-6 py-2"
                  >
                    View All Games
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/play"
                  className="glass-card p-6 hover:bg-blue-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <GamepadIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Play Game</h3>
                      <p className="text-sm text-gray-400">
                        Start a new investigation
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/packages"
                  className="glass-card p-6 hover:bg-orange-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Package className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Premium Access</h3>
                      <p className="text-sm text-gray-400">
                        Unlock advanced features
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/leaderboard"
                  className="glass-card p-6 hover:bg-green-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Leaderboard</h3>
                      <p className="text-sm text-gray-400">See your ranking</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(user.stats.aiDetectionRate)}%
                  </div>
                  <div className="text-sm text-gray-400">AI Detection Rate</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {user.stats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-400">Best Streak</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    12m 30s
                  </div>
                  <div className="text-sm text-gray-400">Avg Game Time</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">247</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
              </div>

              {/* Performance by Role */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6">Performance by Role</h2>
                <div className="space-y-4">
                  {[
                    { role: "Citizen", games: 45, wins: 28, winRate: 62 },
                    { role: "Mafia", games: 12, wins: 7, winRate: 58 },
                    { role: "Healer", games: 8, wins: 5, winRate: 63 },
                  ].map((roleStats) => (
                    <div
                      key={roleStats.role}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{roleStats.role}</div>
                        <div className="text-sm text-gray-400">
                          {roleStats.games} games • {roleStats.wins} wins
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${roleStats.winRate}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium w-12">
                          {roleStats.winRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`glass-card p-6 ${
                      achievement.unlocked
                        ? "border-green-500/30 bg-green-500/5"
                        : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          {achievement.unlocked && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {achievement.description}
                        </p>

                        {!achievement.unlocked &&
                          achievement.progress !== undefined && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {achievement.progress}/
                                  {achievement.maxProgress}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (achievement.progress! /
                                        achievement.maxProgress!) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-green-400">
                            Unlocked on{" "}
                            {new Date(
                              achievement.unlockedAt
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="glass-card p-6">
                <p className="text-center text-gray-400">
                  Settings panel coming soon. For now, you can{" "}
                  <Link
                    href="/profile/settings"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    visit the dedicated settings page
                  </Link>
                  .
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

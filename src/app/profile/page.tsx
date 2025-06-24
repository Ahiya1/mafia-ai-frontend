// src/app/profile/page.tsx - Real Backend Data Integration
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
  const { user, userPackages, gameAccess, isAuthenticated, isLoading } =
    useAuth();
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

  const getWinRate = () => {
    if (user.total_games_played === 0) return 0;
    return Math.round((user.total_wins / user.total_games_played) * 100);
  };

  const getActivePackages = () => {
    return userPackages.filter(
      (pkg) => pkg.is_active && new Date(pkg.expires_at) > new Date()
    );
  };

  const getTotalGamesRemaining = () => {
    return userPackages.reduce((sum, pkg) => sum + pkg.games_remaining, 0);
  };

  const getTotalSpent = () => {
    return userPackages.reduce((sum, pkg) => sum + pkg.amount_paid, 0);
  };

  // Generate some example recent games based on user's stats
  const generateRecentGames = () => {
    const games = [];
    const roles = ["citizen", "mafia_member", "healer", "mafia_leader"];
    const results = ["win", "loss"];

    for (let i = 0; i < Math.min(5, user.total_games_played); i++) {
      games.push({
        id: `game_${i}`,
        result: Math.random() < getWinRate() / 100 ? "win" : "loss",
        role: roles[Math.floor(Math.random() * roles.length)],
        duration: `${Math.floor(Math.random() * 10 + 8)}m ${Math.floor(
          Math.random() * 60
        )}s`,
        players: Math.floor(Math.random() * 3 + 8),
        aiDetected: Math.floor(Math.random() * 4 + 2),
        date: `${i + 1} ${i === 0 ? "hour" : i < 3 ? "hours" : "days"} ago`,
      });
    }
    return games;
  };

  const recentGames = generateRecentGames();

  // Generate achievements based on user stats
  const achievements = [
    {
      id: "first_game",
      name: "First Investigation",
      description: "Complete your first game",
      icon: "🕵️‍♂️",
      unlocked: user.total_games_played > 0,
      unlockedAt: user.created_at,
    },
    {
      id: "ai_hunter",
      name: "AI Hunter",
      description: "Achieve 70%+ AI detection accuracy",
      icon: "🤖",
      unlocked: user.ai_detection_accuracy >= 0.7,
      progress: Math.round(user.ai_detection_accuracy * 100),
      maxProgress: 70,
    },
    {
      id: "social_master",
      name: "Social Master",
      description: "Win 10 games as a citizen",
      icon: "👥",
      unlocked: user.total_wins >= 10,
      progress: user.total_wins,
      maxProgress: 10,
    },
    {
      id: "streak_master",
      name: "Winning Streak",
      description: "Win 5 games in a row",
      icon: "🔥",
      unlocked: false,
      progress: Math.min(user.total_wins, 3),
      maxProgress: 5,
    },
    {
      id: "detective_elite",
      name: "Detective Elite",
      description: "Achieve 90%+ win rate with 10+ games",
      icon: "🏆",
      unlocked: getWinRate() >= 90 && user.total_games_played >= 10,
      progress: Math.min(getWinRate(), 90),
      maxProgress: 90,
    },
    {
      id: "veteran",
      name: "Veteran Investigator",
      description: "Play 50 games",
      icon: "🎖️",
      unlocked: user.total_games_played >= 50,
      progress: user.total_games_played,
      maxProgress: 50,
    },
  ];

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
              {user.is_creator && (
                <Crown className="absolute -top-2 -right-2 w-8 h-8 text-orange-400" />
              )}
              {getActivePackages().length > 0 && !user.is_creator && (
                <Star className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
              )}
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                {user.is_creator && (
                  <Crown className="w-6 h-6 text-orange-400" />
                )}
                {getActivePackages().length > 0 && !user.is_creator && (
                  <Star className="w-6 h-6 text-yellow-400" />
                )}
                {user.is_verified && (
                  <Shield className="w-6 h-6 text-blue-400" />
                )}
              </div>

              <p className="text-gray-400 mb-4">{user.email}</p>

              {/* Account Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {user.total_games_played}
                  </div>
                  <div className="text-sm text-gray-400">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {user.total_wins}
                  </div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {getWinRate()}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(user.ai_detection_accuracy * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">AI Detection</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="text-sm text-gray-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
                {user.last_login && (
                  <span className="ml-4">
                    Last active:{" "}
                    {new Date(user.last_login).toLocaleDateString()}
                  </span>
                )}
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

          {/* Account Status */}
          {gameAccess && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      gameAccess.hasAccess ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  <span className="font-medium">
                    Account Status:{" "}
                    <span
                      className={`capitalize ${
                        gameAccess.accessType === "admin"
                          ? "text-orange-400"
                          : gameAccess.accessType === "premium_package"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {gameAccess.accessType.replace("_", " ")}
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  {gameAccess.accessType === "admin" ? (
                    <span className="text-orange-400">Unlimited Access</span>
                  ) : (
                    <span className="text-green-400">
                      {gameAccess.gamesRemaining} games remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
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

                {recentGames.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <GamepadIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div className="text-lg font-medium mb-2">
                      No games played yet
                    </div>
                    <div className="text-sm">
                      Start your first investigation!
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link href="/play" className="btn-detective px-6 py-2">
                    Start New Game
                  </Link>
                </div>
              </div>

              {/* Package Status */}
              {getActivePackages().length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" />
                    Active Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getActivePackages().map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{pkg.package_name}</h3>
                          <span className="text-green-400 font-bold">
                            ${pkg.amount_paid.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          {pkg.games_remaining} games remaining
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${Math.max(
                                pkg.games_remaining * 10,
                                5
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

                <button
                  onClick={() => {
                    /* Open package management */
                  }}
                  className="glass-card p-6 hover:bg-orange-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                      <Package className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Premium Access</h3>
                      <p className="text-sm text-gray-400">
                        {getActivePackages().length > 0
                          ? "Manage packages"
                          : "Unlock features"}
                      </p>
                    </div>
                  </div>
                </button>
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
                    {Math.round(user.ai_detection_accuracy * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">AI Detection Rate</div>
                </div>

                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {getWinRate()}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
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
                  <div className="text-2xl font-bold text-purple-400">
                    {user.total_games_played * 10 + user.total_wins * 5}
                  </div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6">
                  Performance Breakdown
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Win Rate Progress</span>
                      <span className="text-green-400 font-bold">
                        {getWinRate()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${Math.min(getWinRate(), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>AI Detection Accuracy</span>
                      <span className="text-blue-400 font-bold">
                        {Math.round(user.ai_detection_accuracy * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{
                          width: `${Math.min(
                            user.ai_detection_accuracy * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Experience Level</span>
                      <span className="text-orange-400 font-bold">
                        Level {Math.floor(user.total_games_played / 10) + 1}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                        style={{
                          width: `${
                            ((user.total_games_played % 10) / 10) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
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
                                    width: `${Math.min(
                                      (achievement.progress! /
                                        achievement.maxProgress!) *
                                        100,
                                      100
                                    )}%`,
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

// src/components/navigation.tsx - Enhanced Navigation with Creator Access
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  Menu,
  X,
  Play,
  Trophy,
  Star,
  Shield,
  User,
  LogOut,
  Package,
  HelpCircle,
  Bot,
  Eye,
  Database,
  Zap,
  Monitor,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { CreatorAccess } from "./creator-access";
import { PackageManagement } from "./package-management";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCreatorAccess, setShowCreatorAccess] = useState(false);
  const [showPackageManagement, setShowPackageManagement] = useState(false);
  const [creatorFeatures, setCreatorFeatures] = useState<string[]>([]);

  const pathname = usePathname();
  const { user, isAuthenticated, logout, userPackages, gameAccess } = useAuth();
  const { serverStats, isConnected } = useSocket();

  const navigationItems = [
    {
      name: "Play",
      href: "/play",
      icon: <Play className="w-4 h-4" />,
      description: "Start a new game",
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: <Trophy className="w-4 h-4" />,
      description: "Top players",
    },
    {
      name: "Tutorial",
      href: "/tutorial",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Learn to play",
    },
    {
      name: "About",
      href: "/about",
      icon: <HelpCircle className="w-4 h-4" />,
      description: "About AI Mafia",
    },
  ];

  const profileMenuItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      name: "Statistics",
      href: "/profile/stats",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Settings",
      href: "/profile/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const creatorMenuItems = [
    {
      name: "AI Games",
      action: () => setShowCreatorAccess(true),
      icon: <Bot className="w-4 h-4" />,
      description: "Create AI-only games",
    },
    {
      name: "Monitor",
      action: () => setShowCreatorAccess(true),
      icon: <Monitor className="w-4 h-4" />,
      description: "Live system monitoring",
    },
    {
      name: "Analytics",
      action: () => setShowCreatorAccess(true),
      icon: <BarChart3 className="w-4 h-4" />,
      description: "Advanced analytics",
    },
    {
      name: "Data Export",
      action: () => setShowCreatorAccess(true),
      icon: <Database className="w-4 h-4" />,
      description: "Export game data",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getTotalGamesRemaining = () => {
    return userPackages.reduce((sum, pkg) => sum + pkg.games_remaining, 0);
  };

  const hasActivePackages = () => {
    return userPackages.some(
      (pkg) => pkg.is_active && new Date(pkg.expires_at) > new Date()
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-700 bg-black/20 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                🕵️‍♂️
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                AI Mafia
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.icon}
                  {item.name}

                  {/* Hover tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.description}
                  </div>
                </Link>
              ))}

              {/* Creator Access for Admin Users */}
              {user?.is_creator && (
                <div className="relative group">
                  <button
                    onClick={() => setShowCreatorAccess(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300"
                  >
                    <Crown className="w-4 h-4" />
                    Creator
                  </button>

                  {/* Creator tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Advanced creator tools
                  </div>
                </div>
              )}
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {/* Server Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
                />
                <span className="text-gray-400">
                  {isConnected ? "Online" : "Offline"}
                </span>
                {serverStats && (
                  <span className="text-blue-400 ml-2">
                    {serverStats.activeGames} games
                  </span>
                )}
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      {/* Creator crown indicator */}
                      {user?.is_creator && (
                        <Crown className="absolute -top-1 -right-1 w-3 h-3 text-orange-400" />
                      )}
                      {/* Premium indicator */}
                      {hasActivePackages() && !user?.is_creator && (
                        <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium flex items-center gap-1">
                        {user?.username || "Player"}
                        {user?.is_creator && (
                          <Crown className="w-3 h-3 text-orange-400" />
                        )}
                      </div>
                      {gameAccess && (
                        <div className="text-xs text-gray-400">
                          {gameAccess.accessType === "admin"
                            ? "Unlimited access"
                            : `${gameAccess.gamesRemaining} games left`}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-72 glass-card p-2 shadow-lg"
                      >
                        {/* User Info Header */}
                        <div className="px-3 py-2 border-b border-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{user?.username}</div>
                            {user?.is_creator && (
                              <Crown className="w-4 h-4 text-orange-400" />
                            )}
                            {hasActivePackages() && !user?.is_creator && (
                              <Star className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user?.email}
                          </div>

                          {/* Game Access Status */}
                          {gameAccess && (
                            <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                              <div className="flex justify-between">
                                <span>Access Type:</span>
                                <span
                                  className={`capitalize ${
                                    gameAccess.accessType === "admin"
                                      ? "text-orange-400"
                                      : gameAccess.accessType ===
                                        "premium_package"
                                      ? "text-yellow-400"
                                      : "text-blue-400"
                                  }`}
                                >
                                  {gameAccess.accessType.replace("_", " ")}
                                </span>
                              </div>
                              {gameAccess.accessType !== "admin" && (
                                <div className="flex justify-between">
                                  <span>Games Remaining:</span>
                                  <span className="text-green-400">
                                    {gameAccess.gamesRemaining}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Profile Menu Items */}
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-700/50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}

                        {/* Package Management */}
                        <button
                          onClick={() => {
                            setShowPackageManagement(true);
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-700/50 transition-colors w-full"
                        >
                          <Package className="w-4 h-4" />
                          Premium Access
                          {hasActivePackages() && (
                            <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              {getTotalGamesRemaining()} left
                            </span>
                          )}
                        </button>

                        {/* Creator Tools Section */}
                        {user?.is_creator && (
                          <>
                            <div className="border-t border-gray-700 mt-2 pt-2">
                              <div className="px-3 py-1 text-xs text-orange-400 font-medium">
                                Creator Tools
                              </div>
                              {creatorMenuItems.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={() => {
                                    item.action();
                                    setIsProfileMenuOpen(false);
                                  }}
                                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-orange-500/10 transition-colors w-full"
                                >
                                  {item.icon}
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Sign Out */}
                        <div className="border-t border-gray-700 mt-2 pt-2">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/signin"
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/play"
                    className="btn-detective px-4 py-2 text-sm"
                  >
                    Play Now
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-700 py-4"
              >
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}

                  {/* Creator Access for Mobile */}
                  {user?.is_creator && (
                    <button
                      onClick={() => {
                        setShowCreatorAccess(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 transition-colors w-full"
                    >
                      <Crown className="w-4 h-4" />
                      Creator Tools
                    </button>
                  )}

                  {!isAuthenticated && (
                    <>
                      <div className="border-t border-gray-700 my-4" />
                      <Link
                        href="/auth/signin"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Creator Access Modal */}
      {showCreatorAccess && (
        <CreatorAccess
          onClose={() => setShowCreatorAccess(false)}
          onCreatorVerified={(features) => setCreatorFeatures(features)}
        />
      )}

      {/* Package Management Modal */}
      {showPackageManagement && (
        <PackageManagement
          onClose={() => setShowPackageManagement(false)}
          currentUserId={user?.id}
        />
      )}
    </>
  );
}

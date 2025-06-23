// src/components/navigation.tsx - Enhanced Navigation
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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
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
      name: "Premium",
      href: "/packages",
      icon: <Package className="w-4 h-4" />,
    },
    {
      name: "Settings",
      href: "/profile/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.username || "Player"}
                  </span>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-lg"
                    >
                      <div className="px-3 py-2 border-b border-gray-700 mb-2">
                        <div className="font-medium">{user?.username}</div>
                        <div className="text-sm text-gray-400">
                          {user?.email}
                        </div>
                      </div>

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
                <Link href="/play" className="btn-detective px-4 py-2 text-sm">
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
  );
}

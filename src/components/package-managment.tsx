// src/components/package-management.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crown,
  Zap,
  Star,
  Users,
  Bot,
  BarChart3,
  Gamepad2,
  Shield,
  Download,
  Clock,
  Check,
  Gift,
  CreditCard,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

interface PackageManagementProps {
  onClose: () => void;
  currentUserId?: string;
}

interface UserPackage {
  id: string;
  name: string;
  gamesRemaining: number;
  totalGames: number;
  expiresAt: string;
  features: string[];
  premiumModelsEnabled: boolean;
}

interface AvailablePackage {
  id: string;
  name: string;
  price: number;
  games: number;
  duration: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

export function PackageManagement({
  onClose,
  currentUserId,
}: PackageManagementProps) {
  const [activeTab, setActiveTab] = useState<"current" | "store" | "history">(
    "current"
  );
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const availablePackages: AvailablePackage[] = [
    {
      id: "starter",
      name: "Starter Package",
      price: 5.0,
      games: 10,
      duration: "3 months",
      features: [
        "10 games with premium AI models",
        "Advanced post-game analytics",
        "Ad-free experience",
        "Basic AI behavior insights",
      ],
    },
    {
      id: "social",
      name: "Social Package",
      price: 10.0,
      games: 25,
      duration: "3 months",
      recommended: true,
      savings: "Save 20%",
      features: [
        "25 games with premium AI models",
        "Enhanced analytics dashboard",
        "Game recording & replay",
        "Custom room creation",
        "Priority matchmaking",
        "Detailed AI personality insights",
      ],
    },
    {
      id: "pro",
      name: "Pro Package",
      price: 20.0,
      games: 60,
      duration: "6 months",
      savings: "Save 40%",
      features: [
        "60 games with premium AI models",
        "Complete analytics suite",
        "Data export capabilities",
        "Advanced room configuration",
        "Research-grade insights",
        "Priority support",
      ],
    },
  ];

  useEffect(() => {
    fetchUserPackages();
  }, [currentUserId]);

  const fetchUserPackages = async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/packages`,
        {
          headers: {
            Authorization: `Bearer ${currentUserId}`, // In real app, use proper auth token
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch user packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePackage = async (packageId: string) => {
    setIsPurchasing(packageId);

    try {
      // In a real implementation, this would integrate with PayPal
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            packageId,
            userId: currentUserId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Simulate PayPal redirect
        if (data.paypalUrl) {
          window.open(data.paypalUrl, "_blank");
          toast.success("Redirecting to PayPal for secure payment...", {
            duration: 5000,
          });
        }

        // Refresh packages after purchase
        setTimeout(() => {
          fetchUserPackages();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to initiate purchase");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to process purchase");
    } finally {
      setIsPurchasing(null);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days remaining`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours remaining`;
  };

  const tabs = [
    {
      id: "current",
      name: "My Packages",
      icon: <Package className="w-5 h-5" />,
    },
    { id: "store", name: "Store", icon: <Crown className="w-5 h-5" /> },
    {
      id: "history",
      name: "Purchase History",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-bold">Package Management</h2>
              <p className="text-gray-400">
                Manage your premium access and features
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Tier Status */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Gift className="w-5 h-5" />
              <span className="font-medium">Free Tier Active</span>
              <span className="text-sm text-gray-400">
                • 1 game per day • Basic AI models
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {userPackages.length > 0
                ? "Premium packages also available"
                : "Upgrade for unlimited access"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "current" && (
              <motion.div
                key="current"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="loading-dots justify-center mb-4">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p className="text-gray-400">Loading your packages...</p>
                  </div>
                ) : userPackages.length > 0 ? (
                  <>
                    {/* Active Packages */}
                    <div className="space-y-4">
                      {userPackages.map((pkg) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Crown className="w-8 h-8 text-orange-400" />
                              <div>
                                <h3 className="text-xl font-bold">
                                  {pkg.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>
                                    {formatTimeRemaining(pkg.expiresAt)}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {pkg.gamesRemaining} of {pkg.totalGames}{" "}
                                    games remaining
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">
                                {Math.round(
                                  (pkg.gamesRemaining / pkg.totalGames) * 100
                                )}
                                %
                              </div>
                              <div className="text-sm text-gray-400">
                                Remaining
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (pkg.gamesRemaining / pkg.totalGames) * 100
                                }%`,
                              }}
                            />
                          </div>

                          {/* Features */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {pkg.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Check className="w-4 h-4 text-green-400" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Usage Statistics */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4">
                        Usage Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {userPackages.reduce(
                              (sum, pkg) =>
                                sum + (pkg.totalGames - pkg.gamesRemaining),
                              0
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Games Played
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {userPackages.reduce(
                              (sum, pkg) => sum + pkg.gamesRemaining,
                              0
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Games Left
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {
                              userPackages.filter(
                                (pkg) => pkg.premiumModelsEnabled
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-400">
                            Premium Access
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {
                              userPackages.filter(
                                (pkg) => new Date(pkg.expiresAt) > new Date()
                              ).length
                            }
                          </div>
                          <div className="text-sm text-gray-400">
                            Active Packages
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      No Premium Packages
                    </h3>
                    <p className="text-gray-400 mb-6">
                      You're currently using the free tier. Upgrade to unlock
                      premium AI models and advanced features.
                    </p>
                    <button
                      onClick={() => setActiveTab("store")}
                      className="btn-detective px-6 py-3"
                    >
                      Browse Packages
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "store" && (
              <motion.div
                key="store"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Package Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availablePackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`glass-card p-6 relative ${
                        pkg.recommended
                          ? "ring-2 ring-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent"
                          : ""
                      }`}
                    >
                      {pkg.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Recommended
                          </div>
                        </div>
                      )}

                      {pkg.savings && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                            {pkg.savings}
                          </div>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <Crown
                          className={`w-12 h-12 mx-auto mb-4 ${
                            pkg.recommended
                              ? "text-orange-400"
                              : "text-blue-400"
                          }`}
                        />
                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold mb-1">
                          ${pkg.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {pkg.games} games • {pkg.duration}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => purchasePackage(pkg.id)}
                        disabled={isPurchasing === pkg.id}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          pkg.recommended
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                            : "btn-detective"
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      >
                        {isPurchasing === pkg.id ? (
                          <>
                            <div className="loading-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Purchase Package
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Feature Comparison Table */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Feature Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">Feature</th>
                          <th className="text-center py-2">Free</th>
                          <th className="text-center py-2">Starter</th>
                          <th className="text-center py-2">Social</th>
                          <th className="text-center py-2">Pro</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Games per day</td>
                          <td className="text-center">1</td>
                          <td className="text-center">Unlimited</td>
                          <td className="text-center">Unlimited</td>
                          <td className="text-center">Unlimited</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">AI Models</td>
                          <td className="text-center">Basic</td>
                          <td className="text-center">Premium</td>
                          <td className="text-center">Premium</td>
                          <td className="text-center">Premium</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Analytics</td>
                          <td className="text-center">Basic</td>
                          <td className="text-center">Advanced</td>
                          <td className="text-center">Enhanced</td>
                          <td className="text-center">Complete</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Game Recording</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3">Data Export</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">✅</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Secure Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span>PayPal Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Instant Activation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-orange-400" />
                      <span>No Hidden Fees</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Purchase History</h3>
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      No Purchase History
                    </h3>
                    <p className="text-gray-400">
                      Your purchase history will appear here once you make your
                      first purchase.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

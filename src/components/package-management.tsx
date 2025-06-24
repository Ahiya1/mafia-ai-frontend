// src/components/package-management.tsx - Real Backend Integration
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
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";

interface PackageManagementProps {
  onClose: () => void;
  currentUserId?: string;
}

interface AvailablePackage {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  games_included: number;
  expiration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  displayPrice?: string;
  isPopular?: boolean;
  gameValue?: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  status: string;
  package_name: string;
  games_purchased: number;
  completed_at: string;
  paypal_transaction_id: string;
}

export function PackageManagement({
  onClose,
  currentUserId,
}: PackageManagementProps) {
  const [activeTab, setActiveTab] = useState<"current" | "store" | "history">(
    "current"
  );
  const [availablePackages, setAvailablePackages] = useState<
    AvailablePackage[]
  >([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const { userPackages, gameAccess, refreshPackages, user } = useAuth();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://mafia-ai-production.up.railway.app";

  useEffect(() => {
    fetchAvailablePackages();
    fetchPaymentHistory();
  }, []);

  const fetchAvailablePackages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/packages`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailablePackages(data.packages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch available packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!currentUserId) return;

    try {
      // This endpoint would need to be implemented in your backend
      const response = await fetch(`${API_URL}/api/user/payment-history`, {
        headers: {
          Authorization: `Bearer ${currentUserId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentHistory(data.transactions || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const purchasePackage = async (pkg: AvailablePackage) => {
    if (!currentUserId) {
      toast.error("Please sign in to purchase packages");
      return;
    }

    setIsPurchasing(pkg.id);

    try {
      // For demonstration, we'll simulate PayPal integration
      // In a real app, you'd redirect to PayPal
      const paypalTransactionId = `PAY_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const response = await fetch(`${API_URL}/api/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          packageId: pkg.id,
          paypalTransactionId,
          amountPaid: pkg.price_usd,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Successfully purchased ${pkg.name}!`, {
          duration: 5000,
          icon: "🎉",
        });

        // Refresh user packages
        await refreshPackages();

        // Switch to current packages tab
        setActiveTab("current");

        // Refresh payment history
        await fetchPaymentHistory();
      } else {
        toast.error(data.error || "Failed to complete purchase");
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

  const parseFeatures = (features: string | string[]): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === "string") {
      try {
        return JSON.parse(features);
      } catch {
        return [features];
      }
    }
    return [];
  };

  const getTotalGamesRemaining = () => {
    return userPackages.reduce((sum, pkg) => sum + pkg.games_remaining, 0);
  };

  const getTotalGamesPlayed = () => {
    return user?.total_games_played || 0;
  };

  const getActivePackages = () => {
    return userPackages.filter(
      (pkg) => pkg.is_active && new Date(pkg.expires_at) > new Date()
    );
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

        {/* Current Status */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Gift className="w-5 h-5" />
                <span className="font-medium">Current Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    gameAccess?.accessType === "admin"
                      ? "bg-orange-500/20 text-orange-400"
                      : gameAccess?.accessType === "premium_package"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {gameAccess?.accessType === "admin"
                    ? "Creator Access"
                    : gameAccess?.accessType === "premium_package"
                    ? "Premium Member"
                    : "Free Tier"}
                </span>
              </div>
              {gameAccess && gameAccess.accessType !== "admin" && (
                <div className="text-sm text-gray-400">
                  {gameAccess.gamesRemaining} games remaining
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400">
              Total games played: {getTotalGamesPlayed()}
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
                {tab.id === "current" && getActivePackages().length > 0 && (
                  <span className="ml-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                    {getActivePackages().length}
                  </span>
                )}
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
                {getActivePackages().length > 0 ? (
                  <>
                    {/* Active Packages */}
                    <div className="space-y-4">
                      {getActivePackages().map((pkg) => (
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
                                  {pkg.package_name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>
                                    {formatTimeRemaining(pkg.expires_at)}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {pkg.games_remaining} games remaining
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Purchased:{" "}
                                    {new Date(
                                      pkg.purchase_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">
                                ${pkg.amount_paid.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-400">
                                Total Paid
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(
                                  (pkg.games_remaining /
                                    (pkg.games_remaining +
                                      (user?.total_games_played || 0))) *
                                    100,
                                  5
                                )}%`,
                              }}
                            />
                          </div>

                          {/* Features */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {parseFeatures(pkg.features).map(
                              (feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                  <span>{feature}</span>
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Usage Statistics */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4">
                        Package Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {getTotalGamesPlayed()}
                          </div>
                          <div className="text-sm text-gray-400">
                            Total Games Played
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {getTotalGamesRemaining()}
                          </div>
                          <div className="text-sm text-gray-400">
                            Games Remaining
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {user?.total_wins || 0}
                          </div>
                          <div className="text-sm text-gray-400">
                            Total Wins
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {Math.round(user?.ai_detection_accuracy || 0)}%
                          </div>
                          <div className="text-sm text-gray-400">
                            AI Detection Rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      No Active Packages
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
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="loading-dots justify-center mb-4">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p className="text-gray-400">Loading packages...</p>
                  </div>
                ) : (
                  <>
                    {/* Package Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {availablePackages.map((pkg) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className={`glass-card p-6 relative ${
                            pkg.name === "Social"
                              ? "ring-2 ring-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent"
                              : ""
                          }`}
                        >
                          {pkg.name === "Social" && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                Popular
                              </div>
                            </div>
                          )}

                          <div className="text-center mb-6">
                            <Crown
                              className={`w-12 h-12 mx-auto mb-4 ${
                                pkg.name === "Social"
                                  ? "text-orange-400"
                                  : "text-blue-400"
                              }`}
                            />
                            <h3 className="text-xl font-bold mb-2">
                              {pkg.name}
                            </h3>
                            <div className="text-3xl font-bold mb-1">
                              {pkg.price_usd === 0
                                ? "Free"
                                : `$${pkg.price_usd.toFixed(2)}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {pkg.games_included} games • {pkg.expiration_days}{" "}
                              days
                            </div>
                            {pkg.price_usd > 0 && (
                              <div className="text-xs text-green-400 mt-1">
                                $
                                {(pkg.price_usd / pkg.games_included).toFixed(
                                  2
                                )}{" "}
                                per game
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 mb-6">
                            {parseFeatures(pkg.features).map(
                              (feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                  <span>{feature}</span>
                                </div>
                              )
                            )}
                          </div>

                          <button
                            onClick={() => purchasePackage(pkg)}
                            disabled={
                              isPurchasing === pkg.id || pkg.price_usd === 0
                            }
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${
                              pkg.price_usd === 0
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : pkg.name === "Social"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                                : "btn-detective"
                            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                          >
                            {pkg.price_usd === 0 ? (
                              <>
                                <Gift className="w-4 h-4" />
                                Automatic for New Users
                              </>
                            ) : isPurchasing === pkg.id ? (
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

                    {/* Payment Info */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Secure Payment Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                          <Shield className="w-8 h-8 text-green-400" />
                          <div>
                            <div className="font-medium">PayPal Secure</div>
                            <div className="text-sm text-gray-400">
                              Encrypted checkout process
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Zap className="w-8 h-8 text-blue-400" />
                          <div>
                            <div className="font-medium">
                              Instant Activation
                            </div>
                            <div className="text-sm text-gray-400">
                              Games available immediately
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-8 h-8 text-orange-400" />
                          <div>
                            <div className="font-medium">No Auto-Renewal</div>
                            <div className="text-sm text-gray-400">
                              One-time purchases only
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                  {paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {transaction.package_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {transaction.games_purchased} games •
                              {new Date(
                                transaction.completed_at
                              ).toLocaleDateString()}{" "}
                              • PayPal: {transaction.paypal_transaction_id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">
                              ${transaction.amount.toFixed(2)}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded ${
                                transaction.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        No Purchase History
                      </h3>
                      <p className="text-gray-400">
                        Your purchase history will appear here once you make
                        your first purchase.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

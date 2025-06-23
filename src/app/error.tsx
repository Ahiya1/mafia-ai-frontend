"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle, Bug, Mail } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
        </motion.div>

        {/* Detective with Error */}
        <motion.div
          animate={{
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl mb-6"
        >
          🕵️‍♂️💥
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h1 className="text-3xl font-bold mb-4 text-red-400">
            Investigation Interrupted!
          </h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Something unexpected happened during the investigation. Our AI
            detectives are looking into this mysterious error.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === "development" && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
                Error Details (Dev Mode)
              </summary>
              <div className="mt-2 p-3 bg-red-900/20 rounded border border-red-500/30 text-xs font-mono text-red-300 overflow-x-auto">
                {error.message}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="btn-detective w-full py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>

            <Link
              href="/contact?type=bug"
              className="btn-ghost w-full py-3 flex items-center justify-center gap-2"
            >
              <Bug className="w-5 h-5" />
              Report Bug
            </Link>
          </div>
        </motion.div>

        {/* Error ID for Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-gray-600"
        >
          {error.digest && (
            <p>
              Error ID:{" "}
              <code className="bg-gray-800 px-2 py-1 rounded">
                {error.digest}
              </code>
            </p>
          )}
          <p className="mt-2">
            If this persists, please{" "}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">
              contact support
            </Link>{" "}
            with the error ID above.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

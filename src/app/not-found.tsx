// src/app/not-found.tsx - 404 Error Page
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Search,
  ArrowLeft,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <div className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
            404
          </div>
        </motion.div>

        {/* Detective Animation */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl mb-6"
        >
          🕵️‍♂️
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h1 className="text-3xl font-bold mb-4">Case Closed... Or Not?</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            This page has vanished like a suspicious player in the night. Our
            detective team is investigating, but you might want to return to
            safety.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="btn-detective w-full py-3 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Base
            </Link>

            <Link
              href="/play"
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Start Investigation
            </Link>

            <button
              onClick={() => window.history.back()}
              className="btn-ghost w-full py-3 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-gray-500 space-y-2"
        >
          <p>Need assistance? Try these resources:</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/help"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help Center
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

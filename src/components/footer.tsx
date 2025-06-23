// src/components/footer.tsx - Enhanced Footer
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Discord,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Heart,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Game",
      links: [
        { name: "Play Now", href: "/play" },
        { name: "Tutorial", href: "/tutorial" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Game Rules", href: "/tutorial/rules" },
      ],
    },
    {
      title: "Account",
      links: [
        { name: "Profile", href: "/profile" },
        { name: "Statistics", href: "/profile/stats" },
        { name: "Premium", href: "/packages" },
        { name: "Settings", href: "/profile/settings" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Bug Report", href: "/feedback" },
        { name: "Feature Request", href: "/feedback?type=feature" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "DMCA", href: "/dmca" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/aimafia",
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      name: "Discord",
      href: "https://discord.gg/aimafia",
      icon: <Discord className="w-5 h-5" />,
    },
    {
      name: "GitHub",
      href: "https://github.com/aimafia",
      icon: <Github className="w-5 h-5" />,
    },
    {
      name: "Email",
      href: "mailto:contact@aimafia.xyz",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  return (
    <footer className="bg-gradient-to-t from-noir-gray-900 to-transparent border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                🕵️‍♂️
              </div>
              <span className="text-xl font-bold text-gradient">AI Mafia</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-sm">
              The world's first social deduction game featuring advanced AI
              personalities. Can you detect the artificial minds among you?
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">50K+</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">1.2M+</div>
              <div className="text-sm text-gray-400">AI Interactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">95%</div>
              <div className="text-sm text-gray-400">Player Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Server Uptime</div>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 p-4 bg-gray-800/30 rounded-lg">
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span>Research Ethics Approved</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🔒 Bank-level encryption</span>
            <span>🛡️ Privacy protected</span>
            <span>⚡ 99.9% uptime</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p className="flex items-center gap-2">
                © {currentYear} AI Mafia. Made with{" "}
                <Heart className="w-4 h-4 text-red-400" /> for the future of
                gaming.
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/status"
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                System Status
              </Link>

              <Link
                href="/api-docs"
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                API Docs
              </Link>

              <Link
                href="/research"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Research
              </Link>
            </div>
          </div>

          {/* Version Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Version 2.1.0 • Last updated: {new Date().toLocaleDateString()} •
              Built with Next.js, TypeScript & AI magic ✨
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

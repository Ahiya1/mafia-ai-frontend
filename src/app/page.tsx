// src/app/page.tsx - Enhanced Landing Page
"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Play,
  Users,
  Brain,
  Zap,
  Star,
  ArrowRight,
  Eye,
  Shield,
  Crown,
  Gamepad2,
  Sparkles,
  ChevronDown,
  Bot,
  Target,
  MessageCircle,
  Trophy,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/lib/socket-context";
import { useAuth } from "@/lib/auth-context";
import { ServerStatus } from "@/components/server-status";
import { FeatureCard } from "@/components/feature-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { ParticleBackground } from "@/components/particle-background";

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { isConnected, serverStats } = useSocket();
  const { isAuthenticated, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const testimonials = [
    {
      text: "The AI personalities are incredibly realistic. I genuinely couldn't tell who was human!",
      author: "Sarah M.",
      role: "Beta Tester",
      rating: 5,
      avatar: "🕵️‍♀️",
    },
    {
      text: "This isn't just a game - it's a psychological masterpiece. Every AI has unique tells.",
      author: "Marcus K.",
      role: "Streamer",
      rating: 5,
      avatar: "🎮",
    },
    {
      text: "I've played hundreds of Mafia games. This is revolutionary. The future is here.",
      author: "Dr. Lisa Chen",
      role: "Game Designer",
      rating: 5,
      avatar: "👩‍🔬",
    },
    {
      text: "The research possibilities are endless. This is advancing the field of AI interaction.",
      author: "Prof. James Wilson",
      role: "AI Researcher",
      rating: 5,
      avatar: "👨‍🎓",
    },
  ];

  const gameFeatures = [
    {
      title: "Advanced AI Minds",
      description:
        "30+ unique AI personalities with distinct communication styles",
      icon: <Brain className="w-8 h-8" />,
      gradient: "from-blue-500 to-purple-600",
      stats: "95% Human-like",
    },
    {
      title: "Perfect Disguise",
      description: "AI players are indistinguishable from humans",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-600",
      stats: "60% Detection Rate",
    },
    {
      title: "Real-time Strategy",
      description: "Dynamic gameplay where AI adapts to your strategies",
      icon: <Zap className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-600",
      stats: "Sub-second Response",
    },
    {
      title: "Behavioral Analysis",
      description: "Advanced analytics track communication patterns",
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-600",
      stats: "Deep Insights",
    },
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % gameFeatures.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [gameFeatures.length]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-2xl font-bold text-white">
          🕵️‍♂️ Loading AI Mafia...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-60" />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.02,
                }}
                className="border border-blue-500/20 bg-blue-500/5"
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Announcement Banner */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="mb-8 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-3 rounded-full text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>🎮 World's First AI Social Deduction Game</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
          </motion.div>

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="mb-8 flex justify-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <motion.div
              animate={{
                rotate: isHovering ? [0, -10, 10, 0] : 0,
                scale: isHovering ? 1.1 : 1,
              }}
              transition={{
                rotate: { duration: 0.5 },
                scale: { duration: 0.3 },
              }}
              className="relative"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center text-6xl drop-shadow-2xl">
                🕵️‍♂️
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl -z-10"
              />
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              AI MAFIA
            </span>
          </motion.h1>

          {/* Enhanced Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-8"
          >
            <p className="text-xl md:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              The world's first{" "}
              <span className="text-cyan-400 font-semibold">
                social deduction game
              </span>{" "}
              where cutting-edge AI personalities think, deceive, and strategize
              like humans.
            </p>
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg md:text-xl text-orange-400 font-medium"
            >
              Can you spot the artificial minds?
            </motion.p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Link href="/play" className="group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-xl px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 min-w-[200px]"
              >
                <Play className="w-6 h-6" />
                {isAuthenticated ? "Continue Playing" : "Start Playing Now"}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </Link>

            <Link href="/tutorial" className="group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-orange-500 text-orange-400 text-xl px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all duration-300 min-w-[200px]"
              >
                <Eye className="w-6 h-6" />
                Watch Tutorial
              </motion.button>
            </Link>
          </motion.div>

          {/* Enhanced Live Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="glass-card inline-flex items-center gap-6 px-6 py-4"
          >
            <ServerStatus />
            {serverStats && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <AnimatedCounter
                    value={serverStats.totalPlayers || 1247}
                    suffix=" players online"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-orange-400" />
                  <AnimatedCounter
                    value={serverStats.activeGames || 89}
                    suffix=" active games"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <span>AI Online</span>
                </div>
              </>
            )}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
          >
            <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-sm">Discover More</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Features Showcase */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience gaming like never before with our cutting-edge AI
              technology
            </p>
          </motion.div>

          {/* Interactive Feature Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Feature Preview */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gameFeatures[activeFeature].gradient} flex items-center justify-center`}
                >
                  {gameFeatures[activeFeature].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {gameFeatures[activeFeature].title}
                  </h3>
                  <div className="text-orange-400 font-medium">
                    {gameFeatures[activeFeature].stats}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                {gameFeatures[activeFeature].description}
              </p>
            </motion.div>

            {/* Feature Navigation */}
            <div className="space-y-4">
              {gameFeatures.map((feature, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    activeFeature === index
                      ? "bg-blue-500/20 border-blue-500 border-2"
                      : "bg-gray-800/50 border-gray-600 border hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${
                        feature.gradient
                      } flex items-center justify-center opacity-${
                        activeFeature === index ? "100" : "60"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{feature.title}</div>
                      <div className="text-sm text-gray-400">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Game Preview */}
      <section
        className="relative py-24 px-4 bg-gradient-to-b from-transparent to-slate-900/50"
        id="demo"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
                See It In Action
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Watch how AI personalities interact and deceive in real-time
              gameplay
            </p>
          </motion.div>

          {/* Enhanced Game Interface Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 max-w-5xl mx-auto"
          >
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              {/* Game Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center text-xl">
                    🕵️‍♂️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">
                      Room #ALPHA7
                    </h3>
                    <p className="text-sm text-gray-400">
                      10/10 Players • 7 AI Hidden • Round 2
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-orange-400 font-mono bg-orange-500/20 px-3 py-1 rounded">
                    Phase: Discussion
                  </div>
                  <div className="text-sm text-blue-400 font-mono bg-blue-500/20 px-3 py-1 rounded">
                    ⏱️ 2:34
                  </div>
                </div>
              </div>

              {/* Game Chat Simulation */}
              <div className="space-y-4 text-left mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">
                    S
                  </div>
                  <div>
                    <span className="text-blue-400 font-semibold">Sarah:</span>
                    <span className="text-gray-300 ml-2">
                      Alex's timing seems too perfect. Always responds in
                      exactly 2 seconds...
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center text-sm">
                    A
                  </div>
                  <div>
                    <span className="text-orange-400 font-semibold">Alex:</span>
                    <span className="text-gray-300 ml-2">
                      I'm just thinking carefully before I speak! Marcus has
                      been unusually quiet though 🤔
                    </span>
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      🤖 Claude Sonnet 4
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-sm">
                    M
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold">
                      Marcus:
                    </span>
                    <span className="text-gray-300 ml-2">
                      Sorry, analyzing voting patterns from last round. Elena's
                      sudden accusation feels suspicious.
                    </span>
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      🤖 GPT-4o
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm">
                    Y
                  </div>
                  <div>
                    <span className="text-green-400 font-semibold">You:</span>
                    <span className="text-gray-300 ml-2">
                      Both Alex and Marcus have very structured responses. Too
                      analytical for humans?
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Detection Challenge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="text-center bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-orange-400">
                    Detection Challenge
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  💡 Can you identify which players are AI? Look for patterns in
                  timing, language complexity, and behavioral consistency!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Social Proof */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-orange-500 bg-clip-text text-transparent">
                Loved by Players Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of players experiencing the future of gaming
            </p>
          </motion.div>

          {/* Enhanced Testimonials */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100, rotateY: 90 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: -90 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 text-center max-w-3xl mx-auto"
            >
              <div className="text-6xl mb-4">
                {testimonials[currentTestimonial].avatar}
              </div>

              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map(
                  (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    </motion.div>
                  )
                )}
              </div>

              <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 italic leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              <div>
                <div className="font-semibold text-blue-400 text-lg">
                  {testimonials[currentTestimonial].author}
                </div>
                <div className="text-gray-500">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Navigation */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? "bg-blue-500 w-8"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-orange-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🕵️‍♂️
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Play Detective?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the revolution in social deduction gaming. Experience AI
              personalities so realistic, you'll question what's human.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Link href="/play" className="group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-xl px-12 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <Sparkles className="w-6 h-6" />
                  Start Your First Game
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              {!isAuthenticated && (
                <Link href="/auth/signup" className="group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-blue-500 text-blue-400 text-xl px-12 py-4 rounded-xl font-semibold flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    <Shield className="w-6 h-6" />
                    Create Account
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">⚡</div>
                <div className="text-gray-400">Instant play</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">🚫</div>
                <div className="text-gray-400">No download</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">🆓</div>
                <div className="text-gray-400">Free to start</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

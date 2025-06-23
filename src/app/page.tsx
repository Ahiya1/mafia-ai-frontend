// src/app/page.tsx
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSocket } from "@/lib/socket-context";
import { ServerStatus } from "@/components/server-status";
import { FeatureCard } from "@/components/feature-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { ParticleBackground } from "@/components/particle-background";

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { isConnected, serverStats } = useSocket();
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
    },
    {
      text: "This isn't just a game - it's a psychological masterpiece. Every AI has unique tells.",
      author: "Marcus K.",
      role: "Streamer",
      rating: 5,
    },
    {
      text: "I've played hundreds of Mafia games. This is revolutionary. The future is here.",
      author: "Dr. Lisa Chen",
      role: "Game Designer",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-60" />

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute top-10 right-10 w-32 h-32 border-2 border-blue-500/30 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              y: [0, -20, 0],
            }}
            transition={{
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute bottom-20 left-10 w-24 h-24 border-2 border-orange-500/30 rotate-45"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
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
              <Image
                src="/detective-logo.png"
                alt="AI Mafia Detective"
                width={120}
                height={120}
                className="drop-shadow-2xl"
                priority
              />
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
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10"
              />
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              AI MAFIA
            </span>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="inline-block ml-4"
            >
              🕵️‍♂️
            </motion.div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            The world's first{" "}
            <span className="text-neon font-semibold">
              social deduction game
            </span>{" "}
            where cutting-edge AI personalities think, deceive, and strategize
            like humans.
            <br />
            <span className="text-orange-400 font-medium">
              Can you spot the artificial minds?
            </span>
          </motion.p>

          {/* CTA Buttons */}
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
                className="btn-detective text-xl px-8 py-4 flex items-center gap-3 group-hover:shadow-2xl"
              >
                <Play className="w-6 h-6" />
                Start Playing Now
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

            <Link href="/how-to-play" className="group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-xl px-8 py-4 flex items-center gap-3"
              >
                <Eye className="w-6 h-6" />
                Watch Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="glass-card inline-flex items-center gap-6 px-6 py-3"
          >
            <ServerStatus />
            {serverStats && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <AnimatedCounter
                    value={serverStats.totalPlayers || 0}
                    suffix=" players online"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-orange-400" />
                  <AnimatedCounter
                    value={serverStats.activeGames || 0}
                    suffix=" active games"
                  />
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
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
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
              <span className="text-gradient">Revolutionary Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience gaming like never before with our cutting-edge AI
              technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Advanced AI Minds"
              description="30+ unique AI personalities with distinct communication styles, strategic approaches, and behavioral patterns that evolve throughout the game."
              gradient="from-blue-500 to-purple-600"
              delay={0.1}
            />

            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Perfect Human Disguise"
              description="AI players are indistinguishable from humans. They make mistakes, show emotions, and develop relationships just like real players."
              gradient="from-purple-500 to-pink-600"
              delay={0.2}
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-time Strategy"
              description="Experience dynamic gameplay where AI adapts to your strategies, forms alliances, and executes complex deception tactics."
              gradient="from-orange-500 to-red-600"
              delay={0.3}
            />

            <FeatureCard
              icon={<Eye className="w-8 h-8" />}
              title="Behavioral Analysis"
              description="Advanced analytics track communication patterns, voting behavior, and social dynamics for unprecedented insights."
              gradient="from-green-500 to-teal-600"
              delay={0.4}
            />

            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure & Private"
              description="Enterprise-grade security with optional anonymous gameplay. Your data is protected with military-level encryption."
              gradient="from-indigo-500 to-blue-600"
              delay={0.5}
            />

            <FeatureCard
              icon={<Crown className="w-8 h-8" />}
              title="Premium Experience"
              description="Console-quality gaming experience with stunning visuals, immersive sound design, and seamless cross-platform play."
              gradient="from-yellow-500 to-orange-600"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three simple steps to experience the future of social deduction
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Join a Game",
                description:
                  "Enter a room with up to 10 players. AI personalities are randomly assigned human names for perfect anonymity.",
                icon: <Users className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Play & Analyze",
                description:
                  "Engage in discussions, cast votes, and use your detective skills to identify AI players among the humans.",
                icon: <Brain className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Master the Game",
                description:
                  "Learn each AI's unique tells and patterns. Develop strategies to outsmart both artificial and human opponents.",
                icon: <Crown className="w-8 h-8" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="glass-card w-24 h-24 mx-auto flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="text-blue-400">{step.icon}</div>
                  </motion.div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              <span className="text-gradient">What Players Say</span>
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of players experiencing the future of gaming
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 text-center max-w-2xl mx-auto"
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-current"
                    />
                  )
                )}
              </div>
              <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 italic">
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

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-orange-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Play?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the revolution in social deduction gaming. Experience AI
              personalities so realistic, you'll question what's human.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/play" className="group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-detective text-xl px-12 py-4 flex items-center gap-3"
                >
                  <Sparkles className="w-6 h-6" />
                  Start Your First Game
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-gray-400"
              >
                ⚡ Instant play • No download required
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

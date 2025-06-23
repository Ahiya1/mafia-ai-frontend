# 🕵️‍♂️ AI Mafia Frontend

A cutting-edge social deduction game frontend where humans play alongside AI personalities. Built with Next.js 15, TypeScript, and real-time WebSocket communication.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Running AI Mafia backend server

### Installation

1. **Clone and install dependencies:**

```bash
git clone <your-repo>
cd mafia-ai-frontend
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your backend URLs:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
```

3. **Start development server:**

```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Fixed Issues

This version resolves all TypeScript errors from the original code:

### ✅ Major Fixes Applied:

1. **Import Conflict Resolution**

   - Fixed `Vote` naming conflict between Lucide icon and game type
   - Renamed import to `VoteIcon` to avoid collision

2. **Component Prop Standardization**

   - `onVote` → `onVoteAction` (VotingPanel)
   - `onGameStart` → `onGameStartAction` (GameSetup)
   - `onAction` → `onActionPerformed` (NightActionPanel)
   - `onClose` → `onCloseAction` (GameStats)

3. **Type Safety Improvements**

   - Fixed `canSendMessage` boolean type assertion
   - Proper null checking for game state properties
   - Complete type definitions in `/types/game.ts`

4. **CSS & Styling Enhancements**
   - Added missing CSS classes and animations
   - Complete Tailwind configuration with custom utilities
   - Detective theme color system
   - Glass morphism effects and responsive design

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Detective theme styles
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page with animations
│   └── play/page.tsx        # Main game interface
├── components/
│   ├── animated-counter.tsx # Number animations
│   ├── chat-area.tsx        # Game chat system
│   ├── feature-card.tsx     # Landing page features
│   ├── game-phase-display.tsx # Phase indicators
│   ├── game-setup.tsx       # Room creation/joining
│   ├── game-stats.tsx       # Post-game analytics
│   ├── night-action-panel.tsx # Night phase actions
│   ├── particle-background.tsx # Animated background
│   ├── player-card.tsx      # Player status display
│   ├── server-status.tsx    # Connection indicator
│   └── voting-panel.tsx     # Voting interface
├── lib/
│   └── socket-context.tsx   # WebSocket management
├── stores/
│   └── game-store.ts        # Zustand state management
├── types/
│   └── game.ts              # Complete type definitions
└── ...
```

## 🎮 Core Features

### Game Mechanics

- **10-player social deduction** with 2 Mafia, 1 Healer, 7 Citizens
- **Real-time phases:** Night → Revelation → Discussion → Voting
- **AI personalities** disguised with human names
- **Role-based actions** with time limits

### Technical Features

- **WebSocket real-time** game synchronization
- **Responsive design** for mobile and desktop
- **Framer Motion animations** for premium feel
- **Toast notifications** for game events
- **Loading states** and error handling
- **Type-safe** throughout with TypeScript

### UI/UX Highlights

- **Detective noir theme** with blue/orange palette
- **Glass morphism** card effects
- **Particle background** animations
- **Sequential speaking** system for fair play
- **Voting visualizations** and game statistics

## 🔌 Backend Integration

The frontend connects to the AI Mafia backend via:

- **REST API** for game setup and stats
- **WebSocket** for real-time game events
- **Automatic reconnection** with state recovery

### Key Socket Events:

```typescript
// Joining/Creating games
socket.emit("create_room", { playerName, roomSettings });
socket.emit("join_room", { roomCode, playerName });

// Game actions
socket.emit("game_action", { type: "SEND_MESSAGE", content });
socket.emit("game_action", { type: "CAST_VOTE", targetId, reasoning });
socket.emit("game_action", { type: "NIGHT_ACTION", action, targetId });
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the detective theme:

```javascript
colors: {
  'detective-blue': { 500: '#3b82f6' },
  'detective-orange': { 500: '#f97316' },
  'noir-gray': { 800: '#262626' }
}
```

### Game Configuration

Modify game constants in `types/game.ts`:

```typescript
const GAME_CONSTANTS = {
  MAX_PLAYERS: 10,
  PHASE_DURATIONS: {
    DISCUSSION: 300 * 1000, // 5 minutes
  },
};
```

## 📱 Responsive Design

- **Mobile-first** approach with touch-friendly controls
- **Desktop enhancements** with hover effects and keyboard shortcuts
- **Tablet optimizations** for optimal game experience
- **Cross-browser compatibility** including WebSocket fallbacks

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel via Git integration
```

### Environment Variables for Production:

```env
NEXT_PUBLIC_API_URL=https://your-production-backend.com
NEXT_PUBLIC_WS_URL=wss://your-production-backend.com
NODE_ENV=production
```

## 🛠️ Development

### Available Scripts:

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Code Quality:

- **TypeScript strict mode** enabled
- **ESLint + Prettier** for consistent formatting
- **Component-based architecture** for maintainability
- **Custom hooks** for game logic separation

## 🎯 Game Flow

1. **Landing Page** → Choose single/multiplayer mode
2. **Game Setup** → Create room or join with code
3. **Waiting Lobby** → Fill with AI players automatically
4. **Role Assignment** → Receive secret role
5. **Game Phases** → Night actions, discussions, voting
6. **Game End** → Statistics and AI personality reveals

## 🔍 AI Detection Challenge

The core gameplay revolves around detecting AI players who:

- Have distinct **communication patterns** per model (Claude, GPT, Gemini)
- **Adapt strategies** based on game state
- **Form alliances** and execute deception
- **Make human-like mistakes** to maintain cover

## 📊 Analytics & Research

Post-game analytics reveal:

- **AI personality breakdowns** and strategies used
- **Player performance** metrics and improvement areas
- **Communication pattern analysis** for future games
- **Win rate statistics** across different scenarios

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is part of the AI Mafia ecosystem. See backend repository for licensing details.

---

**Ready to play detective? 🕵️‍♂️ Join the AI Mafia experience!**

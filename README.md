# Double Coin Dispatcher

A fun and engaging HTML5 casual game where players act as dispatchers at a Double Coin tire warehouse, routing trucks to the correct docks.

## 🎮 Game Overview

**Concept**: Drag and drop trucks to the correct loading/unloading docks to earn points!

- **Inbound Trucks** (Green with "IN") → Go to **Inbound Dock** (Left side, green)
- **Outbound Trucks** (Blue with "OUT") → Go to **Outbound Dock** (Right side, blue)

## ✨ Features

- **3 Progressive Levels**: 
  - **Level 1**: 1 inbound + 1 outbound dock (Basic training)
  - **Level 2**: 2 inbound + 2 outbound docks (Increased traffic)
  - **Level 3**: 3 inbound + 3 outbound docks with SKU matching (Advanced logistics)
- **2-minute Sessions**: Perfect for casual play
- **Drag & Drop Mechanics**: Works on both desktop and mobile
- **Scoring System**:
  - +100 points for correct placement
  - +10 bonus per combo multiplier
  - Speed bonuses for quick dispatching
  - -50 penalty for wrong placement
  - -25 penalty for missed trucks
- **Live Leaderboard**: Local storage-based top 10 scores
- **Sound Effects**: Synthesized audio feedback
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 How to Play

1. Open `index.html` in a web browser
2. **Select your level** using the level buttons
3. Click "Start Game" to begin
4. Drag trucks to the correct docks based on the level:

### Level 1: Basic Operations
- Green "IN" trucks → Green inbound dock (left)
- Blue "OUT" trucks → Blue outbound dock (right)

### Level 2: Increased Traffic
- Multiple docks on each side
- Any inbound truck can go to any inbound dock
- Any outbound truck can go to any outbound dock
- Faster spawn rates!

### Level 3: SKU Matching Challenge
- **TIRES** trucks → **TIRES** dock (match colors exactly)
- **RIMS** trucks → **RIMS** dock (match colors exactly)
- **TOOLS** trucks → **TOOLS** dock (match colors exactly)
- Most challenging with fastest spawn rates!

5. Build combos by dispatching trucks correctly in succession
6. Score as many points as possible in 2 minutes!

## 🎯 Scoring Strategy

- **Speed matters**: Dispatch trucks quickly for speed bonuses
- **Accuracy is key**: Wrong placements break your combo
- **Combo building**: Each correct placement increases your combo multiplier
- **Don't let trucks escape**: Missing trucks costs points and breaks combos

## 🔧 Technical Implementation

**Frontend**:
- HTML5 Canvas for game rendering
- Vanilla JavaScript game engine
- CSS3 for responsive UI styling
- Web Audio API for sound effects

**Game Engine Features**:
- Object-oriented game architecture
- Drag and drop with touch support
- Particle effects for visual feedback
- Smooth animation loop with requestAnimationFrame
- Collision detection system

## 📱 Mobile Support

The game includes full touch support:
- Touch to grab trucks
- Drag with finger to move
- Release to drop on docks
- Responsive UI that adapts to screen size

## 🎵 Audio System

- Web Audio API-based synthesized sounds
- Toggle-able sound effects
- Various sound effects:
  - Success/error feedback
  - Truck spawn notifications
  - Combo achievement sounds
  - Game start/end fanfares

## 📊 Leaderboard

Local storage-based leaderboard tracks:
- Top 10 scores
- Date of achievement
- Maximum combo reached
- Persistent across browser sessions


## 📋 Files Structure

```
double-coin-dispatcher/
├── index.html          # Main game HTML file
├── game.js            # Core game engine
├── audio.js           # Audio system
├── netlify.toml        # Deployment configuration
├── deploy.sh           # Deployment script
└── README.md          # This file
```

## 📚 Version Control

The project is version controlled with Git and hosted on GitHub:

**Repository**: [https://github.com/simeon-zhelev/double-coin-dispatcher](https://github.com/simeon-zhelev/double-coin-dispatcher)

### 🏷️ Releases
- **v1.0.0**: Initial complete release with all 3 levels

### 🔄 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 📋 Development Workflow
```bash
# Clone the repository
git clone https://github.com/simeon-zhelev/double-coin-dispatcher.git

# Make changes
# Test locally by opening index.html

# Deploy to Netlify
./deploy.sh

# Commit and push to GitHub
git add .
git commit -m "Your changes"
git push origin main
```

## 🚀 Getting Started

### 🌐 Play Online (Recommended)
**Live Demo**: [https://double-coin-dispatcher.netlify.app](https://double-coin-dispatcher.netlify.app)

### 📚 Repository
**GitHub**: [https://github.com/simeon-zhelev/double-coin-dispatcher](https://github.com/simeon-zhelev/double-coin-dispatcher)

### 💻 Run Locally
1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. Start playing immediately - no server or build process required!

**Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

---

**Double Coin Dispatcher** - Where logistics meets fun! 🚛💨

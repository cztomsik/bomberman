# Bomberman Clone Design Document

## Overview
A simple Bomberman clone implemented using plain HTML, CSS, and JavaScript with emoji-based graphics. The game supports both CPU opponents and prepares for future multiplayer functionality through an echo server.

## Game Mechanics

### Core Rules
- Grid-based movement (11x11 or 13x13 grid)
- Players can place bombs that explode in cross patterns
- Destructible blocks contain power-ups
- Players eliminated by bomb explosions
- Last player standing wins

### Power-ups
- 💣 Extra Bomb - Increase max bomb capacity
- 🔥 Fire Power - Increase explosion radius
- 👟 Speed - Faster movement
- 🛡️ Shield - Temporary invincibility

### Controls
- Player 1: Arrow Keys + Spacebar (bomb)
- Player 2: WASD + Tab (bomb)

## Technical Architecture

### File Structure
```
/
├── index.html              # Main entry point
├── styles.css              # Global styles and game styling
├── main.js                 # Main controller and screen management
├── menu.js                 # Main menu system
├── character-selection.js  # Character/emoji selection
├── game.js                 # Core game engine
├── cpu.js                  # AI opponent logic
└── utils.js                # Shared utilities and constants
```

### Screen Flow
1. **Main Menu** → Character Selection / Settings
2. **Character Selection** → Game Mode Selection
3. **Game Mode Selection** → Game (CPU/Local Multiplayer)
4. **Game** → Results → Back to Menu

### Rendering System
- Template literals with innerHTML for DOM updates
- Component-based structure preparing for Preact migration
- Event-driven state management

## Character System

### Available Characters (Emojis)
- 🤖 Robot
- 👨‍🚀 Astronaut  
- 🥷 Ninja
- 🧙‍♀️ Wizard
- 🦸‍♂️ Hero
- 👻 Ghost
- 🐱 Cat
- 🐸 Frog

### Selection Process
- Separate selection screen for each player
- Preview of selected character
- Confirmation before proceeding to game

## Game Engine Design

### Grid System
- 13x13 grid (configurable)
- Cell types: Empty, Wall, Destructible Block, Bomb, Power-up, Player
- Coordinate system: (x, y) from top-left

### Game State
```javascript
{
  board: Array[13][13],
  players: [
    {
      id: 1,
      x: 1, y: 1,
      character: '🤖',
      alive: true,
      stats: { bombs: 1, firepower: 1, speed: 1 }
    }
  ],
  bombs: [],
  powerups: [],
  gameState: 'playing' | 'paused' | 'ended',
  winner: null
}
```

### Bomb Mechanics
- 3-second timer before explosion
- Cross-pattern explosion (up/down/left/right)
- Chain reactions with other bombs
- Power-up drops from destroyed blocks (30% chance)

## CPU AI Design (cpu.js)

### AI Difficulty Levels
1. **Easy** - Random movement, occasional bombing
2. **Medium** - Basic pathfinding, strategic bomb placement
3. **Hard** - Advanced tactics, prediction of player moves

### AI Behavior Tree
```
1. Evaluate immediate danger (bombs nearby)
2. If in danger → Find safe path
3. Else if can trap player → Place bomb strategically  
4. Else if destructible blocks nearby → Place bomb for power-ups
5. Else → Move toward player or power-ups
```

### Decision Making
- Pathfinding using A* algorithm for safe movement
- Bomb placement scoring based on:
  - Potential player damage
  - Block destruction potential  
  - Self-preservation
- Reaction time delays for realism

## Multiplayer Architecture

### Current Implementation
- Local multiplayer (2 players, 1 keyboard)
- CPU opponents

### Future Echo Server Integration
- WebSocket connection for real-time communication
- Simple message protocol:
  ```javascript
  {
    type: 'move' | 'bomb' | 'gameState',
    playerId: number,
    data: { x, y } | gameStateSnapshot
  }
  ```
- Client-side prediction with server reconciliation

## User Interface Design

### Main Menu
```
🎮 BOMBERMAN CLONE
─────────────────
▶ Play vs CPU
  Play vs Player  
  Settings
  Quit
```

### Character Selection
```
Choose Your Fighter!

🤖 👨‍🚀 🥷 🧙‍♀️
🦸‍♂️ 👻 🐱 🐸

Selected: 🤖 Robot

[Continue] [Back]
```

### Game Board
```
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🤖 📦   📦   📦   📦 🥷🧱
🧱 🧱 🧱 🧱 🧱 🧱 🧱 🧱 🧱
🧱📦   📦   💣   📦   📦🧱
🧱 🧱 🧱 🧱 🧱 🧱 🧱 🧱 🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱

Player 1: 🤖 ❤️❤️❤️ 💣×1 🔥×1 (Arrows + Space)
Player 2: 🥷 ❤️❤️❤️ 💣×1 🔥×1 (WASD + Tab)
```

## Implementation Strategy

### Phase 1: Foundation
1. HTML structure and CSS styling
2. Menu system and navigation
3. Character selection system

### Phase 2: Core Game
1. Grid rendering system
2. Player movement and controls
3. Bomb mechanics and explosions

### Phase 3: AI & Polish
1. CPU AI implementation
2. Power-up system
3. Game state management and win conditions

### Phase 4: Enhancement
1. Sound effects and animations
2. Settings and difficulty options
3. Score tracking and statistics

## Technical Considerations

### Performance
- Efficient DOM updates using template literals
- Minimal redraws by tracking dirty regions
- Event delegation for input handling

### Code Organization  
- ES6 modules structure
- Clear separation of concerns
- Easy migration path to Preact

### Browser Compatibility
- Modern browsers (ES6+ support required)
- No external dependencies
- Responsive design for different screen sizes

## Future Enhancements

### Graphics Upgrade
- Sprite-based graphics to replace emojis
- Animations for explosions and character movement
- Particle effects

### Multiplayer Features
- Online matchmaking
- Spectator mode
- Tournament brackets

### Game Modes
- Battle Royale (4+ players)
- Capture the Flag
- Time-limited rounds

This design provides a solid foundation for a feature-complete Bomberman clone while maintaining simplicity and extensibility.
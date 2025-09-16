# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bomberman clone implemented as a browser-based game using vanilla HTML, CSS, and JavaScript. The game features emoji-based graphics, CPU AI opponents, local multiplayer, and a modular screen-based architecture.

## Development Commands

Since this is a vanilla JavaScript project, no build tools are required:

- **Run the game**: Open `index.html` in a web browser or use a local server
- **Local development**: Use any static file server (e.g., `python -m http.server 8000`)
- **No tests**: This project currently has no automated test suite

## Architecture Overview

### Core Architecture Pattern
The project uses a **screen-based state machine** architecture with a centralized state manager:

- **main.js**: Main application controller that manages screen transitions
- **state.js**: Global state manager (GameState) that handles all game data, settings, and persistence
- **Screen modules**: Each screen (menu, game, settings) has its own module that renders UI and handles events

### Key Architectural Components

1. **State Management** (`state.js`):
   - Single source of truth for all game state
   - Handles localStorage persistence for settings and stats
   - Manages game board, players, bombs, explosions, and powerups
   - Provides helper methods for game logic (isWalkable, getBombAt, etc.)

2. **Game Systems** (`game.js`):
   - Entity Component System (ECS) pattern with separate systems:
   - `inputSystem`: Processes player input
   - `aiSystem`: Controls CPU players
   - `movementSystem`: Handles player movement
   - `bombSystem`: Manages bomb timers and explosions
   - `collisionSystem`: Detects player-explosion collisions
   - `powerupSystem`: Handles powerup collection
   - `gameLogicSystem`: Manages win conditions and game flow

3. **Screen System**:
   - Each screen is a separate module that exports init/cleanup functions
   - Screen transitions handled by watching `GameState.screen` changes
   - All screens render into the main `#app` container

4. **AI System** (`cpu.js`):
   - Behavior-based AI with danger evaluation, target finding, and pathfinding
   - Three difficulty levels with different reaction times and strategy complexity

### Data Flow
1. User input → GameState.input.actions
2. Game systems process state changes each frame
3. UI screens watch GameState.screen for transitions
4. All game data persists to localStorage automatically

## File Structure & Responsibilities

### Core Files
- `main.js`: Application lifecycle, screen management
- `state.js`: Centralized state management and persistence
- `game.js`: Core game engine with ECS systems
- `loop.js`: Game loop and timing
- `cpu.js`: AI opponent logic

### UI Screens
Each screen is implemented as a separate module that exports `init` and optionally `render` functions following a consistent pattern:

- `menu-screen.js`: Main menu interface
- `game-screen.js`: Game board rendering and input handling
- `settings-screen.js`: Game configuration
- `character-selection.js`: Player character selection screen
- `stats-screen.js`: Statistics display and management
- `game-over-screen.js`: Game over screen with results and options
- `controls-screen.js`: Controls explanation

### Utilities
- `utils.js`: Shared constants and helper functions
- `styles.css`: All styling for the game

## Key Implementation Details

### Game Board System
- Uses a 2D array (`GameState.game.board`) for the grid
- Coordinates are (x, y) with (0,0) at top-left
- Cell types: `null` (empty), `'wall'`, `'crate'`, `'bomb'`
- Board generation creates classic Bomberman layout with player spawn areas

### Player Movement
- Players have fractional coordinates but move on grid alignment
- Movement system handles collision detection with walls/crates
- Players can walk through their own bombs but not others'

### Bomb Mechanics
- 3-second timer before explosion
- Cross-pattern explosion with configurable power
- Chain reactions trigger other bombs
- 30% chance for powerups from destroyed crates

### AI Behavior
- Evaluates immediate danger from bombs/explosions
- Finds targets (powerups, destructible crates, other players)
- Uses simple pathfinding for movement decisions
- Different difficulty levels affect reaction speed and strategy

## Common Development Patterns

### Adding New Screens
Each screen follows a consistent modular pattern:

1. **Create screen module** (e.g., `new-screen.js`):
   ```javascript
   import GameState from './state.js';
   
   export function renderNewScreen() {
       return `<div class="new-screen">...</div>`;
   }
   
   export function initNewScreen(container) {
       container.innerHTML = renderNewScreen();
       // Add event listeners
   }
   ```

2. **Import in main.js**:
   ```javascript
   import { initNewScreen } from './new-screen.js';
   ```

3. **Add to screen switch**:
   ```javascript
   case 'new-screen':
       initNewScreen(this.container);
       break;
   ```

4. **Navigate to screen**:
   ```javascript
   GameState.screen = 'new-screen';
   ```

### Modifying Game Logic
- Add new systems to `game.js` systems array
- Systems receive `(state, deltaTime)` parameters
- Modify GameState properties directly (no immutability)

### State Persistence
- Settings auto-save via `GameState.saveSettings()`
- Stats auto-save via `GameState.saveStats()`
- Use `localStorage` for all persistence

### Event Handling
- Each screen manages its own event listeners
- Use event delegation on container element
- Clean up listeners when switching screens

## Development Notes

- **No build process**: Pure vanilla JavaScript with ES6 modules
- **No external dependencies**: All functionality implemented from scratch
- **Emoji graphics**: Uses Unicode emojis for all game visuals
- **Browser compatibility**: Requires modern browser with ES6 module support
- **Performance**: Efficient DOM updates using innerHTML and template literals
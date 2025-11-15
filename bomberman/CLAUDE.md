# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bomberman clone implemented as a browser-based game using vanilla HTML, CSS, and JavaScript with Canvas rendering. The game features emoji-based graphics and CPU AI opponents.

## Development Commands

Since this is a vanilla JavaScript project, no build tools are required:

- **Run the game**: Open `index.html` in a web browser or use a local server
- **Local development**: Use any static file server (e.g., `python -m http.server 8000` or `npm run serve`)
- **Run tests**: `npm test` - Uses Node.js built-in test runner
- **Test AI**: `npm run test:ai` - Runs AI behavior simulation

## Architecture Overview

### Core Architecture Pattern
The project uses a **class-based architecture** with clear separation of concerns:

- **game.js**: Pure game engine class that contains all game logic, state, and mechanics (no rendering)
- **main.js**: UI layer that handles Canvas rendering, input events, and game loop coordination
- **ai.js**: AI controller that makes decisions for CPU players

### Key Architectural Components

1. **Game Engine** (`game.js`):
   - `Game` class that can be instantiated for isolated game instances
   - Contains all game state (board, players, bombs, explosions, powerups)
   - Handles all game logic (movement, explosions, collisions, powerups)
   - Provides main `update(deltaTime)` method for game loop
   - Pure game engine that can run headless (no rendering dependencies)
   - `renderToString()` method for testing

2. **UI Layer** (`main.js`):
   - `BombermanGame` class that manages Canvas rendering and user interface
   - Creates and owns a `Game` instance
   - Handles keyboard input and translates to game actions
   - Renders game state to Canvas using emojis
   - Manages game loop with requestAnimationFrame
   - Handles game states (playing, paused, game over)

3. **AI System** (`ai.js`):
   - `AIController` class with behavior-based AI
   - Danger evaluation and escape planning
   - A* pathfinding for movement
   - Strategic bombing with escape route validation
   - Goal prioritization (powerups → crates → enemies → exploration)

### Data Flow
1. User input → `BombermanGame` input handlers
2. Input translated to game actions → `Game` instance methods
3. AI controllers update → `Game` instance methods
4. `Game.update(deltaTime)` processes all game logic each frame
5. `BombermanGame.render()` draws current game state to Canvas

## File Structure

```
/
├── index.html          # Entry point with Canvas element
├── main.js             # UI layer, Canvas rendering, input, game loop
├── game.js             # Pure game engine (logic and state)
├── ai.js               # AI controller for CPU players
├── test-ai.js          # AI behavior testing script
├── tests/
│   └── game.test.js    # Unit tests for game logic
├── package.json        # Project configuration
├── CLAUDE.md           # This file
├── DESIGN.md           # Original design document
├── AI_DESIGN.md        # AI behavior specification
└── NEXT.md             # Known issues and improvements
```

## Key Implementation Details

### Canvas Rendering
- Uses HTML5 Canvas API for efficient rendering
- Grid-based rendering with emoji characters
- Cell size configurable (default 40x40 pixels)
- Renders: board, players, bombs, explosions, powerups, UI overlay

### Game Board System
- Uses a 2D array (`game.board`) for the grid
- Default size: 15x13 grid
- Coordinates are (x, y) with (0,0) at top-left
- Cell types: `null` (empty), `'wall'`, `'crate'`, `'bomb'`
- Board generation creates classic Bomberman layout with clear spawn corners

### Player System
- Players use integer grid coordinates
- Properties: id, x, y, alive, speed, bombPower, maxBombs, activeBombs
- Human player controlled via arrow keys + spacebar
- AI players controlled by AIController instances

### Bomb Mechanics
- 3-second timer before explosion (3000ms)
- Cross-pattern explosion with configurable power
- Chain reactions trigger other bombs instantly
- 30% chance for powerups from destroyed crates
- Explosion duration: 500ms

### Powerup Types
- 💣 `bomb`: Increase max bomb capacity (+1, max 8)
- 🔥 `power`: Increase explosion radius (+1, max 8)
- 👟 `speed`: Faster movement (+0.5, max 3)

### AI Behavior
- Single decision loop each update cycle
- Priority: escape danger → bomb targets → follow path → find new goal
- Uses A* pathfinding with danger avoidance
- Validates escape routes before placing bombs
- Stuck detection with automatic recovery

### Game States
- **Playing**: Normal gameplay
- **Paused**: Game frozen, press P to resume
- **Game Over**: Shows winner, press R to restart

## Testing

Tests use Node.js built-in test runner:

```bash
npm test                    # Run unit tests
npm run test:ai            # Run AI simulation
```

### Test Coverage
- Board generation and layout
- Player movement and collision
- Bomb placement and explosion mechanics
- Powerup collection and effects
- Chain reactions

### Testing Game Logic
- Create isolated `Game` instances: `const game = new Game(5, 5)`
- Use `game.renderToString()` to verify game state
- Test game logic independently of rendering

## Common Development Patterns

### Modifying Game Logic
1. Add/modify methods in the `Game` class (`game.js`)
2. Game logic is pure - no rendering or input concerns
3. All state changes go through Game methods
4. Test with `game.renderToString()` or unit tests

### Adding Visual Features
1. Modify rendering in `BombermanGame.render()` (`main.js`)
2. Use Canvas 2D context methods
3. Keep rendering separate from game logic

### Improving AI
1. Modify `AIController` class (`ai.js`)
2. AI uses game state read-only, actions through game methods
3. Test with `npm run test:ai`

## Controls

- **Arrow Keys**: Move player
- **Spacebar**: Place bomb
- **P**: Pause/Resume game
- **R**: Restart game (when game over)

## Development Notes

- **No build process**: Pure vanilla JavaScript with ES6 modules
- **No external dependencies**: All functionality implemented from scratch
- **Canvas rendering**: Efficient emoji-based graphics
- **Browser compatibility**: Requires modern browser with ES6 module and Canvas support
- **Performance**: ~60fps with requestAnimationFrame

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bomberman clone implemented as a browser-based game using vanilla HTML, CSS, and JavaScript. The game features emoji-based graphics, CPU AI opponents, local multiplayer, and a modular screen-based architecture.

## Development Commands

Since this is a vanilla JavaScript project, no build tools are required:

- **Run the game**: Open `index.html` in a web browser or use a local server
- **Local development**: Use any static file server (e.g., `python -m http.server 8000`)
- **Run tests**: `npm test` - Uses Node.js built-in test runner

## Architecture Overview

### Core Architecture Pattern
The project uses a **class-based architecture** with clear separation of concerns:

- **main.js**: UI layer that handles DOM rendering, input events, and browser-specific concerns
- **game.js**: Game engine class that contains all game logic, state, and mechanics
- **Screen modules**: Each screen (menu, game, settings) has its own module that renders UI and handles events

### Key Architectural Components

1. **Game Engine** (`game.js`):
   - `Game` class that can be instantiated for isolated game instances
   - Contains all game state (board, players, bombs, explosions, powerups)
   - Handles all game logic (movement, explosions, collisions, powerups)
   - Provides main `update(deltaTime)` method for game loop
   - Pure game engine that can run headless (no DOM dependencies)

2. **UI Layer** (`main.js`):
   - `BombermanGame` class that manages DOM and user interface
   - Creates and owns a `Game` instance
   - Handles keyboard input and translates to game actions
   - Renders game state to DOM using emojis
   - Manages game loop coordination

3. **Screen System**:
   - Each screen is a separate module that exports init/cleanup functions
   - Screen transitions handled by watching `GameState.screen` changes
   - All screens render into the main `#app` container

4. **AI System** (`cpu.js`):
   - Behavior-based AI with danger evaluation, target finding, and pathfinding
   - Three difficulty levels with different reaction times and strategy complexity

### Data Flow
1. User input → `BombermanGame` input handlers
2. Input translated to game actions → `Game` instance methods
3. `Game.update(deltaTime)` processes all game logic each frame
4. `BombermanGame.render()` displays current game state in DOM

## File Structure & Responsibilities

### Core Files
- `main.js`: UI layer, DOM rendering, input handling, game loop coordination
- `game.js`: Game engine class with all game logic and state
- `cpu.js`: AI opponent logic (if implemented)
- `tests/`: Unit tests for game logic using Node.js test runner

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
- Uses a 2D array (`game.game.board`) for the grid
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

## Testing

The project includes comprehensive unit tests covering:
- **Game Logic**: Movement, bomb mechanics, explosions, collisions
- **State Management**: Board generation, entity management, game state
- **String Rendering**: Text-based board representation for testing

Tests use Node.js built-in test runner and can create isolated `Game` instances for testing game logic without DOM dependencies.

## Common Development Patterns

### Adding New Screens
Each screen follows a consistent modular pattern:

1. **Create screen module** (e.g., `new-screen.js`):
   ```javascript
   import Game from './game.js';
   
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
   game.screen = 'new-screen';
   ```

### Modifying Game Logic
- Add new methods to the `Game` class in `game.js`
- Game logic methods receive necessary parameters (players, deltaTime, etc.)
- Call `game.update(deltaTime)` in the main game loop

### Testing Game Logic
- Create isolated `Game` instances in tests: `const game = new Game(5, 5)`
- Use `game.renderToString()` to verify game state in tests
- Test game logic independently of DOM/UI concerns

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
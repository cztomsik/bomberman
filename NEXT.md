# Major Issues in Current Design

This document outlines the most significant problems in the Bomberman codebase, prioritized by impact.

---

## 1. Documentation vs Reality Mismatch

**Severity: Critical**

The documentation (CLAUDE.md, DESIGN.md) describes a completely different architecture than what exists in the code:

### What Documentation Says:
- Screen modules: `menu-screen.js`, `game-screen.js`, `settings-screen.js`, `character-selection.js`, `stats-screen.js`, `game-over-screen.js`, `controls-screen.js`
- Character selection system with 8 emoji characters
- Multiple game modes (CPU, local multiplayer)
- Settings and statistics tracking
- Screen transitions via `GameState.screen`
- Utils module with shared constants

### What Actually Exists:
- **3 source files**: `game.js`, `main.js`, `ai.js`
- No menu system
- No character selection
- No settings
- No game state machine
- Hardcoded 4-player game with single human + 3 AIs
- Game starts immediately on page load

**Impact**: Anyone reading the documentation will be completely misled about the codebase structure. This makes onboarding impossible and creates confusion.

---

## 2. Missing Core Game Features

**Severity: High**

The game lacks essential Bomberman features:

### Missing Features:
- **No game over screen** - Game continues even after winner is determined
- **No restart mechanism** - Must reload page to play again
- **No pause functionality** - Game runs continuously
- **No win detection in UI** - `game.winner` is never set or displayed
- **No player death feedback** - Dead players just disappear
- **No round/match system** - Single endless game
- **No score tracking**
- **Shield powerup mentioned in DESIGN.md but not implemented**

### Code Evidence:
```javascript
// game.js - winner is declared but never set
this.winner = null;

// main.js - no game over logic exists
gameLoop(currentTime) {
    // ... updates forever
    requestAnimationFrame((time) => this.gameLoop(time));
}
```

---

## 3. Critical Bug in AI Explosion Detection

**Severity: High**

`ai.js:129` contains a bug that causes AI to miscalculate explosion paths:

```javascript
isExplosionBlocked(bombX, bombY, targetX, targetY) {
    // ...
    } else { // Vertical
        const start = Math.min(bombY, targetY);
        const end = Math.max(bombY, targetY);
        for (let y = start + 1; y < end; y++) {
            if (this.game.board[targetY][y] === 'wall') return true; // BUG: should be [y][bombX]
        }
    }
}
```

The bug uses `board[targetY][y]` instead of `board[y][bombX]`, causing incorrect wall detection in vertical explosion paths. This can cause AI to walk into explosions or fail to recognize safe positions.

---

## 4. Performance: Full DOM Rebuild Every Frame

**Severity: High**

Every frame, the entire game board is recreated:

```javascript
// main.js:152-166
render() {
    let html = '';
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            html += `<div class="${className}">${content}</div>`;
        }
    }
    this.boardElement.innerHTML = html; // 195 divs recreated every frame
}
```

**Impact**:
- Creates 195 new DOM elements (15x13 grid) at ~60fps
- Garbage collector constantly cleaning up old elements
- No dirty tracking or differential updates
- Browser must re-layout and re-paint entire board

**Better Approach**: Update only changed cells, use requestAnimationFrame throttling, or canvas rendering.

---

## 5. Non-Deterministic Behavior Prevents Testing

**Severity: High**

### Random Board Generation
```javascript
// game.js:49
board[y][x] = nearCorner ? null : (Math.random() < 0.7 ? 'crate' : null);
```

No seed control means:
- Tests can't verify specific scenarios
- Bugs can't be reproduced reliably
- Different test runs give different results

### AI Uses Real Time
```javascript
// ai.js:140-141
const now = Date.now();
if (now - this.lastBombTime < this.minBombInterval) return false;
```

This introduces non-determinism into AI behavior, making it impossible to write reliable tests.

---

## 6. Memory Leaks: Event Listeners Never Cleaned

**Severity: Medium**

```javascript
// main.js:68-80
setupInput() {
    document.addEventListener('keydown', (e) => {...});
    document.addEventListener('keyup', (e) => {...});
}
```

**Issues**:
- No cleanup function provided
- Listeners persist forever
- Multiple game instances would create duplicate listeners
- If game is embedded in SPA, memory leaks accumulate

---

## 7. Tight Coupling and Poor Separation of Concerns

**Severity: Medium**

### Game Engine Not Pure
The `Game` class is reasonably clean, but player creation mixes game logic with presentation:

```javascript
// main.js:28-43
this.player = this.game.createPlayer(0, 1, 1, true);
this.player.name = 'Player';      // UI concern
this.player.emoji = '😊';          // UI concern

const ai1 = this.game.createPlayer(1, ...);
ai1.name = 'AI 1';                  // UI concern
ai1.emoji = '🤖';                   // UI concern
```

### AI Directly Modifies Game State
```javascript
// ai.js:224
this.game.placeBomb(this.player);
```

AI controller has direct access to game internals rather than working through a command/action interface.

### UI and Logic Mixed
`BombermanGame` handles:
- DOM rendering
- Input handling
- Game loop timing
- AI controller management
- Player creation and configuration

This violates single responsibility principle.

---

## 8. Inconsistent Entity Model

**Severity: Medium**

Player properties are inconsistent:

```javascript
// game.js:56-65 - createPlayer
const player = {
    bombCount: 1,        // Unused property
    maxBombs: 1,         // Actually used for bomb limit
    activeBombs: 0,      // Tracks currently placed bombs
    moveTimer: 0,        // Unused
    action: null         // Unused
};
```

Properties like `bombCount`, `moveTimer`, and `action` are created but never used, suggesting incomplete features or leftover code.

---

## 9. Movement System Issues

**Severity: Medium**

### Grid-Based vs Fractional Position Confusion

```javascript
// game.js:137-138
const newX = player.x + dx;  // Allows fractional positions
const newY = player.y + dy;
```

But collision detection uses floor:
```javascript
// game.js:115
Math.floor(e.x) === x && Math.floor(e.y) === y
```

Players use integer coordinates in practice, but the system allows fractional positions. This causes confusion and potential bugs:

```javascript
// game.js:260-272 - checkCollisions
const px = player.x;  // Uses raw position
const py = player.y;
// But explosion coordinates are integers
```

If player is at (1.5, 2), are they hit by explosion at (1, 2) or (2, 2)? Current code checks exact equality, so neither!

---

## 10. No Input Validation

**Severity: Medium**

```javascript
// game.js:126-133
isWalkable(x, y) {
    if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
        return false;
    }
    const cell = this.board[y][x];  // Could crash if board malformed
    return cell === null || cell === 'powerup';
}
```

No validation that:
- Board is properly sized
- Player IDs are unique
- Bomb power/maxBombs are within reasonable bounds
- Delta time is positive

---

## 11. Missing Error Handling

**Severity: Medium**

No try-catch blocks anywhere. If any part fails:
- Board rendering crashes silently
- AI pathfinding could infinite loop
- Game loop stops without notification

```javascript
// main.js:168-196
gameLoop(currentTime) {
    // No error boundary
    const deltaTime = currentTime - this.lastTime;  // Could be NaN on first call
    // ... all operations assume success
}
```

On first call, `this.lastTime = 0`, so `deltaTime` could be very large (timestamp of page load), causing bombs to explode instantly.

---

## 12. Powerup Rendering Inconsistency

**Severity: Low**

Board state uses `'powerup'` as cell type check:
```javascript
// game.js:132
return cell === null || cell === 'powerup';
```

But powerups are stored in separate array, and board cells are never actually set to `'powerup'`:
```javascript
// game.js:230
this.addPowerup(x, y, type);  // Only adds to array
// board[y][x] remains null
```

The `'powerup'` cell type is dead code that's never used.

---

## 13. Hardcoded Configuration Throughout

**Severity: Low**

Magic numbers scattered everywhere:

```javascript
// game.js
const duration = 500;           // Explosion duration
bomb.timer = 3000;              // Bomb timer
Math.random() < 0.3;            // Powerup drop chance
Math.min(player.maxBombs + 1, 8);  // Max bomb limit
Math.min(player.speed + 0.5, 3);   // Speed increment and cap

// main.js
this.movementTimer = 200 / this.player.speed;  // Movement speed

// ai.js
this.minBombInterval = 1000;    // AI bomb cooldown
danger < 1500;                   // Danger threshold
path.length <= 4;                // Escape path limit
```

Should be centralized in a config object.

---

## 14. Test Coverage Gaps

**Severity: Low**

Tests exist for basic game mechanics but miss:
- AI controller logic (separate test-ai.js is manual)
- Integration between UI and game engine
- Error conditions
- Edge cases (all players dead, no crates left, etc.)
- Performance characteristics

---

## Priority Recommendations

### Immediate (P0):
1. **Fix AI explosion bug** - Critical for game functionality
2. **Add game over detection** - Game is incomplete without it
3. **Update documentation** - Remove false claims about non-existent features

### Short-term (P1):
4. Optimize rendering with dirty tracking or canvas
5. Add deterministic board generation (seed parameter)
6. Clean up event listeners
7. Fix player position/collision consistency

### Medium-term (P2):
8. Implement actual screen system or remove from docs
9. Add configuration management
10. Improve separation of concerns
11. Add error boundaries

### Long-term (P3):
12. Implement missing features (menu, settings, character selection)
13. Comprehensive test suite
14. TypeScript migration for better type safety

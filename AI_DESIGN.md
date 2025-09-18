# Bomberman AI - Expected Behavior Specification

## What the AI Player Should Do

### Smart Movement
The AI should move **purposefully and strategically**. While it can wait when it's tactically advantageous (e.g., waiting for an explosion to clear, timing an ambush), it should never be idle for more than 2 seconds. Movement should be smooth - one cell every 100-200ms depending on speed powerups.

Acceptable waiting scenarios:
- Waiting for bomb explosion to clear a path (max 3 seconds)
- Timing an attack on another player (max 2 seconds)
- Waiting in a safe spot for danger to pass (max 2 seconds)
- Setting up a trap or ambush (max 2 seconds)

After any 2-second wait period, the AI must take action - move, place bomb, or change position.

### Strategic Bombing
When the AI encounters destructible crates:
1. Move to a position where bomb can hit the crate
2. Check that escape route exists
3. Place the bomb
4. Immediately move away to safe distance (at least 3 cells from explosion)
5. Wait for explosion
6. Return to collect any powerups that appear

### Intelligent Survival
The AI should **never die from predictable dangers**:
- Always calculate explosion zones before moving
- Never walk into active explosions
- Always escape from own bombs successfully
- Detect and avoid other players' bombs
- Maintain safe distance from timed explosions

### Resource Collection
When powerups appear:
- Immediately path to nearby powerups
- Prioritize: Speed → Extra Bombs → Bomb Power
- Only collect if path is safe from explosions
- Compete with other players for powerups

### Competitive Behavior
Against other players:
- Actively hunt enemy players
- Place bombs to trap opponents
- Predict enemy movement patterns
- Control key areas of the map
- Create chain reactions to maximize destruction

## Expected Behavior Timeline

### First 10 seconds:
- Move from spawn corner toward center
- Place first bomb within 3 seconds
- Destroy 2-3 crates
- Collect first powerup

### 10-30 seconds:
- Have destroyed 5+ crates
- Collected 2-3 powerups
- Established map control
- Begin hunting opponents

### 30+ seconds:
- Aggressive gameplay
- Multiple bombs placed strategically
- Chasing/cornering enemies
- Controlling powerup spawns

## Visual Behavior

### What observers should see:
✓ AI moving with clear purpose
✓ AI waiting strategically (e.g., for explosions to clear)
✓ AI placing bombs next to crates
✓ AI running away after placing bombs
✓ AI collecting powerups efficiently
✓ AI dodging explosions successfully
✓ AI chasing other players
✓ AI sometimes waiting in safe spots tactically

### What observers should NEVER see:
✗ AI idle for more than 2-3 seconds without reason
✗ AI dying from its own bombs
✗ AI walking into visible explosions
✗ AI stuck in corners permanently
✗ AI placing random bombs without targets
✗ AI ignoring nearby powerups
✗ AI frozen or unresponsive

## Current Implementation

### Single Decision Loop
```javascript
class AIController {
    update(deltaTime) {
        // 1. Update movement cooldown (respects speed powerup)
        this.movementCooldown = Math.max(0, this.movementCooldown - deltaTime);
        if (this.movementCooldown > 0) return;

        // 2. Update world knowledge
        const danger = this.getDangerLevel(myX, myY);

        // 3. Make ONE decision
        if (danger > 0 && danger < 1500) {
            // In immediate danger, must escape
            this.state = 'escaping';
            this.planEscape(myX, myY);
        } else if (this.canAndShouldPlaceBomb(myX, myY)) {
            // Can safely bomb something
            this.state = 'bombing';
            this.placeBombAndEscape(myX, myY);
        } else if (this.path && this.path.length > 0) {
            // Continue following current path
            this.state = 'following-path';
            this.followPath();
        } else {
            // Find new goal
            this.state = 'exploring';
            this.findNewGoal(myX, myY);
        }
    }
}
```

### Key Principles

1. **One Action at a Time**
   - Don't switch between states rapidly
   - Complete current action before starting new one
   - Clear goal -> path -> execution

2. **Safety First**
   - ALWAYS check danger before moving
   - ALWAYS ensure escape route before bombing
   - NEVER move into danger unless escaping

3. **Simple Movement**
   - Calculate path once, follow it
   - Recalculate only if blocked
   - Use grid-based movement (no fractional positions)

## Implementation Details

### Key Features
1. **Speed-aware movement** - Movement cooldown adapts to speed powerup (200ms / player.speed)
2. **A* Pathfinding** - Intelligent path calculation with danger avoidance
3. **State tracking** - Clear state machine for debugging ('escaping', 'bombing', 'following-path', 'exploring', 'collecting-powerup', 'hunting', 'stuck')
4. **Goal prioritization**:
   - Priority 1: Nearby powerups
   - Priority 2: Destructible crates
   - Priority 3: Hunt other players
   - Priority 4: Random exploration
5. **Stuck detection** - Resets after 2 seconds of no movement

### Safety Mechanisms
- **Danger detection** - Returns time until explosion (0-3000ms) or Infinity for active explosions
- **Escape validation** - Only places bombs if escape route exists (within 4 moves)
- **Wall-aware explosions** - Correctly calculates explosion blocking by walls
- **Bomb chaining** - Accounts for chain reactions when evaluating danger

### Movement System
```javascript
movePlayer(dx, dy) {
    if (this.canMoveTo(newX, newY)) {
        this.game.movePlayer(this.player, dx, dy);
        // Movement cooldown based on speed powerup
        this.movementCooldown = 200 / this.player.speed;
    }
}
```

## Testing Strategy

### Test Scenarios
1. **Corner Escape** - AI in corner, must escape bomb
2. **Corridor Navigation** - AI must navigate narrow paths
3. **Chain Reaction** - AI must account for multiple bombs
4. **Powerup Collection** - AI collects powerups safely
5. **Crate Destruction** - AI systematically clears crates

### Debug Output
- Current position
- Current action/goal
- Danger levels around AI
- Path being followed
- Decision reasoning

## Next Steps

1. **Simplify Further** - Remove all complex state machines
2. **Fix Movement** - Ensure AI can always move when safe
3. **Perfect Safety** - AI should NEVER die from predictable danger
4. **Add Intelligence** - Only after basics work perfectly

## Core Algorithm (Pseudocode)

```
EVERY FRAME:
    danger = checkDanger(myPosition)

    IF danger > 0 AND danger < 1500:
        path = findEscapePath()
        moveAlongPath(path)
        RETURN

    IF no current goal:
        goal = findNearestCrate()
        IF goal:
            bombPosition = findBombingPosition(goal)
            path = findPath(myPosition, bombPosition)
        ELSE:
            goal = randomSafePosition()
            path = findPath(myPosition, goal)

    IF at goal position AND goal is bombPosition:
        IF canEscapeAfterBomb():
            placeBomb()
            path = findEscapePath()

    moveAlongPath(path)
```

## Key Issues to Solve

1. **Movement Timer** - Currently prevents smooth movement
2. **Path Clearing** - Paths get lost during state changes
3. **Danger Detection** - Not detecting all dangerous situations
4. **Escape Routes** - Not properly validating escape before bombing
5. **Stuck Detection** - Need better recovery when stuck

## Success Criteria

- [ ] AI can move continuously without getting stuck
- [ ] AI never dies from its own bombs
- [ ] AI successfully destroys crates
- [ ] AI collects powerups
- [ ] AI survives for 100+ steps consistently
- [ ] AI can navigate complex mazes
- [ ] AI makes logical decisions visible to observer
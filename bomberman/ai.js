export default class AIController {
    constructor(game, playerIndex) {
        this.game = game;
        this.playerIndex = playerIndex;
        this.player = game.players[playerIndex];

        // State tracking for debugging
        this.state = 'idle';
        this.currentGoal = null;
        this.path = [];

        // Movement timing (will use player.speed)
        this.movementCooldown = 0;

        // Bombing control
        this.lastBombTime = 0;
        this.minBombInterval = 1000; // Reduced from 4000 for more aggressive play

        // Stuck detection
        this.lastPosition = { x: this.player.x, y: this.player.y };
        this.stuckCounter = 0;
    }

    update(deltaTime) {
        if (!this.player || !this.player.alive) return;

        // Update movement cooldown
        this.movementCooldown = Math.max(0, this.movementCooldown - deltaTime);
        if (this.movementCooldown > 0) return;

        const myX = Math.floor(this.player.x);
        const myY = Math.floor(this.player.y);

        // Stuck detection
        if (myX === this.lastPosition.x && myY === this.lastPosition.y) {
            this.stuckCounter += deltaTime;
            if (this.stuckCounter > 2000) { // Stuck for 2 seconds
                this.state = 'stuck';
                this.path = []; // Clear path
                this.currentGoal = null;
            }
        } else {
            this.stuckCounter = 0;
        }
        this.lastPosition = { x: myX, y: myY };

        // SINGLE DECISION LOOP (as per AI_DESIGN.md)

        // 1. Update world knowledge
        const danger = this.getDangerLevel(myX, myY);

        // 2. Make ONE decision
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

    getDangerLevel(x, y) {
        let minDanger = 0;

        // Check all bombs
        for (const bomb of this.game.bombs) {
            if (this.willBeHitByBomb(x, y, bomb)) {
                // We're in explosion range - danger based on time until explosion
                const danger = bomb.timer;
                if (minDanger === 0 || danger < minDanger) {
                    minDanger = danger;
                }
            }
        }

        // Check active explosions
        for (const explosion of this.game.explosions) {
            if (explosion.x === x && explosion.y === y) {
                return Infinity; // Active explosion = maximum danger
            }
        }

        return minDanger;
    }

    willBeHitByBomb(x, y, bomb) {
        // Check if position would be hit by bomb explosion
        if (x === bomb.x && y === bomb.y) return true;

        // Check horizontal explosion line
        if (y === bomb.y && Math.abs(x - bomb.x) <= bomb.power) {
            if (!this.isExplosionBlocked(bomb.x, bomb.y, x, y)) {
                return true;
            }
        }

        // Check vertical explosion line
        if (x === bomb.x && Math.abs(y - bomb.y) <= bomb.power) {
            if (!this.isExplosionBlocked(bomb.x, bomb.y, x, y)) {
                return true;
            }
        }

        return false;
    }

    isExplosionBlocked(bombX, bombY, targetX, targetY) {
        // Check if explosion from bomb to target is blocked by wall
        if (bombY === targetY) { // Horizontal
            const start = Math.min(bombX, targetX);
            const end = Math.max(bombX, targetX);
            for (let x = start + 1; x < end; x++) {
                if (this.game.board[bombY][x] === 'wall') return true;
            }
        } else { // Vertical
            const start = Math.min(bombY, targetY);
            const end = Math.max(bombY, targetY);
            for (let y = start + 1; y < end; y++) {
                if (this.game.board[targetY][y] === 'wall') return true;
            }
        }
        return false;
    }

    canAndShouldPlaceBomb(x, y) {
        // Can't place if we've reached bomb limit
        if (this.player.activeBombs >= this.player.maxBombs) return false;

        // Don't bomb too frequently
        const now = this.game.gameTime;
        if (now - this.lastBombTime < this.minBombInterval) return false;

        // Check if there's something worth bombing adjacent
        const targets = this.getAdjacentTargets(x, y);
        if (targets.length === 0) return false;

        // Only bomb if we can escape
        return this.canEscapeFromPosition(x, y);
    }

    getAdjacentTargets(x, y) {
        const targets = [];
        const checks = [
            { x: x + 1, y: y },
            { x: x - 1, y: y },
            { x: x, y: y + 1 },
            { x: x, y: y - 1 }
        ];

        for (const pos of checks) {
            if (pos.x >= 0 && pos.x < this.game.boardWidth &&
                pos.y >= 0 && pos.y < this.game.boardHeight) {
                const cell = this.game.board[pos.y][pos.x];
                if (cell === 'crate') {
                    targets.push(pos);
                }
                // Also target other players
                const player = this.game.getEntityAt(pos.x, pos.y);
                if (player && player !== this.player) {
                    targets.push(pos);
                }
            }
        }

        return targets;
    }

    canEscapeFromPosition(bombX, bombY) {
        // Simulate bomb placement and check escape routes
        const safePositions = this.findSafePositions(bombX, bombY, this.player.bombPower);

        // Need at least one reachable safe position
        for (const safe of safePositions) {
            const path = this.findPath(bombX, bombY, safe.x, safe.y, true);
            if (path && path.length > 0 && path.length <= 4) { // Can reach safety in 4 moves
                return true;
            }
        }

        return false;
    }

    findSafePositions(bombX, bombY, power) {
        const safe = [];

        // Check all positions within escape range
        for (let y = 0; y < this.game.boardHeight; y++) {
            for (let x = 0; x < this.game.boardWidth; x++) {
                if (!this.canMoveTo(x, y)) continue;

                // Check if this position would be safe from the bomb
                const simBomb = { x: bombX, y: bombY, power: power };
                if (!this.willBeHitByBomb(x, y, simBomb)) {
                    // Also check it's safe from other bombs
                    let safeFromOthers = true;
                    for (const bomb of this.game.bombs) {
                        if (this.willBeHitByBomb(x, y, bomb)) {
                            safeFromOthers = false;
                            break;
                        }
                    }
                    if (safeFromOthers) {
                        safe.push({ x, y });
                    }
                }
            }
        }

        return safe;
    }

    placeBombAndEscape(x, y) {
        console.log(`[AI ${this.playerIndex}] Placing bomb at (${x}, ${y})`);
        this.game.placeBomb(this.player);
        this.lastBombTime = this.game.gameTime;

        // Immediately plan escape
        this.planEscape(x, y);
    }

    planEscape(x, y) {
        const safePositions = [];

        // Find all safe positions
        for (let sy = 0; sy < this.game.boardHeight; sy++) {
            for (let sx = 0; sx < this.game.boardWidth; sx++) {
                if (this.getDangerLevel(sx, sy) === 0 && this.canMoveTo(sx, sy)) {
                    const distance = Math.abs(sx - x) + Math.abs(sy - y);
                    safePositions.push({ x: sx, y: sy, distance });
                }
            }
        }

        // Sort by distance
        safePositions.sort((a, b) => a.distance - b.distance);

        // Try to find path to nearest safe position
        for (const safe of safePositions) {
            const path = this.findPath(x, y, safe.x, safe.y, false); // Don't avoid danger during escape
            if (path && path.length > 0) {
                this.path = path;
                this.currentGoal = safe;
                this.followPath();
                return;
            }
        }

        // If no path found, try simple directional escape
        this.tryDirectionalEscape(x, y);
    }

    tryDirectionalEscape(x, y) {
        const moves = [
            { dx: 0, dy: -1 }, // up
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }   // right
        ];

        // Evaluate each move
        let bestMove = null;
        let bestSafety = -Infinity;

        for (const move of moves) {
            const newX = x + move.dx;
            const newY = y + move.dy;

            if (!this.canMoveTo(newX, newY)) continue;

            // Calculate safety score
            const danger = this.getDangerLevel(newX, newY);
            const safety = danger === 0 ? 1000 : -danger;

            if (safety > bestSafety) {
                bestSafety = safety;
                bestMove = move;
            }
        }

        if (bestMove) {
            this.movePlayer(bestMove.dx, bestMove.dy);
        }
    }

    findNewGoal(x, y) {
        // Priority 1: Nearby powerups
        const powerup = this.findNearestPowerup(x, y);
        if (powerup) {
            const path = this.findPath(x, y, powerup.x, powerup.y, true);
            if (path && path.length > 0) {
                this.path = path;
                this.currentGoal = powerup;
                this.state = 'collecting-powerup';
                this.followPath();
                return;
            }
        }

        // Priority 2: Destructible crates
        const crate = this.findNearestCrate(x, y);
        if (crate) {
            // Find bombing position for this crate
            const bombPos = this.findBombingPosition(crate.x, crate.y);
            if (bombPos) {
                const path = this.findPath(x, y, bombPos.x, bombPos.y, true);
                if (path && path.length > 0) {
                    this.path = path;
                    this.currentGoal = bombPos;
                    this.state = 'moving-to-bomb';
                    this.followPath();
                    return;
                }
            }
        }

        // Priority 3: Hunt other players
        const enemy = this.findNearestEnemy(x, y);
        if (enemy) {
            const path = this.findPath(x, y, enemy.x, enemy.y, true);
            if (path && path.length > 0) {
                this.path = path;
                this.currentGoal = enemy;
                this.state = 'hunting';
                this.followPath();
                return;
            }
        }

        // Priority 4: Random exploration
        this.exploreRandomly(x, y);
    }

    findNearestPowerup(x, y) {
        let nearest = null;
        let minDist = Infinity;

        for (const powerup of this.game.powerups) {
            const dist = Math.abs(powerup.x - x) + Math.abs(powerup.y - y);
            if (dist < minDist) {
                minDist = dist;
                nearest = powerup;
            }
        }

        return nearest;
    }

    findNearestCrate(x, y) {
        let nearest = null;
        let minDist = Infinity;

        for (let cy = 0; cy < this.game.boardHeight; cy++) {
            for (let cx = 0; cx < this.game.boardWidth; cx++) {
                if (this.game.board[cy][cx] === 'crate') {
                    const dist = Math.abs(cx - x) + Math.abs(cy - y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = { x: cx, y: cy };
                    }
                }
            }
        }

        return nearest;
    }

    findNearestEnemy(x, y) {
        let nearest = null;
        let minDist = Infinity;

        for (const player of this.game.players) {
            if (player === this.player || !player.alive) continue;

            const px = Math.floor(player.x);
            const py = Math.floor(player.y);
            const dist = Math.abs(px - x) + Math.abs(py - y);

            if (dist < minDist) {
                minDist = dist;
                nearest = { x: px, y: py };
            }
        }

        return nearest;
    }

    findBombingPosition(targetX, targetY) {
        // Find adjacent positions from which we can bomb the target
        const positions = [
            { x: targetX + 1, y: targetY },
            { x: targetX - 1, y: targetY },
            { x: targetX, y: targetY + 1 },
            { x: targetX, y: targetY - 1 }
        ];

        for (const pos of positions) {
            if (this.canMoveTo(pos.x, pos.y)) {
                return pos;
            }
        }

        return null;
    }

    exploreRandomly(x, y) {
        // Pick a random walkable position
        const positions = [];

        for (let py = 0; py < this.game.boardHeight; py++) {
            for (let px = 0; px < this.game.boardWidth; px++) {
                if (this.canMoveTo(px, py) && (px !== x || py !== y)) {
                    positions.push({ x: px, y: py });
                }
            }
        }

        if (positions.length > 0) {
            const target = positions[Math.floor(Math.random() * positions.length)];
            const path = this.findPath(x, y, target.x, target.y, true);
            if (path && path.length > 0) {
                this.path = path;
                this.currentGoal = target;
                this.state = 'exploring';
                this.followPath();
            }
        }
    }

    followPath() {
        if (!this.path || this.path.length === 0) return;

        const myX = Math.floor(this.player.x);
        const myY = Math.floor(this.player.y);
        const next = this.path[0];

        // Check if we've reached the next waypoint
        if (myX === next.x && myY === next.y) {
            this.path.shift(); // Remove reached waypoint
            if (this.path.length > 0) {
                this.followPath(); // Continue to next waypoint
            }
            return;
        }

        // Move towards next waypoint
        const dx = Math.sign(next.x - myX);
        const dy = Math.sign(next.y - myY);

        this.movePlayer(dx, dy);
    }

    findPath(startX, startY, targetX, targetY, avoidDanger = true) {
        // Simple A* pathfinding
        const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();
        const key = (x, y) => `${x},${y}`;

        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            // Check if we reached the target
            if (current.x === targetX && current.y === targetY) {
                // Reconstruct path
                const path = [];
                let node = current;
                while (node.parent) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }

            closedSet.add(key(current.x, current.y));

            // Check neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const nKey = key(neighbor.x, neighbor.y);
                if (closedSet.has(nKey)) continue;

                // Check if we can move here
                if (!this.canMoveTo(neighbor.x, neighbor.y)) continue;

                // Check danger if avoiding
                if (avoidDanger && this.getDangerLevel(neighbor.x, neighbor.y) > 0) {
                    continue;
                }

                const g = current.g + 1;
                const h = Math.abs(targetX - neighbor.x) + Math.abs(targetY - neighbor.y);
                const f = g + h;

                // Check if already in open set
                const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.f = f;
                        existing.parent = current;
                    }
                } else {
                    openSet.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g, h, f,
                        parent: current
                    });
                }
            }
        }

        return null; // No path found
    }

    movePlayer(dx, dy) {
        const myX = Math.floor(this.player.x);
        const myY = Math.floor(this.player.y);
        const newX = myX + dx;
        const newY = myY + dy;

        if (this.canMoveTo(newX, newY)) {
            this.game.movePlayer(this.player, dx, dy);
            // Set movement cooldown based on player speed
            // Higher speed = shorter cooldown
            this.movementCooldown = 200 / this.player.speed;
        }
    }

    canMoveTo(x, y) {
        // Check bounds
        if (x < 0 || x >= this.game.boardWidth || y < 0 || y >= this.game.boardHeight) {
            return false;
        }

        // Check for walls and crates
        const cell = this.game.board[y][x];
        if (cell === 'wall' || cell === 'crate') {
            return false;
        }

        // Check for bombs (but allow our current position)
        const myX = Math.floor(this.player.x);
        const myY = Math.floor(this.player.y);

        for (const bomb of this.game.bombs) {
            if (bomb.x === x && bomb.y === y) {
                // Only allow if it's our current position
                if (x !== myX || y !== myY) {
                    return false;
                }
            }
        }

        // Check if any other player is there
        for (const player of this.game.players) {
            if (player !== this.player && player.alive) {
                const px = Math.floor(player.x);
                const py = Math.floor(player.y);
                if (px === x && py === y) {
                    return false;
                }
            }
        }

        return true;
    }
}
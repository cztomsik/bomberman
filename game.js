class Game {
    constructor(width = 15, height = 13) {
        this.screen = 'main-menu';
        
        this.game = {
            board: [],
            players: [],
            bombs: [],
            explosions: [],
            powerups: [],
            winner: null
        };
        
        this.input = {
            keys: {},
            actions: []
        };
        
        this.boardWidth = width;
        this.boardHeight = height;
        
        this.resetGame();
    }
    
    resetGame() {
        this.game = {
            board: this.createBoard(),
            players: [],
            bombs: [],
            explosions: [],
            powerups: [],
            winner: null
        };
        
        this.input.actions = [];
    }
    
    createBoard() {
        const board = [];
        const { boardWidth, boardHeight } = this;
        
        // Define spawn corners
        const corners = [
            [1, 1], [boardWidth - 2, 1],
            [1, boardHeight - 2], [boardWidth - 2, boardHeight - 2]
        ];
        
        for (let y = 0; y < boardHeight; y++) {
            board[y] = [];
            for (let x = 0; x < boardWidth; x++) {
                // Walls
                if (x === 0 || x === boardWidth - 1 || y === 0 || y === boardHeight - 1 ||
                    (x % 2 === 0 && y % 2 === 0)) {
                    board[y][x] = 'wall';
                    continue;
                }
                
                // Clear spawn areas (2-block radius from corners)
                const nearCorner = corners.some(([cx, cy]) => 
                    Math.abs(x - cx) + Math.abs(y - cy) <= 1
                );
                
                board[y][x] = nearCorner ? null : (Math.random() < 0.7 ? 'crate' : null);
            }
        }
        
        return board;
    }
    
    createPlayer(id, x, y, isHuman = true) {
        const player = {
            id, x, y, isHuman,
            alive: true, speed: 1, bombPower: 1,
            maxBombs: 1, activeBombs: 0, bombCount: 1,
            powerups: [], moveTimer: 0, action: null
        };
        this.game.players.push(player);
        return player;
    }
    
    addBomb(x, y, owner) {
        const bomb = {
            x,
            y,
            owner,
            timer: 3000,
            power: owner.bombPower
        };
        
        this.game.bombs.push(bomb);
        this.game.board[y][x] = 'bomb';
        owner.activeBombs++;
        
        return bomb;
    }
    
    removeBomb(bomb) {
        const index = this.game.bombs.indexOf(bomb);
        if (index !== -1) this.game.bombs.splice(index, 1);
        if (this.game.board[bomb.y][bomb.x] === 'bomb') {
            this.game.board[bomb.y][bomb.x] = null;
        }
        bomb.owner.activeBombs--;
    }
    
    addExplosion(x, y, duration = 500) {
        const explosion = { x, y, timer: duration };
        this.game.explosions.push(explosion);
        return explosion;
    }
    
    removeExplosion(explosion) {
        const index = this.game.explosions.indexOf(explosion);
        if (index !== -1) this.game.explosions.splice(index, 1);
    }
    
    addPowerup(x, y, type) {
        const powerup = { x, y, type };
        this.game.powerups.push(powerup);
        return powerup;
    }
    
    removePowerup(powerup) {
        const index = this.game.powerups.indexOf(powerup);
        if (index !== -1) this.game.powerups.splice(index, 1);
    }
    
    getEntityAt(x, y) {
        return this.game.players.find(e => e.alive && Math.floor(e.x) === x && Math.floor(e.y) === y);
    }
    
    getPowerupAt(x, y) {
        return this.game.powerups.find(p => p.x === x && p.y === y);
    }
    
    getBombAt(x, y) {
        return this.game.bombs.find(b => b.x === x && b.y === y);
    }
    
    isWalkable(x, y) {
        if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
            return false;
        }
        
        const cell = this.game.board[y][x];
        return cell === null || cell === 'powerup';
    }
    
    addInputAction(playerId, action) {
        this.input.actions.push({ playerId, action, timestamp: Date.now() });
    }
    
    clearInputActions() {
        this.input.actions = [];
    }
    
    getPlayerActions(playerId) {
        return this.input.actions.filter(a => a.playerId === playerId);
    }
    
    // Game logic methods
    movePlayer(player, dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // Check if the new position is walkable
        if (this.isWalkable(newX, newY)) {
            // Check if there's a bomb at the new position
            const bomb = this.getBombAt(newX, newY);
            
            // Can walk if no bomb, or if we're currently standing on this bomb
            if (!bomb || this.getBombAt(player.x, player.y) === bomb) {
                player.x = newX;
                player.y = newY;
            }
        }
    }
    
    placeBomb(player) {
        if (player.activeBombs >= player.maxBombs) return false;
        
        const x = player.x;
        const y = player.y;
        
        // Check if there's already a bomb at this position
        if (this.getBombAt(x, y)) return false;
        
        this.addBomb(x, y, player);
        return true;
    }
    
    updateBombs(deltaTime) {
        const bombsToExplode = [];
        
        for (const bomb of this.game.bombs) {
            bomb.timer -= deltaTime;
            
            if (bomb.timer <= 0) {
                bombsToExplode.push(bomb);
            }
        }
        
        for (const bomb of bombsToExplode) {
            this.explodeBomb(bomb);
        }
    }
    
    explodeBomb(bomb) {
        this.removeBomb(bomb);
        
        // Center explosion
        this.addExplosion(bomb.x, bomb.y);
        
        // Directional explosions
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        
        for (const [dx, dy] of directions) {
            for (let i = 1; i <= bomb.power; i++) {
                const x = bomb.x + dx * i;
                const y = bomb.y + dy * i;
                
                // Check bounds
                if (x < 0 || x >= this.boardWidth || 
                    y < 0 || y >= this.boardHeight) {
                    break;
                }
                
                const cell = this.game.board[y][x];
                
                // Stop at walls
                if (cell === 'wall') break;
                
                // Add explosion
                this.addExplosion(x, y);
                
                // Destroy crates
                if (cell === 'crate') {
                    this.game.board[y][x] = null;
                    
                    // Chance to spawn powerup
                    if (Math.random() < 0.3) {
                        const types = ['bomb', 'power', 'speed'];
                        const type = types[Math.floor(Math.random() * types.length)];
                        this.addPowerup(x, y, type);
                    }
                    break; // Explosion stops at crate
                }
                
                // Chain reaction with other bombs
                const otherBomb = this.getBombAt(x, y);
                if (otherBomb && otherBomb !== bomb) {
                    otherBomb.timer = 0; // Instant explosion
                }
            }
        }
    }
    
    updateExplosions(deltaTime) {
        const explosionsToRemove = [];
        
        for (const explosion of this.game.explosions) {
            explosion.timer -= deltaTime;
            
            if (explosion.timer <= 0) {
                explosionsToRemove.push(explosion);
            }
        }
        
        for (const explosion of explosionsToRemove) {
            this.removeExplosion(explosion);
        }
    }
    
    checkCollisions(player) {
        if (!player?.alive) return;
        
        const px = player.x;
        const py = player.y;
        
        // Check explosion collisions
        for (const explosion of this.game.explosions) {
            if (explosion.x === px && explosion.y === py) {
                player.alive = false;
                return;
            }
        }
        
        // Check powerup collisions
        const powerup = this.getPowerupAt(px, py);
        if (powerup) {
            this.applyPowerup(player, powerup);
            this.removePowerup(powerup);
        }
    }
    
    applyPowerup(player, powerup) {
        switch (powerup.type) {
            case 'bomb':
                player.maxBombs = Math.min(player.maxBombs + 1, 8);
                break;
            case 'power':
                player.bombPower = Math.min(player.bombPower + 1, 8);
                break;
            case 'speed':
                player.speed = Math.min(player.speed + 0.5, 3);
                break;
        }
        
        player.powerups.push(powerup.type);
    }
    
    // Main update method for game loop
    update(deltaTime) {
        this.updateBombs(deltaTime);
        this.updateExplosions(deltaTime);
        
        // Check collisions for all players
        for (const player of this.game.players) {
            this.checkCollisions(player);
        }
    }

    // String renderer for testing
    renderToString() {
        let result = '';
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                // Check for player
                const player = this.getEntityAt(x, y);
                if (player) {
                    result += 'P';
                    continue;
                }
                
                // Check for explosion
                const explosion = this.game.explosions.find(e => e.x === x && e.y === y);
                if (explosion) {
                    result += 'X';
                    continue;
                }
                
                // Check for powerup
                const powerup = this.getPowerupAt(x, y);
                if (powerup) {
                    result += powerup.type[0].toUpperCase(); // B, P, or S
                    continue;
                }
                
                // Check board cell
                const cell = this.game.board[y][x];
                switch (cell) {
                    case 'wall': result += '#'; break;
                    case 'crate': result += '%'; break;
                    case 'bomb': result += '*'; break;
                    default: result += '.'; break;
                }
            }
            if (y < this.boardHeight - 1) result += '\n';
        }
        return result;
    }
}

export default Game;
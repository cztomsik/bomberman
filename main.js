import GameState from './state.js';

class BombermanGame {
    constructor() {
        this.boardElement = document.getElementById('game-board');
        this.bombCountElement = document.getElementById('bomb-count');
        this.bombPowerElement = document.getElementById('bomb-power');
        this.lastTime = 0;
        this.keys = {};
        this.player = null;
        
        this.init();
    }
    
    init() {
        // Initialize game state
        GameState.init();
        GameState.screen = 'game';
        
        // Create player at starting position
        this.player = GameState.createPlayer(0, 1, 1, true);
        
        // Set up the board grid
        this.boardElement.style.gridTemplateColumns = `repeat(${GameState.boardWidth}, 1fr)`;
        
        // Set up input handlers
        this.setupInput();
        
        // Start game loop
        this.gameLoop(0);
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Prevent default for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    handleInput() {
        if (!this.player || !this.player.alive) return;
        
        // Movement
        let dx = 0, dy = 0;
        
        if (this.keys['ArrowUp']) dy = -1;
        if (this.keys['ArrowDown']) dy = 1;
        if (this.keys['ArrowLeft']) dx = -1;
        if (this.keys['ArrowRight']) dx = 1;
        
        if (dx !== 0 || dy !== 0) {
            this.movePlayer(dx, dy);
        }
        
        // Bomb placement
        if (this.keys[' '] && !this.keys.spacePressedLastFrame) {
            this.placeBomb();
        }
        
        this.keys.spacePressedLastFrame = this.keys[' '];
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check if the new position is walkable
        if (GameState.isWalkable(newX, newY)) {
            // Check if there's a bomb at the new position
            const bomb = GameState.getBombAt(newX, newY);
            
            // Can only walk on bombs if we're already standing on it (just placed it)
            if (!bomb || (this.player.x === newX && this.player.y === newY)) {
                this.player.x = newX;
                this.player.y = newY;
            }
        }
    }
    
    placeBomb() {
        if (this.player.activeBombs >= this.player.maxBombs) return;
        
        const x = this.player.x;
        const y = this.player.y;
        
        // Check if there's already a bomb at this position
        if (GameState.getBombAt(x, y)) return;
        
        GameState.addBomb(x, y, this.player);
    }
    
    updateBombs(deltaTime) {
        const bombsToExplode = [];
        
        for (const bomb of GameState.game.bombs) {
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
        GameState.removeBomb(bomb);
        
        // Center explosion
        GameState.addExplosion(bomb.x, bomb.y);
        
        // Directional explosions
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        
        for (const [dx, dy] of directions) {
            for (let i = 1; i <= bomb.power; i++) {
                const x = bomb.x + dx * i;
                const y = bomb.y + dy * i;
                
                // Check bounds
                if (x < 0 || x >= GameState.boardWidth || 
                    y < 0 || y >= GameState.boardHeight) {
                    break;
                }
                
                const cell = GameState.game.board[y][x];
                
                // Stop at walls
                if (cell === 'wall') break;
                
                // Add explosion
                GameState.addExplosion(x, y);
                
                // Destroy crates
                if (cell === 'crate') {
                    GameState.game.board[y][x] = null;
                    
                    // Chance to spawn powerup
                    if (Math.random() < 0.3) {
                        const types = ['bomb', 'power', 'speed'];
                        const type = types[Math.floor(Math.random() * types.length)];
                        GameState.addPowerup(x, y, type);
                    }
                    break; // Explosion stops at crate
                }
                
                // Chain reaction with other bombs
                const otherBomb = GameState.getBombAt(x, y);
                if (otherBomb && otherBomb !== bomb) {
                    otherBomb.timer = 0; // Instant explosion
                }
            }
        }
    }
    
    updateExplosions(deltaTime) {
        const explosionsToRemove = [];
        
        for (const explosion of GameState.game.explosions) {
            explosion.timer -= deltaTime;
            
            if (explosion.timer <= 0) {
                explosionsToRemove.push(explosion);
            }
        }
        
        for (const explosion of explosionsToRemove) {
            GameState.removeExplosion(explosion);
        }
    }
    
    checkCollisions() {
        if (!this.player?.alive) return;
        
        const px = this.player.x;
        const py = this.player.y;
        
        // Check explosion collisions
        for (const explosion of GameState.game.explosions) {
            if (explosion.x === px && explosion.y === py) {
                this.player.alive = false;
                return;
            }
        }
        
        // Check powerup collisions
        const powerup = GameState.getPowerupAt(px, py);
        if (powerup) {
            this.applyPowerup(powerup);
            GameState.removePowerup(powerup);
        }
    }
    
    applyPowerup(powerup) {
        switch (powerup.type) {
            case 'bomb':
                this.player.maxBombs = Math.min(this.player.maxBombs + 1, 8);
                break;
            case 'power':
                this.player.bombPower = Math.min(this.player.bombPower + 1, 8);
                break;
            case 'speed':
                this.player.speed = Math.min(this.player.speed + 0.5, 3);
                break;
        }
        
        this.player.powerups.push(powerup.type);
        this.updateUI();
    }
    
    updateUI() {
        this.bombCountElement.textContent = this.player.maxBombs;
        this.bombPowerElement.textContent = this.player.bombPower;
    }
    
    getCellContent(x, y) {
        // Check for player at this position
        if (this.player?.alive && this.player.x === x && this.player.y === y) {
            return { content: '🤖', className: 'cell' };
        }
        
        // Check for explosion at this position
        if (GameState.game.explosions.some(e => e.x === x && e.y === y)) {
            return { content: '💥', className: 'cell' };
        }
        
        // Check for powerup at this position
        const powerup = GameState.game.powerups.find(p => p.x === x && p.y === y);
        if (powerup) {
            const icons = { bomb: '💣', power: '🔥', speed: '👟' };
            return { content: icons[powerup.type], className: 'cell' };
        }
        
        // Check board cell
        const cell = GameState.game.board[y][x];
        switch (cell) {
            case 'bomb': return { content: '💣', className: 'cell' };
            case 'wall': return { content: '🧱', className: 'cell wall' };
            case 'crate': return { content: '📦', className: 'cell crate' };
            default: return { content: '', className: 'cell' };
        }
    }
    
    render() {
        const { boardWidth, boardHeight } = GameState;
        let html = '';
        
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                const { content, className } = this.getCellContent(x, y);
                html += `<div class="${className}">${content}</div>`;
            }
        }
        
        this.boardElement.innerHTML = html;
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Handle input (limit rate to prevent too fast movement)
        if (!this.inputTimer || this.inputTimer <= 0) {
            this.handleInput();
            this.inputTimer = 100; // Milliseconds between input processing
        } else {
            this.inputTimer -= deltaTime;
        }
        
        // Update game state
        this.updateBombs(deltaTime);
        this.updateExplosions(deltaTime);
        this.checkCollisions();
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BombermanGame();
});
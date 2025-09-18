import Game from './game.js';
import AIController from './ai.js';

class BombermanGame {
    constructor(options = {}) {
        // Allow dependency injection for testing
        this.boardElement = options.boardElement || (typeof document !== 'undefined' ? document.getElementById('game-board') : null);
        this.bombCountElement = options.bombCountElement || (typeof document !== 'undefined' ? document.getElementById('bomb-count') : null);
        this.bombPowerElement = options.bombPowerElement || (typeof document !== 'undefined' ? document.getElementById('bomb-power') : null);
        this.lastTime = 0;
        this.movementTimer = 0;
        this.keys = {};
        this.player = null;
        this.game = null;
        this.aiControllers = [];

        // Only auto-init if we have DOM elements
        if (this.boardElement && !options.skipInit) {
            this.init();
        }
    }

    init() {
        // Create game instance
        this.game = new Game();

        // Create human player at starting position (top-left)
        this.player = this.game.createPlayer(0, 1, 1, true);
        this.player.name = 'Player';
        this.player.emoji = '😊';

        // Create AI players at other corners
        const ai1 = this.game.createPlayer(1, this.game.boardWidth - 2, 1, false);
        ai1.name = 'AI 1';
        ai1.emoji = '🤖';

        const ai2 = this.game.createPlayer(2, 1, this.game.boardHeight - 2, false);
        ai2.name = 'AI 2';
        ai2.emoji = '👾';

        const ai3 = this.game.createPlayer(3, this.game.boardWidth - 2, this.game.boardHeight - 2, false);
        ai3.name = 'AI 3';
        ai3.emoji = '🎯';

        // Create AI controllers
        this.aiControllers = [
            new AIController(this.game, 1),
            new AIController(this.game, 2),
            new AIController(this.game, 3)
        ];

        // Set up the board grid (if DOM element exists)
        if (this.boardElement) {
            this.boardElement.style.gridTemplateColumns = `repeat(${this.game.boardWidth}, 1fr)`;
        }
        
        // Set up input handlers (if in browser)
        if (typeof document !== 'undefined') {
            this.setupInput();
        }
        
        // Start game loop (if in browser)
        if (typeof requestAnimationFrame !== 'undefined') {
            this.gameLoop(0);
        }
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

    handleInput(deltaTime) {
        if (!this.player?.alive) return;

        // Movement (throttled to prevent too fast movement)
        if (this.movementTimer <= 0) {
            let dx = 0, dy = 0;

            if (this.keys['ArrowUp']) dy = -1;
            if (this.keys['ArrowDown']) dy = 1;
            if (this.keys['ArrowLeft']) dx = -1;
            if (this.keys['ArrowRight']) dx = 1;

            if (dx !== 0 || dy !== 0) {
                this.game.movePlayer(this.player, dx, dy);
                this.movementTimer = 200 / this.player.speed; // Faster movement with higher speed
            }
        } else {
            this.movementTimer -= deltaTime;
        }

        // Bomb placement (not throttled - should respond immediately)
        if (this.keys[' '] && !this.keys.spacePressedLastFrame) {
            if (this.game.placeBomb(this.player)) {
                this.updateUI();
            }
        }

        this.keys.spacePressedLastFrame = this.keys[' '];
    }

    updateUI() {
        if (this.bombCountElement) {
            this.bombCountElement.textContent = this.player.maxBombs;
        }
        if (this.bombPowerElement) {
            this.bombPowerElement.textContent = this.player.bombPower;
        }
    }

    getCellContent(x, y) {
        // Check for any player at this position
        for (const player of this.game.players) {
            if (player.alive && Math.floor(player.x) === x && Math.floor(player.y) === y) {
                return { content: player.emoji || '🤖', className: 'cell' };
            }
        }

        // Check for explosion at this position
        if (this.game.explosions.some(e => e.x === x && e.y === y)) {
            return { content: '💥', className: 'cell' };
        }

        // Check for powerup at this position
        const powerup = this.game.powerups.find(p => p.x === x && p.y === y);
        if (powerup) {
            const icons = { bomb: '💣', power: '🔥', speed: '👟' };
            return { content: icons[powerup.type], className: `cell powerup-${powerup.type}` };
        }

        // Check board cell
        const cell = this.game.board[y][x];
        switch (cell) {
            case 'bomb': return { content: '💣', className: 'cell' };
            case 'wall': return { content: '🧱', className: 'cell wall' };
            case 'crate': return { content: '📦', className: 'cell crate' };
            default: return { content: '', className: 'cell' };
        }
    }
    
    render() {
        if (!this.boardElement) return; // Skip rendering if no DOM element
        
        const { boardWidth, boardHeight } = this.game;
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

        // Always handle input to maintain proper state tracking
        this.handleInput(deltaTime);

        // Update AI controllers
        for (const ai of this.aiControllers) {
            ai.update(deltaTime);
        }

        // Update game state (all logic is now in GameState)
        this.game.update(deltaTime);

        // Check if powerups were collected (update UI)
        if (this.player?.powerups.length > (this.lastPowerupCount || 0)) {
            this.updateUI();
            this.lastPowerupCount = this.player.powerups.length;
        }

        // Render
        this.render();

        // Continue loop (if in browser)
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Start the game when DOM is loaded (only in browser)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new BombermanGame();
    });
}

export { BombermanGame };
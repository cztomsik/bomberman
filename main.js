import Game from './game.js';
import AIController from './ai.js';

class BombermanGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 40;
        this.game = null;
        this.player = null;
        this.aiControllers = [];
        this.keys = {};
        this.lastTime = 0;
        this.movementTimer = 0;
        this.gameState = 'playing'; // 'playing', 'paused', 'gameover'

        this.init();
        this.setupInput();
        this.gameLoop(0);
    }

    init() {
        this.game = new Game();
        this.gameState = 'playing';

        // Resize canvas to fit board
        this.canvas.width = this.game.boardWidth * this.cellSize;
        this.canvas.height = this.game.boardHeight * this.cellSize;

        // Create human player (top-left)
        this.player = this.game.createPlayer(0, 1, 1, true);
        this.player.name = 'You';
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

        this.movementTimer = 0;
        this.keys = {};
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            // Handle special keys
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
            if ((e.key === 'r' || e.key === 'R') && this.gameState === 'gameover') {
                this.restart();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    restart() {
        this.init();
    }

    handleInput(deltaTime) {
        if (this.gameState !== 'playing' || !this.player?.alive) return;

        // Movement (throttled)
        if (this.movementTimer <= 0) {
            let dx = 0, dy = 0;

            if (this.keys['ArrowUp']) dy = -1;
            else if (this.keys['ArrowDown']) dy = 1;
            else if (this.keys['ArrowLeft']) dx = -1;
            else if (this.keys['ArrowRight']) dx = 1;

            if (dx !== 0 || dy !== 0) {
                this.game.movePlayer(this.player, dx, dy);
                this.movementTimer = 150 / this.player.speed;
            }
        } else {
            this.movementTimer -= deltaTime;
        }

        // Bomb placement
        if (this.keys[' '] && !this.keys.spacePressedLastFrame) {
            this.game.placeBomb(this.player);
        }
        this.keys.spacePressedLastFrame = this.keys[' '];
    }

    checkGameOver() {
        if (this.gameState !== 'playing') return;

        const alivePlayers = this.game.players.filter(p => p.alive);

        if (alivePlayers.length <= 1) {
            this.gameState = 'gameover';
            if (alivePlayers.length === 1) {
                this.game.winner = alivePlayers[0];
            } else {
                this.game.winner = null; // Draw
            }
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // Update AI
        for (const ai of this.aiControllers) {
            ai.update(deltaTime);
        }

        // Update game logic
        this.game.update(deltaTime);

        // Check for game over
        this.checkGameOver();
    }

    render() {
        const ctx = this.ctx;
        const { boardWidth, boardHeight, board, players, bombs, explosions, powerups } = this.game;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                const cell = board[y][x];
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                // Background
                ctx.fillStyle = '#444';
                ctx.fillRect(px, py, this.cellSize, this.cellSize);

                // Cell content
                ctx.font = '24px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (cell === 'wall') {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    ctx.fillText('🧱', px + this.cellSize/2, py + this.cellSize/2);
                } else if (cell === 'crate') {
                    ctx.fillStyle = '#8b4513';
                    ctx.fillRect(px, py, this.cellSize, this.cellSize);
                    ctx.fillText('📦', px + this.cellSize/2, py + this.cellSize/2);
                } else if (cell === 'bomb') {
                    ctx.fillText('💣', px + this.cellSize/2, py + this.cellSize/2);
                }
            }
        }

        // Draw powerups
        for (const powerup of powerups) {
            const px = powerup.x * this.cellSize;
            const py = powerup.y * this.cellSize;
            const icons = { bomb: '💣', power: '🔥', speed: '👟' };
            ctx.fillText(icons[powerup.type], px + this.cellSize/2, py + this.cellSize/2);
        }

        // Draw explosions
        for (const explosion of explosions) {
            const px = explosion.x * this.cellSize;
            const py = explosion.y * this.cellSize;
            ctx.fillText('💥', px + this.cellSize/2, py + this.cellSize/2);
        }

        // Draw players
        for (const player of players) {
            if (player.alive) {
                const px = player.x * this.cellSize;
                const py = player.y * this.cellSize;
                ctx.fillText(player.emoji, px + this.cellSize/2, py + this.cellSize/2);
            }
        }

        // Draw UI overlay
        this.renderUI();
    }

    renderUI() {
        const ctx = this.ctx;

        // Player stats bar at top
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 30);

        ctx.font = '14px monospace';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        if (this.player) {
            const status = this.player.alive ? '' : ' (DEAD)';
            ctx.fillText(
                `${this.player.emoji} Bombs: ${this.player.maxBombs} | Power: ${this.player.bombPower} | Speed: ${this.player.speed.toFixed(1)}${status}`,
                10, 15
            );
        }

        // Game state overlays
        if (this.gameState === 'paused') {
            this.renderOverlay('PAUSED', 'Press P to resume');
        } else if (this.gameState === 'gameover') {
            const message = this.game.winner
                ? `${this.game.winner.emoji} ${this.game.winner.name} wins!`
                : 'Draw!';
            this.renderOverlay('GAME OVER', message + '\n\nPress R to restart');
        }
    }

    renderOverlay(title, message) {
        const ctx = this.ctx;

        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, this.canvas.width/2, this.canvas.height/2 - 40);

        // Message
        ctx.font = '20px monospace';
        const lines = message.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, this.canvas.width/2, this.canvas.height/2 + 20 + i * 30);
        });
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        const cappedDelta = Math.min(deltaTime, 100);

        this.handleInput(cappedDelta);
        this.update(cappedDelta);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start game when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('game');
        if (canvas) {
            new BombermanGame(canvas);
        }
    });
}

export { BombermanGame };

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
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameover'
        this.menuSelection = 0;
        this.menuOptions = ['Start Game', 'Settings', 'Controls'];
        this.showingControls = false;
        this.showingSettings = false;

        // Game settings
        this.settings = {
            playerCount: 4,  // Total players (1 human + AI)
            minPlayers: 2,
            maxPlayers: 8
        };
        this.settingsSelection = 0;

        // Set initial canvas size for menu
        this.canvas.width = 600;
        this.canvas.height = 520;

        this.setupInput();
        this.gameLoop(0);
    }

    init() {
        // Calculate grid size based on player count
        const gridSize = this.calculateGridSize(this.settings.playerCount);
        this.game = new Game(gridSize.width, gridSize.height);
        this.gameState = 'playing';

        // Resize canvas to fit board
        this.canvas.width = this.game.boardWidth * this.cellSize;
        this.canvas.height = this.game.boardHeight * this.cellSize;

        // Define spawn positions (corners and edges for more players)
        const spawnPositions = this.getSpawnPositions(this.game.boardWidth, this.game.boardHeight, this.settings.playerCount);

        // Player emojis and names
        const playerEmojis = ['😊', '🤖', '👾', '🎯', '👹', '🤡', '👻', '🎃'];
        const playerNames = ['You', 'AI 1', 'AI 2', 'AI 3', 'AI 4', 'AI 5', 'AI 6', 'AI 7'];

        // Create human player
        this.player = this.game.createPlayer(0, spawnPositions[0].x, spawnPositions[0].y, true);
        this.player.name = playerNames[0];
        this.player.emoji = playerEmojis[0];

        // Create AI players
        this.aiControllers = [];
        for (let i = 1; i < this.settings.playerCount; i++) {
            const aiPlayer = this.game.createPlayer(i, spawnPositions[i].x, spawnPositions[i].y, false);
            aiPlayer.name = playerNames[i];
            aiPlayer.emoji = playerEmojis[i];
            this.aiControllers.push(new AIController(this.game, i));
        }

        this.movementTimer = 0;
        this.keys = {};
    }

    getSpawnPositions(boardWidth, boardHeight, playerCount) {
        // Define spawn positions - corners first, then edges
        const positions = [
            { x: 1, y: 1 },                                    // Top-left
            { x: boardWidth - 2, y: 1 },                       // Top-right
            { x: 1, y: boardHeight - 2 },                      // Bottom-left
            { x: boardWidth - 2, y: boardHeight - 2 },         // Bottom-right
            { x: Math.floor(boardWidth / 2), y: 1 },           // Top-center
            { x: Math.floor(boardWidth / 2), y: boardHeight - 2 }, // Bottom-center
            { x: 1, y: Math.floor(boardHeight / 2) },          // Left-center
            { x: boardWidth - 2, y: Math.floor(boardHeight / 2) }  // Right-center
        ];

        return positions.slice(0, playerCount);
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }

            // Handle menu input
            if (this.gameState === 'menu') {
                this.handleMenuInput(e.key);
                return;
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

    handleMenuInput(key) {
        if (this.showingControls) {
            // Any key closes the controls screen
            if (key === 'Enter' || key === 'Escape' || key === ' ') {
                this.showingControls = false;
            }
            return;
        }

        if (this.showingSettings) {
            this.handleSettingsInput(key);
            return;
        }

        if (key === 'ArrowUp') {
            this.menuSelection = (this.menuSelection - 1 + this.menuOptions.length) % this.menuOptions.length;
        } else if (key === 'ArrowDown') {
            this.menuSelection = (this.menuSelection + 1) % this.menuOptions.length;
        } else if (key === 'Enter' || key === ' ') {
            this.selectMenuOption();
        }
    }

    handleSettingsInput(key) {
        if (key === 'Escape') {
            this.showingSettings = false;
            return;
        }

        if (key === 'ArrowLeft') {
            if (this.settings.playerCount > this.settings.minPlayers) {
                this.settings.playerCount--;
            }
        } else if (key === 'ArrowRight') {
            if (this.settings.playerCount < this.settings.maxPlayers) {
                this.settings.playerCount++;
            }
        } else if (key === 'Enter' || key === ' ') {
            this.showingSettings = false;
        }
    }

    selectMenuOption() {
        const option = this.menuOptions[this.menuSelection];
        if (option === 'Start Game') {
            this.init();
        } else if (option === 'Settings') {
            this.showingSettings = true;
        } else if (option === 'Controls') {
            this.showingControls = true;
        }
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

        // Render menu if in menu state
        if (this.gameState === 'menu') {
            this.renderMenu();
            return;
        }

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

    renderMenu() {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title with bomb emoji
        ctx.font = 'bold 60px monospace';
        ctx.fillStyle = '#ff6600';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BOMBERMAN', this.canvas.width/2, 100);

        // Decorative bombs
        ctx.font = '40px serif';
        ctx.fillText('💣', this.canvas.width/2 - 180, 100);
        ctx.fillText('💣', this.canvas.width/2 + 180, 100);

        if (this.showingControls) {
            this.renderControlsScreen();
            return;
        }

        if (this.showingSettings) {
            this.renderSettingsScreen();
            return;
        }

        // Menu options
        ctx.font = '24px monospace';
        const startY = 220;
        const spacing = 50;

        this.menuOptions.forEach((option, i) => {
            const y = startY + i * spacing;

            if (i === this.menuSelection) {
                // Highlight selected option
                ctx.fillStyle = '#ff6600';
                ctx.fillText('> ' + option + ' <', this.canvas.width/2, y);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillText(option, this.canvas.width/2, y);
            }
        });

        // Instructions
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('Use Arrow Keys to navigate', this.canvas.width/2, 380);
        ctx.fillText('Press Enter or Space to select', this.canvas.width/2, 410);

        // Credits
        ctx.font = '14px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('Classic Bomberman Clone', this.canvas.width/2, 480);
    }

    renderControlsScreen() {
        const ctx = this.ctx;

        // Controls title
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ff6600';
        ctx.fillText('CONTROLS', this.canvas.width/2, 200);

        // Control list
        ctx.font = '20px monospace';
        ctx.fillStyle = 'white';
        const controls = [
            'Arrow Keys - Move',
            'Space - Place Bomb',
            'P - Pause Game',
            'R - Restart (Game Over)'
        ];

        controls.forEach((control, i) => {
            ctx.fillText(control, this.canvas.width/2, 260 + i * 35);
        });

        // Back instruction
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('Press Enter or Escape to go back', this.canvas.width/2, 440);
    }

    renderSettingsScreen() {
        const ctx = this.ctx;

        // Settings title
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ff6600';
        ctx.fillText('SETTINGS', this.canvas.width/2, 200);

        // Player count setting
        ctx.font = '20px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText('Number of Players:', this.canvas.width/2, 280);

        // Player count selector with arrows
        ctx.font = '24px monospace';
        ctx.fillStyle = '#ff6600';
        const leftArrow = this.settings.playerCount > this.settings.minPlayers ? '◀' : ' ';
        const rightArrow = this.settings.playerCount < this.settings.maxPlayers ? '▶' : ' ';
        ctx.fillText(`${leftArrow}  ${this.settings.playerCount}  ${rightArrow}`, this.canvas.width/2, 320);

        // Grid size info
        const gridSize = this.calculateGridSize(this.settings.playerCount);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText(`Grid Size: ${gridSize.width}x${gridSize.height}`, this.canvas.width/2, 370);
        ctx.fillText(`(1 Human + ${this.settings.playerCount - 1} AI)`, this.canvas.width/2, 400);

        // Instructions
        ctx.fillText('Use Left/Right arrows to adjust', this.canvas.width/2, 450);
        ctx.fillText('Press Enter or Escape to go back', this.canvas.width/2, 480);
    }

    calculateGridSize(playerCount) {
        // Base size for 2 players, increase proportionally
        // Classic Bomberman uses 15x13, good for 4 players
        // Scale based on player count
        const baseWidth = 11;  // Minimum for 2 players
        const baseHeight = 11;

        // Add 2 cells in each dimension per additional player (keep odd for wall pattern)
        const extraPlayers = playerCount - 2;
        const width = baseWidth + Math.floor(extraPlayers * 2);
        const height = baseHeight + Math.floor(extraPlayers * 1);

        // Ensure odd dimensions for proper wall grid pattern
        const finalWidth = width % 2 === 0 ? width + 1 : width;
        const finalHeight = height % 2 === 0 ? height + 1 : height;

        return { width: finalWidth, height: finalHeight };
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

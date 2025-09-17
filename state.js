const GameState = {
    screen: 'main-menu',
    
    game: {
        board: [],
        players: [],
        bombs: [],
        explosions: [],
        powerups: [],
        winner: null
    },
    
    input: {
        keys: {},
        actions: []
    },
    
    boardWidth: 15,
    boardHeight: 13,
    
    init(width = 15, height = 13) {
        this.boardWidth = width;
        this.boardHeight = height;
        this.resetGame();
    },
    
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
    },
    
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
    },
    
    createPlayer(id, x, y, isHuman = true) {
        const player = {
            id, x, y, isHuman,
            alive: true, speed: 1, bombPower: 1,
            maxBombs: 1, activeBombs: 0, bombCount: 1,
            powerups: [], moveTimer: 0, action: null
        };
        this.game.players.push(player);
        return player;
    },
    
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
    },
    
    removeBomb(bomb) {
        this.game.bombs = this.game.bombs.filter(b => b !== bomb);
        if (this.game.board[bomb.y][bomb.x] === 'bomb') {
            this.game.board[bomb.y][bomb.x] = null;
        }
        bomb.owner.activeBombs--;
    },
    
    addExplosion(x, y, duration = 500) {
        const explosion = { x, y, timer: duration };
        this.game.explosions.push(explosion);
        return explosion;
    },
    
    removeExplosion(explosion) {
        this.game.explosions = this.game.explosions.filter(e => e !== explosion);
    },
    
    addPowerup(x, y, type) {
        const powerup = { x, y, type };
        this.game.powerups.push(powerup);
        return powerup;
    },
    
    removePowerup(powerup) {
        this.game.powerups = this.game.powerups.filter(p => p !== powerup);
    },
    
    getEntityAt(x, y) {
        return this.game.players.find(e => e.alive && Math.floor(e.x) === x && Math.floor(e.y) === y);
    },
    
    getPowerupAt(x, y) {
        return this.game.powerups.find(p => p.x === x && p.y === y);
    },
    
    getBombAt(x, y) {
        return this.game.bombs.find(b => b.x === x && b.y === y);
    },
    
    isWalkable(x, y) {
        if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
            return false;
        }
        
        const cell = this.game.board[y][x];
        return cell === null || cell === 'powerup';
    },
    
    addInputAction(playerId, action) {
        this.input.actions.push({ playerId, action, timestamp: Date.now() });
    },
    
    clearInputActions() {
        this.input.actions = [];
    },
    
    getPlayerActions(playerId) {
        return this.input.actions.filter(a => a.playerId === playerId);
    },
    
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
};

export default GameState;
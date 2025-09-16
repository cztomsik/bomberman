const GameState = {
    screen: 'main-menu',
    
    game: {
        board: [],
        entities: [],
        bombs: [],
        explosions: [],
        powerups: [],
        winner: null
    },
    
    players: [],
    
    input: {
        keys: {},
        actions: []
    },
    
    boardWidth: 15,
    boardHeight: 13,
    
    init() {
        this.resetGame();
    },
    
    resetGame() {
        this.game = {
            board: this.createBoard(),
            entities: [],
            bombs: [],
            explosions: [],
            powerups: [],
            winner: null
        };
        
        this.players = [];
        this.input.actions = [];
    },
    
    createBoard() {
        const board = [];
        const { boardWidth, boardHeight } = this;
        
        for (let y = 0; y < boardHeight; y++) {
            board[y] = [];
            for (let x = 0; x < boardWidth; x++) {
                if (x === 0 || x === boardWidth - 1 || y === 0 || y === boardHeight - 1) {
                    board[y][x] = 'wall';
                } else if (x % 2 === 0 && y % 2 === 0) {
                    board[y][x] = 'wall';
                } else if ((x === 1 && y === 1) || (x === boardWidth - 2 && y === 1) ||
                          (x === 1 && y === boardHeight - 2) || (x === boardWidth - 2 && y === boardHeight - 2)) {
                    board[y][x] = null;
                } else if ((x === 2 && y === 1) || (x === 1 && y === 2) ||
                          (x === boardWidth - 3 && y === 1) || (x === boardWidth - 2 && y === 2) ||
                          (x === 1 && y === boardHeight - 3) || (x === 2 && y === boardHeight - 2) ||
                          (x === boardWidth - 2 && y === boardHeight - 3) || (x === boardWidth - 3 && y === boardHeight - 2)) {
                    board[y][x] = null;
                } else if (Math.random() < 0.7) {
                    board[y][x] = 'crate';
                } else {
                    board[y][x] = null;
                }
            }
        }
        
        return board;
    },
    
    createPlayer(id, x, y, isHuman = true) {
        const player = {
            id,
            x,
            y,
            isHuman,
            alive: true,
            speed: 1,
            bombCount: 1,
            bombPower: 1,
            maxBombs: 1,
            activeBombs: 0,
            powerups: [],
            moveTimer: 0,
            action: null
        };
        
        this.game.entities.push(player);
        this.players.push(player);
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
        const index = this.game.bombs.indexOf(bomb);
        if (index !== -1) {
            this.game.bombs.splice(index, 1);
            if (this.game.board[bomb.y][bomb.x] === 'bomb') {
                this.game.board[bomb.y][bomb.x] = null;
            }
            bomb.owner.activeBombs--;
        }
    },
    
    addExplosion(x, y, duration = 500) {
        const explosion = { x, y, timer: duration };
        this.game.explosions.push(explosion);
        return explosion;
    },
    
    removeExplosion(explosion) {
        const index = this.game.explosions.indexOf(explosion);
        if (index !== -1) {
            this.game.explosions.splice(index, 1);
        }
    },
    
    addPowerup(x, y, type) {
        const powerup = { x, y, type };
        this.game.powerups.push(powerup);
        return powerup;
    },
    
    removePowerup(powerup) {
        const index = this.game.powerups.indexOf(powerup);
        if (index !== -1) {
            this.game.powerups.splice(index, 1);
        }
    },
    
    getEntityAt(x, y) {
        return this.game.entities.find(e => e.alive && Math.floor(e.x) === x && Math.floor(e.y) === y);
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
    }
};

export default GameState;
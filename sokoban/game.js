class SokobanGame {
    constructor() {
        this.currentLevel = 0;
        this.gameState = {};
        this.gameGrid = document.getElementById('game-grid');
        this.levelNumber = document.getElementById('level-number');
        this.moveCounter = document.getElementById('move-counter');
        this.resetBtn = document.getElementById('reset-btn');
        this.winMessage = document.getElementById('win-message');

        this.setupEventListeners();
        this.loadLevel(0);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.resetBtn.addEventListener('click', () => this.resetLevel());
    }

    loadLevel(levelIndex) {
        if (levelIndex >= levels.length) {
            this.showGameComplete();
            return;
        }

        this.currentLevel = levelIndex;
        const level = levels[levelIndex];

        this.gameState = {
            width: level.width,
            height: level.height,
            grid: level.grid.map(row => row.split('')),
            playerPos: null,
            boxes: [],
            targets: [],
            moves: 0
        };

        this.parseLevel();
        this.updateUI();
        this.renderGrid();
    }

    parseLevel() {
        this.gameState.boxes = [];
        this.gameState.targets = [];

        for (let y = 0; y < this.gameState.height; y++) {
            for (let x = 0; x < this.gameState.width; x++) {
                const cell = this.gameState.grid[y][x];

                switch (cell) {
                    case '@':
                        this.gameState.playerPos = { x, y };
                        this.gameState.grid[y][x] = ' ';
                        break;
                    case '+':
                        this.gameState.playerPos = { x, y };
                        this.gameState.targets.push({ x, y });
                        this.gameState.grid[y][x] = '.';
                        break;
                    case '$':
                        this.gameState.boxes.push({ x, y });
                        this.gameState.grid[y][x] = ' ';
                        break;
                    case '*':
                        this.gameState.boxes.push({ x, y });
                        this.gameState.targets.push({ x, y });
                        this.gameState.grid[y][x] = '.';
                        break;
                    case '.':
                        this.gameState.targets.push({ x, y });
                        break;
                }
            }
        }
    }

    handleKeyPress(e) {
        if (this.winMessage.style.display !== 'none' && !this.winMessage.classList.contains('hidden')) {
            this.nextLevel();
            return;
        }

        let direction = null;

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                direction = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                direction = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
                direction = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                direction = { x: 1, y: 0 };
                break;
            case 'r':
                this.resetLevel();
                return;
            default:
                return;
        }

        if (direction) {
            e.preventDefault();
            this.movePlayer(direction);
        }
    }

    movePlayer(direction) {
        const newPos = {
            x: this.gameState.playerPos.x + direction.x,
            y: this.gameState.playerPos.y + direction.y
        };

        if (!this.isValidPosition(newPos)) return;

        const boxAtNewPos = this.getBoxAt(newPos);

        if (boxAtNewPos) {
            const boxNewPos = {
                x: newPos.x + direction.x,
                y: newPos.y + direction.y
            };

            if (!this.isValidPosition(boxNewPos) || this.getBoxAt(boxNewPos)) {
                return;
            }

            boxAtNewPos.x = boxNewPos.x;
            boxAtNewPos.y = boxNewPos.y;
        }

        this.gameState.playerPos = newPos;
        this.gameState.moves++;

        this.updateUI();
        this.renderGrid();

        if (this.checkWinCondition()) {
            this.showWinMessage();
        }
    }

    isValidPosition(pos) {
        if (pos.x < 0 || pos.x >= this.gameState.width ||
            pos.y < 0 || pos.y >= this.gameState.height) {
            return false;
        }

        return this.gameState.grid[pos.y][pos.x] !== '#';
    }

    getBoxAt(pos) {
        return this.gameState.boxes.find(box => box.x === pos.x && box.y === pos.y);
    }

    isTargetAt(pos) {
        return this.gameState.targets.some(target => target.x === pos.x && target.y === pos.y);
    }

    checkWinCondition() {
        return this.gameState.boxes.every(box => this.isTargetAt(box));
    }

    renderGrid() {
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.gameState.width}, 30px)`;
        this.gameGrid.innerHTML = '';

        for (let y = 0; y < this.gameState.height; y++) {
            for (let x = 0; x < this.gameState.width; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';

                const isPlayer = this.gameState.playerPos.x === x && this.gameState.playerPos.y === y;
                const box = this.getBoxAt({ x, y });
                const isTarget = this.isTargetAt({ x, y });
                const cell = this.gameState.grid[y][x];

                if (cell === '#') {
                    tile.classList.add('wall');
                    tile.textContent = '█';
                } else if (isPlayer && isTarget) {
                    tile.classList.add('player-on-target');
                    tile.textContent = '@';
                } else if (isPlayer) {
                    tile.classList.add('player');
                    tile.textContent = '@';
                } else if (box && isTarget) {
                    tile.classList.add('box-on-target');
                    tile.textContent = '■';
                } else if (box) {
                    tile.classList.add('box');
                    tile.textContent = '■';
                } else if (isTarget) {
                    tile.classList.add('target');
                    tile.textContent = '·';
                } else {
                    tile.classList.add('floor');
                    tile.textContent = ' ';
                }

                this.gameGrid.appendChild(tile);
            }
        }
    }

    updateUI() {
        this.levelNumber.textContent = this.currentLevel + 1;
        this.moveCounter.textContent = this.gameState.moves;
    }

    showWinMessage() {
        this.winMessage.classList.remove('hidden');
        this.winMessage.style.display = 'block';
    }

    hideWinMessage() {
        this.winMessage.classList.add('hidden');
        this.winMessage.style.display = 'none';
    }

    nextLevel() {
        this.hideWinMessage();
        this.loadLevel(this.currentLevel + 1);
    }

    resetLevel() {
        this.hideWinMessage();
        this.loadLevel(this.currentLevel);
    }

    showGameComplete() {
        this.winMessage.textContent = 'Congratulations! You completed all levels!';
        this.showWinMessage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SokobanGame();
});
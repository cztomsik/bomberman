import { describe, it } from 'node:test';
import assert from 'node:assert';
import GameState from '../state.js';

describe('GameState', () => {
    describe('init and board creation', () => {
        it('should initialize with custom board size', () => {
            GameState.init(5, 5);
            assert.strictEqual(GameState.boardWidth, 5);
            assert.strictEqual(GameState.boardHeight, 5);
            assert.strictEqual(GameState.game.board.length, 5);
            assert.strictEqual(GameState.game.board[0].length, 5);
        });

        it('should create a 5x5 board with correct layout', () => {
            GameState.init(5, 5);
            const boardStr = GameState.renderToString();
            
            // 5x5 board should have walls on borders and at center (2,2)
            const expected = 
                '#####\n' +
                '#...#\n' +
                '#.#.#\n' +
                '#...#\n' +
                '#####';
            
            // Remove crates for comparison (they're random)
            const actual = boardStr.replace(/%/g, '.');
            assert.strictEqual(actual, expected);
        });

        it('should have clear spawn corners', () => {
            GameState.init(5, 5);
            const board = GameState.game.board;
            
            // Corners should be clear for spawning
            assert.strictEqual(board[1][1], null, 'Top-left spawn should be clear');
            assert.strictEqual(board[1][3], null, 'Top-right spawn should be clear');
            assert.strictEqual(board[3][1], null, 'Bottom-left spawn should be clear');
            assert.strictEqual(board[3][3], null, 'Bottom-right spawn should be clear');
        });
    });

    describe('player operations', () => {
        it('should create and render player', () => {
            GameState.init(5, 5);
            GameState.createPlayer(1, 1, 1, true);
            
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], 'P', 'Player should be at (1,1)');
        });

        it('should find player at position', () => {
            GameState.init(5, 5);
            const player = GameState.createPlayer(1, 2, 2, true);
            
            assert.strictEqual(GameState.getEntityAt(2, 2), player);
            assert.strictEqual(GameState.getEntityAt(1, 1), undefined);
        });
    });

    describe('bomb operations', () => {
        it('should place and render bomb', () => {
            GameState.init(5, 5);
            const player = GameState.createPlayer(1, 1, 1, true);
            GameState.addBomb(1, 1, player);
            
            // Move player away so we can see the bomb
            player.x = 2;
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], '*', 'Bomb should be at (1,1)');
        });

        it('should track active bombs', () => {
            GameState.init(5, 5);
            const player = GameState.createPlayer(1, 1, 1, true);
            
            assert.strictEqual(player.activeBombs, 0);
            const bomb = GameState.addBomb(1, 1, player);
            assert.strictEqual(player.activeBombs, 1);
            
            GameState.removeBomb(bomb);
            assert.strictEqual(player.activeBombs, 0);
        });
    });

    describe('explosion operations', () => {
        it('should render explosions', () => {
            GameState.init(5, 5);
            GameState.addExplosion(1, 1);
            GameState.addExplosion(2, 1);
            
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], 'X', 'Explosion at (1,1)');
            assert.strictEqual(lines[1][2], 'X', 'Explosion at (2,1)');
        });
    });

    describe('powerup operations', () => {
        it('should render powerups correctly', () => {
            GameState.init(5, 5);
            GameState.addPowerup(1, 1, 'bomb');
            GameState.addPowerup(2, 1, 'power');
            GameState.addPowerup(3, 1, 'speed');
            
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], 'B', 'Bomb powerup');
            assert.strictEqual(lines[1][2], 'P', 'Power powerup');
            assert.strictEqual(lines[1][3], 'S', 'Speed powerup');
        });
    });

    describe('renderToString', () => {
        it('should render complex game state', () => {
            GameState.init(5, 5);
            
            // Set up a specific board state
            GameState.game.board[1][1] = 'crate';
            GameState.game.board[1][3] = 'crate';
            
            const player = GameState.createPlayer(1, 2, 2, true);
            GameState.addBomb(1, 2, player);
            GameState.addExplosion(3, 3);
            GameState.addPowerup(3, 1, 'bomb');
            
            const boardStr = GameState.renderToString();
            
            // Verify rendering priority: Player > Explosion > Powerup > Bomb > Terrain
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], '%', 'Crate at (1,1)');
            assert.strictEqual(lines[2][1], '*', 'Bomb at (1,2)');
            assert.strictEqual(lines[2][2], 'P', 'Player at (2,2)');
            assert.strictEqual(lines[1][3], 'B', 'Bomb powerup at (3,1)');
            assert.strictEqual(lines[3][3], 'X', 'Explosion at (3,3)');
        });
    });

    describe('utility methods', () => {
        it('should check walkable positions on 5x5 board', () => {
            GameState.init(5, 5);
            
            // Walls should not be walkable
            assert.strictEqual(GameState.isWalkable(0, 0), false, 'Border wall');
            assert.strictEqual(GameState.isWalkable(2, 2), false, 'Center wall');
            
            // Empty spaces should be walkable
            assert.strictEqual(GameState.isWalkable(1, 1), true, 'Empty space');
            
            // Out of bounds
            assert.strictEqual(GameState.isWalkable(-1, 0), false, 'Out of bounds');
            assert.strictEqual(GameState.isWalkable(5, 0), false, 'Out of bounds');
        });
    });
});
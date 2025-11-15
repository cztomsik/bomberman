import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import Game from '../game.js';

describe('Game Engine', () => {
    let game;

    beforeEach(() => {
        game = new Game(5, 5);
    });

    it('should initialize with custom board size', () => {
        assert.strictEqual(game.boardWidth, 5);
        assert.strictEqual(game.boardHeight, 5);
        assert.strictEqual(game.board.length, 5);
        assert.strictEqual(game.board[0].length, 5);
    });

    it('should create board with correct layout', () => {
        const boardStr = game.renderToString();
        
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
        const board = game.board;
        
        // Corners should be clear for spawning
        assert.strictEqual(board[1][1], null, 'Top-left spawn should be clear');
        assert.strictEqual(board[1][3], null, 'Top-right spawn should be clear');
        assert.strictEqual(board[3][1], null, 'Bottom-left spawn should be clear');
        assert.strictEqual(board[3][3], null, 'Bottom-right spawn should be clear');
    });

    it('should create and render player', () => {
        game.createPlayer(1, 1, 1, true);
        
        const boardStr = game.renderToString();
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[1][1], 'P', 'Player should be at (1,1)');
    });

    it('should find player at position', () => {
        const player = game.createPlayer(1, 2, 2, true);
        
        assert.strictEqual(game.getEntityAt(2, 2), player);
        assert.strictEqual(game.getEntityAt(1, 1), undefined);
    });

    it('should place and render bomb', () => {
        const player = game.createPlayer(1, 1, 1, true);
        game.addBomb(1, 1, player);
        
        // Move player away so we can see the bomb
        player.x = 2;
        const boardStr = game.renderToString();
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[1][1], '*', 'Bomb should be at (1,1)');
    });

    it('should track active bombs', () => {
        const player = game.createPlayer(1, 1, 1, true);
        
        assert.strictEqual(player.activeBombs, 0);
        const bomb = game.addBomb(1, 1, player);
        assert.strictEqual(player.activeBombs, 1);
        
        game.removeBomb(bomb);
        assert.strictEqual(player.activeBombs, 0);
    });

    it('should render explosions', () => {
        game.addExplosion(1, 1);
        game.addExplosion(2, 1);
        
        const boardStr = game.renderToString();
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[1][1], 'X', 'Explosion at (1,1)');
        assert.strictEqual(lines[1][2], 'X', 'Explosion at (2,1)');
    });

    it('should render powerups correctly', () => {
        game.addPowerup(1, 1, 'bomb');
        game.addPowerup(2, 1, 'power');
        game.addPowerup(3, 1, 'speed');
        
        const boardStr = game.renderToString();
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[1][1], 'B', 'Bomb powerup');
        assert.strictEqual(lines[1][2], 'P', 'Power powerup');
        assert.strictEqual(lines[1][3], 'S', 'Speed powerup');
    });

    it('should render complex game state', () => {
        // Set up a specific board state
        game.board[1][1] = 'crate';
        game.board[1][3] = 'crate';
        
        const player = game.createPlayer(1, 2, 2, true);
        game.addBomb(1, 2, player);
        game.addExplosion(3, 3);
        game.addPowerup(3, 1, 'bomb');
        
        const boardStr = game.renderToString();
        
        // Verify rendering priority: Player > Explosion > Powerup > Bomb > Terrain
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[1][1], '%', 'Crate at (1,1)');
        assert.strictEqual(lines[2][1], '*', 'Bomb at (1,2)');
        assert.strictEqual(lines[2][2], 'P', 'Player at (2,2)');
        assert.strictEqual(lines[1][3], 'B', 'Bomb powerup at (3,1)');
        assert.strictEqual(lines[3][3], 'X', 'Explosion at (3,3)');
    });

    it('should check walkable positions', () => {
        // Walls should not be walkable
        assert.strictEqual(game.isWalkable(0, 0), false, 'Border wall');
        assert.strictEqual(game.isWalkable(2, 2), false, 'Center wall');
        
        // Empty spaces should be walkable
        assert.strictEqual(game.isWalkable(1, 1), true, 'Empty space');
        
        // Out of bounds
        assert.strictEqual(game.isWalkable(-1, 0), false, 'Out of bounds');
        assert.strictEqual(game.isWalkable(5, 0), false, 'Out of bounds');
    });

    it('should move player in empty space', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear the board for easier testing
        for (let y = 1; y < 4; y++) {
            for (let x = 1; x < 4; x++) {
                if (x !== 2 || y !== 2) { // Keep center wall
                    game.board[y][x] = null;
                }
            }
        }
        
        player.x = 1;
        player.y = 1;
        
        game.movePlayer(player, 1, 0);
        assert.strictEqual(player.x, 2);
        assert.strictEqual(player.y, 1);
        
        game.movePlayer(player, 0, 1);
        assert.strictEqual(player.x, 2);
        assert.strictEqual(player.y, 1); // Can't move into wall at (2,2)
    });

    it('should not move player into walls', () => {
        const player = game.createPlayer(0, 1, 1, true);
        
        // Try to move into border wall
        game.movePlayer(player, -1, 0);
        assert.strictEqual(player.x, 1);
        assert.strictEqual(player.y, 1);
        
        // Try to move into center wall
        player.x = 1;
        player.y = 2;
        game.movePlayer(player, 1, 0);
        assert.strictEqual(player.x, 1); // Should not move
    });

    it('should place bomb at player position', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear board for testing
        for (let y = 1; y < 4; y++) {
            for (let x = 1; x < 4; x++) {
                game.board[y][x] = null;
            }
        }
        
        player.x = 2;
        player.y = 2;
        game.placeBomb(player);
        
        // Move player away to see the bomb
        player.x = 1;
        const boardStr = game.renderToString();
        const lines = boardStr.split('\n');
        assert.strictEqual(lines[2][2], '*', 'Bomb at (2,2)');
    });

    it('should create cross-pattern explosion', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear board for testing
        for (let y = 1; y < 4; y++) {
            for (let x = 1; x < 4; x++) {
                game.board[y][x] = null;
            }
        }
        
        player.x = 2;
        player.y = 2;
        player.bombPower = 1;
        game.placeBomb(player);
        
        const bomb = game.getBombAt(2, 2);
        player.alive = false; // Remove player from board
        game.explodeBomb(bomb);
        
        const expected = 
            '#####\n' +
            '#.X.#\n' +
            '#XXX#\n' +
            '#.X.#\n' +
            '#####';
        
        assert.strictEqual(game.renderToString(), expected);
    });

    it('should stop explosion at walls', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear board for testing
        for (let y = 1; y < 4; y++) {
            for (let x = 1; x < 4; x++) {
                game.board[y][x] = null;
            }
        }
        
        // Put wall to block explosion
        game.board[2][2] = 'wall';
        
        player.x = 1;
        player.y = 2;
        player.bombPower = 3; // High power to test blocking
        game.placeBomb(player);
        
        const bomb = game.getBombAt(1, 2);
        player.alive = false; // Remove player from board
        game.explodeBomb(bomb);
        
        // Wall at (2,2) should block explosion from continuing right
        const expected = 
            '#####\n' +
            '#X..#\n' +
            '#X#.#\n' +  // Wall blocks, no explosion at (3,2)
            '#X..#\n' +
            '#####';
        
        assert.strictEqual(game.renderToString(), expected);
    });

    it('should destroy crates', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear board for testing
        for (let y = 1; y < 4; y++) {
            for (let x = 1; x < 4; x++) {
                game.board[y][x] = null;
            }
        }
        
        game.board[2][3] = 'crate';
        
        player.x = 2;
        player.y = 2;
        game.placeBomb(player);
        
        const bomb = game.getBombAt(2, 2);
        player.alive = false;
        game.explodeBomb(bomb);
        
        // Crate should be destroyed
        assert.strictEqual(game.board[2][3], null);
        
        // Explosion reaches crate position
        const expected = 
            '#####\n' +
            '#.X.#\n' +
            '#XXX#\n' +
            '#.X.#\n' +
            '#####';
        
        assert.strictEqual(game.renderToString(), expected);
    });

    it('should kill player on explosion', () => {
        const player = game.createPlayer(0, 2, 2, true);
        
        assert.strictEqual(player.alive, true);
        game.addExplosion(2, 2);
        game.checkCollisions(player);
        
        assert.strictEqual(player.alive, false);
    });

    it('should collect powerups', () => {
        const player = game.createPlayer(0, 2, 2, true);
        
        game.addPowerup(2, 2, 'bomb');
        const initialMaxBombs = player.maxBombs;
        
        game.checkCollisions(player);
        
        assert.strictEqual(player.maxBombs, initialMaxBombs + 1);
        assert.strictEqual(game.getPowerupAt(2, 2), undefined, 'Powerup collected');
    });

    it('should increase bomb count', () => {
        const player = game.createPlayer(0, 1, 1, true);
        const initial = player.maxBombs;
        game.applyPowerup(player, { type: 'bomb' });
        assert.strictEqual(player.maxBombs, initial + 1);
    });

    it('should increase bomb power', () => {
        const player = game.createPlayer(0, 1, 1, true);
        const initial = player.bombPower;
        game.applyPowerup(player, { type: 'power' });
        assert.strictEqual(player.bombPower, initial + 1);
    });

    it('should increase speed', () => {
        const player = game.createPlayer(0, 1, 1, true);
        const initial = player.speed;
        game.applyPowerup(player, { type: 'speed' });
        assert.strictEqual(player.speed, initial + 0.5);
    });

    it('should respect max bombs limit', () => {
        const player = game.createPlayer(0, 1, 1, true);
        player.maxBombs = 1;
        player.x = 1;
        player.y = 1;
        
        game.placeBomb(player);
        assert.strictEqual(game.bombs.length, 1);
        
        // Try to place another bomb
        player.x = 3;
        player.y = 3;
        game.placeBomb(player);
        
        assert.strictEqual(game.bombs.length, 1, 'Should not exceed max bombs');
    });

    it('should trigger chain reactions', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear area for testing
        game.board[1][2] = null;
        game.board[1][3] = null;
        
        // Place two bombs next to each other
        player.x = 1;
        player.y = 2;
        game.placeBomb(player);
        
        player.maxBombs = 2;
        player.x = 1;
        player.y = 3;
        game.placeBomb(player);
        
        const bomb1 = game.getBombAt(1, 2);
        const bomb2 = game.getBombAt(1, 3);
        
        // Explode first bomb
        game.explodeBomb(bomb1);
        
        // Second bomb should be triggered (timer set to 0)
        assert.strictEqual(bomb2.timer, 0, 'Chain reaction triggered');
    });

    it('should allow player to stay on their own bomb', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear area
        game.board[1][1] = null;
        game.board[1][2] = null;
        
        player.x = 1;
        player.y = 1;
        game.placeBomb(player);
        
        // Should be able to stay on the bomb
        game.movePlayer(player, 0, 0);
        assert.strictEqual(player.x, 1);
        assert.strictEqual(player.y, 1);
    });

    it('should not allow walking back onto bomb after leaving', () => {
        const player = game.createPlayer(0, 1, 1, true);
        // Clear area
        game.board[1][1] = null;
        game.board[1][2] = null;

        player.x = 1;
        player.y = 1;
        game.placeBomb(player);

        // Move away from bomb
        game.movePlayer(player, 0, 1);
        assert.strictEqual(player.y, 2);

        // Try to move back onto bomb
        game.movePlayer(player, 0, -1);
        assert.strictEqual(player.y, 2, 'Should not move back onto bomb');
    });

    it('should detect game over when one player remains', () => {
        const player1 = game.createPlayer(0, 1, 1, true);
        const player2 = game.createPlayer(1, 3, 3, false);

        // Both alive
        const alive = game.players.filter(p => p.alive);
        assert.strictEqual(alive.length, 2);

        // Kill player2
        player2.alive = false;
        const remaining = game.players.filter(p => p.alive);
        assert.strictEqual(remaining.length, 1);
        assert.strictEqual(remaining[0], player1);
    });

    it('should detect draw when all players die', () => {
        const player1 = game.createPlayer(0, 1, 1, true);
        const player2 = game.createPlayer(1, 3, 3, false);

        player1.alive = false;
        player2.alive = false;

        const remaining = game.players.filter(p => p.alive);
        assert.strictEqual(remaining.length, 0);
    });

    it('should generate deterministic boards with same seed', () => {
        const game1 = new Game(15, 13, 12345);
        const game2 = new Game(15, 13, 12345);

        const board1 = game1.renderToString();
        const board2 = game2.renderToString();

        assert.strictEqual(board1, board2, 'Same seed should produce identical boards');
    });

    it('should generate different boards with different seeds', () => {
        const game1 = new Game(15, 13, 12345);
        const game2 = new Game(15, 13, 54321);

        const board1 = game1.renderToString();
        const board2 = game2.renderToString();

        assert.notStrictEqual(board1, board2, 'Different seeds should produce different boards');
    });

    it('should track game time', () => {
        assert.strictEqual(game.gameTime, 0);

        game.update(100);
        assert.strictEqual(game.gameTime, 100);

        game.update(50);
        assert.strictEqual(game.gameTime, 150);
    });

    it('should reset game time on resetGame', () => {
        game.update(100);
        assert.strictEqual(game.gameTime, 100);

        game.resetGame();
        assert.strictEqual(game.gameTime, 0);
    });

    it('should generate deterministic powerups with same seed', () => {
        // Use a larger board with known seed
        const game1 = new Game(15, 13, 99999);
        const game2 = new Game(15, 13, 99999);

        const player1 = game1.createPlayer(0, 7, 6, true);
        const player2 = game2.createPlayer(0, 7, 6, true);

        // Clear some crates to place bombs
        game1.board[6][8] = 'crate';
        game2.board[6][8] = 'crate';

        // Place bombs at same position
        player1.x = 7;
        player1.y = 6;
        player2.x = 7;
        player2.y = 6;
        game1.placeBomb(player1);
        game2.placeBomb(player2);

        // Explode bombs
        const bomb1 = game1.getBombAt(7, 6);
        const bomb2 = game2.getBombAt(7, 6);
        game1.explodeBomb(bomb1);
        game2.explodeBomb(bomb2);

        // Both should have same powerup spawns (or lack thereof)
        assert.strictEqual(game1.powerups.length, game2.powerups.length);
        if (game1.powerups.length > 0) {
            assert.strictEqual(game1.powerups[0].type, game2.powerups[0].type);
        }
    });
});
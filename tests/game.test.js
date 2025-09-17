import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BombermanGame } from '../main.js';
import GameState from '../state.js';

describe('BombermanGame', () => {
    let game;

    beforeEach(() => {
        // Create game without DOM elements and use 5x5 board
        game = new BombermanGame({ skipInit: true });
        GameState.init(5, 5);
    });

    describe('initialization', () => {
        it('should initialize game with player', () => {
            game.init();
            assert.ok(game.player);
            assert.strictEqual(game.player.x, 1);
            assert.strictEqual(game.player.y, 1);
            
            // Check player appears on board
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[1][1], 'P');
        });
    });

    describe('player movement', () => {
        beforeEach(() => {
            game.init();
            // Clear the board for easier testing
            for (let y = 1; y < 4; y++) {
                for (let x = 1; x < 4; x++) {
                    if (x !== 2 || y !== 2) { // Keep center wall
                        GameState.game.board[y][x] = null;
                    }
                }
            }
        });

        it('should move player in empty space', () => {
            game.player.x = 1;
            game.player.y = 1;
            
            game.movePlayer(1, 0);
            assert.strictEqual(game.player.x, 2);
            assert.strictEqual(game.player.y, 1);
            
            game.movePlayer(0, 1);
            assert.strictEqual(game.player.x, 2);
            assert.strictEqual(game.player.y, 1); // Can't move into wall at (2,2)
        });

        it('should not move into walls', () => {
            game.player.x = 1;
            game.player.y = 1;
            
            // Try to move into border wall
            game.movePlayer(-1, 0);
            assert.strictEqual(game.player.x, 1);
            assert.strictEqual(game.player.y, 1);
            
            // Try to move into center wall
            game.player.x = 1;
            game.player.y = 2;
            game.movePlayer(1, 0);
            assert.strictEqual(game.player.x, 1); // Should not move
        });
    });

    describe('bomb placement and explosions', () => {
        beforeEach(() => {
            // Reinitialize with 5x5 board
            GameState.init(5, 5);
            // Create player manually (don't call game.init() as it resets board to 15x13)
            game.player = GameState.createPlayer(0, 1, 1, true);
            // Clear board for testing
            for (let y = 1; y < 4; y++) {
                for (let x = 1; x < 4; x++) {
                    GameState.game.board[y][x] = null;
                }
            }
        });

        it('should place bomb at player position', () => {
            game.player.x = 2;
            game.player.y = 2;
            game.placeBomb();
            
            // Move player away to see the bomb
            game.player.x = 1;
            const boardStr = GameState.renderToString();
            const lines = boardStr.split('\n');
            assert.strictEqual(lines[2][2], '*', 'Bomb at (2,2)');
        });

        it('should create cross-pattern explosion', () => {
            game.player.x = 2;
            game.player.y = 2;
            game.player.bombPower = 1;
            game.placeBomb();
            
            const bomb = GameState.getBombAt(2, 2);
            game.player.alive = false; // Remove player from board
            game.explodeBomb(bomb);
            
            const expected = 
                '#####\n' +
                '#.X.#\n' +
                '#XXX#\n' +
                '#.X.#\n' +
                '#####';
            
            assert.strictEqual(GameState.renderToString(), expected);
        });

        it('should stop explosion at walls', () => {
            // Put wall to block explosion
            GameState.game.board[2][2] = 'wall';
            
            game.player.x = 1;
            game.player.y = 2;
            game.player.bombPower = 3; // High power to test blocking
            game.placeBomb();
            
            const bomb = GameState.getBombAt(1, 2);
            game.player.alive = false; // Remove player from board
            game.explodeBomb(bomb);
            
            // Wall at (2,2) should block explosion from continuing right
            const expected = 
                '#####\n' +
                '#X..#\n' +
                '#X#.#\n' +  // Wall blocks, no explosion at (3,2)
                '#X..#\n' +
                '#####';
            
            assert.strictEqual(GameState.renderToString(), expected);
        });

        it('should destroy crates', () => {
            GameState.game.board[2][3] = 'crate';
            
            game.player.x = 2;
            game.player.y = 2;
            game.placeBomb();
            
            const bomb = GameState.getBombAt(2, 2);
            game.player.alive = false;
            game.explodeBomb(bomb);
            
            // Crate should be destroyed
            assert.strictEqual(GameState.game.board[2][3], null);
            
            // Explosion reaches crate position
            const expected = 
                '#####\n' +
                '#.X.#\n' +
                '#XXX#\n' +
                '#.X.#\n' +
                '#####';
            
            assert.strictEqual(GameState.renderToString(), expected);
        });
    });

    describe('collision detection', () => {
        beforeEach(() => {
            game.init();
        });

        it('should kill player on explosion', () => {
            game.player.x = 2;
            game.player.y = 2;
            assert.strictEqual(game.player.alive, true);
            
            GameState.addExplosion(2, 2);
            game.checkCollisions();
            
            assert.strictEqual(game.player.alive, false);
        });

        it('should collect powerups', () => {
            game.player.x = 2;
            game.player.y = 2;
            
            GameState.addPowerup(2, 2, 'bomb');
            const initialMaxBombs = game.player.maxBombs;
            
            game.checkCollisions();
            
            assert.strictEqual(game.player.maxBombs, initialMaxBombs + 1);
            assert.strictEqual(GameState.getPowerupAt(2, 2), undefined, 'Powerup collected');
        });
    });

    describe('powerup effects', () => {
        beforeEach(() => {
            game.init();
        });

        it('should increase bomb count', () => {
            const initial = game.player.maxBombs;
            game.applyPowerup({ type: 'bomb' });
            assert.strictEqual(game.player.maxBombs, initial + 1);
        });

        it('should increase bomb power', () => {
            const initial = game.player.bombPower;
            game.applyPowerup({ type: 'power' });
            assert.strictEqual(game.player.bombPower, initial + 1);
        });

        it('should increase speed', () => {
            const initial = game.player.speed;
            game.applyPowerup({ type: 'speed' });
            assert.strictEqual(game.player.speed, initial + 0.5);
        });
    });

    describe('bomb mechanics', () => {
        beforeEach(() => {
            game.init();
        });

        it('should respect max bombs limit', () => {
            game.player.maxBombs = 1;
            game.player.x = 1;
            game.player.y = 1;
            
            game.placeBomb();
            assert.strictEqual(GameState.game.bombs.length, 1);
            
            // Try to place another bomb
            game.player.x = 3;
            game.player.y = 3;
            game.placeBomb();
            
            assert.strictEqual(GameState.game.bombs.length, 1, 'Should not exceed max bombs');
        });

        it('should trigger chain reactions', () => {
            // Clear area for testing
            GameState.game.board[1][2] = null;
            GameState.game.board[1][3] = null;
            
            // Place two bombs next to each other
            game.player.x = 1;
            game.player.y = 2;
            game.placeBomb();
            
            game.player.maxBombs = 2;
            game.player.x = 1;
            game.player.y = 3;
            game.placeBomb();
            
            const bomb1 = GameState.getBombAt(1, 2);
            const bomb2 = GameState.getBombAt(1, 3);
            
            // Explode first bomb
            game.explodeBomb(bomb1);
            
            // Second bomb should be triggered (timer set to 0)
            assert.strictEqual(bomb2.timer, 0, 'Chain reaction triggered');
        });
    });

    describe('movement with bombs', () => {
        beforeEach(() => {
            game.init();
            // Clear area
            GameState.game.board[1][1] = null;
            GameState.game.board[1][2] = null;
        });

        it('should allow player to stay on their own bomb', () => {
            game.player.x = 1;
            game.player.y = 1;
            game.placeBomb();
            
            // Should be able to stay on the bomb
            game.movePlayer(0, 0);
            assert.strictEqual(game.player.x, 1);
            assert.strictEqual(game.player.y, 1);
        });

        it('should not allow walking back onto bomb after leaving', () => {
            game.player.x = 1;
            game.player.y = 1;
            game.placeBomb();
            
            // Move away from bomb
            game.movePlayer(0, 1);
            assert.strictEqual(game.player.y, 2);
            
            // Try to move back onto bomb
            game.movePlayer(0, -1);
            assert.strictEqual(game.player.y, 2, 'Should not move back onto bomb');
        });
    });
});
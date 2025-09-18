import Game from './game.js';
import AIController from './ai.js';

console.log('Starting AI test...\n');

// Create a smaller test game (7x7)
const game = new Game(7, 7);

// Add just 2 AI players
// Player 0 - AI Medium (top-left)
const player0 = game.createPlayer(0, 1, 1, false);
player0.name = 'AI 1';
player0.emoji = '🤖';

// Player 1 - AI Medium (bottom-right)
const player1 = game.createPlayer(1, game.boardWidth - 2, game.boardHeight - 2, false);
player1.name = 'AI 2';
player1.emoji = '👾';

// Create AI controllers
const aiControllers = [
    new AIController(game, 0),
    new AIController(game, 1)
];

// Track statistics
const stats = {
    updates: 0,
    bombsPlaced: 0,
    cratesDestroyed: 0,
    powerupsCollected: 0
};

// Monitor game state
let lastBombCount = 0;
let lastCrateCount = countCrates();
let lastPowerupCount = 0;

function countCrates() {
    let count = 0;
    for (let y = 0; y < game.boardHeight; y++) {
        for (let x = 0; x < game.boardWidth; x++) {
            if (game.board[y][x] === 'crate') count++;
        }
    }
    return count;
}

// Game loop
function update() {
    const deltaTime = 100; // 100ms per update

    // Update game state
    game.update(deltaTime);

    // Update AI controllers
    for (const ai of aiControllers) {
        ai.update(deltaTime);
    }

    // Track statistics
    stats.updates++;

    const currentBombCount = game.bombs.length;
    if (currentBombCount > lastBombCount) {
        stats.bombsPlaced += currentBombCount - lastBombCount;
    }
    lastBombCount = currentBombCount;

    const currentCrateCount = countCrates();
    if (currentCrateCount < lastCrateCount) {
        stats.cratesDestroyed += lastCrateCount - currentCrateCount;
    }
    lastCrateCount = currentCrateCount;

    const currentPowerupCount = game.powerups.length;
    if (currentPowerupCount < lastPowerupCount) {
        stats.powerupsCollected += lastPowerupCount - currentPowerupCount;
    }
    lastPowerupCount = currentPowerupCount;

    // Print game state every second (10 updates)
    if (stats.updates % 10 === 0) {
        console.log('\n=== Game State ===');
        console.log(game.renderToString());
        console.log('\n=== Statistics ===');
        console.log(`Updates: ${stats.updates}`);
        console.log(`Bombs placed: ${stats.bombsPlaced}`);
        console.log(`Crates destroyed: ${stats.cratesDestroyed}`);
        console.log(`Powerups collected: ${stats.powerupsCollected}`);

        console.log('\n=== AI States ===');
        aiControllers.forEach((ai, index) => {
            const player = game.players[ai.playerIndex];
            console.log(`AI ${index + 1}: ${ai.state} | Alive: ${player.alive} | Pos: (${Math.floor(player.x)}, ${Math.floor(player.y)})`);
        });

        console.log('\n=== Player Stats ===');
        game.players.forEach((player, index) => {
            if (player.alive) {
                console.log(`${player.name}: Bombs: ${player.maxBombs} | Power: ${player.bombPower} | Speed: ${player.speed.toFixed(2)}`);
            }
        });
    }

    // Quick exit for testing
    if (stats.updates > 100) {
        console.log('\n=== TEST COMPLETE (100 updates) ===');
        console.log('\n=== FINAL STATS ===');
        console.log(`Bombs placed: ${stats.bombsPlaced}`);
        console.log(`Crates destroyed: ${stats.cratesDestroyed}`);
        console.log(`Powerups collected: ${stats.powerupsCollected}`);
        clearInterval(gameLoop);
        process.exit(0);
    }

    // Check game over
    const alivePlayers = game.players.filter(p => p.alive);
    if (alivePlayers.length <= 1) {
        console.log('\n=== GAME OVER ===');
        if (alivePlayers.length === 1) {
            console.log(`Winner: ${alivePlayers[0].name}`);
        } else {
            console.log('Draw!');
        }
        console.log('\nFinal Statistics:');
        console.log(`Total updates: ${stats.updates}`);
        console.log(`Total bombs placed: ${stats.bombsPlaced}`);
        console.log(`Total crates destroyed: ${stats.cratesDestroyed}`);
        console.log(`Total powerups collected: ${stats.powerupsCollected}`);
        clearInterval(gameLoop);
    }
}

// Run the game loop
console.log('Starting game loop...');
console.log('Board size: 7x7');
console.log('Players: 2 AI players');
console.log('\nLegend:');
console.log('🤖 = AI 1');
console.log('👾 = AI 2');
console.log('💣 = Bomb');
console.log('💥 = Explosion');
console.log('📦 = Crate');
console.log('🧱 = Wall');
console.log('⚡/💊/🔥 = Powerups\n');

const gameLoop = setInterval(update, 100);

// Stop after 5 minutes
setTimeout(() => {
    console.log('\n=== TIMEOUT ===');
    console.log('Test ended after 5 minutes');
    clearInterval(gameLoop);
    process.exit(0);
}, 5 * 60 * 1000);
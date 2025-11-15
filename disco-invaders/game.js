const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Game state
let gameRunning = true;
let score = 0;
let keys = {};
let discoTime = 0;

// Particles and effects
let particles = [];
let popups = [];
let combo = 0;
let lastKillTime = 0;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 30,
    speed: 5,
    color: '#0f0'
};

// Bullets
let playerBullets = [];
let alienBullets = [];

const bulletConfig = {
    width: 4,
    height: 15,
    playerSpeed: 5,
    alienSpeed: 4,
    color: '#ff0'
};

// Aliens
let aliens = [];
const alienConfig = {
    rows: 3,
    cols: 8,
    width: 40,
    height: 30,
    padding: 10,
    offsetX: 100,
    offsetY: 50,
    speed: 1,
    direction: 1,
    color: '#f00'
};

// Disco color generator
function getDiscoColor(offset = 0) {
    const hue = (discoTime * 2 + offset) % 360;
    return `hsl(${hue}, 100%, 50%)`;
}

// Particle system
function createExplosion(x, y) {
    const confettiEmojis = ['🎉', '⭐', '💥', '✨', '🌟', '💫', '🎊'];
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 2 + Math.random() * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60,
            emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.rotation += p.rotationSpeed;
        p.life--;
        return p.life > 0;
    });
}

function drawParticles() {
    ctx.save();
    for (let p of particles) {
        ctx.globalAlpha = p.life / 60;
        ctx.font = '20px Arial';
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, -10, 10);
        ctx.restore();
    }
    ctx.restore();
}

// Combo system
const comboMessages = [
    'GROOVY!',
    'FUNKY!',
    'DISCO FEVER!',
    'BOOGIE DOWN!',
    'GET DOWN!',
    'STAYIN\' ALIVE!',
    'NIGHT FEVER!',
    'DISCO INFERNO!'
];

function createComboPopup(comboCount) {
    if (comboCount < 3) return;

    const messageIndex = Math.min(comboCount - 3, comboMessages.length - 1);
    popups.push({
        text: `${comboCount}x ${comboMessages[messageIndex]}`,
        x: canvas.width / 2,
        y: 150,
        life: 90,
        scale: 0
    });
}

function updatePopups() {
    popups = popups.filter(p => {
        p.life--;
        // Scale up then fade out
        if (p.life > 60) {
            p.scale = Math.min(p.scale + 0.1, 1);
        }
        p.y -= 0.5;
        return p.life > 0;
    });
}

function drawPopups() {
    ctx.save();
    for (let p of popups) {
        ctx.globalAlpha = p.life / 90;
        ctx.font = `bold ${30 * p.scale}px Arial`;
        ctx.fillStyle = getDiscoColor(p.life * 5);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
    }
    ctx.restore();
}

// Initialize aliens
function createAliens() {
    aliens = [];
    for (let row = 0; row < alienConfig.rows; row++) {
        for (let col = 0; col < alienConfig.cols; col++) {
            aliens.push({
                x: alienConfig.offsetX + col * (alienConfig.width + alienConfig.padding),
                y: alienConfig.offsetY + row * (alienConfig.height + alienConfig.padding),
                width: alienConfig.width,
                height: alienConfig.height,
                alive: true
            });
        }
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameRunning) {
        e.preventDefault();
        shootPlayerBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', restartGame);

// Player shooting
function shootPlayerBullet() {
    playerBullets.push({
        x: player.x + player.width / 2 - bulletConfig.width / 2,
        y: player.y,
        width: bulletConfig.width,
        height: bulletConfig.height
    });
}

// Alien shooting
function shootAlienBullet() {
    if (Math.random() < 0.005 && aliens.length > 0) {
        const aliveAliens = aliens.filter(a => a.alive);
        if (aliveAliens.length > 0) {
            const alien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            alienBullets.push({
                x: alien.x + alien.width / 2 - bulletConfig.width / 2,
                y: alien.y + alien.height,
                width: bulletConfig.width,
                height: bulletConfig.height
            });
        }
    }
}

// Update player
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// Update bullets
function updateBullets() {
    // Player bullets
    playerBullets = playerBullets.filter(bullet => {
        bullet.y -= bulletConfig.playerSpeed;
        return bullet.y > 0;
    });

    // Alien bullets
    alienBullets = alienBullets.filter(bullet => {
        bullet.y += bulletConfig.alienSpeed;
        return bullet.y < canvas.height;
    });
}

// Update aliens
function updateAliens() {
    let shouldMoveDown = false;

    // Check if any alien hit the edge
    for (let alien of aliens) {
        if (alien.alive) {
            if ((alien.x <= 0 && alienConfig.direction === -1) ||
                (alien.x + alien.width >= canvas.width && alienConfig.direction === 1)) {
                shouldMoveDown = true;
                break;
            }
        }
    }

    // Move aliens
    if (shouldMoveDown) {
        alienConfig.direction *= -1;
        for (let alien of aliens) {
            if (alien.alive) {
                alien.y += 20;
            }
        }
    } else {
        for (let alien of aliens) {
            if (alien.alive) {
                alien.x += alienConfig.speed * alienConfig.direction;
            }
        }
    }

    // Check if aliens reached player
    for (let alien of aliens) {
        if (alien.alive && alien.y + alien.height >= player.y) {
            gameOver();
        }
    }
}

// Collision detection
function checkCollisions() {
    // Player bullets hitting aliens
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];

        for (let alien of aliens) {
            if (alien.alive &&
                bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {

                // Create explosion at alien center
                createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);

                // Combo tracking
                const currentTime = Date.now();
                if (currentTime - lastKillTime < 1500) {
                    combo++;
                } else {
                    combo = 1;
                }
                lastKillTime = currentTime;

                // Show combo popup
                if (combo >= 3) {
                    createComboPopup(combo);
                }

                alien.alive = false;
                playerBullets.splice(i, 1);
                score += 10;
                scoreElement.textContent = score;
                break;
            }
        }
    }

    // Alien bullets hitting player
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        const bullet = alienBullets[i];

        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {

            gameOver();
            break;
        }
    }

    // Check if all aliens are dead
    if (aliens.every(alien => !alien.alive)) {
        alienConfig.speed += 0.2;
        createAliens();
    }
}

// Draw functions
function drawPlayer() {
    ctx.fillStyle = getDiscoColor(0);
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw ship triangle
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - 10);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    // Player bullets with rainbow trail
    for (let i = 0; i < playerBullets.length; i++) {
        const bullet = playerBullets[i];
        ctx.fillStyle = getDiscoColor(i * 30);
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Alien bullets
    for (let i = 0; i < alienBullets.length; i++) {
        const bullet = alienBullets[i];
        ctx.fillStyle = getDiscoColor(i * 30 + 180);
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawAliens() {
    for (let i = 0; i < aliens.length; i++) {
        const alien = aliens[i];
        if (alien.alive) {
            // Dance effect - aliens wiggle based on disco time
            const wiggle = Math.sin(discoTime * 0.1 + i) * 2;

            // Each alien gets a different color based on position
            ctx.fillStyle = getDiscoColor(i * 15);
            ctx.fillRect(alien.x + wiggle, alien.y, alien.width, alien.height);

            // Draw alien eyes with disco colors
            ctx.fillStyle = getDiscoColor(i * 15 + 180);
            ctx.fillRect(alien.x + 8 + wiggle, alien.y + 8, 6, 6);
            ctx.fillRect(alien.x + 26 + wiggle, alien.y + 8, 6, 6);
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Update disco timer
    discoTime += 1;

    // Update canvas rotation based on player position
    // Map player.x from (0 to canvas.width) to rotation (-45deg to +45deg)
    const playerProgress = player.x / (canvas.width - player.width);
    const rotation = (playerProgress - 0.5) * 90; // -45 to +45 degrees
    canvas.style.transform = `rotate(${rotation}deg)`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update
    updatePlayer();
    updateBullets();
    updateAliens();
    updateParticles();
    updatePopups();
    shootAlienBullet();
    checkCollisions();

    // Draw
    drawPlayer();
    drawBullets();
    drawAliens();
    drawParticles();
    drawPopups();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

function restartGame() {
    gameRunning = true;
    score = 0;
    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');
    playerBullets = [];
    alienBullets = [];
    particles = [];
    popups = [];
    combo = 0;
    lastKillTime = 0;
    player.x = canvas.width / 2 - 20;
    alienConfig.speed = 1;
    canvas.style.transform = 'rotate(0deg)';
    createAliens();
    gameLoop();
}

// Start game
createAliens();
gameLoop();

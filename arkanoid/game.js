class ArkanoidGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameMessage = document.getElementById('gameMessage');
        this.startButton = document.getElementById('startButton');

        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');

        this.gameState = 'start'; // start, playing, paused, gameOver, victory

        this.paddle = {
            x: this.canvas.width / 2 - 75,
            y: this.canvas.height - 60,
            width: 150,
            height: 15,
            speed: 8,
            text: '═══════════════'
        };

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            vx: 4,
            vy: -4,
            speed: 4,
            emoji: '⚽'
        };

        this.score = 0;
        this.lives = 3;
        this.level = 1;

        this.bricks = [];
        this.keys = {};
        this.mouseX = 0;

        this.initializeBricks();
        this.setupEventListeners();
        this.gameLoop();
    }

    initializeBricks() {
        this.bricks = [];
        const rows = 6;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 30;
        const padding = 5;
        const offsetTop = 80;
        const offsetLeft = (this.canvas.width - (cols * (brickWidth + padding) - padding)) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: col * (brickWidth + padding) + offsetLeft,
                    y: row * (brickHeight + padding) + offsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    destroyed: false,
                    emoji: '🧱'
                });
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === 'Enter') {
                this.handleStartRestart();
            }

            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });

        this.startButton.addEventListener('click', () => {
            this.handleStartRestart();
        });
    }

    handleStartRestart() {
        if (this.gameState === 'start' || this.gameState === 'gameOver' || this.gameState === 'victory') {
            this.startGame();
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.hideMessage();
        this.resetBall();

        if (this.gameState === 'start') {
            this.score = 0;
            this.lives = 3;
            this.level = 1;
        }

        this.updateUI();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
        this.ball.vy = -this.ball.speed;
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showMessage('Paused', 'Press Space to continue', false);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideMessage();
        }
    }

    showMessage(title, text, showButton = true) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        this.startButton.style.display = showButton ? 'block' : 'none';
        this.gameMessage.classList.remove('hidden');
    }

    hideMessage() {
        this.gameMessage.classList.add('hidden');
    }

    updatePaddle() {
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] && this.paddle.x + this.paddle.width < this.canvas.width) {
            this.paddle.x += this.paddle.speed;
        }

        // Mouse control
        if (this.mouseX > 0) {
            this.paddle.x = this.mouseX - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        }
    }

    updateBall() {
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Wall collision
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.vx = -this.ball.vx;
        }

        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.vy = -this.ball.vy;
        }

        // Bottom wall (lose life)
        if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.lives--;
            this.updateUI();

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }

        // Paddle collision
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.vy > 0) {

            this.ball.vy = -this.ball.vy;

            // Add some angle based on where the ball hits the paddle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.vx = (hitPos - 0.5) * 8;
        }

        // Brick collision
        this.checkBrickCollision();
    }

    checkBrickCollision() {
        for (let brick of this.bricks) {
            if (!brick.destroyed &&
                this.ball.x >= brick.x &&
                this.ball.x <= brick.x + brick.width &&
                this.ball.y >= brick.y &&
                this.ball.y <= brick.y + brick.height) {

                brick.destroyed = true;
                this.ball.vy = -this.ball.vy;
                this.score += 10;
                this.updateUI();

                // Check victory condition
                if (this.bricks.every(b => b.destroyed)) {
                    this.victory();
                }

                break;
            }
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.showMessage('Game Over!', `Final Score: ${this.score}`, true);
    }

    victory() {
        this.gameState = 'victory';
        const bonus = this.lives * 500 + 1000;
        this.score += bonus;
        this.updateUI();
        this.showMessage('Victory!', `Level Complete! Bonus: ${bonus}`, true);
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render paddle
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#00BFFF';
        this.ctx.fillText(
            this.paddle.text,
            this.paddle.x,
            this.paddle.y + this.paddle.height
        );

        // Render ball
        this.ctx.fillText(
            this.ball.emoji,
            this.ball.x,
            this.ball.y + 10
        );

        // Render bricks
        this.ctx.font = '25px Arial';
        for (let brick of this.bricks) {
            if (!brick.destroyed) {
                this.ctx.fillText(
                    brick.emoji,
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2 + 8
                );
            }
        }
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.updatePaddle();
            this.updateBall();
        }

        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ArkanoidGame();
});
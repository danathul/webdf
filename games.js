// Games State Management
let gamesState = {
    userPoints: 0,
    dailyStreak: 0,
    lastPlayedDate: null,
    gamesPlayed: {},
    currentGame: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGamesData();
    updatePointsDisplay();
    setupEventListeners();
});

// Load Games Data
function loadGamesData() {
    const saved = localStorage.getItem('dafah_games');
    if (saved) {
        gamesState = JSON.parse(saved);
    } else {
        gamesState = {
            userPoints: 0,
            dailyStreak: 0,
            lastPlayedDate: null,
            gamesPlayed: {}
        };
    }
    updatePointsDisplay();
}

// Save Games Data
function saveGamesData() {
    localStorage.setItem('dafah_games', JSON.stringify(gamesState));
}

// Update Points Display
function updatePointsDisplay() {
    document.getElementById('user-points').textContent = gamesState.userPoints;
    document.getElementById('daily-streak').textContent = gamesState.dailyStreak;
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modal on background click
    document.querySelectorAll('.game-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeGame();
            }
        });
    });
}

// Start Game
function startGame(gameType) {
    gamesState.currentGame = gameType;

    const modal = document.getElementById(`${gameType}-game-modal`);
    if (modal) {
        modal.classList.add('active');
    }

    switch(gameType) {
        case 'tap':
            startTapGame();
            break;
        case 'memory':
            startMemoryGame();
            break;
        case 'spin':
            // Spin game is ready to go
            break;
        case 'scratch':
            startScratchGame();
            break;
        case 'flappy':
            startFlappyGame();
            break;
        case 'math':
            startMathGame();
            break;
    }
}

// Close Game
function closeGame() {
    if (gamesState.currentGame) {
        const modal = document.getElementById(`${gamesState.currentGame}-game-modal`);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    gamesState.currentGame = null;
}

// ==================== TAP TO COLLECT GAME ====================
let tapGameState = {
    score: 0,
    timeLeft: 30,
    gameActive: false,
    timerInterval: null
};

function startTapGame() {
    tapGameState = {
        score: 0,
        timeLeft: 30,
        gameActive: true,
        timerInterval: null
    };

    document.getElementById('tap-score').textContent = '0';
    document.getElementById('tap-timer').textContent = '30';
    document.getElementById('tap-result').style.display = 'none';
    document.getElementById('tap-target').style.display = 'block';

    // Start timer
    tapGameState.timerInterval = setInterval(() => {
        tapGameState.timeLeft--;
        document.getElementById('tap-timer').textContent = tapGameState.timeLeft;

        if (tapGameState.timeLeft <= 0) {
            endTapGame();
        }
    }, 1000);
}

function tapDonut() {
    if (!tapGameState.gameActive) return;

    tapGameState.score++;
    document.getElementById('tap-score').textContent = tapGameState.score;

    // Animation
    const button = document.getElementById('tap-target');
    button.classList.add('hit');
    setTimeout(() => button.classList.remove('hit'), 300);

    // Particle effect
    createParticles(event.clientX, event.clientY);
}

function endTapGame() {
    tapGameState.gameActive = false;
    clearInterval(tapGameState.timerInterval);

    const points = Math.floor(tapGameState.score * 2);
    gamesState.userPoints += points;
    saveGamesData();
    updatePointsDisplay();

    document.getElementById('tap-target').style.display = 'none';
    document.getElementById('tap-final-score').textContent = tapGameState.score;
    document.getElementById('tap-points-earned').textContent = points;
    document.getElementById('tap-result').style.display = 'block';

    celebrateWin(points);
}

// ==================== MEMORY GAME ====================
let memoryGameState = {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    gameActive: true
};

const memorySymbols = ['🍪', '🍩', '☕', '🧁', '🍪', '🍩', '☕', '🧁'];

function startMemoryGame() {
    memoryGameState = {
        cards: [...memorySymbols].sort(() => Math.random() - 0.5),
        flipped: [],
        matched: 0,
        moves: 0,
        gameActive: true
    };

    document.getElementById('memory-moves').textContent = '0';
    document.getElementById('memory-matched').textContent = '0';
    document.getElementById('memory-result').style.display = 'none';

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    memoryGameState.cards.forEach((symbol, index) => {
        const card = document.createElement('button');
        card.className = 'memory-card';
        card.textContent = '?';
        card.onclick = () => flipMemoryCard(index, card);
        grid.appendChild(card);
    });
}

function flipMemoryCard(index, cardElement) {
    if (!memoryGameState.gameActive) return;
    if (memoryGameState.flipped.includes(index)) return;
    if (cardElement.classList.contains('matched')) return;

    memoryGameState.flipped.push(index);
    cardElement.classList.add('flipped');
    cardElement.textContent = memoryGameState.cards[index];

    if (memoryGameState.flipped.length === 2) {
        memoryGameState.gameActive = false;
        memoryGameState.moves++;
        document.getElementById('memory-moves').textContent = memoryGameState.moves;

        const [first, second] = memoryGameState.flipped;

        if (memoryGameState.cards[first] === memoryGameState.cards[second]) {
            // Match found
            memoryGameState.matched++;
            document.getElementById('memory-matched').textContent = memoryGameState.matched;

            document.querySelectorAll('.memory-card').forEach((card, i) => {
                if (i === first || i === second) {
                    card.classList.add('matched');
                }
            });

            memoryGameState.flipped = [];
            memoryGameState.gameActive = true;

            if (memoryGameState.matched === 4) {
                endMemoryGame();
            }
        } else {
            // No match
            setTimeout(() => {
                document.querySelectorAll('.memory-card').forEach((card, i) => {
                    if (i === first || i === second) {
                        card.classList.remove('flipped');
                        card.textContent = '?';
                    }
                });
                memoryGameState.flipped = [];
                memoryGameState.gameActive = true;
            }, 1000);
        }
    }
}

function endMemoryGame() {
    memoryGameState.gameActive = false;

    const points = Math.max(75 - (memoryGameState.moves * 5), 20);
    gamesState.userPoints += points;
    saveGamesData();
    updatePointsDisplay();

    document.getElementById('memory-final-moves').textContent = memoryGameState.moves;
    document.getElementById('memory-points-earned').textContent = points;
    document.getElementById('memory-result').style.display = 'block';

    celebrateWin(points);
}

// ==================== SPIN THE WHEEL ====================
let spinGameState = {
    isSpinning: false,
    prizes: [50, 100, 75, 150, 50, 200]
};

function spinWheel() {
    if (spinGameState.isSpinning) return;

    spinGameState.isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;

    const wheel = document.getElementById('spin-wheel');
    const spins = Math.floor(Math.random() * 5) + 5;
    const prizeIndex = Math.floor(Math.random() * 6);
    const rotation = spins * 360 + (prizeIndex * 60);

    wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
        const prize = spinGameState.prizes[prizeIndex];
        gamesState.userPoints += prize;
        saveGamesData();
        updatePointsDisplay();

        document.getElementById('spin-points-earned').textContent = prize;
        document.getElementById('spin-result').style.display = 'block';

        celebrateWin(prize);

        spinGameState.isSpinning = false;
        spinBtn.disabled = false;
    }, 4000);
}

// ==================== SCRATCH CARD GAME ====================
function startScratchGame() {
    const canvas = document.getElementById('scratch-canvas');
    const container = document.querySelector('.scratch-container');

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#999';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const prize = [50, 75, 100, 150, 200][Math.floor(Math.random() * 5)];
    document.getElementById('scratch-amount').textContent = prize;
    canvas.dataset.prize = prize;

    // Scratch functionality
    let isDrawing = false;

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        scratchCard(canvas, e);
    });

    canvas.addEventListener('touchstart', () => isDrawing = true);
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        scratchCard(canvas, e.touches[0]);
    });
}

function scratchCard(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(x - 20, y - 20, 40, 40);

    // Check if enough scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparent = 0;

    for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) transparent++;
    }

    if (transparent / (data.length / 4) > 0.5) {
        endScratchGame(canvas);
    }
}

function endScratchGame(canvas) {
    canvas.style.pointerEvents = 'none';
    const prize = parseInt(canvas.dataset.prize);

    gamesState.userPoints += prize;
    saveGamesData();
    updatePointsDisplay();

    document.getElementById('scratch-points-earned').textContent = prize;
    document.getElementById('scratch-result').style.display = 'block';

    celebrateWin(prize);
}

// ==================== FLAPPY DONUT GAME ====================
let flappyGameState = {
    score: 0,
    gameActive: true,
    bird: { x: 50, y: 250, width: 30, height: 30, velocity: 0 },
    pipes: [],
    gravity: 0.5,
    jump: -12
};

function startFlappyGame() {
    flappyGameState = {
        score: 0,
        gameActive: true,
        bird: { x: 50, y: 250, width: 30, height: 30, velocity: 0 },
        pipes: [],
        gravity: 0.5,
        jump: -12
    };

    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');

    document.getElementById('flappy-score').textContent = '0';
    document.getElementById('flappy-result').style.display = 'none';

    // Game loop
    const gameLoop = setInterval(() => {
        if (!flappyGameState.gameActive) {
            clearInterval(gameLoop);
            return;
        }

        // Update
        flappyGameState.bird.velocity += flappyGameState.gravity;
        flappyGameState.bird.y += flappyGameState.bird.velocity;

        // Add pipes
        if (flappyGameState.pipes.length === 0 || flappyGameState.pipes[flappyGameState.pipes.length - 1].x < 200) {
            const gapSize = 120;
            const gapY = Math.random() * (canvas.height - gapSize - 100) + 50;
            flappyGameState.pipes.push({
                x: canvas.width,
                gapY: gapY,
                gapSize: gapSize,
                width: 60,
                scored: false
            });
        }

        // Move pipes
        flappyGameState.pipes.forEach(pipe => {
            pipe.x -= 5;

            // Check collision
            if (
                flappyGameState.bird.x < pipe.x + pipe.width &&
                flappyGameState.bird.x + flappyGameState.bird.width > pipe.x &&
                (flappyGameState.bird.y < pipe.gapY || flappyGameState.bird.y + flappyGameState.bird.height > pipe.gapY + pipe.gapSize)
            ) {
                endFlappyGame();
            }

            // Score
            if (!pipe.scored && pipe.x + pipe.width < flappyGameState.bird.x) {
                pipe.scored = true;
                flappyGameState.score++;
                document.getElementById('flappy-score').textContent = flappyGameState.score;
            }
        });

        // Remove off-screen pipes
        flappyGameState.pipes = flappyGameState.pipes.filter(pipe => pipe.x > -100);

        // Check bounds
        if (flappyGameState.bird.y > canvas.height || flappyGameState.bird.y < 0) {
            endFlappyGame();
        }

        // Draw
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bird
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(flappyGameState.bird.x, flappyGameState.bird.y, flappyGameState.bird.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw pipes
        ctx.fillStyle = '#228B22';
        flappyGameState.pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
            ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, canvas.height - pipe.gapY - pipe.gapSize);
        });

        // Draw score
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Score: ' + flappyGameState.score, 10, 30);
    }, 30);

    // Jump on click
    canvas.addEventListener('click', () => {
        if (flappyGameState.gameActive) {
            flappyGameState.bird.velocity = flappyGameState.jump;
        }
    });
}

function endFlappyGame() {
    flappyGameState.gameActive = false;

    const points = Math.floor(flappyGameState.score * 10);
    gamesState.userPoints += points;
    saveGamesData();
    updatePointsDisplay();

    document.getElementById('flappy-final-score').textContent = flappyGameState.score;
    document.getElementById('flappy-points-earned').textContent = points;
    document.getElementById('flappy-result').style.display = 'block';

    celebrateWin(points);
}

// ==================== QUICK MATH GAME ====================
let mathGameState = {
    correct: 0,
    timeLeft: 30,
    gameActive: false,
    timerInterval: null,
    currentProblem: null
};

function startMathGame() {
    mathGameState = {
        correct: 0,
        timeLeft: 30,
        gameActive: true,
        timerInterval: null,
        currentProblem: null
    };

    document.getElementById('math-correct').textContent = '0';
    document.getElementById('math-timer').textContent = '30';
    document.getElementById('math-result').style.display = 'none';

    generateMathProblem();

    mathGameState.timerInterval = setInterval(() => {
        mathGameState.timeLeft--;
        document.getElementById('math-timer').textContent = mathGameState.timeLeft;

        if (mathGameState.timeLeft <= 0) {
            endMathGame();
        }
    }, 1000);
}

function generateMathProblem() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = ['+', '-', '*'][Math.floor(Math.random() * 3)];

    let answer;
    if (operation === '+') answer = num1 + num2;
    else if (operation === '-') answer = num1 - num2;
    else answer = num1 * num2;

    mathGameState.currentProblem = {
        num1, num2, operation, answer
    };

    document.getElementById('math-problem').textContent = `${num1} ${operation} ${num2} = ?`;

    // Generate options
    const options = [answer];
    while (options.length < 4) {
        const wrong = answer + (Math.floor(Math.random() * 20) - 10);
        if (!options.includes(wrong) && wrong !== answer) {
            options.push(wrong);
        }
    }

    const shuffled = options.sort(() => Math.random() - 0.5);

    const optionsDiv = document.getElementById('math-options');
    optionsDiv.innerHTML = shuffled.map(opt => `
        <button class="math-option" onclick="selectMathAnswer(${opt})">
            ${opt}
        </button>
    `).join('');
}

function selectMathAnswer(selected) {
    if (!mathGameState.gameActive) return;

    const buttons = document.querySelectorAll('.math-option');
    buttons.forEach(btn => btn.disabled = true);

    if (selected === mathGameState.currentProblem.answer) {
        mathGameState.correct++;
        document.getElementById('math-correct').textContent = mathGameState.correct;
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === selected) {
                btn.classList.add('correct');
            }
        });
    } else {
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === selected) {
                btn.classList.add('wrong');
            }
            if (parseInt(btn.textContent) === mathGameState.currentProblem.answer) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        buttons.forEach(btn => btn.disabled = false);
        generateMathProblem();
    }, 800);
}

function endMathGame() {
    mathGameState.gameActive = false;
    clearInterval(mathGameState.timerInterval);

    const points = mathGameState.correct * 10;
    gamesState.userPoints += points;
    saveGamesData();
    updatePointsDisplay();

    document.getElementById('math-final-correct').textContent = mathGameState.correct;
    document.getElementById('math-points-earned').textContent = points;
    document.getElementById('math-result').style.display = 'block';

    celebrateWin(points);
}

// ==================== UTILITIES ====================

function celebrateWin(points) {
    createConfetti();
    showToast(`🎉 You earned ${points} points!`, 'success');
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.background = 'var(--primary-color)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '999';

        const angle = (Math.PI * 2 * i) / 10;
        const velocity = 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        document.body.appendChild(particle);

        let px = x, py = y;
        const animate = () => {
            px += vx;
            py += vy;
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - (Math.abs(py - y) / 200);

            if (Math.abs(py - y) < 200) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        animate();
    }
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['var(--primary-color)', 'var(--secondary-color)', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
}

function claimDailyBonus() {
    const today = new Date().toDateString();

    if (gamesState.lastPlayedDate === today) {
        showToast('You already claimed your bonus today!', 'warning');
        return;
    }

    const bonus = 100;
    gamesState.userPoints += bonus;
    gamesState.dailyStreak++;
    gamesState.lastPlayedDate = today;
    saveGamesData();
    updatePointsDisplay();

    createConfetti();
    showToast(`🎁 Daily bonus claimed! +${bonus} points!`, 'success');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

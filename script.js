document.addEventListener('DOMContentLoaded', () => {
    // --- 1. НАСТРОЙКИ ИГРЫ И ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ---
    const player = document.getElementById('player');
    const gameWorld = document.getElementById('game-world');
    const scoreElement = document.getElementById('score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScoreElement = document.getElementById('final-score');

    // Настройки
    const lanes = [-100, 0, 100]; // Смещение для левой, центральной, правой полосы
    let gameSpeed = 6;
    
    // Состояние игры
    let currentLane = 1;
    let score = 0;
    let isJumping = false;
    let isSliding = false;
    let isGameRunning = false;
    let gameLoopInterval;
    let obstacleInterval;

    // --- 2. УПРАВЛЕНИЕ ПЕРСОНАЖЕМ ---
    function handleKeyPress(e) {
        if (!isGameRunning) return;
        switch (e.key) {
            case 'ArrowLeft':
                if (currentLane > 0) currentLane--;
                break;
            case 'ArrowRight':
                if (currentLane < 2) currentLane++;
                break;
            case 'ArrowUp':
                jump();
                break;
            case 'ArrowDown':
                slide();
                break;
        }
        updatePlayerPosition();
    }

    function updatePlayerPosition() {
        player.style.left = `calc(50% + ${lanes[currentLane]}px)`;
    }

    function jump() {
        if (isJumping || isSliding) return;
        isJumping = true;
        player.classList.add('jumping');
        setTimeout(() => {
            isJumping = false;
            player.classList.remove('jumping');
        }, 500); // Длительность прыжка
    }

    function slide() {
        if (isJumping || isSliding) return;
        isSliding = true;
        player.classList.add('sliding');
        setTimeout(() => {
            isSliding = false;
            player.classList.remove('sliding');
        }, 600); // Длительность подката
    }

    // --- 3. СОЗДАНИЕ И ДВИЖЕНИЕ ОБЪЕКТОВ ---
    function createObject() {
        const div = document.createElement('div');
        div.classList.add('game-object');

        const objectType = Math.random();
        const lane = Math.floor(Math.random() * 3);

        if (objectType < 0.2) { 
            div.classList.add('coin');
            div.dataset.type = 'coin';
        } else if (objectType < 0.6) {
            div.classList.add('obstacle-low');
            div.dataset.type = 'obstacle-low';
        } else { 
            div.classList.add('obstacle-high');
            div.dataset.type = 'obstacle-high';
        }
        
        div.style.left = `calc(50% + ${lanes[lane]}px)`;
        div.style.top = '-50px'; // Появляется сверху
        gameWorld.appendChild(div);
    }
    
    function moveObjects() {
        document.querySelectorAll('.game-object').forEach(obj => {
            let currentTop = parseFloat(obj.style.top);
            currentTop += gameSpeed;
            obj.style.top = currentTop + 'px';

            if (currentTop > 600) { obj.remove(); }
            checkCollision(obj);
        });
    }

    // --- 4. ПРОВЕРКА СТОЛКНОВЕНИЙ ---
    function checkCollision(obj) {
        const objRect = obj.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (objRect.left < playerRect.right && objRect.right > playerRect.left &&
            objRect.top < playerRect.bottom && objRect.bottom > playerRect.top) {
            
            if (obj.dataset.type === 'coin') {
                score += 10;
                scoreElement.innerText = score;
                obj.remove();
            } else if (obj.dataset.type === 'obstacle-low' && !isJumping) {
                endGame();
            } else if (obj.dataset.type === 'obstacle-high' && !isSliding) {
                endGame();
            }
        }
    }

    // --- 5. ОСНОВНОЙ ИГРОВОЙ ЦИКЛ И УПРАВЛЕНИЕ СОСТОЯНИЕМ ---
    function gameLoop() {
        score++;
        scoreElement.innerText = score;
        moveObjects();
    }
    
    function startGame() {
        currentLane = 1; score = 0; gameSpeed = 6; isGameRunning = true;
        gameWorld.querySelectorAll('.game-object').forEach(o => o.remove());
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        updatePlayerPosition();
        gameLoopInterval = setInterval(gameLoop, 16); // ~60 FPS
        obstacleInterval = setInterval(createObject, 900);
        
        document.addEventListener('keydown', handleKeyPress);
    }

    function endGame() {
        isGameRunning = false;
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        document.removeEventListener('keydown', handleKeyPress);

        finalScoreElement.innerText = score;
        gameOverScreen.classList.remove('hidden');
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});

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
    const gameSpeedStart = 5;
    const speedMultiplier = 1.0001;
    
    // Состояние игры
    let currentLane = 1; // 0, 1, 2
    let score = 0;
    let gameSpeed = gameSpeedStart;
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
        // Вернуть на место после прыжка
        setTimeout(() => {
            isJumping = false;
            player.classList.remove('jumping');
        }, 500); // Длительность прыжка
    }

    function slide() {
        if (isJumping || isSliding) return;
        isSliding = true;
        player.classList.add('sliding');
        // Вернуть в норму после подката
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

        if (objectType < 0.2) { // 20% шанс создать бонус
            div.classList.add('coin');
            div.dataset.type = 'coin';
        } else if (objectType < 0.6) { // 40% шанс - низкое препятствие
            div.classList.add('obstacle-low');
            div.dataset.type = 'obstacle-low';
        } else { // 40% шанс - высокое препятствие
            div.classList.add('obstacle-high');
            div.dataset.type = 'obstacle-high';
        }
        
        div.style.left = `calc(50% + ${lanes[lane]}px)`;
        div.style.bottom = '100%'; // Появляется сверху
        gameWorld.appendChild(div);
    }
    
    function moveObjects() {
        document.querySelectorAll('.game-object').forEach(obj => {
            let currentBottom = parseFloat(obj.style.bottom);
            currentBottom -= gameSpeed;
            obj.style.bottom = currentBottom + '%';

            // Удаляем объект, если он ушел за экран
            if (currentBottom < -20) {
                obj.remove();
            }

            // Проверка столкновений
            checkCollision(obj);
        });
        gameSpeed *= speedMultiplier; // Постепенно увеличиваем скорость
    }

    // --- 4. ПРОВЕРКА СТОЛКНОВЕНИЙ ---
    function checkCollision(obj) {
        const objRect = obj.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // Проверяем, на одной ли линии игрок и объект
        const horizontalMatch = Math.abs(playerRect.x - objRect.x) < 30;

        if (horizontalMatch) {
            const verticalMatch = playerRect.top < objRect.bottom && playerRect.bottom > objRect.top;
            
            if (verticalMatch) {
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
    }

    // --- 5. ОСНОВНОЙ ИГРОВОЙ ЦИКЛ И УПРАВЛЕНИЕ СОСТОЯНИЕМ ---
    function gameLoop() {
        score++;
        scoreElement.innerText = score;
        moveObjects();
    }
    
    function startGame() {
        // Сброс всех значений
        currentLane = 1;
        score = 0;
        gameSpeed = gameSpeedStart;
        isGameRunning = true;
        
        // Очистка мира
        gameWorld.querySelectorAll('.game-object').forEach(o => o.remove());

        // Скрыть экраны
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        // Запуск циклов
        updatePlayerPosition();
        gameLoopInterval = setInterval(gameLoop, 16); // ~60 FPS
        obstacleInterval = setInterval(createObject, 1500 / (gameSpeed / gameSpeedStart));
        
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

    // Назначаем события кнопкам
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});

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
    const lanes = [-100, 0, 100]; // Смещение для полос: левая, центр, правая
    let gameSpeed = 5;
    
    // Состояние игры
    let currentLane = 1; // 0, 1, 2 (начинаем в центре)
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
        const lane = Math.floor(Math.random() * 3);
        div.style.left = `calc(50% + ${lanes[lane]}px)`;
        
        const objectType = Math.random();
        if (objectType < 0.25) { 
            div.classList.add('coin');
            div.dataset.type = 'coin';
        } else if (objectType < 0.65) {
            div.classList.add('obstacle-low');
            div.dataset.type = 'obstacle-low';
        } else { 
            div.classList.add('obstacle-high');
            div.dataset.type = 'obstacle-high';
        }
        
        gameWorld.appendChild(div);
    }
    
    function moveObjects() {
        document.querySelectorAll('.game-object').forEach(obj => {
            let currentBottom = parseFloat(getComputedStyle(obj).bottom);
            currentBottom -= gameSpeed;
            obj.style.bottom = currentBottom + 'px';

            if (currentBottom < -50) { obj.remove(); }
            checkCollision(obj);
        });
    }

    // --- 4. ПРОВЕРКА СТОЛКНОВЕНИЙ ---
    function checkCollision(obj) {
        const objRect = obj.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const verticalMatch = objRect.top < playerRect.bottom && objRect.bottom > playerRect.top;
        const horizontalMatch = objRect.left < playerRect.right && objRect.right > playerRect.left;

        if (verticalMatch && horizontalMatch) {
            if (obj.dataset.type === 'coin') {
                score += 10;
                obj.remove();
            } else if (obj.dataset.type === 'obstacle-low' && !isJumping) {
                endGame();
            } else if (obj.dataset.type === 'obstacle-high' && !isSliding) {
                // Высокое препятствие имеет смысл, только если игрок прыгает, но у нас его надо проскальзывать.
                // Поэтому тут надо проверять не на "isJumping", а на то, что игрок в обычном состоянии
                endGame();
            }
        }
    }
    

    // --- 5. ОСНОВНОЙ ИГРОВОЙ ЦИКЛ ---
    function gameLoop() {
        score++;
        scoreElement.innerText = score;
        moveObjects();
    }
    
    function startGame() {
        // Сброс всех значений
        currentLane = 1; score = 0; isGameRunning = true;
        updatePlayerPosition();
        
        // Очистка мира
        gameWorld.querySelectorAll('.game-object').forEach(o => o.remove());

        // Скрыть экраны и показать игру
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        // Запуск циклов
        gameLoopInterval = setInterval(gameLoop, 16); // ~60 FPS
        obstacleInterval = setInterval(createObject, 1000);
        
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

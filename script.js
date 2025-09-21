// Этот код запустится ТОЛЬКО после полной загрузки HTML страницы
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ПОИСК ВСЕХ HTML-ЭЛЕМЕНТОВ ---
    // Если скрипт запустится раньше времени, здесь будут ошибки.
    // Наша обертка выше защищает от этого.
    const player = document.getElementById('player');
    const gameWorld = document.getElementById('game-world');
    const scoreElement = document.getElementById('score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScoreElement = document.getElementById('final-score');

    // --- 2. НАСТРОЙКИ ИГРЫ ---
    const lanes = [-100, 0, 100];
    let gameSpeed;
    let currentLane, score, isJumping, isSliding, isGameRunning;
    let gameLoopInterval, obstacleInterval;

    // --- 3. ФУНКЦИИ УПРАВЛЕНИЯ ИГРОКОМ ---
    function handleKeyPress(e) {
        if (!isGameRunning) return;
        switch (e.key) {
            case 'ArrowLeft': if (currentLane > 0) currentLane--; break;
            case 'ArrowRight': if (currentLane < 2) currentLane++; break;
            case 'ArrowUp': jump(); break;
            case 'ArrowDown': slide(); break;
        }
        updatePlayerPosition();
    }
    function updatePlayerPosition() { player.style.left = `calc(50% + ${lanes[currentLane]}px)`; }
    function jump() {
        if (isJumping || isSliding) return;
        isJumping = true; player.classList.add('jumping');
        setTimeout(() => { isJumping = false; player.classList.remove('jumping'); }, 500);
    }
    function slide() {
        if (isJumping || isSliding) return;
        isSliding = true; player.classList.add('sliding');
        setTimeout(() => { isSliding = false; player.classList.remove('sliding'); }, 500);
    }

    // --- 4. ФУНКЦИИ УПРАВЛЕНИЯ ОБЪЕКТАМИ ---
    function createObject() {
        const div = document.createElement('div');
        div.classList.add('game-object');
        const lane = Math.floor(Math.random() * 3);
        div.style.left = `calc(50% + ${lanes[lane]}px)`;
        const objectType = Math.random();

        if (objectType < 0.25) { div.classList.add('coin'); div.dataset.type = 'coin'; }
        else if (objectType < 0.65) { div.classList.add('obstacle-low'); div.dataset.type = 'obstacle-low'; }
        else { div.classList.add('obstacle-high'); div.dataset.type = 'obstacle-high'; div.style.top = `${-100 - Math.random() * 200}px`; } // Высокие препятствия появляются чуть дальше
        gameWorld.appendChild(div);
    }

    function moveObjects() {
        score++; scoreElement.innerText = score;
        document.querySelectorAll('.game-object').forEach(obj => {
            let currentTop = parseFloat(getComputedStyle(obj).top);
            currentTop += gameSpeed; obj.style.top = currentTop + 'px';
            if (currentTop > 650) { obj.remove(); }
            checkCollision(obj);
        });
    }

    // --- 5. СТОЛКНОВЕНИЯ ---
    function checkCollision(obj) {
        const objRect = obj.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (objRect.left < playerRect.right && objRect.right > playerRect.left &&
            objRect.top < playerRect.bottom && objRect.bottom > playerRect.top) {
            
            if (obj.dataset.type === 'coin') { score += 50; obj.remove(); }
            else if (obj.dataset.type === 'obstacle-low' && !isJumping) { endGame(); }
            else if (obj.dataset.type === 'obstacle-high' && !isSliding) { endGame(); }
        }
    }

    // --- 6. УПРАВЛЕНИЕ ХОДОМ ИГРЫ ---
    function startGame() {
        isGameRunning = true; gameSpeed = 5; currentLane = 1; score = 0;
        updatePlayerPosition();
        gameWorld.querySelectorAll('.game-object').forEach(o => o.remove());
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        document.addEventListener('keydown', handleKeyPress);
        gameLoopInterval = setInterval(moveObjects, 16);
        obstacleInterval = setInterval(createObject, 900);
    }
    function endGame() {
        isGameRunning = false;
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        document.removeEventListener('keydown', handleKeyPress);
        finalScoreElement.innerText = score;
        gameOverScreen.classList.remove('hidden');
    }
    
    // --- 7. ЗАПУСК ИГРЫ ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});

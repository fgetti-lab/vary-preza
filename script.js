// Получаем элементы игры из HTML
const character = document.getElementById('character');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score');

let score = 0;
let isJumping = false;
let isGameOver = false;

// Функция для прыжка
function jump() {
    if (isJumping || isGameOver) return;

    isJumping = true;
    character.classList.add('jump-animation');

    setTimeout(() => {
        character.classList.remove('jump-animation');
        isJumping = false;
    }, 500); // Длительность анимации прыжка
}

// Слушаем нажатия клавиш и касания экрана для прыжка
document.addEventListener('keydown', jump);
document.addEventListener('touchstart', jump);

// Основной игровой цикл для проверки столкновений
setInterval(() => {
    if (isGameOver) return;

    // Получаем текущие позиции персонажа и препятствия
    const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue('top'));
    const characterBottom = parseInt(window.getComputedStyle(character).getPropertyValue('bottom'));
    const obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue('left'));

    // Простое условие столкновения
    if (obstacleLeft < 90 && obstacleLeft > 40 && characterBottom <= 50) {
        isGameOver = true;
        alert('Ой! Игра окончена. Твой счёт: ' + score + '\n\nПопробуешь еще разок, Варя?');
        // Перезагрузка игры
        location.reload();
    }

    // Увеличиваем счет
    score++;
    scoreDisplay.textContent = score;

}, 10); // Проверяем каждые 10 миллисекунд

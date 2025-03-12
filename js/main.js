// Función para manejar "Game Over" con modal
function triggerGameOver() {
    gameOver = true;
    playSound(gameOverSound);

   // Función para manejar "Game Over" con modal
function triggerGameOver() {
    gameOver = true;
    playSound(gameOverSound);

    

    // Mostrar el modal de "Game Over"
    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    gameOverModal.show();
}

    // Mostrar la puntuación final en el modal
    const finalScoreText = `${removedCircles} puntos`; // Mostrar solo los puntos obtenidos
    document.getElementById("finalScore").innerText = finalScoreText;

    // Mostrar el modal de "Game Over"
    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    gameOverModal.show();
}


// Evento para reiniciar el juego desde el botón en la pantalla de inicio
document.getElementById("restartButton").addEventListener("click", function () {
    // Si el modal está abierto, cerrarlo
    const gameOverModal = bootstrap.Modal.getInstance(document.getElementById('gameOverModal'));
    if (gameOverModal) {
        gameOverModal.hide(); // Cierra el modal de "Game Over" si está abierto
    }

    // Reiniciar las variables y elementos del juego
    initCircles();
    updateCanvas(); // Actualiza el canvas para empezar de nuevo
});
// Evento para reiniciar el juego desde el botón en el modal de "Game Over"
document.getElementById("restartGameBtn").addEventListener("click", function () {
    // Cerrar el modal antes de reiniciar
    const gameOverModal = bootstrap.Modal.getInstance(document.getElementById('gameOverModal'));
    if (gameOverModal) {
        gameOverModal.hide(); // Cierra el modal de "Game Over"
    }

    // Reiniciar las variables y elementos del juego
    initCircles();
    updateCanvas(); // Actualiza el canvas para empezar de nuevo
});

const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Elementos HTML para mostrar estadísticas
const countDisplay = document.getElementById("countDisplay");
const percentDisplay = document.getElementById("percentDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const failDisplay = document.getElementById("failDisplay");
const restartButton = document.getElementById("restartButton");

// Dimensiones del canvas
const window_height = 600;
const window_width = 600;

canvas.height = window_height;
canvas.width = window_width;

let totalCircles = 0;
let removedCircles = 0;
let level = 1;
let speedMultiplier = 1;
let failedCircles = 0;
let gameOver = false;

// Cargar imágenes
const backgroundImage = new Image();
backgroundImage.src = "./assets/espacio.jpg";

const circleImage = new Image();
circleImage.src = "./assets/objeto.png";

// Cargar sonidos
const clickSound = new Audio("./assets/audio/acierto.mp3");
const failSound = new Audio("./assets/audio/fail.mp3");
const clickAnywhereSound = new Audio("./assets/audio/laser.mp3");
const gameOverSound = new Audio("./assets/audio/gameover.mp3");

// Ajustar el volumen de los sonidos
clickSound.volume = 0.4; // Volumen ajustado al (60%)
failSound.volume = 0.3;  // Volumen ajustado al (40%)
clickAnywhereSound.volume = 0.1; // Volumen ajustado al (30%)
gameOverSound.volume = 1; // Volumen ajustado un poco más alto (100%)

// Función para reproducir sonidos sin interrupciones
function playSound(sound) {
    let audio = sound.cloneNode();
    audio.play();
}

class Circle {
    constructor(x, y, radius, image, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.image = image;
        this.speed = speed;
        this.dy = -this.speed;
        this.dx = Math.random() * 2 - 1;
        this.opacity = 1;
        this.fading = false;
        this.clicked = false;
    }

    draw(context) {
        context.save();
        context.globalAlpha = this.opacity;
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
        context.restore();
    }

    update(context) {
        if (this.fading) {
            this.opacity -= 0.05;
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
        } else {
            this.move();
        }
        this.draw(context);
    }

    move() {
        this.posY += this.dy;
        this.posX += this.dx;

        if (this.posY + this.radius < 0 && !this.clicked) {
            failedCircles++;
            this.fading = true;
            playSound(failSound);
            updateStats();

            // Verificar si se alcanza el límite de fallos
            if (failedCircles >= 10) {
                triggerGameOver();
            }
        }

        if (this.posX - this.radius < 0 || this.posX + this.radius > window_width) {
            this.dx = -this.dx;
        }
    }

    isHovered(x, y) {
        let dx = x - this.posX;
        let dy = y - this.posY;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    isClicked(x, y) {
        return this.isHovered(x, y);
    }
}

// Evento de clic en cualquier parte de la pantalla
canvas.addEventListener("click", function (event) {
    if (gameOver) return;

    let rect = canvas.getBoundingClientRect();
    let clickX = event.clientX - rect.left;
    let clickY = event.clientY - rect.top;

    let clickedOnCircle = false;

    for (let i = 0; i < circles.length; i++) {
        if (circles[i].isClicked(clickX, clickY) && !circles[i].clicked) {
            circles[i].fading = true;
            circles[i].clicked = true;
            removedCircles++;
            playSound(clickSound);
            clickedOnCircle = true;
            updateStats();
        }
    }

    playSound(clickAnywhereSound);
});

// Evento de hover para cambiar opacidad
canvas.addEventListener("mousemove", function (event) {
    if (gameOver) return;

    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    for (let i = 0; i < circles.length; i++) {
        if (circles[i].isHovered(mouseX, mouseY)) {
            circles[i].opacity = 0.8;
        } else if (!circles[i].fading) {
            circles[i].opacity = 1;
        }
    }
});

let circles = [];

function initCircles() {
    gameOver = false;
    level = 1;
    removedCircles = 0;
    failedCircles = 0;
    speedMultiplier = 1;
    circles = [];
    generateLevel();
}

function generateLevel() {
    for (let i = 0; i < 10; i++) {
        circles.push(createRandomCircle(i + 1));
    }
    totalCircles = removedCircles + circles.length;
    updateStats();
}

function createRandomCircle(index) {
    let radius = Math.floor(Math.random() * 30) + 20;
    let x = Math.random() * (window_width - 2 * radius) + radius;
    let y = window_height + radius;
    let speed = Math.random() * (1.5 + 0.5 * speedMultiplier) + 0.5;

    return new Circle(x, y, radius, circleImage, speed);
}

function updateStats() {
    let percentage = totalCircles > 0 ? ((removedCircles / totalCircles) * 100).toFixed(2) : 0;
    countDisplay.innerText = `Eliminados: ${removedCircles} / ${totalCircles}`;
    percentDisplay.innerText = `Porcentaje: ${percentage}%`;
    levelDisplay.innerText = `Nivel: ${level}`;
    failDisplay.innerText = `Fallos: ${failedCircles}`;
}

// Función de actualización del canvas
function updateCanvas() {
    if (gameOver) {
        return;
    }

    requestAnimationFrame(updateCanvas);
    ctx.clearRect(0, 0, window_width, window_height);
    ctx.drawImage(backgroundImage, 0, 0, window_width, window_height);

    circles = circles.filter(circle => circle.opacity > 0);

    for (let i = 0; i < circles.length; i++) {
        circles[i].update(ctx);
    }

    if (circles.length === 0 && !gameOver) {
        level++;
        speedMultiplier += 0.5;
        generateLevel();
    }
}

// Iniciar el juego
initCircles();
updateCanvas();

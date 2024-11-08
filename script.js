// Cache DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuContainer = document.getElementById('menuContainer');
const gameContainer = document.getElementById('gameContainer');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const timerElement = document.getElementById('timer');

// Use a single event listener for key events
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

let gameStarted = false;
let score = 0;
let componentsCollected = 0;
let timeLeft = 60;
let gameOver = false;
let currentLevel = 0;

const player = {
    x: 50,
    y: 500,
    width: 30,
    height: 30,
    speed: 2,
    color: 'yellow',
    vy: 0,
    jumping: false,
    onLadder: false
};

let currentComponentIndex = 0;

const levels = [
    {
        // Nivel 1
        components: [
            { x: 600, y: 300, width: 20, height: 20, color: 'red', collected: false, type: 'battery', order: 0 },
            { x: 300, y: 250, width: 20, height: 20, color: 'blue', collected: false, type: 'cable', order: 1 }
        ],
        barrels: [
            { x: 800, y: 450, width: 30, height: 30, speed: -3, initialX: 800 }

        ],
        platforms: [
            { x: 0, y: 500, width: 800, height: 15, color: 'blue' }, // Plataforma base
            // x: 0, y: 450, width: 400, height: 15, color: 'blue' }, // Plataforma 1
            { x: 600, y: 400, width: 200, height: 15, color: 'blue' }, // Plataforma 2
            { x: 200, y: 300, width: 400, height: 15, color: 'blue' }  // Plataforma 3
        ],
        lightBulb: { x: 350, y: 50, width: 30, height: 30, isOn: false }
    },
    {
        // Nivel 2
        components: [
            { x: 700, y: 100, width: 20, height: 20, color: 'red', collected: false,type: 'battery', order: 0 },
            { x: 250, y: 350, width: 20, height: 20, color: 'green', collected: false,type: 'cable', order: 1 }, // Centramos el objeto
            { x: 400, y: 250, width: 20, height: 20, color: 'blue', collected: false,type: 'resistor', order: 2 }
        ],
        barrels: [
            { x: 800, y: 520, width: 30, height: 50, speed: -3 },
            { x: 800, y: 350, width: 30, height: 30, speed: -2 }
        ],
        platforms: [
            { x: 0, y: 500, width: 800, height: 15, color: 'blue' }, // Plataforma base
            { x: 0, y: 400, width: 400, height: 15, color: 'blue' }, // Plataforma 1
            { x: 600, y: 400, width: 200, height: 15, color: 'blue' }, // Plataforma 2
            { x: 0, y: 300, width: 800, height: 15, color: 'blue' }  // Plataforma 3
        ],
        lightBulb: { x: 350, y: 50, width: 30, height: 30, isOn: false }
    },
    {
        // Nivel 3
        components: [
            { x: 700, y: 100, width: 20, height: 20, color: 'red', collected: false,type: 'battery', order: 0  },
            { x: 500, y: 350, width: 20, height: 20, color: 'orange', collected: false,type: 'cable', order: 1 },
            { x: 400, y: 250, width: 20, height: 20, color: 'blue', collected: false,type: 'resistor', order: 2 },
            { x: 150, y: 450, width: 20, height: 20, color: 'green', collected: false,type: 'capacitor', order: 3  }
        ],
        barrels: [
            { x: 800, y: 450, width: 30, height: 30, speed: -3 },//abajo
            { x: 800, y: 350, width: 30, height: 30, speed: -2 },//medio
            { x: 800, y: 150, width: 30, height: 30, speed: -4 }//arriba
        ],
        platforms: [
            { x: 0, y: 500, width: 800, height: 15, color: 'blue' }, // Plataforma base
            { x: 0, y: 400, width: 400, height: 15, color: 'blue' }, // Plataforma 1
            { x: 600, y: 400, width: 200, height: 15, color: 'blue' }, // Plataforma 2
            { x: 0, y: 300, width: 800, height: 15, color: 'blue' }, // Plataforma 3
            { x: 0, y: 200, width: 400, height: 15, color: 'blue' }, // Plataforma 4
            { x: 600, y: 200, width: 200, height: 15, color: 'blue' } // Plataforma 5
        ],
        lightBulb: { x: 350, y: 50, width: 30, height: 30, isOn: false }
    },

    {
        // Nivel 4 - Mayor dificultad con barriles rápidos y más componentes
        components: [
            { x: 650, y: 150, width: 20, height: 20, color: 'red', collected: false,type: 'battery', order: 0 },
            { x: 300, y: 350, width: 20, height: 20, color: 'blue', collected: false,type: 'resistor', order: 2 },
            { x: 200, y: 250, width: 20, height: 20, color: 'green', collected: false,type: 'capacitor', order: 3 },
            { x: 400, y: 250, width: 20, height: 20, color: 'blue', collected: false,type: 'switch', order: 4 },
            { x: 500, y: 450, width: 20, height: 20, color: 'yellow', collected: false,type: 'cable', order: 1 }
        ],
        barrels: [
            { x: 800, y: 450, width: 30, height: 30, speed: -5 }, // Barril rápido
            { x: 800, y: 300, width: 30, height: 30, speed: -4 }
        ],
        platforms: [
            { x: 0, y: 500, width: 800, height: 15, color: 'blue' },
            { x: 0, y: 400, width: 300, height: 15, color: 'blue' },
            { x: 500, y: 300, width: 300, height: 15, color: 'blue' },
            { x: 100, y: 200, width: 200, height: 15, color: 'blue' }
        ],
        lightBulb: { x: 600, y: 50, width: 30, height: 30, isOn: false }
    },
    {
        // Nivel 5 - Dificultad máxima con múltiples barriles y mayor velocidad
        components: [
            { x: 750, y: 120, width: 20, height: 20, color: 'red', collected: false,type: 'battery', order: 0  },
            { x: 450, y: 250, width: 20, height: 20, color: 'blue', collected: false,type: 'resistor', order: 2   },
            { x: 200, y: 450, width: 20, height: 20, color: 'green', collected: false,type: 'capacitor', order: 3  },
            { x: 350, y: 200, width: 20, height: 20, color: 'purple', collected: false,type: 'switch', order: 4  },
            { x: 100, y: 400, width: 20, height: 20, color: 'orange', collected: false,type: 'cable', order: 1 },
            { x: 500, y: 450, width: 20, height: 20, color: 'yellow', collected: false,type: 'motor', order: 5 }
        ],
        barrels: [
            { x: 800, y: 450, width: 30, height: 30, speed: -6 },
            { x: 800, y: 300, width: 30, height: 30, speed: -5 },
            { x: 800, y: 110, width: 30, height: 30, speed: -7 }
        ],
        platforms: [
            { x: 0, y: 500, width: 800, height: 15, color: 'blue' },
            { x: 0, y: 350, width: 250, height: 15, color: 'blue' },
            { x: 450, y: 300, width: 250, height: 15, color: 'blue' },
            { x: 340, y: 150, width: 200, height: 15, color: 'blue' }
        ],
        lightBulb: { x: 400, y: 50, width: 30, height: 30, isOn: false }
    }
];

const ladders = [
    { x: 200, y: 300, width: 20, height: 100, color: 'red' },
    { x: 500, y: 200, width: 20, height: 100, color: 'red' }
];

canvas.width = 800;
canvas.height = 600;

startButton.addEventListener('click', startGame);

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (gameStarted) {
        movePlayer(deltaTime);
        moveBarrels(deltaTime);
        checkCollisions();
        draw();
    }

    requestAnimationFrame(gameLoop);
}
const legendList = document.getElementById('legendList');

function startGame() {
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    updateLegend();
    startTimer();
    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

function updateLegend() {
    legendList.innerHTML = '';
    levels[currentLevel].components
        .sort((a, b) => a.order - b.order)
        .forEach(component => {
            const listItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = `images/${component.type}.png`; // Asegúrate de que las imágenes estén en la carpeta 'images'
            img.alt = component.type;
            listItem.appendChild(img);
            listItem.appendChild(document.createTextNode(`${component.type.charAt(0).toUpperCase() + component.type.slice(1)} -> ${component.order}`));
            legendList.appendChild(listItem);
        });
}

function movePlayer(deltaTime) {
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    if (!player.onLadder) {
        player.y += player.vy;
        player.vy += 0.3;
    }

    levels[currentLevel].platforms.forEach(platform => {
        if (isColliding(player, platform)) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.jumping = false;
        }
    });

    player.onLadder = false;
    ladders.forEach(ladder => {
        if (isColliding(player, ladder)) {
            player.onLadder = true;
            player.vy = 0;
            if (keys['ArrowUp']) player.y -= player.speed;
            if (keys['ArrowDown']) player.y += player.speed;
        }
    });

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.jumping = false;
    }

    if (keys[' '] && !player.jumping && !player.onLadder) {
        player.vy = -10;
        player.jumping = true;
        document.getElementById('jumpSound')?.play();
    }
}

function moveBarrels(deltaTime) {
    levels[currentLevel].barrels.forEach(barrel => {
        barrel.x += barrel.speed;
        if (barrel.x < -30) barrel.x = canvas.width;
    });
}

function checkCollisions() {
    checkBarrelCollision();
    checkCollection();
    checkLightBulbActivation();
}

function checkBarrelCollision() {
    levels[currentLevel].barrels.forEach(barrel => {
        if (isColliding(player, barrel)) {
            document.getElementById('loseSound').play();
            alert('¡Perdiste! Un barril te atrapó.');
            barrel.x = barrel.initialX; // Reiniciar la posición del barril
            resetGame();
        }
    });
}

const collectedList = document.getElementById('collectedList');

function updateCollected() {
    collectedList.innerHTML = '';
    levels[currentLevel].components
        .filter(component => component.collected)
        .forEach(component => {
            const listItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = `images/${component.type}.png`; // Asegúrate de que las imágenes estén en la carpeta 'images'
            img.alt = component.type;
            listItem.appendChild(img);
            listItem.appendChild(document.createTextNode(`${component.type.charAt(0).toUpperCase() + component.type.slice(1)}`));
            collectedList.appendChild(listItem);
        });
}

function checkCollection() {
    levels[currentLevel].components.forEach(component => {
        if (isColliding(player, component) && !component.collected) {
            if (component.order === currentComponentIndex) {
                component.collected = true;
                componentsCollected++;
                score += 100;
                currentComponentIndex++;
                updateScore();
                updateCollected();
                document.getElementById('collectSound')?.play();
            } else {
                updateMessage('¡Debes recoger los componentes en el orden correcto!');
            }
        }
    });
    if (componentsCollected === levels[currentLevel].components.length) {
        levels[currentLevel].lightBulb.isOn = true;
        updateMessage('¡Todos los componentes recogidos! Enciende el foco!');
    }
}

function checkLightBulbActivation() {
    const lightBulb = levels[currentLevel].lightBulb;
    if (lightBulb.isOn && isColliding(player, lightBulb)) {
        if (currentLevel < levels.length - 1) {
            alert('¡El foco se ha encendido! ¡Felicidades! Pasando al siguiente nivel.');
            currentLevel++;
            resetGame();
            updateLegend(); // Actualizar la leyenda al cambiar de nivel
        } else {
            alert('¡Felicidades! Has completado todos los niveles.');
            currentLevel = 0;
            gameStarted = false;
            resetGame();
            menuContainer.style.display = 'block';
            gameContainer.style.display = 'none';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(ctx, player);
    levels[currentLevel].components.forEach(component => {
        if (!component.collected) drawComponent(ctx, component);
    });
    levels[currentLevel].barrels.forEach(barrel => drawBarrel(ctx, barrel));
    levels[currentLevel].platforms.forEach(platform => drawPlatform(ctx, platform));
    ladders.forEach(ladder => drawLadder(ctx, ladder));
    drawLightBulb(ctx, levels[currentLevel].lightBulb);
}

function drawPlayer(ctx, player) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + player.width / 8, player.y + player.height / 4, player.width / 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawComponent(ctx, component) {
    switch (component.type) {
        case 'battery': drawBattery(ctx, component); break;
        case 'switch': drawSwitch(ctx, component); break;
        case 'motor': drawMotor(ctx, component); break;
        case 'cable': drawCable(ctx, component); break;
        case 'resistor': drawResistor(ctx, component); break;
        case 'capacitor': drawCapacitor(ctx, component); break;
        default: console.warn(`Tipo de componente desconocido: ${component.type}`); break;
    }
}

function drawBattery(ctx, component) {
    ctx.fillStyle = '#4B3C2A';
    ctx.fillRect(component.x, component.y + component.height / 5, component.width, component.height * 0.8);
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(component.x, component.y, component.width, component.height / 5);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(component.x + component.width / 3, component.y + component.height * 0.5, component.width / 3, component.height / 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(component.x + component.width / 4, component.y + component.height / 15, component.width / 10, component.height / 20);
    ctx.fillRect(component.x + component.width / 4 + 5, component.y + component.height / 15 - 5, component.width / 20, component.height / 10);
}

function drawSwitch(ctx, component) {
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(component.x, component.y, component.width, component.height);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(component.x + component.width / 4, component.y + component.height / 4, component.width / 2, component.height / 2);
}

function drawMotor(ctx, component) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(component.x, component.y, component.width, component.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillRect(component.x + 5, component.y + 5, component.width - 10, component.height / 3);
}

function drawCable(ctx, component) {
    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(component.x, component.y + component.height / 2);
    ctx.lineTo(component.x + component.width, component.y + component.height / 2);
    ctx.stroke();
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(component.x - 5, component.y + (component.height / 2) - 5, 10, 10);
    ctx.fillRect(component.x + component.width - 5, component.y + (component.height / 2) - 5, 10, 10);
}

function drawResistor(ctx, component) {
    ctx.fillStyle = '#8B4513'; // Color marrón para el cuerpo del resistor
    ctx.fillRect(component.x + component.width / 4, component.y, component.width / 2, component.height); // Cuerpo del resistor
    ctx.fillStyle = '#000000'; // Color negro para las bandas
    ctx.fillRect(component.x + component.width / 4 + 2, component.y, 2, component.height); // Primera banda
    ctx.fillRect(component.x + component.width / 2 - 2, component.y, 2, component.height); // Segunda banda
    ctx.fillRect(component.x + 3 * component.width / 4 - 4, component.y, 2, component.height); // Tercera banda
    ctx.strokeStyle = '#000000'; // Color negro para las líneas
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(component.x, component.y + component.height / 2);
    ctx.lineTo(component.x + component.width / 4, component.y + component.height / 2); // Línea izquierda
    ctx.moveTo(component.x + 3 * component.width / 4, component.y + component.height / 2);
    ctx.lineTo(component.x + component.width, component.y + component.height / 2); // Línea derecha
    ctx.stroke();
}

function drawCapacitor(ctx, component) {
    ctx.fillStyle = '#0000FF'; // Color azul para el cuerpo del capacitor
    ctx.fillRect(component.x + component.width / 4, component.y, component.width / 2, component.height); // Cuerpo del capacitor
    ctx.strokeStyle = '#000000'; // Color negro para las líneas
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(component.x + component.width / 4, component.y);
    ctx.lineTo(component.x + component.width / 4, component.y + component.height); // Línea izquierda
    ctx.moveTo(component.x + 3 * component.width / 4, component.y);
    ctx.lineTo(component.x + 3 * component.width / 4, component.y + component.height); // Línea derecha
    ctx.moveTo(component.x, component.y + component.height / 2);
    ctx.lineTo(component.x + component.width / 4, component.y + component.height / 2); // Línea horizontal izquierda
    ctx.moveTo(component.x + 3 * component.width / 4, component.y + component.height / 2);
    ctx.lineTo(component.x + component.width, component.y + component.height / 2); // Línea horizontal derecha
    ctx.stroke();
}

function drawBarrel(ctx, barrel) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(barrel.x + barrel.width / 2, barrel.y);
    ctx.quadraticCurveTo(barrel.x + barrel.width, barrel.y + barrel.height / 4, barrel.x + barrel.width, barrel.y + barrel.height);
    ctx.quadraticCurveTo(barrel.x + barrel.width, barrel.y + barrel.height * 0.75, barrel.x + barrel.width / 2, barrel.y + barrel.height);
    ctx.quadraticCurveTo(barrel.x, barrel.y + barrel.height * 0.75, barrel.x, barrel.y + barrel.height);
    ctx.quadraticCurveTo(barrel.x, barrel.y + barrel.height / 4, barrel.x + barrel.width / 2, barrel.y);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(barrel.x + barrel.width / 3, barrel.y + barrel.height / 3, barrel.width / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(barrel.x + (2 * barrel.width) / 3, barrel.y + barrel.height / 3, barrel.width / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(barrel.x + barrel.width / 3, barrel.y + barrel.height / 3, barrel.width / 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(barrel.x + (2 * barrel.width) / 3, barrel.y + barrel.height / 3, barrel.width / 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawLadder(ctx, ladder) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(ladder.x, ladder.y, ladder.width / 5, ladder.height);
    ctx.fillRect(ladder.x + ladder.width - ladder.width / 5, ladder.y, ladder.width / 5, ladder.height);
    const stepHeight = 15;
    for (let i = ladder.y; i < ladder.y + ladder.height; i += stepHeight) {
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(ladder.x + ladder.width / 5, i, ladder.width - (2 * ladder.width) / 5, 3);
    }
}

function drawPlatform(ctx, platform) {
    const brickWidth = 20;
    const brickHeight = 10;
    const brickColor = '#b5651d';
    ctx.fillStyle = brickColor;
    for (let row = 0; row < platform.height; row += brickHeight) {
        for (let col = 0; col < platform.width; col += brickWidth) {
            const offset = (row % (2 * brickHeight) === 0) ? 0 : brickWidth / 2;
            ctx.fillRect(platform.x + col + offset, platform.y + row, brickWidth, brickHeight);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(platform.x + col + offset, platform.y + row, brickWidth, brickHeight);
        }
    }
}

function drawLightBulb(ctx, lightBulb) {
    ctx.fillStyle = lightBulb.isOn ? '#FFEB3B' : '#B0BEC5';
    ctx.beginPath();
    ctx.ellipse(lightBulb.x + lightBulb.width / 2, lightBulb.y + lightBulb.height / 2, lightBulb.width / 2, lightBulb.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(lightBulb.x + (lightBulb.width / 2 - 15), lightBulb.y + lightBulb.height - 15, 30, 15);
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.strokeRect(lightBulb.x + (lightBulb.width / 2 - 15), lightBulb.y + lightBulb.height - 15, 30, 15);
    if (lightBulb.isOn) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(lightBulb.x + lightBulb.width / 2, lightBulb.y + lightBulb.height / 2, lightBulb.width / 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function isColliding(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function resetGame() {
    player.x = 50;
    player.y = 500;
    player.vy = 0;
    player.jumping = false;
    keys = {};
    componentsCollected = 0;
    currentComponentIndex = 0;
    score = 0;
    timeLeft = 60;
    updateScore();
    updateMessage('');
    levels[currentLevel].components.forEach(component => component.collected = false);
    levels[currentLevel].lightBulb.isOn = false;
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            alert('¡Tiempo agotado! Perdiste.');
            resetGame();
        }
    }, 1000);
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateMessage(message) {
    messageElement.textContent = message;
}

function updateTimer() {
    timerElement.textContent = timeLeft;
}
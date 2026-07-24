"use strict";

/**
 * そらまめアドベンチャー
 * Canvasを使った横スクロールアクションゲーム
 */

// ==============================
// Canvasの初期設定
// ==============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const messageScreen = document.getElementById("messageScreen");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const restartButton = document.getElementById("restartButton");

// ==============================
// ゲーム全体の設定
// ==============================

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const WORLD_WIDTH = 4300;

const GRAVITY = 0.7;
const FRICTION = 0.82;

const keys = {};

let cameraX = 0;
let score = 0;
let collectedCoins = 0;

let gameState = "playing";
let animationFrameId = null;

// ==============================
// プレイヤー
// ==============================

const playerStartPosition = {
    x: 120,
    y: 360
};

const player = {
    x: playerStartPosition.x,
    y: playerStartPosition.y,

    width: 42,
    height: 54,

    velocityX: 0,
    velocityY: 0,

    speed: 0.9,
    maxSpeed: 7,
    jumpPower: 14,

    onGround: false,
    facingRight: true
};

// ==============================
// ステージ
// ==============================

const platforms = [
    // 地面
    {
        x: 0,
        y: 470,
        width: 800,
        height: 70
    },
    {
        x: 900,
        y: 470,
        width: 620,
        height: 70
    },
    {
        x: 1640,
        y: 470,
        width: 720,
        height: 70
    },
    {
        x: 2470,
        y: 470,
        width: 520,
        height: 70
    },
    {
        x: 3120,
        y: 470,
        width: 1180,
        height: 70
    },

    // 浮いている足場
    {
        x: 420,
        y: 370,
        width: 170,
        height: 24
    },
    {
        x: 680,
        y: 300,
        width: 150,
        height: 24
    },
    {
        x: 1020,
        y: 350,
        width: 180,
        height: 24
    },
    {
        x: 1280,
        y: 280,
        width: 150,
        height: 24
    },
    {
        x: 1770,
        y: 360,
        width: 180,
        height: 24
    },
    {
        x: 2030,
        y: 290,
        width: 160,
        height: 24
    },
    {
        x: 2600,
        y: 350,
        width: 180,
        height: 24
    },
    {
        x: 2820,
        y: 270,
        width: 130,
        height: 24
    },
    {
        x: 3260,
        y: 360,
        width: 180,
        height: 24
    },
    {
        x: 3540,
        y: 300,
        width: 180,
        height: 24
    },
    {
        x: 3830,
        y: 240,
        width: 170,
        height: 24
    }
];

// ==============================
// コイン
// ==============================

const initialCoins = [
    { x: 480, y: 320 },
    { x: 735, y: 250 },
    { x: 1080, y: 300 },
    { x: 1340, y: 230 },
    { x: 1840, y: 310 },
    { x: 2100, y: 240 },
    { x: 2670, y: 300 },
    { x: 2870, y: 220 },
    { x: 3330, y: 310 },
    { x: 3610, y: 250 },
    { x: 3900, y: 190 }
];

let coins = [];

// ==============================
// 敵
// ==============================

const initialEnemies = [
    {
        x: 620,
        y: 430,
        minX: 520,
        maxX: 760,
        speed: 1.5
    },
    {
        x: 1120,
        y: 430,
        minX: 950,
        maxX: 1450,
        speed: 1.8
    },
    {
        x: 1880,
        y: 430,
        minX: 1690,
        maxX: 2280,
        speed: 2
    },
    {
        x: 2680,
        y: 430,
        minX: 2510,
        maxX: 2920,
        speed: 1.7
    },
    {
        x: 3390,
        y: 430,
        minX: 3180,
        maxX: 3700,
        speed: 2.1
    }
];

let enemies = [];

// ==============================
// ゴール
// ==============================

const goal = {
    x: 4120,
    y: 330,
    width: 60,
    height: 140
};

// ==============================
// 装飾
// ==============================

const clouds = [
    { x: 180, y: 90, scale: 1 },
    { x: 760, y: 140, scale: 0.8 },
    { x: 1380, y: 80, scale: 1.2 },
    { x: 2120, y: 120, scale: 0.9 },
    { x: 2780, y: 70, scale: 1.1 },
    { x: 3500, y: 135, scale: 0.85 },
    { x: 4050, y: 85, scale: 1 }
];

const hills = [
    { x: 0, width: 600, height: 200 },
    { x: 700, width: 750, height: 250 },
    { x: 1550, width: 650, height: 190 },
    { x: 2250, width: 800, height: 240 },
    { x: 3150, width: 720, height: 210 },
    { x: 3850, width: 600, height: 180 }
];

// ==============================
// 初期化
// ==============================

function initializeGame() {
    player.x = playerStartPosition.x;
    player.y = playerStartPosition.y;

    player.velocityX = 0;
    player.velocityY = 0;

    player.onGround = false;
    player.facingRight = true;

    cameraX = 0;
    score = 0;
    collectedCoins = 0;

    gameState = "playing";

    coins = initialCoins.map((coin) => ({
        ...coin,
        radius: 13,
        collected: false
    }));

    enemies = initialEnemies.map((enemy) => ({
        ...enemy,
        width: 44,
        height: 40,
        direction: 1,
        active: true
    }));

    hideMessage();

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    gameLoop();
}

// ==============================
// キー操作
// ==============================

window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    const preventKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "Space"
    ];

    if (preventKeys.includes(event.code)) {
        event.preventDefault();
    }

    if (event.code === "KeyR") {
        initializeGame();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

restartButton.addEventListener("click", initializeGame);

// ==============================
// プレイヤーの更新
// ==============================

function updatePlayer() {
    if (gameState !== "playing") {
        return;
    }

    const movingLeft =
        keys.ArrowLeft ||
        keys.KeyA;

    const movingRight =
        keys.ArrowRight ||
        keys.KeyD;

    const jumping =
        keys.ArrowUp ||
        keys.KeyW ||
        keys.Space;

    if (movingLeft) {
        player.velocityX -= player.speed;
        player.facingRight = false;
    }

    if (movingRight) {
        player.velocityX += player.speed;
        player.facingRight = true;
    }

    if (!movingLeft && !movingRight) {
        player.velocityX *= FRICTION;
    }

    player.velocityX = clamp(
        player.velocityX,
        -player.maxSpeed,
        player.maxSpeed
    );

    if (jumping && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }

    player.velocityY += GRAVITY;

    // 横方向の移動
    player.x += player.velocityX;
    resolveHorizontalCollisions();

    // 縦方向の移動
    const previousY = player.y;

    player.y += player.velocityY;
    player.onGround = false;

    resolveVerticalCollisions(previousY);

    // ステージ外に出ないようにする
    player.x = clamp(
        player.x,
        0,
        WORLD_WIDTH - player.width
    );

    // 穴に落ちた場合
    if (player.y > GAME_HEIGHT + 150) {
        endGame(
            "ゲームオーバー",
            "穴に落ちてしまいました。"
        );
    }
}

// ==============================
// 足場との横方向の当たり判定
// ==============================

function resolveHorizontalCollisions() {
    for (const platform of platforms) {
        if (!isColliding(player, platform)) {
            continue;
        }

        if (player.velocityX > 0) {
            player.x = platform.x - player.width;
        } else if (player.velocityX < 0) {
            player.x = platform.x + platform.width;
        }

        player.velocityX = 0;
    }
}

// ==============================
// 足場との縦方向の当たり判定
// ==============================

function resolveVerticalCollisions(previousY) {
    for (const platform of platforms) {
        if (!isColliding(player, platform)) {
            continue;
        }

        const previousBottom = previousY + player.height;
        const platformTop = platform.y;

        const previousTop = previousY;
        const platformBottom = platform.y + platform.height;

        if (
            player.velocityY >= 0 &&
            previousBottom <= platformTop + 10
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else if (
            player.velocityY < 0 &&
            previousTop >= platformBottom - 10
        ) {
            player.y = platformBottom;
            player.velocityY = 0;
        }
    }
}

// ==============================
// コインの更新
// ==============================

function updateCoins() {
    for (const coin of coins) {
        if (coin.collected) {
            continue;
        }

        const coinBox = {
            x: coin.x - coin.radius,
            y: coin.y - coin.radius,
            width: coin.radius * 2,
            height: coin.radius * 2
        };

        if (isColliding(player, coinBox)) {
            coin.collected = true;
            collectedCoins += 1;
            score += 100;
        }
    }
}

// ==============================
// 敵の更新
// ==============================

function updateEnemies() {
    for (const enemy of enemies) {
        if (!enemy.active) {
            continue;
        }

        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x <= enemy.minX) {
            enemy.x = enemy.minX;
            enemy.direction = 1;
        }

        if (enemy.x + enemy.width >= enemy.maxX) {
            enemy.x = enemy.maxX - enemy.width;
            enemy.direction = -1;
        }

        if (!isColliding(player, enemy)) {
            continue;
        }

        const playerBottom = player.y + player.height;
        const enemyTop = enemy.y;

        const isJumpAttack =
            player.velocityY > 0 &&
            playerBottom - enemyTop < 25;

        if (isJumpAttack) {
            enemy.active = false;
            player.velocityY = -9;
            score += 200;
        } else {
            endGame(
                "ゲームオーバー",
                "森のモンスターにぶつかってしまいました。"
            );
        }
    }
}

// ==============================
// ゴール判定
// ==============================

function updateGoal() {
    if (isColliding(player, goal)) {
        const bonus = 1000;
        score += bonus;

        endGame(
            "ステージクリア！",
            `コインを${collectedCoins}枚集めました。スコア：${score}`
        );
    }
}

// ==============================
// カメラ
// ==============================

function updateCamera() {
    const targetCameraX =
        player.x -
        GAME_WIDTH * 0.35;

    cameraX += (targetCameraX - cameraX) * 0.08;

    cameraX = clamp(
        cameraX,
        0,
        WORLD_WIDTH - GAME_WIDTH
    );
}

// ==============================
// ゲーム状態の更新
// ==============================

function update() {
    updatePlayer();
    updateCoins();
    updateEnemies();
    updateGoal();
    updateCamera();
}

// ==============================
// 描画
// ==============================

function draw() {
    ctx.clearRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    drawSky();
    drawBackground();
    drawWorld();
    drawInterface();
}

function drawSky() {
    const skyGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        GAME_HEIGHT
    );

    skyGradient.addColorStop(0, "#74cfff");
    skyGradient.addColorStop(1, "#dff7ff");

    ctx.fillStyle = skyGradient;

    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    // 太陽
    ctx.beginPath();
    ctx.arc(
        790,
        90,
        48,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffd966";
    ctx.fill();
}

function drawBackground() {
    ctx.save();

    // 遠景はゆっくりスクロールさせる
    ctx.translate(-cameraX * 0.25, 0);

    for (const cloud of clouds) {
        drawCloud(
            cloud.x,
            cloud.y,
            cloud.scale
        );
    }

    ctx.restore();

    ctx.save();

    ctx.translate(-cameraX * 0.45, 0);

    for (const hill of hills) {
        drawHill(hill);
    }

    ctx.restore();
}

function drawWorld() {
    ctx.save();

    ctx.translate(-cameraX, 0);

    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawGoal();
    drawPlayer();

    ctx.restore();
}

// ==============================
// 足場の描画
// ==============================

function drawPlatforms() {
    for (const platform of platforms) {
        ctx.fillStyle = "#795548";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        ctx.fillStyle = "#55a630";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            Math.min(14, platform.height)
        );

        ctx.fillStyle = "#7bc950";

        for (
            let grassX = platform.x;
            grassX < platform.x + platform.width;
            grassX += 28
        ) {
            ctx.beginPath();

            ctx.moveTo(
                grassX,
                platform.y + 14
            );

            ctx.lineTo(
                grassX + 8,
                platform.y + 3
            );

            ctx.lineTo(
                grassX + 16,
                platform.y + 14
            );

            ctx.fill();
        }
    }
}

// ==============================
// プレイヤーの描画
// ==============================

function drawPlayer() {
    const centerX =
        player.x +
        player.width / 2;

    // 影
    ctx.beginPath();

    ctx.ellipse(
        centerX,
        player.y + player.height + 5,
        21,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgb(0 0 0 / 18%)";
    ctx.fill();

    // 体
    ctx.fillStyle = "#54b948";

    roundRect(
        player.x,
        player.y + 12,
        player.width,
        player.height - 12,
        14
    );

    ctx.fill();

    // 頭
    ctx.beginPath();

    ctx.arc(
        centerX,
        player.y + 17,
        19,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#7ed957";
    ctx.fill();

    // 顔
    const eyeDirection =
        player.facingRight ? 1 : -1;

    const eyeX =
        centerX +
        eyeDirection * 7;

    ctx.beginPath();

    ctx.arc(
        eyeX,
        player.y + 15,
        3,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#1e3d2f";
    ctx.fill();

    // 手
    ctx.beginPath();

    ctx.arc(
        player.x + 4,
        player.y + 37,
        7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        player.x + player.width - 4,
        player.y + 37,
        7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#98e66b";
    ctx.fill();

    // 足
    ctx.fillStyle = "#355f3b";

    ctx.fillRect(
        player.x + 6,
        player.y + player.height - 4,
        12,
        8
    );

    ctx.fillRect(
        player.x + player.width - 18,
        player.y + player.height - 4,
        12,
        8
    );
}

// ==============================
// 敵の描画
// ==============================

function drawEnemies() {
    for (const enemy of enemies) {
        if (!enemy.active) {
            continue;
        }

        ctx.beginPath();

        ctx.ellipse(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            enemy.width / 2,
            enemy.height / 2,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#9b5de5";
        ctx.fill();

        // 目
        ctx.beginPath();

        ctx.arc(
            enemy.x + 14,
            enemy.y + 15,
            4,
            0,
            Math.PI * 2
        );

        ctx.arc(
            enemy.x + 30,
            enemy.y + 15,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            enemy.x + 14,
            enemy.y + 16,
            2,
            0,
            Math.PI * 2
        );

        ctx.arc(
            enemy.x + 30,
            enemy.y + 16,
            2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#222222";
        ctx.fill();

        // 足
        ctx.fillStyle = "#6a2c91";

        ctx.fillRect(
            enemy.x + 6,
            enemy.y + enemy.height - 5,
            12,
            9
        );

        ctx.fillRect(
            enemy.x + enemy.width - 18,
            enemy.y + enemy.height - 5,
            12,
            9
        );
    }
}

// ==============================
// コインの描画
// ==============================

function drawCoins() {
    const time = performance.now() * 0.006;

    for (const coin of coins) {
        if (coin.collected) {
            continue;
        }

        const scaleX =
            Math.abs(Math.cos(time + coin.x * 0.01));

        ctx.save();

        ctx.translate(coin.x, coin.y);
        ctx.scale(scaleX, 1);

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffd60a";
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "#f4a300";
        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius - 5,
            0,
            Math.PI * 2
        );

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff3a0";
        ctx.stroke();

        ctx.restore();
    }
}

// ==============================
// ゴールの描画
// ==============================

function drawGoal() {
    // ポール
    ctx.fillStyle = "#f5f5f5";

    ctx.fillRect(
        goal.x + 8,
        goal.y,
        10,
        goal.height
    );

    // 旗
    ctx.beginPath();

    ctx.moveTo(
        goal.x + 18,
        goal.y + 8
    );

    ctx.lineTo(
        goal.x + 70,
        goal.y + 28
    );

    ctx.lineTo(
        goal.x + 18,
        goal.y + 50
    );

    ctx.closePath();

    ctx.fillStyle = "#ff595e";
    ctx.fill();

    // ポール上部
    ctx.beginPath();

    ctx.arc(
        goal.x + 13,
        goal.y,
        11,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffd166";
    ctx.fill();

    // ゴール文字
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";

    ctx.fillText(
        "GOAL",
        goal.x + 22,
        goal.y + 34
    );
}

// ==============================
// 背景の描画
// ==============================

function drawCloud(x, y, scale) {
    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgb(255 255 255 / 88%)";

    ctx.beginPath();

    ctx.arc(
        0,
        10,
        28,
        0,
        Math.PI * 2
    );

    ctx.arc(
        34,
        0,
        36,
        0,
        Math.PI * 2
    );

    ctx.arc(
        76,
        12,
        27,
        0,
        Math.PI * 2
    );

    ctx.fillRect(
        0,
        10,
        76,
        30
    );

    ctx.fill();

    ctx.restore();
}

function drawHill(hill) {
    ctx.beginPath();

    ctx.moveTo(
        hill.x,
        GAME_HEIGHT
    );

    ctx.quadraticCurveTo(
        hill.x + hill.width / 2,
        GAME_HEIGHT - hill.height,
        hill.x + hill.width,
        GAME_HEIGHT
    );

    ctx.closePath();

    ctx.fillStyle = "#8fd694";
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
        hill.x + hill.width * 0.2,
        GAME_HEIGHT
    );

    ctx.quadraticCurveTo(
        hill.x + hill.width * 0.55,
        GAME_HEIGHT - hill.height * 0.75,
        hill.x + hill.width * 0.85,
        GAME_HEIGHT
    );

    ctx.closePath();

    ctx.fillStyle = "#70c178";
    ctx.fill();
}

// ==============================
// 画面上部の表示
// ==============================

function drawInterface() {
    ctx.save();

    ctx.fillStyle = "rgb(255 255 255 / 88%)";

    roundRect(
        18,
        18,
        330,
        64,
        14
    );

    ctx.fill();

    ctx.fillStyle = "#243447";
    ctx.font = "bold 22px sans-serif";

    ctx.fillText(
        `スコア：${score}`,
        35,
        47
    );

    ctx.fillText(
        `コイン：${collectedCoins}/${coins.length}`,
        180,
        47
    );

    ctx.font = "bold 14px sans-serif";

    ctx.fillText(
        `ゴールまで：${Math.max(
            0,
            Math.ceil((goal.x - player.x) / 100)
        )}`,
        35,
        70
    );

    ctx.restore();
}

// ==============================
// 共通処理
// ==============================

function isColliding(rectA, rectB) {
    return (
        rectA.x < rectB.x + rectB.width &&
        rectA.x + rectA.width > rectB.x &&
        rectA.y < rectB.y + rectB.height &&
        rectA.y + rectA.height > rectB.y
    );
}

function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}

function roundRect(
    x,
    y,
    width,
    height,
    radius
) {
    const safeRadius = Math.min(
        radius,
        width / 2,
        height / 2
    );

    ctx.beginPath();

    ctx.moveTo(
        x + safeRadius,
        y
    );

    ctx.lineTo(
        x + width - safeRadius,
        y
    );

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + safeRadius
    );

    ctx.lineTo(
        x + width,
        y + height - safeRadius
    );

    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - safeRadius,
        y + height
    );

    ctx.lineTo(
        x + safeRadius,
        y + height
    );

    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - safeRadius
    );

    ctx.lineTo(
        x,
        y + safeRadius
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x + safeRadius,
        y
    );

    ctx.closePath();
}

// ==============================
// ゲーム終了
// ==============================

function endGame(title, text) {
    if (gameState !== "playing") {
        return;
    }

    gameState = "finished";

    messageTitle.textContent = title;
    messageText.textContent = text;

    messageScreen.classList.remove("hidden");
}

function hideMessage() {
    messageScreen.classList.add("hidden");
}

// ==============================
// メインループ
// ==============================

function gameLoop() {
    update();
    draw();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ==============================
// ゲーム開始
// ==============================

initializeGame();
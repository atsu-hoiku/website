"use strict";

/**
 * キリン・スカイパトロール
 * CanvasとJavaScriptで作る縦スクロールシューティング
 */

// ======================================
// HTML要素
// ======================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const messageScreen = document.getElementById("messageScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const finalScore = document.getElementById("finalScore");

// ======================================
// ゲーム設定
// ======================================

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const keys = {};

let gameState = "waiting";
let animationFrameId = null;

let score = 0;
let elapsedTime = 0;
let lastTime = 0;

let enemySpawnTimer = 0;
let itemSpawnTimer = 0;

let backgroundOffset = 0;
let screenShake = 0;

// ======================================
// プレイヤー
// ======================================

const player = {
    x: GAME_WIDTH / 2 - 30,
    y: GAME_HEIGHT - 150,

    width: 60,
    height: 92,

    speed: 6,

    maxLife: 3,
    life: 3,

    shotCooldown: 0,
    shotInterval: 180,

    invincibleTime: 0
};

// ======================================
// ゲームオブジェクト
// ======================================

let bullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];
let items = [];
let stars = [];

// ======================================
// 背景の星
// ======================================

function createStars() {
    stars = [];

    for (let index = 0; index < 70; index += 1) {
        stars.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            radius: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 1.8 + 0.6
        });
    }
}

// ======================================
// 初期化
// ======================================

function initializeGame() {
    player.x = GAME_WIDTH / 2 - player.width / 2;
    player.y = GAME_HEIGHT - 150;

    player.life = player.maxLife;
    player.shotCooldown = 0;
    player.invincibleTime = 0;

    bullets = [];
    enemies = [];
    enemyBullets = [];
    particles = [];
    items = [];

    score = 0;
    elapsedTime = 0;

    enemySpawnTimer = 0;
    itemSpawnTimer = 0;

    backgroundOffset = 0;
    screenShake = 0;

    lastTime = performance.now();

    gameState = "playing";

    startScreen.classList.add("hidden");
    messageScreen.classList.add("hidden");

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    gameLoop(lastTime);
}

// ======================================
// キーボード操作
// ======================================

window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    const preventKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Space"
    ];

    if (preventKeys.includes(event.code)) {
        event.preventDefault();
    }

    if (
        event.code === "KeyR" &&
        gameState !== "waiting"
    ) {
        initializeGame();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

startButton.addEventListener("click", initializeGame);
restartButton.addEventListener("click", initializeGame);

// ======================================
// プレイヤー更新
// ======================================

function updatePlayer(deltaTime) {
    const moveDistance =
        player.speed * deltaTime / 16.67;

    if (keys.ArrowLeft || keys.KeyA) {
        player.x -= moveDistance;
    }

    if (keys.ArrowRight || keys.KeyD) {
        player.x += moveDistance;
    }

    if (keys.ArrowUp || keys.KeyW) {
        player.y -= moveDistance;
    }

    if (keys.ArrowDown || keys.KeyS) {
        player.y += moveDistance;
    }

    player.x = clamp(
        player.x,
        10,
        GAME_WIDTH - player.width - 10
    );

    player.y = clamp(
        player.y,
        100,
        GAME_HEIGHT - player.height - 15
    );

    if (player.shotCooldown > 0) {
        player.shotCooldown -= deltaTime;
    }

    if (player.invincibleTime > 0) {
        player.invincibleTime -= deltaTime;
    }

    if (
        keys.Space &&
        player.shotCooldown <= 0
    ) {
        shootPlayerBullet();
        player.shotCooldown = player.shotInterval;
    }
}

// ======================================
// プレイヤーの弾
// ======================================

function shootPlayerBullet() {
    const centerX =
        player.x + player.width / 2;

    bullets.push({
        x: centerX - 5,
        y: player.y - 12,

        width: 10,
        height: 24,

        speed: 11
    });

    createMuzzleParticles(
        centerX,
        player.y
    );
}

function updateBullets(deltaTime) {
    const speedRate = deltaTime / 16.67;

    for (const bullet of bullets) {
        bullet.y -= bullet.speed * speedRate;
    }

    bullets = bullets.filter(
        (bullet) => bullet.y + bullet.height > -20
    );
}

// ======================================
// 敵の生成
// ======================================

function spawnEnemy() {
    const difficulty =
        Math.min(2.6, 1 + elapsedTime / 45000);

    const isBalloon =
        Math.random() < 0.25;

    if (isBalloon) {
        enemies.push({
            type: "balloon",

            x: Math.random() * (GAME_WIDTH - 58),
            y: -80,

            width: 58,
            height: 70,

            speed: 1.8 * difficulty,
            horizontalSpeed:
                (Math.random() - 0.5) * 2,

            life: 2,
            points: 200,

            shootTimer:
                1000 + Math.random() * 1000,

            phase: Math.random() * Math.PI * 2
        });

        return;
    }

    enemies.push({
        type: "cloud",

        x: Math.random() * (GAME_WIDTH - 66),
        y: -70,

        width: 66,
        height: 50,

        speed:
            (2.1 + Math.random() * 1.2) *
            difficulty,

        horizontalSpeed:
            (Math.random() - 0.5) * 1.5,

        life: 1,
        points: 100,

        shootTimer:
            1400 + Math.random() * 1800,

        phase: Math.random() * Math.PI * 2
    });
}

// ======================================
// 敵の更新
// ======================================

function updateEnemies(deltaTime) {
    const speedRate = deltaTime / 16.67;

    enemySpawnTimer -= deltaTime;

    if (enemySpawnTimer <= 0) {
        spawnEnemy();

        const minimumInterval =
            Math.max(
                330,
                900 - elapsedTime / 100
            );

        enemySpawnTimer =
            minimumInterval +
            Math.random() * 450;
    }

    for (const enemy of enemies) {
        enemy.phase += 0.035 * speedRate;

        enemy.y += enemy.speed * speedRate;

        enemy.x +=
            (
                enemy.horizontalSpeed +
                Math.sin(enemy.phase) * 0.6
            ) * speedRate;

        if (enemy.x < 0) {
            enemy.x = 0;
            enemy.horizontalSpeed *= -1;
        }

        if (
            enemy.x + enemy.width >
            GAME_WIDTH
        ) {
            enemy.x =
                GAME_WIDTH - enemy.width;

            enemy.horizontalSpeed *= -1;
        }

        enemy.shootTimer -= deltaTime;

        if (
            enemy.shootTimer <= 0 &&
            enemy.y > 20 &&
            enemy.y < GAME_HEIGHT * 0.62
        ) {
            shootEnemyBullet(enemy);

            enemy.shootTimer =
                1300 + Math.random() * 1700;
        }
    }

    enemies = enemies.filter(
        (enemy) =>
            enemy.y < GAME_HEIGHT + 100 &&
            enemy.life > 0
    );
}

// ======================================
// 敵の弾
// ======================================

function shootEnemyBullet(enemy) {
    const startX =
        enemy.x + enemy.width / 2;

    const startY =
        enemy.y + enemy.height;

    const targetX =
        player.x + player.width / 2;

    const targetY =
        player.y + player.height / 2;

    const angle = Math.atan2(
        targetY - startY,
        targetX - startX
    );

    const speed =
        enemy.type === "balloon"
            ? 4.3
            : 3.6;

    enemyBullets.push({
        x: startX - 7,
        y: startY,

        width: 14,
        height: 14,

        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed
    });
}

function updateEnemyBullets(deltaTime) {
    const speedRate = deltaTime / 16.67;

    for (const bullet of enemyBullets) {
        bullet.x +=
            bullet.velocityX * speedRate;

        bullet.y +=
            bullet.velocityY * speedRate;
    }

    enemyBullets = enemyBullets.filter(
        (bullet) =>
            bullet.x > -30 &&
            bullet.x < GAME_WIDTH + 30 &&
            bullet.y > -30 &&
            bullet.y < GAME_HEIGHT + 30
    );
}

// ======================================
// 回復アイテム
// ======================================

function updateItems(deltaTime) {
    const speedRate = deltaTime / 16.67;

    itemSpawnTimer -= deltaTime;

    if (itemSpawnTimer <= 0) {
        if (Math.random() < 0.55) {
            items.push({
                x: 30 + Math.random() *
                    (GAME_WIDTH - 80),

                y: -50,

                width: 38,
                height: 38,

                speed: 2,
                rotation: 0
            });
        }

        itemSpawnTimer =
            9000 + Math.random() * 7000;
    }

    for (const item of items) {
        item.y += item.speed * speedRate;
        item.rotation += 0.04 * speedRate;
    }

    items = items.filter(
        (item) => item.y < GAME_HEIGHT + 50
    );
}

// ======================================
// 当たり判定
// ======================================

function checkCollisions() {
    checkBulletEnemyCollisions();
    checkPlayerEnemyCollisions();
    checkPlayerEnemyBulletCollisions();
    checkPlayerItemCollisions();
}

function checkBulletEnemyCollisions() {
    for (const bullet of bullets) {
        for (const enemy of enemies) {
            if (
                bullet.remove ||
                enemy.life <= 0
            ) {
                continue;
            }

            if (!isColliding(bullet, enemy)) {
                continue;
            }

            bullet.remove = true;
            enemy.life -= 1;

            createHitParticles(
                bullet.x,
                bullet.y
            );

            if (enemy.life <= 0) {
                score += enemy.points;

                createExplosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.type
                );
            }
        }
    }

    bullets = bullets.filter(
        (bullet) => !bullet.remove
    );
}

function checkPlayerEnemyCollisions() {
    if (player.invincibleTime > 0) {
        return;
    }

    for (const enemy of enemies) {
        if (enemy.life <= 0) {
            continue;
        }

        const playerHitBox = getPlayerHitBox();

        if (
            isColliding(playerHitBox, enemy)
        ) {
            enemy.life = 0;

            damagePlayer();

            createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                enemy.type
            );

            break;
        }
    }
}

function checkPlayerEnemyBulletCollisions() {
    if (player.invincibleTime > 0) {
        return;
    }

    const playerHitBox = getPlayerHitBox();

    for (const bullet of enemyBullets) {
        if (bullet.remove) {
            continue;
        }

        if (
            isColliding(
                playerHitBox,
                bullet
            )
        ) {
            bullet.remove = true;
            damagePlayer();
            break;
        }
    }

    enemyBullets = enemyBullets.filter(
        (bullet) => !bullet.remove
    );
}

function checkPlayerItemCollisions() {
    const playerHitBox = getPlayerHitBox();

    for (const item of items) {
        if (item.remove) {
            continue;
        }

        if (
            isColliding(
                playerHitBox,
                item
            )
        ) {
            item.remove = true;

            if (player.life < player.maxLife) {
                player.life += 1;
            } else {
                score += 300;
            }

            createHeartParticles(
                item.x + item.width / 2,
                item.y + item.height / 2
            );
        }
    }

    items = items.filter(
        (item) => !item.remove
    );
}

function getPlayerHitBox() {
    return {
        x: player.x + 13,
        y: player.y + 13,
        width: player.width - 26,
        height: player.height - 24
    };
}

// ======================================
// ダメージ
// ======================================

function damagePlayer() {
    if (gameState !== "playing") {
        return;
    }

    player.life -= 1;
    player.invincibleTime = 1800;

    screenShake = 14;

    createDamageParticles(
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    if (player.life <= 0) {
        endGame();
    }
}

// ======================================
// パーティクル
// ======================================

function createMuzzleParticles(x, y) {
    for (let index = 0; index < 5; index += 1) {
        particles.push({
            x,
            y,

            velocityX:
                (Math.random() - 0.5) * 2,

            velocityY:
                -Math.random() * 3 - 1,

            radius:
                Math.random() * 3 + 2,

            life: 250,
            maxLife: 250,

            type: "star"
        });
    }
}

function createHitParticles(x, y) {
    for (let index = 0; index < 7; index += 1) {
        particles.push({
            x,
            y,

            velocityX:
                (Math.random() - 0.5) * 5,

            velocityY:
                (Math.random() - 0.5) * 5,

            radius:
                Math.random() * 4 + 2,

            life: 350,
            maxLife: 350,

            type: "hit"
        });
    }
}

function createExplosion(x, y, enemyType) {
    const count =
        enemyType === "balloon"
            ? 18
            : 12;

    for (let index = 0; index < count; index += 1) {
        particles.push({
            x,
            y,

            velocityX:
                (Math.random() - 0.5) * 8,

            velocityY:
                (Math.random() - 0.5) * 8,

            radius:
                Math.random() * 6 + 3,

            life:
                500 + Math.random() * 250,

            maxLife: 750,

            type:
                enemyType === "balloon"
                    ? "balloon"
                    : "cloud"
        });
    }
}

function createDamageParticles(x, y) {
    for (let index = 0; index < 18; index += 1) {
        particles.push({
            x,
            y,

            velocityX:
                (Math.random() - 0.5) * 9,

            velocityY:
                (Math.random() - 0.5) * 9,

            radius:
                Math.random() * 5 + 3,

            life: 650,
            maxLife: 650,

            type: "damage"
        });
    }
}

function createHeartParticles(x, y) {
    for (let index = 0; index < 12; index += 1) {
        particles.push({
            x,
            y,

            velocityX:
                (Math.random() - 0.5) * 5,

            velocityY:
                -Math.random() * 5 - 1,

            radius:
                Math.random() * 5 + 3,

            life: 700,
            maxLife: 700,

            type: "heart"
        });
    }
}

function updateParticles(deltaTime) {
    const speedRate = deltaTime / 16.67;

    for (const particle of particles) {
        particle.x +=
            particle.velocityX * speedRate;

        particle.y +=
            particle.velocityY * speedRate;

        particle.velocityX *= 0.98;
        particle.velocityY *= 0.98;

        particle.life -= deltaTime;
    }

    particles = particles.filter(
        (particle) => particle.life > 0
    );
}

// ======================================
// 背景更新
// ======================================

function updateBackground(deltaTime) {
    const speedRate = deltaTime / 16.67;

    backgroundOffset += 1.5 * speedRate;

    for (const star of stars) {
        star.y += star.speed * speedRate;

        if (star.y > GAME_HEIGHT + 5) {
            star.y = -5;
            star.x = Math.random() * GAME_WIDTH;
        }
    }

    if (screenShake > 0) {
        screenShake *= 0.86;

        if (screenShake < 0.2) {
            screenShake = 0;
        }
    }
}

// ======================================
// 更新処理
// ======================================

function update(deltaTime) {
    if (gameState !== "playing") {
        return;
    }

    elapsedTime += deltaTime;

    updateBackground(deltaTime);
    updatePlayer(deltaTime);
    updateBullets(deltaTime);
    updateEnemies(deltaTime);
    updateEnemyBullets(deltaTime);
    updateItems(deltaTime);
    updateParticles(deltaTime);

    checkCollisions();

    score += deltaTime * 0.003;
}

// ======================================
// 描画処理
// ======================================

function draw() {
    ctx.clearRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    ctx.save();

    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
    }

    drawBackground();
    drawItems();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();
    drawPlayer();
    drawParticles();

    ctx.restore();

    drawInterface();
}

// ======================================
// 背景描画
// ======================================

function drawBackground() {
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        GAME_HEIGHT
    );

    gradient.addColorStop(0, "#1677b8");
    gradient.addColorStop(0.55, "#65c8ef");
    gradient.addColorStop(1, "#d8f5ff");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    // 太陽
    ctx.beginPath();

    ctx.arc(
        GAME_WIDTH - 105,
        105,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgb(255 230 120 / 80%)";
    ctx.fill();

    // 星
    for (const star of stars) {
        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgb(255 255 255 / 70%)";
        ctx.fill();
    }

    // 流れる雲
    for (let index = 0; index < 7; index += 1) {
        const cloudY =
            (
                index * 145 +
                backgroundOffset * 0.6
            ) %
            (GAME_HEIGHT + 160) -
            100;

        const cloudX =
            40 +
            (index * 123) %
            (GAME_WIDTH - 170);

        drawBackgroundCloud(
            cloudX,
            cloudY,
            0.7 + (index % 3) * 0.18
        );
    }
}

function drawBackgroundCloud(x, y, scale) {
    ctx.save();

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgb(255 255 255 / 30%)";

    ctx.beginPath();

    ctx.arc(
        0,
        15,
        28,
        0,
        Math.PI * 2
    );

    ctx.arc(
        35,
        0,
        38,
        0,
        Math.PI * 2
    );

    ctx.arc(
        78,
        18,
        27,
        0,
        Math.PI * 2
    );

    ctx.fillRect(
        0,
        15,
        78,
        32
    );

    ctx.fill();

    ctx.restore();
}

// ======================================
// キリン描画
// ======================================

function drawPlayer() {
    const isInvisible =
        player.invincibleTime > 0 &&
        Math.floor(player.invincibleTime / 100) % 2 === 0;

    if (isInvisible) {
        return;
    }

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    // 羽
    ctx.fillStyle = "#f5fbff";

    ctx.beginPath();

    ctx.ellipse(
        8,
        55,
        20,
        31,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.ellipse(
        player.width - 8,
        55,
        20,
        31,
        0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle = "#acddeb";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 胴体
    ctx.fillStyle = "#f2c94c";

    roundRect(
        11,
        38,
        38,
        48,
        17
    );

    ctx.fill();

    // 首
    ctx.fillRect(
        22,
        17,
        18,
        40
    );

    // 頭
    ctx.beginPath();

    ctx.ellipse(
        31,
        18,
        22,
        17,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 耳
    ctx.beginPath();

    ctx.ellipse(
        11,
        13,
        10,
        6,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.ellipse(
        51,
        13,
        10,
        6,
        0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // ツノ
    ctx.strokeStyle = "#7a5320";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(22, 5);
    ctx.lineTo(19, -7);

    ctx.moveTo(40, 5);
    ctx.lineTo(43, -7);

    ctx.stroke();

    ctx.fillStyle = "#7a5320";

    ctx.beginPath();

    ctx.arc(
        19,
        -8,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        43,
        -8,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 模様
    ctx.fillStyle = "#a86c20";

    const spots = [
        [18, 48, 6],
        [39, 58, 5],
        [22, 73, 5],
        [35, 30, 4],
        [27, 14, 4]
    ];

    for (const spot of spots) {
        ctx.beginPath();

        ctx.arc(
            spot[0],
            spot[1],
            spot[2],
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // 目
    ctx.fillStyle = "#263238";

    ctx.beginPath();

    ctx.arc(
        23,
        16,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        39,
        16,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 鼻
    ctx.fillStyle = "#f7d87a";

    ctx.beginPath();

    ctx.ellipse(
        31,
        27,
        12,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#70401c";

    ctx.beginPath();

    ctx.arc(
        27,
        26,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        35,
        26,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 足
    ctx.fillStyle = "#d9a62e";

    ctx.fillRect(
        15,
        78,
        10,
        14
    );

    ctx.fillRect(
        36,
        78,
        10,
        14
    );

    ctx.restore();
}

// ======================================
// プレイヤー弾描画
// ======================================

function drawBullets() {
    for (const bullet of bullets) {
        const centerX =
            bullet.x + bullet.width / 2;

        const centerY =
            bullet.y + bullet.height / 2;

        drawStar(
            centerX,
            centerY,
            5,
            13,
            6,
            "#fff176",
            "#f9a825"
        );
    }
}

// ======================================
// 敵描画
// ======================================

function drawEnemies() {
    for (const enemy of enemies) {
        if (enemy.type === "balloon") {
            drawBalloonEnemy(enemy);
        } else {
            drawCloudEnemy(enemy);
        }
    }
}

function drawCloudEnemy(enemy) {
    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );

    ctx.fillStyle = "#7c75a8";

    ctx.beginPath();

    ctx.arc(
        15,
        29,
        18,
        0,
        Math.PI * 2
    );

    ctx.arc(
        34,
        18,
        23,
        0,
        Math.PI * 2
    );

    ctx.arc(
        53,
        29,
        17,
        0,
        Math.PI * 2
    );

    ctx.fillRect(
        14,
        26,
        40,
        20
    );

    ctx.fill();

    // 目
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(
        26,
        27,
        6,
        0,
        Math.PI * 2
    );

    ctx.arc(
        43,
        27,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#262238";

    ctx.beginPath();

    ctx.arc(
        27,
        28,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        42,
        28,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 怒った眉
    ctx.strokeStyle = "#41395c";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(19, 18);
    ctx.lineTo(29, 22);

    ctx.moveTo(49, 18);
    ctx.lineTo(39, 22);

    ctx.stroke();

    ctx.restore();
}

function drawBalloonEnemy(enemy) {
    ctx.save();

    ctx.translate(
        enemy.x,
        enemy.y
    );

    // 風船
    ctx.beginPath();

    ctx.ellipse(
        29,
        28,
        26,
        31,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ef6c82";
    ctx.fill();

    ctx.strokeStyle = "#a63852";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 顔
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(
        20,
        24,
        6,
        0,
        Math.PI * 2
    );

    ctx.arc(
        38,
        24,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#35202a";

    ctx.beginPath();

    ctx.arc(
        21,
        25,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        37,
        25,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // 紐
    ctx.strokeStyle = "#724332";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(29, 59);
    ctx.lineTo(29, 69);

    ctx.stroke();

    // 体
    ctx.fillStyle = "#5d467a";

    ctx.beginPath();

    ctx.arc(
        29,
        65,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}

// ======================================
// 敵弾描画
// ======================================

function drawEnemyBullets() {
    for (const bullet of enemyBullets) {
        const centerX =
            bullet.x + bullet.width / 2;

        const centerY =
            bullet.y + bullet.height / 2;

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            bullet.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#d946ef";
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// ======================================
// アイテム描画
// ======================================

function drawItems() {
    for (const item of items) {
        ctx.save();

        ctx.translate(
            item.x + item.width / 2,
            item.y + item.height / 2
        );

        ctx.rotate(item.rotation);

        drawHeart(
            0,
            0,
            15,
            "#ff6685"
        );

        ctx.restore();
    }
}

// ======================================
// パーティクル描画
// ======================================

function drawParticles() {
    for (const particle of particles) {
        const alpha =
            Math.max(
                0,
                particle.life /
                particle.maxLife
            );

        ctx.save();

        ctx.globalAlpha = alpha;

        if (
            particle.type === "star" ||
            particle.type === "hit"
        ) {
            drawStar(
                particle.x,
                particle.y,
                5,
                particle.radius * 1.8,
                particle.radius,
                "#fff176",
                "#f9a825"
            );
        } else if (
            particle.type === "heart"
        ) {
            drawHeart(
                particle.x,
                particle.y,
                particle.radius,
                "#ff6685"
            );
        } else {
            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            if (particle.type === "cloud") {
                ctx.fillStyle = "#d9d7ef";
            } else if (
                particle.type === "balloon"
            ) {
                ctx.fillStyle = "#ff7892";
            } else {
                ctx.fillStyle = "#ff7043";
            }

            ctx.fill();
        }

        ctx.restore();
    }
}

// ======================================
// 画面上部のUI
// ======================================

function drawInterface() {
    ctx.save();

    ctx.fillStyle = "rgb(255 255 255 / 88%)";

    roundRect(
        16,
        16,
        GAME_WIDTH - 32,
        68,
        16
    );

    ctx.fill();

    ctx.fillStyle = "#263238";
    ctx.font = "bold 24px sans-serif";

    ctx.fillText(
        `SCORE ${Math.floor(score)}`,
        34,
        57
    );

    ctx.textAlign = "right";

    ctx.fillText(
        `TIME ${Math.floor(elapsedTime / 1000)}`,
        GAME_WIDTH - 34,
        57
    );

    ctx.textAlign = "left";

    for (
        let index = 0;
        index < player.maxLife;
        index += 1
    ) {
        const x =
            GAME_WIDTH / 2 -
            62 +
            index * 46;

        const isActive =
            index < player.life;

        drawHeart(
            x,
            49,
            14,
            isActive
                ? "#ff5577"
                : "#cfd8dc"
        );
    }

    ctx.restore();
}

// ======================================
// 共通図形
// ======================================

function drawStar(
    centerX,
    centerY,
    points,
    outerRadius,
    innerRadius,
    fillColor,
    strokeColor
) {
    let rotation =
        -Math.PI / 2;

    const step =
        Math.PI / points;

    ctx.beginPath();

    for (
        let index = 0;
        index < points * 2;
        index += 1
    ) {
        const radius =
            index % 2 === 0
                ? outerRadius
                : innerRadius;

        const x =
            centerX +
            Math.cos(rotation) * radius;

        const y =
            centerY +
            Math.sin(rotation) * radius;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        rotation += step;
    }

    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawHeart(
    centerX,
    centerY,
    size,
    color
) {
    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY + size * 0.8
    );

    ctx.bezierCurveTo(
        centerX - size * 1.5,
        centerY,
        centerX - size * 0.7,
        centerY - size,
        centerX,
        centerY - size * 0.35
    );

    ctx.bezierCurveTo(
        centerX + size * 0.7,
        centerY - size,
        centerX + size * 1.5,
        centerY,
        centerX,
        centerY + size * 0.8
    );

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
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

// ======================================
// 共通処理
// ======================================

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

// ======================================
// ゲーム終了
// ======================================

function endGame() {
    gameState = "gameOver";

    messageIcon.textContent = "🦒";
    messageTitle.textContent = "ゲームオーバー";
    messageText.textContent =
        "空のパトロール、おつかれさまでした！";

    finalScore.textContent =
        `スコア：${Math.floor(score)}`;

    messageScreen.classList.remove("hidden");
}

// ======================================
// ゲームループ
// ======================================

function gameLoop(currentTime) {
    const rawDeltaTime =
        currentTime - lastTime;

    const deltaTime =
        Math.min(rawDeltaTime, 40);

    lastTime = currentTime;

    update(deltaTime);
    draw();

    animationFrameId =
        requestAnimationFrame(gameLoop);
}

// ======================================
// 最初の画面
// ======================================

createStars();
draw();
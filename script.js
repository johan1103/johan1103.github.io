// Canvas 설정
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');

// Canvas 크기 설정
canvas.width = 800;
canvas.height = 600;

// 픽셀 크기
const PIXEL_SIZE = 4;

// 색상 팔레트
const COLORS = {
    snow: '#FFFFFF',
    darkGreen: '#165B33',
    lightGreen: '#22A54D',
    brown: '#654321',
    red: '#C1292E',
    yellow: '#FFD700',
    lightBlue: '#87CEEB',
    darkBlue: '#1a1a2e',
    skin: '#FFDBAC',
    orange: '#FF6B35',
    star: '#FFF700',
    pink: '#FF69B4'
};

// 눈송이 클래스
class Snowflake {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.floor(Math.random() * 2) + 1;
    }

    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y / 30) * 0.5;

        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = COLORS.snow;
        ctx.fillRect(
            Math.floor(this.x / PIXEL_SIZE) * PIXEL_SIZE,
            Math.floor(this.y / PIXEL_SIZE) * PIXEL_SIZE,
            this.size * PIXEL_SIZE,
            this.size * PIXEL_SIZE
        );
    }
}

// 반짝이는 조명 클래스
class Light {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = this.randomColor();
        this.brightness = Math.random() * 0.6 + 0.3; // 0.3 ~ 0.9 사이로 초기화
        this.speed = (Math.random() * 0.02 + 0.01) / 2; // 속도를 절반으로 (유지 시간 두 배)
    }

    randomColor() {
        const colors = [COLORS.red, COLORS.yellow]; // 색상 가짓수 절반으로
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.brightness += this.speed;
        // 0.2 ~ 1.0 범위 내에서만 움직이도록 제한
        if (this.brightness > 1.0) {
            this.brightness = 1.0;
            this.speed *= -1;
        } else if (this.brightness < 0.2) {
            this.brightness = 0.2;
            this.speed *= -1;
        }
    }

    draw() {
        const alpha = this.brightness;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, PIXEL_SIZE * 2, PIXEL_SIZE * 2);
        ctx.globalAlpha = 1;
    }
}

// 떨어지는 선물 클래스
class Gift {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.color = this.randomColor();
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // -0.05 ~ 0.05

        // 지면 경계(118)부터 적당한 깊이(130) 사이의 랜덤한 위치에서 터짐
        this.explodeY = (118 + Math.random() * 12) * PIXEL_SIZE;
    }

    randomColor() {
        const colors = [COLORS.red, COLORS.darkGreen, COLORS.lightBlue, COLORS.pink];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;

        // 랜덤하게 설정된 위치에 도달하면 터짐
        if (this.y >= this.explodeY) {
            return true; // 제거 표시
        }
        return false;
    }

    draw() {
        const gridX = Math.floor(this.x / PIXEL_SIZE);
        const gridY = Math.floor(this.y / PIXEL_SIZE);

        // 선물 상자 본체 (6x6)
        for (let j = 0; j < 6; j++) {
            for (let i = 0; i < 6; i++) {
                drawPixel(gridX + i, gridY + j, this.color);
            }
        }

        // 리본 (가로)
        for (let i = 0; i < 6; i++) {
            drawPixel(gridX + i, gridY + 2, COLORS.yellow);
            drawPixel(gridX + i, gridY + 3, COLORS.yellow);
        }

        // 리본 (세로)
        for (let j = 0; j < 6; j++) {
            drawPixel(gridX + 2, gridY + j, COLORS.yellow);
            drawPixel(gridX + 3, gridY + j, COLORS.yellow);
        }

        // 리본 장식 (상단)
        drawPixel(gridX + 1, gridY - 1, COLORS.yellow);
        drawPixel(gridX + 4, gridY - 1, COLORS.yellow);
        drawPixel(gridX + 2, gridY - 2, COLORS.yellow);
        drawPixel(gridX + 3, gridY - 2, COLORS.yellow);
    }
}

// 파티클 클래스 (선물이 터질 때)
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // 랜덤한 방향으로 퍼짐
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2; // 위쪽으로 더 많이

        this.gravity = 0.15;
        this.life = 1.0; // 1.0에서 시작해서 0으로
        this.fadeSpeed = 0.02;

        // 크리스마스 색상
        const colors = [COLORS.red, COLORS.yellow, COLORS.snow, COLORS.star, COLORS.orange];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.size = Math.random() > 0.5 ? 1 : 2; // 1픽셀 또는 2픽셀
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // 중력 적용

        this.life -= this.fadeSpeed;

        return this.life <= 0; // life가 0 이하면 제거
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.floor(this.x / PIXEL_SIZE) * PIXEL_SIZE,
            Math.floor(this.y / PIXEL_SIZE) * PIXEL_SIZE,
            this.size * PIXEL_SIZE,
            this.size * PIXEL_SIZE
        );
        ctx.globalAlpha = 1;
    }
}

// 폭죽 로켓 클래스
class Firework {
    constructor() {
        this.x = (Math.random() * 150 + 25) * PIXEL_SIZE; // 양 끝 제외한 랜덤 위치
        this.y = 118 * PIXEL_SIZE; // 지면에서 시작
        this.targetY = (Math.random() * 40 + 20) * PIXEL_SIZE; // 20~60 사이 높이
        this.speed = 3;
        this.exploded = false;

        // 폭죽 색상 (폭발할 때 사용)
        const colorSets = [
            [COLORS.red, COLORS.yellow],
            [COLORS.lightBlue, COLORS.snow],
            [COLORS.star, COLORS.yellow],
            [COLORS.pink, COLORS.snow],
            [COLORS.darkGreen, COLORS.lightGreen]
        ];
        this.colorSet = colorSets[Math.floor(Math.random() * colorSets.length)];
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;

            // 목표 높이에 도달하면 폭발
            if (this.y <= this.targetY) {
                this.exploded = true;
                return 'explode';
            }
        }

        return this.exploded ? 'remove' : 'active';
    }

    draw() {
        if (!this.exploded) {
            // 올라가는 로켓 (작은 점)
            ctx.fillStyle = COLORS.yellow;
            ctx.fillRect(
                Math.floor(this.x / PIXEL_SIZE) * PIXEL_SIZE,
                Math.floor(this.y / PIXEL_SIZE) * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE * 2
            );

            // 로켓 꼬리 (약간의 트레일)
            ctx.globalAlpha = 0.5;
            ctx.fillRect(
                Math.floor(this.x / PIXEL_SIZE) * PIXEL_SIZE,
                Math.floor((this.y + PIXEL_SIZE * 2) / PIXEL_SIZE) * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE
            );
            ctx.globalAlpha = 1;
        }
    }
}

// 폭죽 파티클 클래스
class FireworkParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;

        // 360도 모든 방향으로 퍼짐
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2; // 더 빠르게 (2~5 범위)
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.gravity = 0.08; // 선물 파티클보다 가벼움
        this.life = 1.0;
        this.fadeSpeed = 0.012; // 더 오래 유지 (더 멀리 가도록)

        this.color = color;
        this.size = Math.random() > 0.7 ? 2 : 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98; // 공기 저항

        this.life -= this.fadeSpeed;

        return this.life <= 0;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.floor(this.x / PIXEL_SIZE) * PIXEL_SIZE,
            Math.floor(this.y / PIXEL_SIZE) * PIXEL_SIZE,
            this.size * PIXEL_SIZE,
            this.size * PIXEL_SIZE
        );
        ctx.globalAlpha = 1;
    }
}

// 눈송이 배열 생성
const snowflakes = [];
for (let i = 0; i < 50; i++) {
    snowflakes.push(new Snowflake());
}

// 트리 조명 배열
const lights = [];

// 떨어지는 선물 배열
const fallingGifts = [];

// 파티클 배열
const particles = [];

// 폭죽 배열
const fireworks = [];
const fireworkParticles = [];

// 폭죽 생성 타이머
let lastFireworkTime = 0;
const fireworkInterval = 2000; // 2초마다 폭죽 발사

// 선물 터진 횟수 및 이벤트 관리
let giftExplodeCount = 0; // 터진 선물 총 횟수
let bannerActive = false; // 배너 활성화 여부
let bannerCycleCount = 0; // 배너 활성화 후 산타 사이클 카운트
const bannerCycleTarget = 6; // 3번 왕복 = 6번 사이클

// 픽셀 그리기 헬퍼 함수
function drawPixel(x, y, color, size = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, size * PIXEL_SIZE, size * PIXEL_SIZE);
}

// 크리스마스 트리 그리기
function drawTree() {
    const baseX = 60;
    const baseY = 115; // 땅 위로 이동

    // 나무 줄기
    for (let y = 0; y < 15; y++) {
        for (let x = -2; x <= 2; x++) {
            drawPixel(baseX + x, baseY + y, COLORS.brown);
        }
    }

    // 나무 (삼각형 형태 - 아래에서 위로, 더 길게)
    // 하단 삼각형 (가장 큼)
    let currentY = baseY;
    for (let y = 0; y < 25; y++) {
        const width = Math.floor(25 - (y / 25) * 25);
        const green = y % 4 < 2 ? COLORS.darkGreen : COLORS.lightGreen;
        for (let x = -width; x <= width; x++) {
            drawPixel(baseX + x, currentY - y, green);
        }
    }

    // 중간 삼각형
    currentY = baseY - 18; // 하단 삼각형과 연결
    for (let y = 0; y < 20; y++) {
        const width = Math.floor(20 - (y / 20) * 20);
        const green = y % 4 < 2 ? COLORS.lightGreen : COLORS.darkGreen;
        for (let x = -width; x <= width; x++) {
            drawPixel(baseX + x, currentY - y, green);
        }
    }

    // 상단 삼각형 (가장 작음)
    currentY = baseY - 33; // 중간 삼각형과 연결
    for (let y = 0; y < 16; y++) {
        const width = Math.floor(15 - (y / 16) * 15);
        const green = y % 4 < 2 ? COLORS.darkGreen : COLORS.lightGreen;
        for (let x = -width; x <= width; x++) {
            drawPixel(baseX + x, currentY - y, green);
        }
    }

    // 별 (꼭대기, 크기 두 배)
    const starY = baseY - 50;
    // 중심부 (4x4)
    drawPixel(baseX, starY, COLORS.star, 2);
    drawPixel(baseX - 1, starY, COLORS.star, 2);
    drawPixel(baseX, starY + 1, COLORS.star, 2);
    drawPixel(baseX - 1, starY + 1, COLORS.star, 2);
    // 위쪽 뾰족한 부분
    drawPixel(baseX, starY - 1, COLORS.star);
    drawPixel(baseX - 1, starY - 1, COLORS.star);
    drawPixel(baseX, starY - 2, COLORS.star);
    // 아래쪽 뾰족한 부분
    drawPixel(baseX, starY + 2, COLORS.star);
    drawPixel(baseX - 1, starY + 2, COLORS.star);
    drawPixel(baseX, starY + 3, COLORS.star);
    // 좌우 뾰족한 부분
    drawPixel(baseX - 2, starY, COLORS.star);
    drawPixel(baseX - 3, starY, COLORS.star);
    drawPixel(baseX + 1, starY, COLORS.star);
    drawPixel(baseX + 2, starY, COLORS.star);
    drawPixel(baseX - 2, starY + 1, COLORS.star);
    drawPixel(baseX + 1, starY + 1, COLORS.star);
}

// 루돌프 그리기 (rudolph.jpg 기반, 2배 크기, 부위별 구조화)
function drawRudolph(x, y) {
    const darkBrown = '#654321';
    const mediumBrown = '#8B7355';
    const lightBrown = '#A0826D';
    const beige = '#C9B18A';

    // 각 픽셀을 2x2로 그리기
    // const p = (px, py, color) => {
    //     drawPixel(x + px * 2, y + py * 2, color);
    //     drawPixel(x + px * 2 + 1, y + py * 2, color);
    //     drawPixel(x + px * 2, y + py * 2 + 1, color);
    //     drawPixel(x + px * 2 + 1, y + py * 2 + 1, color);
    // };
    const p = (px, py, color) => {
        drawPixel(x + px, y + py, color);
    };

    // 뿔
    p(3, -3, darkBrown);
    p(3, -2, darkBrown);
    p(4, -2, darkBrown);

    // 얼굴 (머리)
    p(4, -1, darkBrown);
    p(5, -1, mediumBrown);
    p(6, -1, mediumBrown);

    p(4, 0, mediumBrown);
    p(5, 0, mediumBrown);
    p(6, 0, mediumBrown);
    p(7, 0, mediumBrown);

    p(3, 1, mediumBrown);
    p(4, 1, mediumBrown);
    p(5, 1, mediumBrown);
    p(6, 1, '#000000');
    p(7, 1, mediumBrown);
    p(8, 1, mediumBrown);
    p(9, 1, COLORS.red);

    p(4, 2, mediumBrown);
    p(5, 2, mediumBrown);
    p(6, 2, mediumBrown);
    p(7, 2, mediumBrown);
    p(8, 2, mediumBrown);

    p(4, 3, mediumBrown);
    p(5, 3, mediumBrown);
    p(6, 3, mediumBrown);
    p(7, 3, mediumBrown);

    // 목 부분
    p(4, 4, COLORS.red);
    p(5, 4, COLORS.red);
    p(6, 4, COLORS.red);

    // 몸통

    p(1, 5, mediumBrown);
    p(2, 5, mediumBrown);
    p(3, 5, mediumBrown);
    p(4, 5, mediumBrown);
    p(5, 5, mediumBrown);
    p(6, 5, mediumBrown);
    p(7, 5, COLORS.yellow);

    p(0, 6, mediumBrown);
    p(1, 6, mediumBrown);
    p(2, 6, lightBrown);
    p(3, 6, mediumBrown);
    p(4, 6, mediumBrown);
    p(5, 6, mediumBrown);
    p(6, 6, mediumBrown);

    p(-1, 7, mediumBrown);
    p(0, 7, mediumBrown);
    p(1, 7, lightBrown);
    p(2, 7, mediumBrown);
    p(3, 7, mediumBrown);
    p(4, 7, mediumBrown);
    p(5, 7, mediumBrown);
    p(6, 7, mediumBrown);

    // 다리
    p(0, 8, mediumBrown);
    p(1, 8, mediumBrown);
    p(2, 8, mediumBrown);

    p(5, 8, mediumBrown);
    p(6, 8, mediumBrown);

    p(0, 9, mediumBrown);
    p(1, 9, mediumBrown);

    p(5, 9, mediumBrown);
    p(6, 9, mediumBrown);

    p(0, 9, darkBrown);
    p(1, 9, darkBrown);

    p(5, 9, darkBrown);
    p(6, 9, darkBrown);
}

// 썰매 그리기 (옆모습, 1.5배 크기)
function drawSleigh(x, y) {
    // 썰매 뒷부분 (높은 등받이)
    for (let j = -6; j <= 0; j++) {
        drawPixel(x - 6, y + j, COLORS.red);
        drawPixel(x - 5, y + j, COLORS.red);
    }

    // 썰매 본체 (측면)
    for (let i = -6; i <= 6; i++) {
        drawPixel(x + i, y, COLORS.red);
        drawPixel(x + i, y + 1, COLORS.red);
        drawPixel(x + i, y + 2, COLORS.red);
    }

    // 썰매 앞부분 (곡선)
    drawPixel(x + 7, y, COLORS.red);
    drawPixel(x + 7, y + 1, COLORS.red);

    // 썰매 날 (아래쪽, 은색)
    for (let i = -7; i <= 7; i++) {
        drawPixel(x + i, y + 3, '#C0C0C0');
        drawPixel(x + i, y + 4, '#C0C0C0');
    }
    drawPixel(x + 8, y + 4, '#C0C0C0');
    drawPixel(x + 9, y + 4, '#C0C0C0');

    // 장식 (금색 라인)
    for (let i = -5; i <= 7; i++) {
        drawPixel(x + i, y - 1, COLORS.yellow);
    }
}

// 산타 그리기 (santa.png 기반, 픽셀 하나하나 따라 그리기)
function drawSantaOnSleigh(x, y) {
    const p = (px, py, color) => {
        drawPixel(x + px, y + py, color);
    };

    const black = '#000000';
    const red = COLORS.red;
    const white = COLORS.snow;
    const skin = '#F5DEB3';


    // Row -11 (모자)
    p(1, -11, white);
    p(2, -11, red);
    p(3, -11, red);
    p(4, -11, red);

    p(2, -10, red);
    p(3, -10, red);
    p(4, -10, red);
    p(5, -10, red);
    p(6, -10, red);

    p(1, -9, red);
    p(2, -9, red);
    p(3, -9, red);
    p(4, -9, red);
    p(5, -9, red);
    p(6, -9, red);
    p(7, -9, red);

    // Row -8 (모자 테두리)
    p(1, -8, white);
    p(2, -8, white);
    p(3, -8, white);
    p(4, -8, white);
    p(5, -8, white);
    p(6, -8, white);
    p(7, -8, white);

    p(1, -7, white);
    p(2, -7, white);
    p(3, -7, white);
    p(4, -7, white);
    p(5, -7, white);
    p(6, -7, white);
    p(7, -7, white);

    // Row -6 (얼굴 시작)
    p(0, -6, white);
    p(1, -6, skin);
    p(2, -6, black);
    p(3, -6, skin);
    p(4, -6, skin);
    p(5, -6, skin);
    p(6, -6, black);
    p(7, -6, skin);
    p(8, -6, white);

    // Row -5 (코)
    p(0, -5, white);
    p(1, -5, skin);
    p(2, -5, skin);
    p(3, -5, skin);
    p(4, -5, red);
    p(5, -5, skin);
    p(6, -5, skin);
    p(7, -5, skin);
    p(8, -5, white);

    // Row -4 (수염 시작)
    p(0, -4, white);
    p(1, -4, white);
    p(2, -4, white);
    p(3, -4, white);
    p(4, -4, white);
    p(5, -4, white);
    p(6, -4, white);
    p(7, -4, white);
    p(8, -4, white);

    // Row -3
    p(1, -3, white);
    p(2, -3, white);
    p(3, -3, white);
    p(4, -3, white);
    p(5, -3, white);
    p(6, -3, white);
    p(7, -3, white);

    // Row -2
    p(2, -2, white);
    p(3, -2, white);
    p(4, -2, white);
    p(5, -2, white);
    p(6, -2, white);

    // Row -1 (몸통 시작)
    p(1, -1, red);
    p(2, -1, red);
    p(3, -1, red);
    p(4, -1, red);
    p(5, -1, red);
    p(6, -1, red);

    // Row 0
    p(0, 0, red);
    p(1, 0, red);
    p(2, 0, red);
    p(3, 0, red);
    p(4, 0, red);
    p(5, 0, red);
    p(6, 0, red);
    p(7, 0, red);

    // Row 1 (벨트)
    p(-1, 1, white);
    p(0, 1, white);
    p(1, 1, white);
    p(2, 1, white);
    p(3, 1, white);
    p(4, 1, white);
    p(5, 1, white);
    p(6, 1, white);
    p(7, 1, white);
    p(8, 1, white);

}

// 배너 패널 그리기 (산타 썰매 뒤)
function drawBanner(x, y) {
    const bannerX = x - 80;
    const bannerY = y + 3;
    const bannerWidth = 55;

    // 배너 배경 (흰색)
    for (let j = 0; j < 10; j++) {
        for (let i = 0; i < bannerWidth; i++) {
            drawPixel(bannerX + i, bannerY + j, COLORS.snow);
        }
    }

    // 배너 테두리 (빨간색)
    for (let i = 0; i < bannerWidth; i++) {
        drawPixel(bannerX + i, bannerY, COLORS.red);
        drawPixel(bannerX + i, bannerY + 9, COLORS.red);
    }
    for (let j = 0; j < 10; j++) {
        drawPixel(bannerX, bannerY + j, COLORS.red);
        drawPixel(bannerX + bannerWidth - 1, bannerY + j, COLORS.red);
    }

    // 배너와 썰매를 연결하는 줄
    for (let i = 0; i < 8; i++) {
        drawPixel(bannerX + bannerWidth + i, bannerY + 5, '#8B4513');
    }

    // "태은이 국시 합격 기원" 텍스트 렌더링
    ctx.save();
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillStyle = COLORS.red;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('태은이 국시 합격 기원',
        (bannerX + bannerWidth / 2) * PIXEL_SIZE,
        (bannerY + 5) * PIXEL_SIZE
    );
    ctx.restore();
}

// 루돌프 썰매 전체 그리기 (항상 오른쪽으로 이동)
function drawRudolphSleigh(x, y) {
    // 배너는 활성화되어 있을 때만 그리기
    if (bannerActive && bannerCycleCount < bannerCycleTarget) {
        drawBanner(x, y);
    }

    // 썰매와 산타 먼저 (뒤쪽)
    drawSleigh(x - 10, y + 5);
    drawSantaOnSleigh(x - 13, y + 2);

    // 루돌프가 앞(오른쪽)에서 썰매를 끔
    drawRudolph(x + 8, y);

    drawRudolph(x + 20, y);

    drawRudolph(x + 32, y);

    // 고삐/줄 (루돌프와 썰매 연결)
    for (let i = -2; i <= 7; i++) {
        drawPixel(x + i, y + 6, '#8B4513');
    }
    for (let i = 15; i <= 19; i++) {
        drawPixel(x + i, y + 6, '#8B4513');
    }
    for (let i = 27; i <= 31; i++) {
        drawPixel(x + i, y + 6, '#8B4513');
    }
}

// 선물 상자 그리기
function drawGift(x, y, color) {
    // 상자 본체
    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < 8; i++) {
            drawPixel(x + i, y + j, color);
        }
    }

    // 리본 (가로)
    for (let i = 0; i < 8; i++) {
        drawPixel(x + i, y + 2, COLORS.yellow);
        drawPixel(x + i, y + 3, COLORS.yellow);
    }

    // 리본 (세로)
    for (let j = 0; j < 6; j++) {
        drawPixel(x + 3, y + j, COLORS.yellow);
        drawPixel(x + 4, y + j, COLORS.yellow);
    }

    // 리본 장식
    drawPixel(x + 2, y - 1, COLORS.yellow);
    drawPixel(x + 5, y - 1, COLORS.yellow);
    drawPixel(x + 3, y - 2, COLORS.yellow);
    drawPixel(x + 4, y - 2, COLORS.yellow);
}

// 눈사람 그리기
function drawSnowman(x, y) {
    // 하단 눈덩이
    for (let j = 0; j < 5; j++) {
        const width = 4 - Math.abs(j - 2);
        for (let i = -width; i <= width; i++) {
            drawPixel(x + i, y + j, COLORS.snow);
        }
    }

    // 중간 눈덩이
    for (let j = 0; j < 4; j++) {
        const width = 3 - Math.abs(j - 1.5);
        for (let i = -Math.floor(width); i <= Math.floor(width); i++) {
            drawPixel(x + i, y - 4 + j, COLORS.snow);
        }
    }

    // 머리
    for (let j = 0; j < 3; j++) {
        const width = 2 - Math.abs(j - 1);
        for (let i = -width; i <= width; i++) {
            drawPixel(x + i, y - 7 + j, COLORS.snow);
        }
    }

    // 눈
    drawPixel(x - 1, y - 6, '#000000');
    drawPixel(x + 1, y - 6, '#000000');

    // 코 (당근)
    drawPixel(x, y - 5, COLORS.orange);

    // 버튼
    drawPixel(x, y - 3, '#000000');
    drawPixel(x, y - 1, '#000000');
    drawPixel(x, y + 1, '#000000');

    // 모자
    for (let i = -2; i <= 2; i++) {
        drawPixel(x + i, y - 8, '#000000');
    }
    for (let j = 0; j < 2; j++) {
        drawPixel(x - 1, y - 9 - j, '#000000');
        drawPixel(x, y - 9 - j, '#000000');
        drawPixel(x + 1, y - 9 - j, '#000000');
    }
}

// 땅바닥 그리기
function drawGround() {
    // 땅 (갈색)
    for (let x = 0; x < 200; x++) {
        for (let y = 118; y < 150; y++) {
            drawPixel(x, y, '#8B7355');
        }
    }

    // 드문드문 눈 덮인 효과
    for (let x = 0; x < 200; x++) {
        // 랜덤하게 눈 배치 (일정한 패턴)
        if ((x + Math.floor(x / 5)) % 7 < 4) {
            for (let y = 118; y < 120; y++) {
                drawPixel(x, y, COLORS.snow);
            }
        }
        if ((x + Math.floor(x / 3)) % 11 < 5) {
            drawPixel(x, 120, COLORS.snow);
        }
        if ((x + Math.floor(x / 7)) % 13 < 3) {
            drawPixel(x, 121, COLORS.snow);
        }
    }
}

// 집 그리기
function drawHouse(x, y, roofColor, wallColor) {
    // 벽
    for (let j = 0; j < 12; j++) {
        for (let i = 0; i < 16; i++) {
            drawPixel(x + i, y + j, wallColor);
        }
    }

    // 지붕 (아래가 넓고 위가 좁은 정삼각형, 더 크게)
    for (let j = 0; j < 10; j++) {
        const width = 10 - j;
        for (let i = -width; i <= width; i++) {
            drawPixel(x + 8 + i, y - 1 - j, roofColor);
        }
    }

    // 굴뚝 (지붕 위에 겹쳐서)
    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 3; i++) {
            drawPixel(x + 12 + i, y - 6 - j, '#8B4513');
        }
    }
    // 굴뚝 위 눈
    for (let i = 0; i < 3; i++) {
        drawPixel(x + 12 + i, y - 11, COLORS.snow);
    }

    // 눈 덮인 지붕 꼭대기
    drawPixel(x + 8, y - 10, COLORS.snow);
    drawPixel(x + 7, y - 10, COLORS.snow);
    drawPixel(x + 9, y - 10, COLORS.snow);

    // 문
    for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 4; i++) {
            drawPixel(x + 6 + i, y + 5 + j, COLORS.brown);
        }
    }

    // 문 손잡이
    drawPixel(x + 8, y + 8, COLORS.yellow);

    // 창문 (왼쪽)
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            drawPixel(x + 1 + i, y + 3 + j, COLORS.lightBlue);
        }
    }
    // 창문 틀
    for (let i = 0; i < 4; i++) {
        drawPixel(x + 1 + i, y + 5, '#333333');
    }
    drawPixel(x + 3, y + 3, '#333333');
    drawPixel(x + 3, y + 4, '#333333');
    drawPixel(x + 3, y + 6, '#333333');

    // 창문 (오른쪽)
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            drawPixel(x + 11 + i, y + 3 + j, COLORS.lightBlue);
        }
    }
    // 창문 틀
    for (let i = 0; i < 4; i++) {
        drawPixel(x + 11 + i, y + 5, '#333333');
    }
    drawPixel(x + 13, y + 3, '#333333');
    drawPixel(x + 13, y + 4, '#333333');
    drawPixel(x + 13, y + 6, '#333333');
}

// 산타 이동 애니메이션 (왼쪽에서 오른쪽으로만)
let santaX = -20;
let prevSantaX = -20; // 이전 프레임의 santaX (리셋 감지용)

// 밤하늘의 별 초기화
const skyStars = [];
function initSkyStars() {
    // 하늘 영역 상위 2/3에만 랜덤하게 별 배치
    const maxStarY = Math.floor(115 * 2 / 3); // 약 77
    for (let i = 0; i < 40; i++) {
        skyStars.push({
            x: Math.floor(Math.random() * 200),
            y: Math.floor(Math.random() * maxStarY),
            size: Math.random() > 0.7 ? 2 : 1 // 30%는 크기 2, 70%는 크기 1
        });
    }
}

// 밤하늘의 별 그리기
function drawSkyStars() {
    skyStars.forEach(star => {
        drawPixel(star.x, star.y, COLORS.star, star.size);
    });
}

// 달 그리기
function drawMoon() {
    const moonX = 20;
    const moonY = 15;
    const moonRadius = 8; // 6에서 8로 증가 (약 1.3배)

    // 달 본체 (원형)
    for (let y = -moonRadius; y <= moonRadius; y++) {
        for (let x = -moonRadius; x <= moonRadius; x++) {
            const distance = Math.sqrt(x * x + y * y);
            if (distance <= moonRadius) {
                drawPixel(moonX + x, moonY + y, COLORS.snow);
            }
        }
    }

    // 크레이터 (어두운 부분)
    drawPixel(moonX - 3, moonY - 2, '#D3D3D3');
    drawPixel(moonX - 4, moonY - 2, '#D3D3D3');
    drawPixel(moonX - 3, moonY - 1, '#D3D3D3');
    drawPixel(moonX - 4, moonY - 1, '#D3D3D3');

    drawPixel(moonX + 2, moonY + 3, '#D3D3D3');
    drawPixel(moonX + 3, moonY + 3, '#D3D3D3');
    drawPixel(moonX + 2, moonY + 2, '#D3D3D3');

    drawPixel(moonX - 1, moonY - 4, '#D3D3D3');
    drawPixel(moonX - 2, moonY - 4, '#D3D3D3');
}

// 트리 조명 초기화
function initLights() {
    // 트리 구조에 맞춰 조명 배치 (개수 절반으로)
    // baseX = 60, baseY = 115, 트리가 더 길어짐
    const positions = [
        // 하단 삼각형
        [50, 112], [48, 104], [45, 96],
        [70, 112], [72, 104], [80, 96],
        [60, 114], [58, 106], [62, 98],

        // 중간 삼각형
        [52, 94], [55, 86],
        [68, 94], [65, 86],
        [60, 92], [60, 84],

        // 상단 삼각형
        [55, 78], [57, 72],
        [65, 78], [63, 72],
        [60, 76], [60, 71]
    ];

    positions.forEach(([x, y]) => {
        lights.push(new Light(x * PIXEL_SIZE, y * PIXEL_SIZE));
    });
}

initLights();
initSkyStars();

// 클릭 이벤트 쓰로틀링 변수
let lastClickTime = 0;
const clickCooldown = 500; // 0.5초 (밀리초)

// 클릭 이벤트로 선물 떨어뜨리기
canvas.addEventListener('click', (event) => {
    const currentTime = Date.now();

    // 마지막 클릭으로부터 0.5초가 지나지 않았으면 무시
    if (currentTime - lastClickTime < clickCooldown) {
        return;
    }

    // 마지막 클릭 시간 업데이트
    lastClickTime = currentTime;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 산타의 현재 위치에서 선물 생성
    const giftX = (Math.floor(santaX) - 4) * PIXEL_SIZE;
    const giftY = 30 * PIXEL_SIZE;

    fallingGifts.push(new Gift(giftX, giftY));

    // 선물이 떨어지는 순간 작은 파티클 효과 생성
    const centerX = giftX + 3 * PIXEL_SIZE;
    const centerY = giftY + 3 * PIXEL_SIZE;

    // 6-8개의 작은 파티클 생성 (땅에 닿을 때보다 적게)
    const particleCount = Math.floor(Math.random() * 3) + 6;
    for (let j = 0; j < particleCount; j++) {
        particles.push(new Particle(centerX, centerY));
    }
});

// 폭죽 생성 함수
function createFirework() {
    const currentTime = Date.now();

    // 배너가 활성화되어 있는 동안 폭죽 발사
    if (bannerActive) {
        // 간격을 1초로 줄이고, 발사 확률 80%로 증가
        if (currentTime - lastFireworkTime > 1000) {
            // 랜덤하게 폭죽 발사 (80% 확률)
            if (Math.random() > 0.2) {
                // 1-2개의 폭죽을 동시에 발사
                const count = Math.random() > 0.5 ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    fireworks.push(new Firework());
                }
                lastFireworkTime = currentTime;
            }
        }
    }
}

// 애니메이션 루프
function animate() {
    // 배경 클리어
    ctx.fillStyle = COLORS.darkBlue;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 밤하늘의 별
    drawSkyStars();

    // 달
    drawMoon();

    // 땅바닥
    drawGround();

    // 집 3채
    drawHouse(10, 106, COLORS.red, '#D2B48C');
    drawHouse(95, 106, '#8B0000', '#F5DEB3');
    drawHouse(165, 106, COLORS.darkGreen, '#DEB887');

    // 크리스마스 트리
    drawTree();

    // 조명 업데이트 및 그리기
    lights.forEach(light => {
        light.update();
        light.draw();
    });

    // 눈사람 (땅 위로 이동)
    drawSnowman(150, 113);

    // 산타와 루돌프 썰매 이동 (왼쪽에서 오른쪽으로)
    prevSantaX = santaX;
    santaX += 0.5;

    // 리셋 조건: 배너가 활성화되어 있으면 배너가 완전히 사라질 때까지 기다림
    let shouldReset = false;
    if (bannerActive) {
        // 배너 위치: x - 80, 배너 너비: 55
        // 배너 오른쪽 끝: x - 80 + 55 = x - 25
        // 배너가 완전히 화면 밖으로 나가려면 x - 25 > 200 (캔버스 너비 / PIXEL_SIZE)
        if (santaX - 80 > 200) {
            shouldReset = true;
        }
    } else {
        // 배너가 없을 때는 산타만 기준
        if (santaX > 220) {
            shouldReset = true;
        }
    }

    if (shouldReset) {
        santaX = -50; // 왼쪽에서 다시 시작

        // 배너가 활성화되어 있으면 사이클 카운트 증가
        if (bannerActive) {
            bannerCycleCount++;
            if (bannerCycleCount >= bannerCycleTarget) {
                bannerActive = false; // 3번 왕복 완료
            }
        }
    }

    drawRudolphSleigh(Math.floor(santaX), 30);

    // 눈송이 업데이트 및 그리기
    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });

    // 떨어지는 선물 업데이트 및 그리기
    for (let i = fallingGifts.length - 1; i >= 0; i--) {
        const gift = fallingGifts[i];
        const shouldRemove = gift.update();

        if (shouldRemove) {
            // 선물이 터진 횟수 증가
            giftExplodeCount++;

            // 땅에 닿았을 때 파티클 생성
            const centerX = gift.x + 3 * PIXEL_SIZE;
            const centerY = gift.y + 3 * PIXEL_SIZE;

            // 12-15개의 파티클 생성
            const particleCount = Math.floor(Math.random() * 4) + 12;
            for (let j = 0; j < particleCount; j++) {
                particles.push(new Particle(centerX, centerY));
            }

            // 5의 배수일 때 배너 활성화 (폭죽도 자동으로 활성화됨)
            if (giftExplodeCount % 5 === 0) {
                bannerActive = true;
                bannerCycleCount = 0; // 사이클 카운트 리셋
            }

            fallingGifts.splice(i, 1);
        } else {
            gift.draw();
        }
    }

    // 파티클 업데이트 및 그리기
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        const shouldRemove = particle.update();

        if (shouldRemove) {
            particles.splice(i, 1);
        } else {
            particle.draw();
        }
    }

    // 폭죽 생성
    createFirework();

    // 폭죽 로켓 업데이트 및 그리기
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        const status = firework.update();

        if (status === 'explode') {
            // 폭발 시 파티클 생성 (50-70개)
            const particleCount = Math.floor(Math.random() * 21) + 50;
            for (let j = 0; j < particleCount; j++) {
                const color = firework.colorSet[Math.floor(Math.random() * firework.colorSet.length)];
                fireworkParticles.push(new FireworkParticle(firework.x, firework.y, color));
            }
            fireworks.splice(i, 1);
        } else if (status === 'remove') {
            fireworks.splice(i, 1);
        } else {
            firework.draw();
        }
    }

    // 폭죽 파티클 업데이트 및 그리기
    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        const particle = fireworkParticles[i];
        const shouldRemove = particle.update();

        if (shouldRemove) {
            fireworkParticles.splice(i, 1);
        } else {
            particle.draw();
        }
    }

    requestAnimationFrame(animate);
}

// 애니메이션 시작
animate();

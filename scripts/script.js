const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let starSpeed = 0.5;  // Default speed
let starVisibility = true;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

function createStars(count) {
    stars = [];  // Clear existing stars
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            speed: Math.random() * starSpeed + 0.2,
            color: getRandomColor(),
        });
    }
}

function drawStars() {
    if (!starVisibility) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
    }
}

function animateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
            star.color = getRandomColor();
        }
    }
}

function update() {
    drawStars();
    animateStars();
    requestAnimationFrame(update);
}

resizeCanvas();
createStars(150);  // Default 150 stars
update();
window.addEventListener("resize", resizeCanvas);

// Listen for changes from the secret page
document.addEventListener('updateStarSettings', (e) => {
    const { starCount, starSpeed: newSpeed, starVisibility: visibility } = e.detail;
    starSpeed = newSpeed;
    starVisibility = visibility;
    createStars(starCount);
});

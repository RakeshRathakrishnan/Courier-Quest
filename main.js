// Courier Quest – Endless Levels + Scaling Difficulty + Highscore
// - Level starts at 1 on Street
// - First switch: at 20 delivered packages → switches to Subway (level 2)
// - After that: switches area on EVERY delivery, level increases each time
// - 60s timer per run (resets on level up/area change)
// - Hazards get faster with timer + level
// - Continuous pickups in both arenas
// - Highscore tracking + overlay + HUD flash

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ui = {
  level: document.getElementById('ui-level'),
  lives: document.getElementById('ui-lives'),
  time:  document.getElementById('ui-time'),
  pkgs:  document.getElementById('ui-pkgs'),
  carry: document.getElementById('ui-carry'),
  score: document.getElementById('ui-score'),
};
const overlay = document.getElementById('overlay');

// ----- Constants -----
const STATE = { PLAY:1, PAUSE:2, GAME_OVER:3 };
const START_TIME = 60;          // seconds
const MAX_ACTIVE_PICKUPS = 4;
const POINTS_PER_LEVEL = 10;    // every 10 score = +1 level

// ----- Game state -----
let state = STATE.PLAY;
let area  = 1;          // 1 = Street, 2 = Subway
let level = 1;
let lives = 3;
let timeLeft = START_TIME;
let delivered = 0;      // total packages delivered
let score = 0;

// Highscore tracking
let highScore = 0;
let highScoreFlashTimer = 0;   // seconds to show "(NEW HIGHSCORE!)"

// Player
const player = {
  x: 64,
  y: 64,
  w: 24,
  h: 24,
  speed: 160,
  inv: 0,
  carry: 0,
};

// World objects
let pickups  = [];  // {x,y,w,h,active}
let dropoffs = [];  // {x,y,w,h}
let hazards  = [];  // {x,y,w,h,speed,dx,dy}
let walls    = [];  // {x,y,w,h}

// Input
const keys = new Set();
addEventListener('keydown', (e)=>{
  const k = e.key.toLowerCase();
  if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','p','r'].includes(k)) {
    e.preventDefault();
  }
  keys.add(k);

  if (k === 'p' && state !== STATE.GAME_OVER) {
    state = (state === STATE.PLAY ? STATE.PAUSE : STATE.PLAY);
  }
  if (k === 'r') restart();
});
addEventListener('keyup', (e)=> keys.delete(e.key.toLowerCase()));

document.getElementById('btn-restart').addEventListener('click', restart);

// Demo video controls
document.getElementById('btn-demo').addEventListener('click', ()=> {
  const videoModal = document.getElementById('video-modal');
  const video = document.getElementById('demo-video');
  
  videoModal.classList.add('show');
  video.currentTime = 0;
  video.play();
});

document.getElementById('close-video').addEventListener('click', ()=> {
  const videoModal = document.getElementById('video-modal');
  const video = document.getElementById('demo-video');
  
  video.pause();
  videoModal.classList.remove('show');
});

// Close video modal when clicking outside the video
document.getElementById('video-modal').addEventListener('click', (e)=> {
  if (e.target.id === 'video-modal') {
    const videoModal = document.getElementById('video-modal');
    const video = document.getElementById('demo-video');
    
    video.pause();
    videoModal.classList.remove('show');
  }
});

// ----- Init Areas -----
function initArea(n){
  area    = n;
  hazards = [];
  walls   = [];
  pickups = [];
  dropoffs = [];
  player.carry = 0;

  if (area === 1) {
    // STREET: cars move horizontally
    for (let i = 0; i < 3; i++) {
      hazards.push(makeHazard(
        -50,
        120 + i * 120,
        90 + i * 20, // base speed
        1, 0,
        36, 18
      ));
    }

    // Dummy wall off-screen (keeps wall collision logic but nothing visible)
    walls.push({
      x: canvas.width + 100,
      y: 0,
      w: 20,
      h: canvas.height
    });

    // Starting pickups
    pickups.push(makePickup(880, 40));
    pickups.push(makePickup(80, 260));
    pickups.push(makePickup(860, 480));

    // One drop-off
    dropoffs.push({ x: 40, y: 40, w: 18, h: 18 });

  } else {
    // SUBWAY: bots move vertically
    for (let i = 0; i < 3; i++) {
      hazards.push(makeHazard(
        200 + i * 180,
        -40,
        80 + i * 20,
        0, 1,
        18, 28
      ));
    }

    // Also use dummy wall off-screen (no middle divider now)
    walls.push({
      x: canvas.width + 100,
      y: 0,
      w: 20,
      h: canvas.height
    });

    // Starting pickups in subway
    pickups.push(makePickup(60, 80));
    pickups.push(makePickup(840, 420));
    pickups.push(makePickup(480, 60));

    // Subway drop-off
    dropoffs.push({ x: 900, y: 40, w: 18, h: 18 });
  }

  ui.level.textContent = 'Level ' + level + ' – ' + (area === 1 ? 'Street' : 'Subway');
  updateHUD();
}

function makeHazard(x, y, speed, dx, dy, w, h){
  return { x, y, w, h, speed, dx, dy };
}

function makePickup(x, y){
  return { x, y, w:16, h:16, active:true };
}

function spawnRandomPickup(){
  const margin = 40;
  const px = margin + Math.random() * (canvas.width  - margin * 2);
  const py = margin + Math.random() * (canvas.height - margin * 2);
  pickups.push(makePickup(px, py));
}

function restart(){
  state = STATE.PLAY;
  level = 1;
  area  = 1;
  lives = 3;
  timeLeft = START_TIME;
  delivered = 0;
  score = 0;
  highScoreFlashTimer = 0; // keep highScore, just clear the flash

  overlay.classList.remove('show');
  overlay.textContent = 'Game Over – Press R to Restart';

  player.x = 64;
  player.y = 64;
  player.inv = 0;
  player.carry = 0;

  initArea(area);
}

// ----- Main Loop -----
let last = 0;
function loop(ts){
  const dt = Math.min(0.033, (ts - last) / 1000 || 0);
  last = ts;

  if (state === STATE.PLAY) {
    update(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

function update(dt){
  // Timer
  timeLeft = Math.max(0, timeLeft - dt);
  if (timeLeft <= 0 && state !== STATE.GAME_OVER) {
    state = STATE.GAME_OVER;
    overlay.textContent = `Time's Up – Final Score: ${score} – Press R to Restart`;
    overlay.classList.add('show');
  }

  // Highscore flash timer
  if (highScoreFlashTimer > 0) {
    highScoreFlashTimer -= dt;
  }

  if (player.inv > 0) player.inv -= dt;

  // Movement
  const mx = (keys.has('arrowright') || keys.has('d') ? 1 : 0) -
             (keys.has('arrowleft')  || keys.has('a') ? 1 : 0);
  const my = (keys.has('arrowdown')  || keys.has('s') ? 1 : 0) -
             (keys.has('arrowup')    || keys.has('w') ? 1 : 0);
  const len = Math.hypot(mx, my) || 1;
  player.x += (mx / len) * player.speed * dt;
  player.y += (my / len) * player.speed * dt;

  // Clamp to screen
  player.x = Math.max(0, Math.min(player.x, canvas.width  - player.w));
  player.y = Math.max(0, Math.min(player.y, canvas.height - player.h));

  // Walls (dummy, so basically no blocking)
  for (const w of walls) {
    if (hit(player, w)) {
      const dx = (player.x + player.w / 2) - (w.x + w.w / 2);
      const dy = (player.y + player.h / 2) - (w.y + w.h / 2);
      const px = (w.w / 2 + player.w / 2) - Math.abs(dx);
      const py = (w.h / 2 + player.h / 2) - Math.abs(dy);
      if (px < py) {
        player.x += (dx > 0 ? px : -px);
      } else {
        player.y += (dy > 0 ? py : -py);
      }
    }
  }

  // Hazards move with scaling based on timer + level
  for (const h of hazards) {
    // 0 -> 1 over the course of the timer
    const timeProgress = Math.min(1, Math.max(0, (START_TIME - timeLeft) / START_TIME));
    const timerMul = 1 + timeProgress * 2;            // 1x -> 3x as timer goes down
    const levelMul = 1 + (level - 1) * 0.25;          // each level adds +25% speed
    const mul = timerMul * levelMul;

    h.x += h.dx * h.speed * mul * dt;
    h.y += h.dy * h.speed * mul * dt;

    if (h.dx !== 0) {
      if (h.x > canvas.width)  h.x = -h.w;
      if (h.x < -h.w)          h.x = canvas.width;
    }
    if (h.dy !== 0) {
      if (h.y > canvas.height) h.y = -h.h;
      if (h.y < -h.h)          h.y = canvas.height;
    }
  }

  // Hazard collisions → lose life + invulnerability
  if (state === STATE.PLAY && player.inv <= 0) {
    for (const h of hazards) {
      if (hit(player, h)) {
        lives--;
        player.inv = 1.0;

        const dirx = Math.sign((player.x + player.w / 2) - (h.x + h.w / 2)) || 1;
        const diry = Math.sign((player.y + player.h / 2) - (h.y + h.h / 2)) || 0;
        player.x += dirx * 12;
        player.y += diry * 12;

        player.x = Math.max(0, Math.min(player.x, canvas.width  - player.w));
        player.y = Math.max(0, Math.min(player.y, canvas.height - player.h));
        break;
      }
    }
  }

  // Out of lives → game over + score / highscore message
  if (lives <= 0 && state !== STATE.GAME_OVER) {
    state = STATE.GAME_OVER;

    let wasHighscore = false;
    if (score > highScore) {
      highScore = score;
      wasHighscore = true;
    }

    if (wasHighscore) {
      overlay.textContent = `NEW HIGHSCORE! Final Score: ${score} – Press R to Restart`;
    } else {
      overlay.textContent = `Out of Lives – Final Score: ${score} – Press R to Restart`;
    }

    overlay.classList.add('show');
  }

  // Pickups: collect
  for (const p of pickups) {
    if (p.active && hit(player, p)) {
      p.active = false;
      player.carry += 1;
    }
  }

  // Continuous spawning in both arenas up to MAX_ACTIVE_PICKUPS
  if (state === STATE.PLAY && timeLeft > 0) {
    let activeCount = pickups.filter(p => p.active).length;
    while (activeCount < MAX_ACTIVE_PICKUPS) {
      spawnRandomPickup();
      activeCount++;
    }
  }

  // Deliver at drop-off
  if (player.carry > 0) {
    for (const d of dropoffs) {
      if (hit(player, d)) {
        const prevHigh = highScore;

        score     += player.carry;
        delivered += player.carry;
        player.carry = 0;

        // Highscore check
        if (score > highScore) {
          highScore = score;
          if (score > prevHigh) {
            highScoreFlashTimer = 2.0; // show "(NEW HIGHSCORE!)" for 2 seconds
          }
        }

        // NEW LOGIC: 
        // First switch at 20 delivered, then switch every delivery
        let shouldSwitch = false;
        
        if (delivered >= 20 && level === 1) {
          // First time reaching 20 - switch to subway
          shouldSwitch = true;
          level = 2;
        } else if (level > 1) {
          // After the first switch, switch every delivery
          shouldSwitch = true;
          level++;
        }

        if (shouldSwitch) {
          timeLeft = START_TIME; // reset timer on level change
          
          // Toggle between Street (1) and Subway (2)
          area = (area === 1) ? 2 : 1;
          initArea(area);
        }

        break;
      }
    }
  }

  updateHUD();
}

function draw(){
  // Background
  if (area === 1) {
    // Street
    fillRect(0, 0, canvas.width, canvas.height, '#15202b');
    ctx.globalAlpha = 0.18;
    for (let y = 100; y < canvas.height; y += 120) {
      for (let x = 0; x < canvas.width; x += 60) {
        fillRect(x, y, 36, 6, '#c6d3de');
      }
    }
    ctx.globalAlpha = 1;
  } else {
    // Subway
    fillRect(0, 0, canvas.width, canvas.height, '#0f1018');
    ctx.globalAlpha = 0.18;
    for (let x = 40; x < canvas.width; x += 120) {
      fillRect(x, 70, 8, 8, '#e3e3e3');
    }
    ctx.globalAlpha = 1;
  }

  // Drop-offs
  for (const d of dropoffs) {
    fillRect(d.x, d.y, d.w, d.h, '#ffd166');
  }

  // Active pickups
  for (const p of pickups) {
    if (p.active) fillRect(p.x, p.y, p.w, p.h, '#4fd1c5');
  }

  // Walls (off-screen only)
  for (const w of walls) {
    fillRect(w.x, w.y, w.w, w.h, '#242e3a');
  }

  // Hazards
  const hzColor = (area === 1 ? '#e63946' : '#f4a261');
  for (const h of hazards) {
    fillRect(h.x, h.y, h.w, h.h, hzColor);
  }

  // Player (flash when invulnerable)
  const flash = player.inv > 0 ? (Math.floor(performance.now() / 100) % 2 === 0) : false;
  fillRect(player.x, player.y, player.w, player.h, flash ? '#c2fbd7' : '#8ee3b9');
}

// Helpers
function fillRect(x, y, w, h, color){
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function hit(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function updateHUD(){
  ui.lives.textContent = 'Lives: ' + lives;
  ui.time.textContent  = 'Time: ' + Math.ceil(timeLeft);
  ui.pkgs.textContent  = 'Delivered: ' + delivered;
  ui.carry.textContent = 'Carrying: ' + player.carry;

  let scoreText = 'Score: ' + score;
  if (highScoreFlashTimer > 0) {
    scoreText += ' (NEW HIGHSCORE!)';
  }
  ui.score.textContent = scoreText;
}

// Boot
restart();
requestAnimationFrame(loop);

'use strict';

// ============================================================================
// ANTI-BULLYING RUNNER v2.0 ULTRA — game.js
// Sistema completo do jogo com todas as mecânicas, UI e persistência
// ============================================================================

// Global state
let gameInitialized = false;
let gameRunning = false;
let gameStarted = false;
let runState = null;

// ============================================================================
// AUDIO CONTEXT & SFX
// ============================================================================

let audioCtx = null;
let sfxGainNode = null;
let musicGainNode = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGainNode = audioCtx.createGain();
    sfxGainNode.connect(audioCtx.destination);
    sfxGainNode.gain.value = 0.5;
    
    musicGainNode = audioCtx.createGain();
    musicGainNode.connect(audioCtx.destination);
    musicGainNode.gain.value = 0.3;
  } catch (e) {
    console.warn('Audio context init failed:', e);
  }
}

function ensureAudio() {
  if (!audioCtx) initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(err => console.warn('Audio resume failed:', err));
  }
}

function playTone(freq, type, duration, gainNode, delay, fadeTime) {
  if (!audioCtx || !gainNode) return;
  ensureAudio();
  try {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(gainNode);
    env.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
    env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + fadeTime);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + fadeTime);
  } catch (e) { 
    console.warn('playTone error:', e); 
  }
}

function playSweep(f1, f2, type, duration, gainNode, fadeTime) {
  if (!audioCtx || !gainNode) return;
  ensureAudio();
  try {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, audioCtx.currentTime + duration);
    osc.connect(env);
    env.connect(gainNode);
    env.gain.setValueAtTime(0.3, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + fadeTime);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + fadeTime);
  } catch (e) { 
    console.warn('playSweep error:', e); 
  }
}

function playNoise(duration, gainNode, level) {
  if (!audioCtx || !gainNode) return;
  ensureAudio();
  try {
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) data[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    const env = audioCtx.createGain();
    src.buffer = buf;
    src.connect(env);
    env.connect(gainNode);
    env.gain.setValueAtTime(level, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    src.start(audioCtx.currentTime);
  } catch (e) { 
    console.warn('playNoise error:', e); 
  }
}

// SFX functions
function sfxJump() { ensureAudio(); if (sfxGainNode) playSweep(280, 620, 'square', 0.18, sfxGainNode, 0.22); }
function sfxCollect() { ensureAudio(); if (sfxGainNode) playTone(880, 'sine', 0.12, sfxGainNode, 0, 0.25); }
function sfxGem() { ensureAudio(); if (sfxGainNode) { playTone(1046, 'sine', 0.1, sfxGainNode, 0, 0.22); playTone(1318, 'sine', 0.14, sfxGainNode, 0.06, 0.2); } }
function sfxCorrect() { ensureAudio(); if (sfxGainNode) { playTone(523, 'triangle', 0.12, sfxGainNode, 0, 0.25); playTone(659, 'triangle', 0.12, sfxGainNode, 0.1, 0.25); playTone(880, 'triangle', 0.12, sfxGainNode, 0.2, 0.25); } }
function sfxWrong() { ensureAudio(); if (sfxGainNode) playSweep(300, 90, 'sawtooth', 0.35, sfxGainNode, 0.22); }
function sfxCollision() { ensureAudio(); if (sfxGainNode) { playNoise(0.22, sfxGainNode, 0.35); playTone(80, 'square', 0.18, sfxGainNode, 0, 0.3); } }
function sfxPowerup() { ensureAudio(); if (sfxGainNode) playSweep(220, 900, 'square', 0.3, sfxGainNode, 0.2); }
function sfxClick() { ensureAudio(); if (sfxGainNode) playTone(700, 'square', 0.05, sfxGainNode, 0, 0.12); }
function sfxLevelUp() { ensureAudio(); if (sfxGainNode) { [523, 659, 784, 1046].forEach(function (f, i) { playTone(f, 'triangle', 0.18, sfxGainNode, i * 0.09, 0.25); }); } }
function sfxShieldBreak() { ensureAudio(); if (sfxGainNode) { playNoise(0.18, sfxGainNode, 0.25); playTone(1200, 'sine', 0.1, sfxGainNode, 0, 0.2); } }

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function randRange(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(randRange(a, b + 1)); }
function $(id) { return document.getElementById(id); }

// ============================================================================
// DILEMMA SYSTEM (ANTI-BULLYING EDUCATIONAL CONTENT)
// ============================================================================

const DILEMMAS = [
  {
    question: 'Você viu um colega sendo excluído do grupo.',
    choices: ['Incluir na conversa', 'Ignorar e passar'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Um grupo começou a fazer apelidos ofensivos.',
    choices: ['Pedir para parar', 'Rir junto e participar'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Alguém compartilhou uma foto sua sem permissão online.',
    choices: ['Conversar com a pessoa', 'Responder agressivamente'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Uma colega ficou triste após brincadeiras do grupo.',
    choices: ['Conversar e apoiar', 'Continuar como se nada fosse'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Você viu alguém sendo provocado por um colega.',
    choices: ['Defender e apoiar', 'Fingir que não viu'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Alguém está sendo isolado nos trabalhos em grupo.',
    choices: ['Escolher para seu grupo', 'Deixar para o final'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  },
  {
    question: 'Houve zombaria online sobre a aparência de alguém.',
    choices: ['Denunciar e não participar', 'Curtir os comentários'],
    correct: 0,
    reward: { xp: 50, coins: 20 }
  }
];

let currentDilemma = null;
let dilemmaActive = false;

function selectRandomDilemma() {
  return DILEMMAS[Math.floor(Math.random() * DILEMMAS.length)];
}

function showDilemma() {
  if (dilemmaActive || !runState || !gameRunning) return;
  
  dilemmaActive = true;
  currentDilemma = selectRandomDilemma();
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'dilemma-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2>💬 Dilema</h2>
      <p style="font-size: 1rem; margin-bottom: 20px; line-height: 1.5; color: var(--text-primary);">${currentDilemma.question}</p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${currentDilemma.choices.map((choice, idx) => `
          <button class="dilemma-choice" data-choice="${idx}">${choice}</button>
        `).join('')}
      </div>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    .dilemma-choice {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      background: var(--surface);
      border: 2px solid var(--text-secondary);
      color: var(--text-primary);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .dilemma-choice:hover {
      background: var(--surface-strong);
      border-color: var(--accent-primary);
    }
    .dilemma-choice:active {
      transform: scale(0.95);
    }
  `;
  
  if (style.parentNode !== document.head) {
    document.head.appendChild(style);
  }
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.dilemma-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const choice = parseInt(e.target.dataset.choice);
      handleDilemmaChoice(choice);
      modal.remove();
    });
  });
}

function handleDilemmaChoice(choiceIdx) {
  if (!currentDilemma) return;
  
  const isCorrect = choiceIdx === currentDilemma.correct;
  
  if (isCorrect) {
    sfxCorrect();
    if (runState) {
      runState.score += currentDilemma.reward.coins;
      Progress.coins += currentDilemma.reward.coins;
    }
    addXP(currentDilemma.reward.xp);
    spawnFloatingText(`+${currentDilemma.reward.xp}XP`, window.innerWidth / 2, 100, 'is-gem');
  } else {
    sfxWrong();
  }
  
  dilemmaActive = false;
  currentDilemma = null;
  saveProgress();
}

// ============================================================================
// PROGRESS & STORAGE
// ============================================================================

const Progress = {
  playerName: 'Runner',
  score: 0,
  coins: 0,
  gems: 0,
  xp: 0,
  level: 1,
  theme: 'arcade',
  language: 'pt',
  skins: {},
  themes: {},
  powers: {},
  topRuns: [],
  
  save() {
    try {
      localStorage.setItem('abr-progress', JSON.stringify(this));
    } catch (e) { 
      console.warn('Save error:', e); 
    }
  },
  
  load() {
    try {
      const saved = localStorage.getItem('abr-progress');
      if (saved) Object.assign(this, JSON.parse(saved));
    } catch (e) { 
      console.warn('Load error:', e); 
    }
  }
};

function addXP(amount) {
  Progress.xp += amount;
  const xpPerLevel = 500;
  const newLevel = Math.floor(Progress.xp / xpPerLevel) + 1;
  if (newLevel > Progress.level) {
    Progress.level = newLevel;
    sfxLevelUp();
    spawnFloatingText(`⭐ LEVEL UP! ${newLevel}`, window.innerWidth / 2, 150, 'is-gem');
  }
}

function saveProgress() {
  Progress.save();
}

// ============================================================================
// CANVAS & RENDERING
// ============================================================================

let canvas = null;
let ctx = null;

function getOrCreateCanvas() {
  if (!canvas) {
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'game-canvas';
      const app = document.getElementById('app');
      if (app) app.appendChild(canvas);
      else document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
  }
  return canvas;
}

function resizeCanvas() {
  if (!canvas) getOrCreateCanvas();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ============================================================================
// TRACK GEOMETRY
// ============================================================================

const trackGeo = {
  vanishX: 0.5,
  vanishY: 0.15,
  groundY: 0.85,
  roadHalfTop: 0.08,
  roadHalfBottom: 0.3,
  
  computeCoords() {
    this.vanishX = canvas.width / 2;
    this.vanishY = canvas.height * 0.15;
    this.groundY = canvas.height * 0.85;
    this.roadHalfTop = canvas.width * 0.08;
    this.roadHalfBottom = canvas.width * 0.3;
  }
};

function depthT(p) { return clamp(p, 0, 1); }
function roadHalfWidthAt(p) { return lerp(trackGeo.roadHalfTop, trackGeo.roadHalfBottom, depthT(p)); }
function screenYAt(p) { return lerp(trackGeo.vanishY, trackGeo.groundY, depthT(p)); }
function screenXAt(p, lane) { return trackGeo.vanishX + (lane - 1) * roadHalfWidthAt(p); }
function scaleAt(p) { return lerp(0.32, 1, depthT(p)); }

// ============================================================================
// RUN STATE
// ============================================================================

function createRunState() {
  return {
    running: true,
    gameTime: 0,
    score: 0,
    lane: 1,
    nextObstacleTime: 3,
    nextDilemmaTime: 15,
    difficulty: 1,
    obstacles: [],
    coins: [],
    gems: [],
    powerups: [],
    floatingTexts: [],
    player: {
      lane: 1,
      falling: false,
      fallingVel: 0,
      sliding: false,
      shieldActive: false,
      shieldHits: 0
    },
    activePowers: []
  };
}

// ============================================================================
// PLAYER & CONTROLS
// ============================================================================

const keys = {};
let touchStartX = 0;
let touchStartY = 0;

function setupControls() {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleKeyDown(e) {
  keys[e.key.toLowerCase()] = true;
  if (['a', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
}

function handleKeyUp(e) {
  keys[e.key.toLowerCase()] = false;
}

function handleTouchStart(e) {
  if (!runState || !runState.running) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  if (!runState || !runState.running) return;
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (!runState || !runState.running) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 30) return;
  
  const angle = Math.atan2(dy, dx);
  if (Math.abs(angle) < Math.PI / 4) {
    if (dx > 0) movePlayer(2);
    else movePlayer(0);
  } else if (angle > 0) {
    slidePlayer();
  } else {
    jumpPlayer();
  }
}

function movePlayer(direction) {
  if (!runState || !runState.running) return;
  if (direction === 0) runState.player.lane = Math.max(0, runState.player.lane - 1);
  else if (direction === 2) runState.player.lane = Math.min(2, runState.player.lane + 1);
  runState.lane = runState.player.lane;
}

function jumpPlayer() {
  if (!runState || !runState.running || runState.player.falling) return;
  sfxJump();
  runState.player.falling = true;
  runState.player.fallingVel = -0.4;
}

function slidePlayer() {
  if (!runState || !runState.running || runState.player.sliding) return;
  runState.player.sliding = true;
  setTimeout(() => { if (runState) runState.player.sliding = false; }, 400);
}

// ============================================================================
// SPAWNING
// ============================================================================

function spawnObstacle() {
  if (!runState) return;
  runState.obstacles.push({
    type: 'box',
    lane: randInt(0, 2),
    depth: 0,
    width: 0.08,
    height: 0.12
  });
}

function spawnCoin() {
  if (!runState) return;
  runState.coins.push({
    lane: randInt(0, 2),
    depth: 0,
    collected: false
  });
}

function spawnGem() {
  if (!runState) return;
  runState.gems.push({
    lane: 1,
    depth: 0,
    collected: false
  });
}

function spawnPowerup() {
  if (!runState) return;
  const types = ['shield', 'speed', 'magnet', 'slow', 'jetpack'];
  runState.powerups.push({
    type: types[Math.floor(Math.random() * types.length)],
    lane: randInt(0, 2),
    depth: 0,
    collected: false
  });
}

function spawnFloatingText(text, x, y, cls) {
  if (!runState) return;
  runState.floatingTexts.push({
    text,
    x,
    y,
    life: 1,
    cls
  });
}

function activatePower(type) {
  if (!runState || !runState.player) return;
  
  switch (type) {
    case 'shield':
      if (runState.player.shieldActive) runState.player.shieldHits++;
      else { runState.player.shieldActive = true; runState.player.shieldHits = 1; }
      sfxPowerup();
      spawnFloatingText('🛡️ Escudo!', window.innerWidth / 2, 100, 'is-shield');
      break;
    case 'speed':
      runState.activePowers = runState.activePowers.filter(p => p.type !== 'speed');
      runState.activePowers.push({ type: 'speed', time: 12 });
      sfxPowerup();
      spawnFloatingText('⚡ Velocidade!', window.innerWidth / 2, 100, 'is-gem');
      break;
    case 'magnet':
      runState.activePowers = runState.activePowers.filter(p => p.type !== 'magnet');
      runState.activePowers.push({ type: 'magnet', time: 10 });
      sfxPowerup();
      spawnFloatingText('🧲 Ímã!', window.innerWidth / 2, 100, 'is-coin');
      break;
    case 'slow':
      runState.activePowers = runState.activePowers.filter(p => p.type !== 'slow');
      runState.activePowers.push({ type: 'slow', time: 8 });
      sfxPowerup();
      spawnFloatingText('🌀 Lentidão!', window.innerWidth / 2, 100, 'is-gem');
      break;
    case 'jetpack':
      runState.player.falling = true;
      runState.player.fallingVel = -0.6;
      runState.activePowers = runState.activePowers.filter(p => p.type !== 'jetpack');
      runState.activePowers.push({ type: 'jetpack', time: 5 });
      sfxPowerup();
      spawnFloatingText('🚀 Jetpack!', window.innerWidth / 2, 100, 'is-gem');
      break;
  }
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

function checkCollision(playerDepth, playerLane, playerHeight) {
  if (!runState) return false;
  
  for (let obs of runState.obstacles) {
    if (Math.abs(obs.depth - playerDepth) < 0.15 && obs.lane === playerLane) {
      const playerSliding = runState.player.sliding;
      const playerAirborne = runState.player.falling;
      
      if (playerSliding || playerAirborne) continue;
      
      return true;
    }
  }
  return false;
}

function handleCollision(rs) {
  if (!rs || !rs.player) return;
  const player = rs.player;
  
  if (player.shieldActive && (player.shieldHits || 0) > 0) {
    player.shieldHits = Math.max(0, (player.shieldHits || 1) - 1);
    player.shieldActive = false;
    sfxShieldBreak();
    spawnFloatingText('+Escudo protegido!', window.innerWidth / 2, window.innerHeight * 0.35, 'is-shield-break');
    return;
  }
  
  rs.running = false;
  sfxCollision();
}

// ============================================================================
// UPDATE LOOP
// ============================================================================

function updateRun(dt) {
  if (!runState || !runState.running) return;
  
  runState.gameTime += dt;
  
  // Update difficulty
  runState.difficulty = 1 + runState.gameTime * 0.15;
  
  // Player movement
  if (keys['a'] || keys['arrowleft']) movePlayer(0);
  if (keys['d'] || keys['arrowright']) movePlayer(2);
  if (keys[' '] || keys['arrowup']) jumpPlayer();
  if (keys['arrowdown']) slidePlayer();
  
  // Player physics
  const playerDepth = 0.85;
  if (runState.player.falling) {
    runState.player.fallingVel += 0.01;
    if (runState.player.fallingVel > 0.4) {
      runState.player.falling = false;
      runState.player.fallingVel = 0;
    }
  }
  
  // Collision check
  if (checkCollision(playerDepth, runState.player.lane, 0.1)) {
    handleCollision(runState);
  }
  
  // Coin collection
  runState.coins = runState.coins.filter(coin => {
    coin.depth += 0.015 * runState.difficulty;
    if (!coin.collected && Math.abs(coin.depth - playerDepth) < 0.08 && coin.lane === runState.player.lane) {
      coin.collected = true;
      sfxCollect();
      runState.score += 10;
      Progress.coins += 10;
      spawnFloatingText('+10🪙', screenXAt(coin.depth, coin.lane), screenYAt(coin.depth), 'is-coin');
      return true;
    }
    return coin.depth < 1.5;
  });
  
  // Gem collection
  runState.gems = runState.gems.filter(gem => {
    gem.depth += 0.015 * runState.difficulty;
    if (!gem.collected && Math.abs(gem.depth - playerDepth) < 0.08 && gem.lane === runState.player.lane) {
      gem.collected = true;
      sfxGem();
      runState.score += 50;
      Progress.gems += 1;
      addXP(50);
      spawnFloatingText('+1💎', screenXAt(gem.depth, gem.lane), screenYAt(gem.depth), 'is-gem');
      return true;
    }
    return gem.depth < 1.5;
  });
  
  // Powerup collection
  runState.powerups = runState.powerups.filter(pu => {
    pu.depth += 0.015 * runState.difficulty;
    if (!pu.collected && Math.abs(pu.depth - playerDepth) < 0.08 && pu.lane === runState.player.lane) {
      pu.collected = true;
      activatePower(pu.type);
      return true;
    }
    return pu.depth < 1.5;
  });
  
  // Obstacle spawning
  runState.nextObstacleTime -= dt;
  if (runState.nextObstacleTime <= 0) {
    spawnObstacle();
    runState.nextObstacleTime = Math.max(1, 3 - runState.gameTime * 0.05);
  }
  
  // Coin spawning
  if (Math.random() < 0.02) spawnCoin();
  if (Math.random() < 0.005) spawnGem();
  if (Math.random() < 0.008) spawnPowerup();
  
  // Dilemma spawning
  runState.nextDilemmaTime -= dt;
  if (runState.nextDilemmaTime <= 0 && runState.gameTime > 10) {
    showDilemma();
    runState.nextDilemmaTime = 20 + Math.random() * 15;
  }
  
  // Update obstacles
  runState.obstacles = runState.obstacles.filter(obs => {
    obs.depth += 0.015 * runState.difficulty;
    return obs.depth < 1.5;
  });
  
  // Update floating texts
  runState.floatingTexts = runState.floatingTexts.filter(ft => {
    ft.life -= dt / 0.8;
    return ft.life > 0;
  });
  
  // Update active powers
  runState.activePowers = runState.activePowers.map(p => ({ ...p, time: p.time - dt })).filter(p => p.time > 0);
  
  // Add XP per second
  addXP(Math.floor(dt * 10 * runState.difficulty));
  
  saveProgress();
}

// ============================================================================
// RENDERING
// ============================================================================

function renderRun() {
  if (!canvas || !ctx) return;
  
  ctx.fillStyle = '#0d0221';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (!runState) return;
  
  // Draw track
  ctx.strokeStyle = '#ff2e9a';
  ctx.lineWidth = 2;
  
  for (let lane = 0; lane <= 2; lane++) {
    const x1 = screenXAt(0, lane);
    const y1 = screenYAt(0);
    const x2 = screenXAt(0.8, lane);
    const y2 = screenYAt(0.8);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  // Draw obstacles
  ctx.fillStyle = '#ff4d6d';
  for (let obs of runState.obstacles) {
    const x = screenXAt(obs.depth, obs.lane);
    const y = screenYAt(obs.depth);
    const scale = scaleAt(obs.depth);
    const w = canvas.width * obs.width * scale;
    const h = canvas.height * obs.height * scale;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  }
  
  // Draw coins
  ctx.fillStyle = '#ffd24c';
  for (let coin of runState.coins) {
    if (coin.collected) continue;
    const x = screenXAt(coin.depth, coin.lane);
    const y = screenYAt(coin.depth);
    const scale = scaleAt(coin.depth);
    const r = canvas.width * 0.02 * scale;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw gems
  ctx.fillStyle = '#7ad7ff';
  for (let gem of runState.gems) {
    if (gem.collected) continue;
    const x = screenXAt(gem.depth, gem.lane);
    const y = screenYAt(gem.depth);
    const scale = scaleAt(gem.depth);
    const r = canvas.width * 0.025 * scale;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw player
  ctx.fillStyle = '#00e5ff';
  const playerX = screenXAt(0.85, runState.player.lane);
  const playerY = screenYAt(0.85) - (runState.player.fallingVel * canvas.height * 0.3);
  const playerW = canvas.width * 0.05;
  const playerH = canvas.height * 0.1;
  ctx.fillRect(playerX - playerW / 2, playerY - playerH / 2, playerW, playerH);
  
  // Draw shield if active
  if (runState.player.shieldActive) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerW * 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw floating texts
  for (let ft of runState.floatingTexts) {
    ctx.fillStyle = `rgba(255, 255, 255, ${ft.life})`;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y - (1 - ft.life) * 40);
  }
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastTime = 0;
let animFrameId = null;

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.016);
  lastTime = now;
  
  if (canvas) {
    trackGeo.computeCoords();
    updateRun(dt);
    renderRun();
  }
  
  animFrameId = requestAnimationFrame(gameLoop);
}

// ============================================================================
// START & END
// ============================================================================

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  gameRunning = true;
  dilemmaActive = false;
  currentDilemma = null;
  
  getOrCreateCanvas();
  runState = createRunState();
  resizeCanvas();
  lastTime = performance.now();
  
  if (!animFrameId) {
    animFrameId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameRunning = false;
  if (!runState) return;
  
  const finalScore = runState.score;
  Progress.topRuns = (Progress.topRuns || []).concat(finalScore).sort((a, b) => b - a).slice(0, 10);
  saveProgress();
  
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  
  runState = null;
  gameStarted = false;
}

function resetGame() {
  gameStarted = false;
  gameRunning = false;
  dilemmaActive = false;
  currentDilemma = null;
  runState = null;
  
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  
  const modal = document.getElementById('dilemma-modal');
  if (modal) modal.remove();
}

// ============================================================================
// UI INTEGRATION
// ============================================================================

window.addEventListener('resize', resizeCanvas);

// Listen for game start/end signals
document.addEventListener('gameStart', startGame);
document.addEventListener('gameEnd', endGame);
document.addEventListener('gameReset', resetGame);

// Expose functions to global scope
window.startGame = startGame;
window.endGame = endGame;
window.resetGame = resetGame;
window.runState = runState;
window.Progress = Progress;
window.spawnFloatingText = spawnFloatingText;
window.sfxPowerup = sfxPowerup;
window.sfxShieldBreak = sfxShieldBreak;
window.sfxCorrect = sfxCorrect;
window.sfxWrong = sfxWrong;
window.activatePower = activatePower;
window.handleCollision = handleCollision;
window.showDilemma = showDilemma;
window.addXP = addXP;
window.setupControls = setupControls;

// Initialize on load
window.addEventListener('load', () => {
  Progress.load();
  setupControls();
  getOrCreateCanvas();
  resizeCanvas();
  gameInitialized = true;
  
  // Dispatch custom event to notify any external UI
  document.dispatchEvent(new CustomEvent('gameReady'));
  
  // Auto-start game (opcional - remova se quiser um menu)
  startGame();
});

// Handle visibility change to pause/resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameRunning) {
    gameRunning = false;
  }
});

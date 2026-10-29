/* ==========================================================================
   MAYANK SAINI — GOD-TIER 3D WEBGL, ALGO SANDBOX & RETRO ARCADE SCRIPTS
   Three.js 3D Engine, Pitch-Mapped Audio, Live Sorters, Playable Game & CLI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. WEB AUDIO SYNTHESIZER ====================
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('mayank-audio') !== 'false';
      this.updateUI();
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.05, gain = 0.04) {
      if (!this.enabled) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        g.gain.setValueAtTime(gain, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    laser() {
      if (!this.enabled) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.06, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    warp() {
      if (!this.enabled) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.5);
        g.gain.setValueAtTime(0.08, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
      } catch (e) {}
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('mayank-audio', this.enabled);
      if (this.enabled) {
        this.init();
        this.playTone(880, 'sine', 0.1, 0.05);
      }
      this.updateUI();
    }

    updateUI() {
      const sfxIcon = document.getElementById('sfxIcon');
      const hudText = document.querySelector('#sfxToggle .hud-text');
      if (sfxIcon) {
        sfxIcon.className = this.enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      }
      if (hudText) {
        hudText.textContent = this.enabled ? 'SFX: ON' : 'SFX: MUTED';
      }
    }
  }

  const sfx = new CyberAudio();
  document.getElementById('sfxToggle')?.addEventListener('click', () => sfx.toggle());

  // ==================== 2. THREE.JS 3D WEBGL GALAXY ====================
  let scene, camera, renderer, particles, geometricMesh;
  let hyperdriveSpeed = 0.002;
  const container = document.getElementById('webglContainer');

  function initThree() {
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Particle Starfield
    const starCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0xa855f7);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2200;

      const mixed = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Floating 3D Geometric Wireframe TorusKnot
    const meshGeo = new THREE.TorusKnotGeometry(180, 40, 100, 16);
    const meshMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    geometricMesh = new THREE.Mesh(meshGeo, meshMat);
    geometricMesh.position.set(450, 0, -300);
    scene.add(geometricMesh);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMoveParallax);
  }

  let mouseX = 0, mouseY = 0;
  function onMouseMoveParallax(e) {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.4;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.4;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animateThree() {
    requestAnimationFrame(animateThree);
    if (!particles || !renderer) return;

    particles.rotation.y += hyperdriveSpeed;
    particles.rotation.x += hyperdriveSpeed * 0.4;

    if (geometricMesh) {
      geometricMesh.rotation.x += 0.005;
      geometricMesh.rotation.y += 0.008;
    }

    camera.position.x += (mouseX - camera.position.x) * 0.04;
    camera.position.y += (-mouseY - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  initThree();
  animateThree();

  // Hyperdrive Toggle
  const hyperdriveBtn = document.getElementById('hyperdriveBtn');
  let isHyper = false;

  hyperdriveBtn?.addEventListener('click', () => {
    isHyper = !isHyper;
    document.body.classList.toggle('hyperdrive-active', isHyper);
    hyperdriveSpeed = isHyper ? 0.025 : 0.002;
    sfx.warp();

    const icon = document.getElementById('hyperIcon');
    if (icon) {
      icon.style.color = isHyper ? '#ff0055' : '';
    }
  });

  // ==================== 3. LIVE ALGORITHM VISUALIZER SANDBOX ====================
  const viewport = document.getElementById('barsViewport');
  const algoSelect = document.getElementById('algoSelect');
  const startBtn = document.getElementById('startAlgoBtn');
  const resetBtn = document.getElementById('resetAlgoBtn');
  const speedSlider = document.getElementById('algoSpeed');

  const compDisplay = document.getElementById('comparisonsVal');
  const swapDisplay = document.getElementById('swapsVal');
  const statusDisplay = document.getElementById('algoStatus');

  let array = [];
  const ARRAY_SIZE = 28;
  let isSorting = false;
  let comparisons = 0;
  let swaps = 0;

  function generateArray() {
    if (isSorting) return;
    array = [];
    comparisons = 0;
    swaps = 0;
    updateStats();
    if (statusDisplay) {
      statusDisplay.textContent = 'IDLE — Ready to execute';
      statusDisplay.className = 'm-val status-idle';
    }

    if (!viewport) return;
    viewport.innerHTML = '';

    for (let i = 0; i < ARRAY_SIZE; i++) {
      const val = Math.floor(Math.random() * 85) + 12; // 12% to 97% height
      array.push(val);

      const bar = document.createElement('div');
      bar.className = 'algo-bar';
      bar.style.height = `${val}%`;
      bar.setAttribute('data-index', i);
      viewport.appendChild(bar);
    }
  }

  function updateStats() {
    if (compDisplay) compDisplay.textContent = comparisons;
    if (swapDisplay) swapDisplay.textContent = swaps;
  }

  function sleep(ms) {
    const speed = speedSlider ? (160 - parseInt(speedSlider.value, 10)) : 60;
    return new Promise(resolve => setTimeout(resolve, Math.max(speed, 8)));
  }

  function playBarSound(val) {
    const freq = 200 + val * 10;
    sfx.playTone(freq, 'sine', 0.04, 0.03);
  }

  // Bubble Sort
  async function bubbleSort() {
    const bars = viewport.querySelectorAll('.algo-bar');
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSorting) return;

        bars[j].classList.add('comparing');
        bars[j + 1].classList.add('comparing');
        comparisons++;
        updateStats();
        playBarSound(array[j]);

        await sleep();

        if (array[j] > array[j + 1]) {
          bars[j].classList.add('swapping');
          bars[j + 1].classList.add('swapping');
          swaps++;
          updateStats();

          // Swap
          let temp = array[j];
          array[j] = array[j + 1];
          array[j + 1] = temp;

          bars[j].style.height = `${array[j]}%`;
          bars[j + 1].style.height = `${array[j + 1]}%`;

          await sleep();
          bars[j].classList.remove('swapping');
          bars[j + 1].classList.remove('swapping');
        }

        bars[j].classList.remove('comparing');
        bars[j + 1].classList.remove('comparing');
      }
      bars[n - i - 1].classList.add('sorted');
    }
    bars[0].classList.add('sorted');
  }

  // Selection Sort
  async function selectionSort() {
    const bars = viewport.querySelectorAll('.algo-bar');
    const n = array.length;

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      bars[i].classList.add('swapping');

      for (let j = i + 1; j < n; j++) {
        if (!isSorting) return;
        bars[j].classList.add('comparing');
        comparisons++;
        updateStats();
        playBarSound(array[j]);

        await sleep();

        if (array[j] < array[minIdx]) {
          if (minIdx !== i) bars[minIdx].classList.remove('comparing');
          minIdx = j;
        } else {
          bars[j].classList.remove('comparing');
        }
      }

      if (minIdx !== i) {
        swaps++;
        updateStats();
        let temp = array[i];
        array[i] = array[minIdx];
        array[minIdx] = temp;

        bars[i].style.height = `${array[i]}%`;
        bars[minIdx].style.height = `${array[minIdx]}%`;
        bars[minIdx].classList.remove('comparing');
      }

      bars[i].classList.remove('swapping');
      bars[i].classList.add('sorted');
    }
  }

  // Insertion Sort
  async function insertionSort() {
    const bars = viewport.querySelectorAll('.algo-bar');
    const n = array.length;

    for (let i = 1; i < n; i++) {
      let key = array[i];
      let j = i - 1;
      bars[i].classList.add('swapping');

      while (j >= 0 && array[j] > key) {
        if (!isSorting) return;
        bars[j].classList.add('comparing');
        comparisons++;
        swaps++;
        updateStats();
        playBarSound(array[j]);

        array[j + 1] = array[j];
        bars[j + 1].style.height = `${array[j + 1]}%`;
        await sleep();

        bars[j].classList.remove('comparing');
        j--;
      }
      array[j + 1] = key;
      bars[j + 1].style.height = `${key}%`;
      bars[i].classList.remove('swapping');
    }

    bars.forEach(b => b.classList.add('sorted'));
  }

  // Binary Search (on sorted array)
  async function binarySearch() {
    // First sort instantly
    array.sort((a, b) => a - b);
    const bars = viewport.querySelectorAll('.algo-bar');
    bars.forEach((b, idx) => {
      b.style.height = `${array[idx]}%`;
      b.className = 'algo-bar';
    });

    const target = array[Math.floor(Math.random() * array.length)];
    if (statusDisplay) statusDisplay.textContent = `Target Key: ${target}`;

    let left = 0, right = array.length - 1;
    while (left <= right) {
      if (!isSorting) return;
      const mid = Math.floor((left + right) / 2);
      bars[mid].classList.add('swapping');
      comparisons++;
      updateStats();
      playBarSound(array[mid]);

      await sleep();

      if (array[mid] === target) {
        bars[mid].classList.remove('swapping');
        bars[mid].classList.add('sorted');
        if (statusDisplay) {
          statusDisplay.textContent = `MATCH FOUND AT INDEX ${mid}! 🎉`;
          statusDisplay.className = 'm-val status-done';
        }
        return;
      }

      if (array[mid] < target) {
        for (let k = left; k <= mid; k++) bars[k].style.opacity = '0.25';
        left = mid + 1;
      } else {
        for (let k = mid; k <= right; k++) bars[k].style.opacity = '0.25';
        right = mid - 1;
      }
      bars[mid].classList.remove('swapping');
    }
  }

  startBtn?.addEventListener('click', async () => {
    if (isSorting) return;
    isSorting = true;
    startBtn.disabled = true;
    sfx.playTone(880, 'triangle', 0.08, 0.05);

    if (statusDisplay) {
      statusDisplay.textContent = 'EXECUTING ALGORITHM...';
      statusDisplay.className = 'm-val status-running';
    }

    const algo = algoSelect?.value || 'bubble';
    if (algo === 'bubble') await bubbleSort();
    else if (algo === 'selection') await selectionSort();
    else if (algo === 'insertion') await insertionSort();
    else if (algo === 'bsearch') await binarySearch();

    isSorting = false;
    startBtn.disabled = false;
    if (statusDisplay && !statusDisplay.textContent.includes('MATCH')) {
      statusDisplay.textContent = 'COMPLETED — Array Fully Sorted ⚡';
      statusDisplay.className = 'm-val status-done';
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (isSorting) return;
    generateArray();
    sfx.playTone(660, 'sine', 0.05, 0.04);
  });

  generateArray();

  // ==================== 4. PLAYABLE RETRO ARCADE MINI-GAME (BUG CRUSHER) ====================
  const arcadeModal = document.getElementById('arcadeModal');
  const arcadeClose = document.getElementById('closeArcadeBtn');
  const gameCanvas = document.getElementById('gameCanvas');
  const gameOverlay = document.getElementById('gameOverlay');
  const startGameBtn = document.getElementById('startArcadeGameBtn');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const highScoreDisplay = document.getElementById('highScoreDisplay');

  document.getElementById('arcadeTriggerBtn')?.addEventListener('click', () => openArcade());
  document.getElementById('openArcadeHeroBtn')?.addEventListener('click', () => openArcade());
  arcadeClose?.addEventListener('click', () => closeArcade());

  function openArcade() {
    arcadeModal?.classList.add('open');
    sfx.warp();
  }

  function closeArcade() {
    arcadeModal?.classList.remove('open');
    stopGame();
  }

  let gameCtx = gameCanvas?.getContext('2d');
  let gameRunning = false;
  let gameScore = 0;
  let gameHighScore = parseInt(localStorage.getItem('mayank-high-score') || '0', 10);
  if (highScoreDisplay) highScoreDisplay.textContent = `BEST: ${gameHighScore}`;

  let player = { x: 280, y: 350, w: 40, h: 20, speed: 6 };
  let lasers = [];
  let bugs = [];
  let keys = {};
  let spawnTimer = null;
  let gameLoopId = null;

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameRunning) {
      e.preventDefault();
      shootLaser();
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  function shootLaser() {
    lasers.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12, speed: 8 });
    sfx.laser();
  }

  function spawnBug() {
    if (!gameRunning) return;
    const bugLabels = ['NullPtr', 'SegFault', 'MemLeak', 'NaN', 'OOM'];
    const label = bugLabels[Math.floor(Math.random() * bugLabels.length)];
    bugs.push({
      x: Math.random() * (gameCanvas.width - 50) + 10,
      y: -20,
      w: 48,
      h: 22,
      label: label,
      speed: Math.random() * 1.5 + 1.2
    });
  }

  function startGame() {
    gameOverlay.style.display = 'none';
    gameRunning = true;
    gameScore = 0;
    lasers = [];
    bugs = [];
    player.x = 280;
    if (scoreDisplay) scoreDisplay.textContent = `SCORE: 0`;

    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnBug, 1100);
    gameLoop();
  }

  function stopGame() {
    gameRunning = false;
    clearInterval(spawnTimer);
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    if (gameOverlay) gameOverlay.style.display = 'flex';
  }

  function gameOver() {
    stopGame();
    sfx.playTone(180, 'sawtooth', 0.4, 0.08);
    if (gameScore > gameHighScore) {
      gameHighScore = gameScore;
      localStorage.setItem('mayank-high-score', gameHighScore);
      if (highScoreDisplay) highScoreDisplay.textContent = `BEST: ${gameHighScore}`;
    }
    const h2 = gameOverlay.querySelector('h2');
    if (h2) h2.textContent = `GAME OVER — SCORE: ${gameScore}`;
  }

  function gameLoop() {
    if (!gameRunning) return;

    // Move player
    if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) player.x -= player.speed;
    if ((keys['ArrowRight'] || keys['KeyD']) && player.x < gameCanvas.width - player.w) player.x += player.speed;

    // Clear
    gameCtx.fillStyle = 'rgba(2, 4, 10, 0.4)';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw Player
    gameCtx.fillStyle = '#00f2fe';
    gameCtx.shadowColor = '#00f2fe';
    gameCtx.shadowBlur = 10;
    gameCtx.fillRect(player.x, player.y, player.w, player.h);
    gameCtx.shadowBlur = 0;

    // Update & Draw Lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      l.y -= l.speed;
      gameCtx.fillStyle = '#ff0055';
      gameCtx.shadowColor = '#ff0055';
      gameCtx.shadowBlur = 8;
      gameCtx.fillRect(l.x, l.y, l.w, l.h);
      gameCtx.shadowBlur = 0;

      if (l.y < -10) lasers.splice(i, 1);
    }

    // Update & Draw Bugs
    for (let i = bugs.length - 1; i >= 0; i--) {
      const b = bugs[i];
      b.y += b.speed;

      // Draw Bug Box
      gameCtx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      gameCtx.strokeStyle = '#a855f7';
      gameCtx.lineWidth = 1.5;
      gameCtx.strokeRect(b.x, b.y, b.w, b.h);
      gameCtx.fillRect(b.x, b.y, b.w, b.h);

      // Label
      gameCtx.fillStyle = '#fff';
      gameCtx.font = '10px JetBrains Mono';
      gameCtx.fillText(b.label, b.x + 4, b.y + 15);

      // Check collision with Lasers
      for (let j = lasers.length - 1; j >= 0; j--) {
        const l = lasers[j];
        if (l.x > b.x && l.x < b.x + b.w && l.y > b.y && l.y < b.y + b.h) {
          // Bug destroyed!
          bugs.splice(i, 1);
          lasers.splice(j, 1);
          gameScore += 10;
          if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${gameScore}`;
          sfx.playTone(750, 'triangle', 0.06, 0.04);
          break;
        }
      }

      // Check if Bug hit ground or player
      if (b && (b.y + b.h >= player.y && b.x + b.w >= player.x && b.x <= player.x + player.w || b.y > gameCanvas.height)) {
        gameOver();
        return;
      }
    }

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  startGameBtn?.addEventListener('click', () => startGame());

  // ==================== 5. INTERACTIVE BENTO TERMINAL CLI ====================
  const termIn = document.getElementById('termInput');
  const termHist = document.getElementById('termHist');
  const termClear = document.getElementById('termClear');
  const termScreen = document.getElementById('termScreen');

  const CMDS = {
    help: `Available CLI commands:
  <span class="t-cyan">about</span>     - Software engineer bio
  <span class="t-cyan">skills</span>    - Languages, systems & frontend
  <span class="t-cyan">projects</span>  - Enterprise full-stack & C++ builds
  <span class="t-cyan">dsa</span>       - 500+ LeetCode milestones
  <span class="t-cyan">game</span>      - Launch playable Bug Crusher arcade
  <span class="t-cyan">matrix</span>    - Trigger screen matrix wave
  <span class="t-cyan">contact</span>   - Direct transmission links
  <span class="t-cyan">clear</span>     - Wipe terminal log`,

    about: `Mayank Saini // Full-Stack & Systems Engineer
  College : Maharaja Agrasen Institute of Technology (MAIT), Delhi
  Year    : 2nd Year B.Tech CSE (Graduating 2027)
  Focus   : Scalable Web Systems, C++ DSA, High Performance UI`,

    skills: `Technical Arsenal:
  C++ (DSA & STL), React 19, TypeScript, Node.js, Express, MongoDB, Three.js`,

    projects: `Key Architectures:
  1. Full-Stack Workspace     [React, Node.js, Express, MongoDB, TS]
  2. C++ Algorithm Engine     [C++, Graph Traversal, BFS/DFS, A*]
  3. Real-Time Telemetry App  [React.js, Tailwind, REST APIs]`,

    dsa: `Algorithmic Record:
  500+ Solved (LeetCode / Codeforces) in C++ STL
  Mastered: Dynamic Programming, Graph Systems, Binary Trees`,

    contact: `thebestmayanksaini@gmail.com &bull; Delhi, India`,

    game: `Launching arcade system...`,

    matrix: `Matrix neural scan initiated!`
  };

  termIn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termIn.value.trim().toLowerCase();
      if (!val) return;

      const pLine = document.createElement('div');
      pLine.className = 't-line';
      pLine.innerHTML = `<span class="t-prompt">guest@mayank:~$</span> ${escapeHtml(termIn.value)}`;
      termHist?.appendChild(pLine);

      if (val === 'clear') {
        if (termHist) termHist.innerHTML = '';
        termIn.value = '';
        return;
      }

      if (val === 'game') {
        openArcade();
      }

      if (val === 'matrix') {
        document.body.style.filter = 'hue-rotate(90deg) contrast(1.15)';
        setTimeout(() => { document.body.style.filter = ''; }, 2200);
      }

      const res = CMDS[val] || `Command not found: '${escapeHtml(val)}'. Type <span class="t-cyan">'help'</span> for list.`;
      const rLine = document.createElement('div');
      rLine.className = 't-line';
      rLine.style.whiteSpace = 'pre-line';
      rLine.innerHTML = res;
      termHist?.appendChild(rLine);

      termIn.value = '';
      if (termScreen) termScreen.scrollTop = termScreen.scrollHeight;
      sfx.playTone(550, 'square', 0.03, 0.02);
    }
  });

  termClear?.addEventListener('click', () => {
    if (termHist) termHist.innerHTML = '';
  });

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==================== 6. SPOTLIGHT CARD TRACKER ====================
  document.querySelectorAll('[data-spotlight]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
    });
  });

  // ==================== 7. 3D HOLOGRAM PORTRAIT TILT ====================
  const holoStage = document.getElementById('holoStage');
  holoStage?.addEventListener('mousemove', (e) => {
    const rect = holoStage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    holoStage.style.transform = `perspective(1000px) rotateX(${(-y / rect.height) * 16}deg) rotateY(${(x / rect.width) * 16}deg) scale3d(1.03, 1.03, 1.03)`;
  });
  holoStage?.addEventListener('mouseleave', () => {
    holoStage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });

  // ==================== 8. DYNAMIC TYPING IN HERO ====================
  const typeWords = [
    'Scalable Full-Stack Web Systems',
    'High-Performance C++ Algorithms',
    'Modern React 19 & TypeScript UIs',
    'Resilient Node.js Microservices'
  ];
  let tWordIdx = 0, tCharIdx = 0, tDeleting = false;
  const heroTypeEl = document.getElementById('heroTyping');

  function runHeroType() {
    if (!heroTypeEl) return;
    const cur = typeWords[tWordIdx];

    if (tDeleting) {
      heroTypeEl.textContent = cur.substring(0, tCharIdx - 1);
      tCharIdx--;
    } else {
      heroTypeEl.textContent = cur.substring(0, tCharIdx + 1);
      tCharIdx++;
    }

    let spd = tDeleting ? 30 : 65;

    if (!tDeleting && tCharIdx === cur.length) {
      spd = 2000;
      tDeleting = true;
    } else if (tDeleting && tCharIdx === 0) {
      tDeleting = false;
      tWordIdx = (tWordIdx + 1) % typeWords.length;
      spd = 400;
    }
    setTimeout(runHeroType, spd);
  }
  runHeroType();

  // ==================== 9. GITHUB HEATMAP SIMULATION ====================
  const ghGrid = document.getElementById('ghGrid');
  if (ghGrid) {
    const total = 52 * 7;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      const tile = document.createElement('div');
      tile.className = 'gh-tile';
      const r = Math.random();
      let lvl = 'l-0';
      if (r > 0.35 && r <= 0.6) lvl = 'l-1';
      else if (r > 0.6 && r <= 0.8) lvl = 'l-2';
      else if (r > 0.8 && r <= 0.92) lvl = 'l-3';
      else if (r > 0.92) lvl = 'l-4';
      tile.classList.add(lvl);
      tile.title = `Activity: ${lvl === 'l-0' ? '0' : Math.floor(Math.random() * 8) + 1} commits`;
      frag.appendChild(tile);
    }
    ghGrid.appendChild(frag);
  }

  // ==================== 10. REALTIME DELHI IST CLOCK ====================
  const liveClock = document.getElementById('liveClock');
  const clockMode = document.getElementById('clockMode');

  function updateClock() {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));

    const h = String(ist.getHours()).padStart(2, '0');
    const m = String(ist.getMinutes()).padStart(2, '0');
    const s = String(ist.getSeconds()).padStart(2, '0');

    if (liveClock) liveClock.textContent = `${h}:${m}:${s}`;
    if (clockMode) {
      const hr = ist.getHours();
      if (hr >= 6 && hr < 12) clockMode.textContent = 'Morning architecture & coffee ☀️';
      else if (hr >= 12 && hr < 18) clockMode.textContent = 'Deep work & building apps ⚡';
      else if (hr >= 18 && hr < 23) clockMode.textContent = 'C++ DSA problem grinding 🌙';
      else clockMode.textContent = 'Late night system hacking ☕';
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==================== 11. STAT COUNTERS & PRELOADER ====================
  const loadBar = document.getElementById('loadBar');
  const loadPercent = document.getElementById('loadPercent');
  const preloader = document.getElementById('preloader');
  let pVal = 0;

  const pInt = setInterval(() => {
    pVal += Math.floor(Math.random() * 16) + 8;
    if (pVal > 100) pVal = 100;
    if (loadBar) loadBar.style.width = `${pVal}%`;
    if (loadPercent) loadPercent.textContent = pVal;

    if (pVal === 100) {
      clearInterval(pInt);
      setTimeout(() => {
        preloader?.classList.add('preloader-done');
        animateCounters();
      }, 350);
    }
  }, 50);

  function animateCounters() {
    document.querySelectorAll('.counter-num[data-val]').forEach(c => {
      const tgt = parseInt(c.getAttribute('data-val'), 10);
      let cur = 0;
      const step = Math.ceil(tgt / 40);
      const timer = setInterval(() => {
        cur += step;
        if (cur >= tgt) {
          c.textContent = tgt;
          clearInterval(timer);
        } else {
          c.textContent = cur;
        }
      }, 30);
    });
  }

  // ==================== 12. CURSOR MOTION ====================
  const curDot = document.getElementById('cursorDot');
  const curRing = document.getElementById('cursorRing');
  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (curDot) {
      curDot.style.left = `${mx}px`;
      curDot.style.top = `${my}px`;
    }
  });

  function renderRing() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    if (curRing) {
      curRing.style.left = `${rx}px`;
      curRing.style.top = `${ry}px`;
    }
    requestAnimationFrame(renderRing);
  }
  renderRing();

  document.querySelectorAll('a, button, input, select, textarea, [data-spotlight]').forEach(el => {
    el.addEventListener('mouseenter', () => curRing?.classList.add('c-hover'));
    el.addEventListener('mouseleave', () => curRing?.classList.remove('c-hover'));
  });

  // ==================== 13. COPY EMAIL & FORM ====================
  const copyBtn = document.getElementById('copyBtn');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText('thebestmayanksaini@gmail.com').then(() => {
      sfx.playTone(880, 'sine', 0.1, 0.05);
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      copyBtn.style.background = '#10b981';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        copyBtn.style.background = '';
      }, 2000);
    });
  });

  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cName')?.value || '';
    const email = document.getElementById('cEmail')?.value || '';
    const sub = document.getElementById('cSubject')?.value || '';
    const msg = document.getElementById('cMsg')?.value || '';

    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(msg)}`;
    window.location.href = `mailto:thebestmayanksaini@gmail.com?subject=${encodeURIComponent(sub)}&body=${body}`;

    const sBtn = document.getElementById('submitBtn');
    if (sBtn) {
      sBtn.innerHTML = '<span class="btn-content"><i class="fa-solid fa-check"></i> Opening Mail Client...</span>';
      sBtn.style.background = '#10b981';
      setTimeout(() => {
        sBtn.innerHTML = '<span class="btn-content"><i class="fa-solid fa-paper-plane"></i> Transmit Message</span>';
        sBtn.style.background = '';
        contactForm.reset();
      }, 3500);
    }
  });

  // Mobile Menu
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  hamburgerBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('nav-open');
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => navLinks?.classList.remove('nav-open'));
  });

});

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BallSkin, CollectibleDef, GameSettings, LevelData, ObstacleDef, PlatformDef, PowerUpDef, Vector3D } from '../types/game';
import { BallState, BoxCollider, stepBallPhysics, resetBallAtPoint } from './physics';
import { soundManager } from './audio';
import { BALL_SKINS } from './ballSkins';

// Software GL detection
export const isSoftwareGl = (() => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

export interface EngineCallbacks {
  onCoinCollected: (points: number, totalCoins: number) => void;
  onStarCollected: (points: number, starsCount: number) => void;
  onCheckpointReached: (checkpointId: string) => void;
  onPowerUpActivated: (type: string, duration: number) => void;
  onFallOut: (fallsCount: number) => void;
  onLevelCompleted: () => void;
  onStatsUpdate: (stats: { speed: number; boost: number; timeElapsed: number }) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: EngineCallbacks;

  // Game state
  private currentLevel: LevelData | null = null;
  private settings: GameSettings;
  private activeSkin: BallSkin;
  private isRunning = false;
  private isPaused = false;
  private isVictory = false;
  private animFrameId = 0;
  private lastTime = 0;
  private levelTimeElapsed = 0;
  private fallsCount = 0;
  private coinsCount = 0;
  private starsCount = 0;

  // Ball physics
  public ballState: BallState = {
    position: { x: 0, y: 1, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    radius: 0.5,
    isGrounded: true,
    groundSurface: 'normal',
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    boostTimer: 0,
    boostMeter: 1.0,
  };

  private lastSafeCheckpoint: Vector3D = { x: 0, y: 1, z: 0 };
  private boxColliders: BoxCollider[] = [];

  // Active power-up timers
  private powerUps = {
    speedBoost: 0,
    highJump: 0,
    shield: 0,
    magnet: 0,
  };

  // Three.js meshes
  private ballMesh: THREE.Mesh | null = null;
  private ballGroup: THREE.Group = new THREE.Group();
  private shadowDisc: THREE.Mesh | null = null;
  private shieldBubble: THREE.Mesh | null = null;
  private levelGroup: THREE.Group = new THREE.Group();
  private dynamicObstacles: { def: ObstacleDef; group: THREE.Group; initialPos: THREE.Vector3 }[] = [];
  private movingPlatforms: { def: PlatformDef; mesh: THREE.Mesh; collider: BoxCollider; initialPos: THREE.Vector3 }[] = [];
  private collectibleMeshes: Map<string, { mesh: THREE.Group; def: CollectibleDef }> = new Map();
  private powerUpMeshes: Map<string, { mesh: THREE.Group; def: PowerUpDef }> = new Map();
  private checkpointMeshes: Map<string, { ring: THREE.Mesh; beacon: THREE.Mesh }> = new Map();
  private finishMesh: THREE.Group | null = null;

  // Particle pool
  private particleCount = 200;
  private particleGeo: THREE.BufferGeometry = new THREE.BufferGeometry();
  private particlePositions = new Float32Array(this.particleCount * 3);
  private particleVelocities: { x: number; y: number; z: number; life: number; maxLife: number; color: THREE.Color }[] = [];
  private particlePoints: THREE.Points | null = null;

  // Input states
  public input = {
    x: 0,
    z: 0,
    jump: false,
    brake: false,
    boost: false,
  };

  // Camera tracking
  private cameraLookTarget = new THREE.Vector3();
  private cameraCurrentPos = new THREE.Vector3(0, 5, 8);
  private cameraTrauma = 0;
  private raycaster = new THREE.Raycaster();

  constructor(container: HTMLElement, settings: GameSettings, callbacks: EngineCallbacks) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;
    this.activeSkin = BALL_SKINS[0];

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // Camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 400);
    this.camera.position.set(0, 4, 7);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Studio Environment lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.setupLighting();
    this.setupParticleSystem();

    this.scene.add(this.levelGroup);
    this.scene.add(this.ballGroup);

    this.buildBallMesh();
    this.setupEventListeners();
  }

  private setupLighting() {
    // Hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Key directional light with shadow
    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    dirLight.position.set(25, 45, 25);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 150;
      const d = 35;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    // Ambient light backup
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(amb);
  }

  private setupParticleSystem() {
    this.particlePositions.fill(0);
    for (let i = 0; i < this.particleCount; i++) {
      this.particleVelocities.push({
        x: 0,
        y: 0,
        z: 0,
        life: 0,
        maxLife: 1,
        color: new THREE.Color(0xffffff),
      });
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.particlePoints = new THREE.Points(this.particleGeo, mat);
    this.scene.add(this.particlePoints);
  }

  public spawnParticles(x: number, y: number, z: number, count: number, colorHex: number, speedScale = 1.0) {
    let spawned = 0;
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < this.particleCount && spawned < count; i++) {
      const p = this.particleVelocities[i];
      if (p.life <= 0) {
        this.particlePositions[i * 3] = x;
        this.particlePositions[i * 3 + 1] = y;
        this.particlePositions[i * 3 + 2] = z;

        p.x = (Math.random() - 0.5) * 6 * speedScale;
        p.y = (Math.random() * 4 + 1) * speedScale;
        p.z = (Math.random() - 0.5) * 6 * speedScale;
        p.life = 0.4 + Math.random() * 0.4;
        p.maxLife = p.life;
        p.color.copy(col);
        spawned++;
      }
    }
    this.particleGeo.attributes.position.needsUpdate = true;
  }

  private buildBallMesh() {
    // Clear existing
    while (this.ballGroup.children.length > 0) {
      this.ballGroup.remove(this.ballGroup.children[0]);
    }

    const skin = this.activeSkin;
    const geo = new THREE.SphereGeometry(this.ballState.radius, 32, 24);

    let mat: THREE.Material;
    if (skin.specialEffect === 'crystal') {
      mat = new THREE.MeshPhysicalMaterial({
        color: skin.color,
        roughness: skin.roughness,
        metalness: skin.metalness,
        transmission: isSoftwareGl ? 0 : 0.9,
        transparent: true,
        opacity: isSoftwareGl ? 0.45 : 0.95,
        ior: 1.52,
        clearcoat: 1.0,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: skin.color,
        roughness: skin.roughness,
        metalness: skin.metalness,
        emissive: skin.emissive || 0x000000,
        emissiveIntensity: skin.emissiveIntensity || 0,
      });
    }

    this.ballMesh = new THREE.Mesh(geo, mat);
    if (!isSoftwareGl) {
      this.ballMesh.castShadow = true;
      this.ballMesh.receiveShadow = true;
    }
    this.ballGroup.add(this.ballMesh);

    // Decorative racing rings / accent bands for 3-part composite model
    const ringGeo = new THREE.TorusGeometry(this.ballState.radius * 1.005, 0.02, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh2.rotation.x = Math.PI / 2;
    this.ballMesh.add(ringMesh1);
    this.ballMesh.add(ringMesh2);

    // Shield bubble
    const shieldGeo = new THREE.SphereGeometry(this.ballState.radius * 1.35, 24, 18);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    this.shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
    this.ballGroup.add(this.shieldBubble);

    // Contact shadow disc underneath ball
    const shadowGeo = new THREE.CircleGeometry(this.ballState.radius * 1.1, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.scene.add(this.shadowDisc);
  }

  public setSkin(skin: BallSkin) {
    this.activeSkin = skin;
    this.buildBallMesh();
  }

  public setSettings(settings: GameSettings) {
    this.settings = settings;
    if (this.renderer) {
      if (settings.graphicsQuality === 'low') {
        this.renderer.shadowMap.enabled = false;
        this.renderer.setPixelRatio(1);
      } else {
        this.renderer.shadowMap.enabled = !isSoftwareGl;
        this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      }
    }
  }

  public loadLevel(level: LevelData) {
    this.currentLevel = level;
    this.isVictory = false;
    this.levelTimeElapsed = 0;
    this.fallsCount = 0;
    this.coinsCount = 0;
    this.starsCount = 0;
    this.lastSafeCheckpoint = { ...level.spawnPoint };

    // Reset power-ups
    this.powerUps = { speedBoost: 0, highJump: 0, shield: 0, magnet: 0 };

    // Clear previous level meshes
    while (this.levelGroup.children.length > 0) {
      const child = this.levelGroup.children[0];
      this.levelGroup.remove(child);
    }
    this.dynamicObstacles = [];
    this.movingPlatforms = [];
    this.collectibleMeshes.clear();
    this.powerUpMeshes.clear();
    this.checkpointMeshes.clear();
    this.boxColliders = [];

    // Background & fog colors
    if (level.backgroundColor) {
      this.scene.background = new THREE.Color(level.backgroundColor);
      this.scene.fog = new THREE.FogExp2(level.fogColor || level.backgroundColor, 0.015);
    }

    // Build platforms
    level.platforms.forEach((p) => {
      this.buildPlatform(p);
    });

    // Build obstacles
    level.obstacles.forEach((o) => {
      this.buildObstacle(o);
    });

    // Build collectibles
    level.collectibles.forEach((c) => {
      this.buildCollectible(c);
    });

    // Build power-ups
    level.powerUps.forEach((pw) => {
      this.buildPowerUp(pw);
    });

    // Build checkpoints
    level.checkpoints.forEach((cp) => {
      this.buildCheckpoint(cp);
    });

    // Build finish portal
    this.buildFinishPortal(level.finishPoint);

    // Reset ball position
    resetBallAtPoint(this.ballState, level.spawnPoint, this.ballState.radius);
    this.ballGroup.position.set(this.ballState.position.x, this.ballState.position.y, this.ballState.position.z);
    this.cameraLookTarget.set(this.ballState.position.x, this.ballState.position.y, this.ballState.position.z);
    this.cameraCurrentPos.set(this.ballState.position.x, this.ballState.position.y + 4, this.ballState.position.z + 7);
    this.camera.position.copy(this.cameraCurrentPos);
    this.camera.lookAt(this.cameraLookTarget);

    soundManager.startBGM(level.theme);
  }

  private buildPlatform(p: PlatformDef) {
    const geo = new THREE.BoxGeometry(p.width, p.height, p.depth);
    let color = p.color || 0x3b82f6;
    if (p.surfaceType === 'ice') color = 0xbae6fd;
    if (p.surfaceType === 'booster') color = 0x06b6d4;
    if (p.surfaceType === 'bouncy') color = 0xec4899;

    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: p.surfaceType === 'ice' ? 0.05 : 0.5,
      metalness: p.surfaceType === 'booster' ? 0.6 : 0.1,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x, p.y, p.z);
    if (!isSoftwareGl) {
      mesh.receiveShadow = true;
      mesh.castShadow = true;
    }
    this.levelGroup.add(mesh);

    // Edge bevel indicator or booster arrows
    if (p.surfaceType === 'booster') {
      const arrowGeo = new THREE.ConeGeometry(0.6, 1.2, 3);
      arrowGeo.rotateX(-Math.PI / 2);
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(0, p.height / 2 + 0.05, 0);
      mesh.add(arrow);
    } else if (p.surfaceType === 'bouncy') {
      const springGeo = new THREE.CylinderGeometry(p.width * 0.35, p.width * 0.35, 0.1, 16);
      const springMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.8 });
      const spring = new THREE.Mesh(springGeo, springMat);
      spring.position.set(0, p.height / 2 + 0.05, 0);
      mesh.add(spring);
    }

    const collider: BoxCollider = {
      x: p.x,
      y: p.y,
      z: p.z,
      width: p.width,
      height: p.height,
      depth: p.depth,
      surfaceType: p.surfaceType,
    };
    this.boxColliders.push(collider);

    if (p.moveRange) {
      this.movingPlatforms.push({
        def: p,
        mesh,
        collider,
        initialPos: new THREE.Vector3(p.x, p.y, p.z),
      });
    }
  }

  private buildObstacle(o: ObstacleDef) {
    const group = new THREE.Group();
    group.position.set(o.x, o.y, o.z);

    if (o.type === 'rotating_bar') {
      const size = o.size || [4, 0.4, 0.4];
      const barGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const barMat = new THREE.MeshStandardMaterial({ color: o.color || 0xef4444, roughness: 0.3, metalness: 0.4 });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.castShadow = !isSoftwareGl;
      group.add(barMesh);

      // Central pivot stand
      const pivotGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 16);
      const pivotMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const pivot = new THREE.Mesh(pivotGeo, pivotMat);
      pivot.position.y = -0.5;
      group.add(pivot);
    } else if (o.type === 'hammer') {
      const frameGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 12);
      const hammerHeadGeo = new THREE.BoxGeometry(1.4, 1.2, 1.2);
      const mat = new THREE.MeshStandardMaterial({ color: o.color || 0xf43f5e, metalness: 0.7, roughness: 0.2 });
      const head = new THREE.Mesh(hammerHeadGeo, mat);
      head.position.y = -1.6;
      head.castShadow = !isSoftwareGl;
      const arm = new THREE.Mesh(frameGeo, mat);
      arm.position.y = -0.8;
      group.add(arm);
      group.add(head);
    } else if (o.type === 'sliding_block') {
      const size = o.size || [2, 2, 2];
      const blockGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const mat = new THREE.MeshStandardMaterial({ color: o.color || 0xdc2626, roughness: 0.4 });
      const block = new THREE.Mesh(blockGeo, mat);
      block.castShadow = !isSoftwareGl;
      group.add(block);
    } else if (o.type === 'laser') {
      const size = o.size || [4, 0.25, 0.25];
      const beamGeo = new THREE.CylinderGeometry(size[1], size[1], size[0], 12);
      beamGeo.rotateZ(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({ color: o.color || 0x06b6d4, transparent: true, opacity: 0.85 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      group.add(beam);
    }

    this.levelGroup.add(group);
    this.dynamicObstacles.push({ def: o, group, initialPos: new THREE.Vector3(o.x, o.y, o.z) });
  }

  private buildCollectible(c: CollectibleDef) {
    const group = new THREE.Group();
    group.position.set(c.x, c.y, c.z);

    if (c.type === 'coin') {
      // Spinning golden cylinder coin with beveled rim
      const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.15,
        metalness: 0.9,
      });
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.castShadow = !isSoftwareGl;
      group.add(mesh);
    } else if (c.type === 'star') {
      // 3D Star shape
      const starGeo = new THREE.OctahedronGeometry(0.55, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xeab308,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      group.add(starMesh);
    }

    this.levelGroup.add(group);
    this.collectibleMeshes.set(c.id, { mesh: group, def: c });
  }

  private buildPowerUp(pw: PowerUpDef) {
    const group = new THREE.Group();
    group.position.set(pw.x, pw.y, pw.z);

    const orbGeo = new THREE.IcosahedronGeometry(0.48, 1);
    let col = 0x38bdf8;
    if (pw.type === 'speed_boost') col = 0x06b6d4;
    if (pw.type === 'high_jump') col = 0xa855f7;
    if (pw.type === 'shield') col = 0x10b981;
    if (pw.type === 'magnet') col = 0xf59e0b;

    const orbMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    this.levelGroup.add(group);
    this.powerUpMeshes.set(pw.id, { mesh: group, def: pw });
  }

  private buildCheckpoint(cp: { id: string; x: number; y: number; z: number; radius: number }) {
    const group = new THREE.Group();
    group.position.set(cp.x, cp.y, cp.z);

    // Glowing ring on floor
    const ringGeo = new THREE.TorusGeometry(cp.radius * 0.7, 0.08, 12, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Vertical beacon light pillar
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.3,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 1.5;
    group.add(beacon);

    this.levelGroup.add(group);
    this.checkpointMeshes.set(cp.id, { ring, beacon });
  }

  private buildFinishPortal(pos: Vector3D) {
    const group = new THREE.Group();
    group.position.set(pos.x, pos.y, pos.z);

    // Arch pillars
    const archGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 32, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.y = 0;
    group.add(arch);

    // Portal energy center disc
    const portalGeo = new THREE.CircleGeometry(2.0, 32);
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.y = 1.0;
    group.add(portal);

    this.levelGroup.add(group);
    this.finishMesh = group;
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  public pause() {
    this.isPaused = true;
    soundManager.updateRollSound(0, false);
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    soundManager.stopBGM();
    soundManager.updateRollSound(0, false);
  }

  private loop = () => {
    if (!this.isRunning || this.isPaused) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.renderer.render(this.scene, this.camera);

    if (isSoftwareGl) {
      this.afterDraw(this.loop);
    } else {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        window.setTimeout(poll, 4);
      } else {
        if (sync) gl.deleteSync(sync);
        window.setTimeout(cb, 60);
      }
    };
    window.setTimeout(poll, 4);
  }

  private update(dt: number) {
    if (this.isVictory || !this.currentLevel) return;

    this.levelTimeElapsed += dt;

    // Power-up countdowns
    if (this.powerUps.speedBoost > 0) this.powerUps.speedBoost -= dt;
    if (this.powerUps.highJump > 0) this.powerUps.highJump -= dt;
    if (this.powerUps.shield > 0) this.powerUps.shield -= dt;
    if (this.powerUps.magnet > 0) this.powerUps.magnet -= dt;

    // Update shield bubble mesh opacity
    if (this.shieldBubble) {
      const active = this.powerUps.shield > 0;
      (this.shieldBubble.material as THREE.MeshBasicMaterial).opacity = active ? 0.6 : 0;
      if (active) this.shieldBubble.rotation.y += dt * 2;
    }

    // Step dynamic moving platforms
    const elapsed = this.levelTimeElapsed;
    this.movingPlatforms.forEach((mp) => {
      const range = mp.def.moveRange;
      if (!range) return;
      const speed = range.speed || 2;
      const t = elapsed * speed;

      if (range.x) {
        mp.mesh.position.x = mp.initialPos.x + Math.sin(t) * range.x;
        mp.collider.x = mp.mesh.position.x;
      }
      if (range.y) {
        mp.mesh.position.y = mp.initialPos.y + Math.sin(t) * range.y;
        mp.collider.y = mp.mesh.position.y;
      }
      if (range.z) {
        mp.mesh.position.z = mp.initialPos.z + Math.cos(t) * range.z;
        mp.collider.z = mp.mesh.position.z;
      }
    });

    // Step rotating obstacles
    this.dynamicObstacles.forEach((obs) => {
      const def = obs.def;
      const speed = (def.speed || 2) * dt;
      if (def.type === 'rotating_bar') {
        obs.group.rotation.y += speed;
      } else if (def.type === 'hammer') {
        obs.group.rotation.z = Math.sin(elapsed * (def.speed || 2)) * 1.2;
      } else if (def.type === 'sliding_block') {
        const range = def.range || 2;
        obs.group.position.x = obs.initialPos.x + Math.sin(elapsed * (def.speed || 2)) * range;
      } else if (def.type === 'laser') {
        // Laser pulsating brightness
        const beam = obs.group.children[0] as THREE.Mesh;
        if (beam) {
          (beam.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(elapsed * 8) * 0.4;
        }
      }
    });

    // Step physics
    const highJumpActive = this.powerUps.highJump > 0;
    const customGravity = this.currentLevel.gravity || -24;

    const events = stepBallPhysics(
      this.ballState,
      this.input,
      this.boxColliders,
      dt,
      highJumpActive,
      customGravity
    );

    // Audio triggers
    const speed = Math.sqrt(
      this.ballState.velocity.x * this.ballState.velocity.x +
      this.ballState.velocity.z * this.ballState.velocity.z
    );

    soundManager.updateRollSound(speed, this.ballState.isGrounded);

    if (events.jumped) {
      soundManager.playJump();
      this.spawnParticles(this.ballState.position.x, this.ballState.position.y - 0.4, this.ballState.position.z, 8, 0xffffff);
    }
    if (events.landed) {
      soundManager.playLand(Math.min(1.0, Math.abs(this.ballState.velocity.y) / 10));
      this.spawnParticles(this.ballState.position.x, this.ballState.position.y - 0.4, this.ballState.position.z, 6, 0x94a3b8);
    }
    if (events.bounced) {
      soundManager.playJump();
      this.spawnParticles(this.ballState.position.x, this.ballState.position.y - 0.3, this.ballState.position.z, 14, 0xec4899);
    }
    if (events.boosted) {
      soundManager.playBoost();
      this.spawnParticles(this.ballState.position.x, this.ballState.position.y, this.ballState.position.z, 10, 0x06b6d4, 1.5);
    }
    if (events.fell) {
      this.handlePlayerFall();
    }

    // Check collision with dynamic obstacles
    this.checkObstacleCollisions();

    // Collectibles & Magnet
    this.updateCollectibles(dt);

    // Checkpoints
    this.checkCheckpointTriggers();

    // Finish Portal
    this.checkFinishPortal();

    // Update ball visual mesh position & rotation
    this.ballGroup.position.set(this.ballState.position.x, this.ballState.position.y, this.ballState.position.z);
    if (this.ballMesh) {
      this.ballMesh.rotation.x = this.ballState.rotation.x;
      this.ballMesh.rotation.z = this.ballState.rotation.z;
    }

    // Contact shadow grounding disc
    if (this.shadowDisc) {
      this.shadowDisc.position.set(this.ballState.position.x, this.ballState.position.y - this.ballState.radius + 0.02, this.ballState.position.z);
      // Fade out if ball is high in the air
      const heightAboveFloor = Math.max(0, this.ballState.position.y - (this.ballState.radius + 0.02));
      const shadowMat = this.shadowDisc.material as THREE.MeshBasicMaterial;
      shadowMat.opacity = Math.max(0.05, 0.45 - heightAboveFloor * 0.1);
      const scale = 1 + heightAboveFloor * 0.2;
      this.shadowDisc.scale.set(scale, scale, scale);
    }

    // Particle pool integration
    this.updateParticles(dt);

    // Camera follow with exponential damping
    this.updateCamera(dt, speed);

    // Report stats to React HUD throttled
    this.callbacks.onStatsUpdate({
      speed: Math.round(speed * 3.6), // km/h
      boost: this.ballState.boostMeter,
      timeElapsed: this.levelTimeElapsed,
    });
  }

  private checkObstacleCollisions() {
    const ballPos = this.ballState.position;
    const r = this.ballState.radius;

    for (const obs of this.dynamicObstacles) {
      const def = obs.def;
      const obsPos = obs.group.position;
      const dx = ballPos.x - obsPos.x;
      const dy = ballPos.y - obsPos.y;
      const dz = ballPos.z - obsPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < r + 1.2) {
        // Shield absorbs hit
        if (this.powerUps.shield > 0) {
          this.powerUps.shield = 0;
          soundManager.playCrash();
          this.spawnParticles(ballPos.x, ballPos.y, ballPos.z, 20, 0x38bdf8, 2);
          this.cameraTrauma = 0.5;
          return;
        }

        // Apply knockback impulse
        soundManager.playCrash();
        this.cameraTrauma = 0.8;
        this.spawnParticles(ballPos.x, ballPos.y, ballPos.z, 16, 0xef4444);

        const pushX = dist > 0.01 ? (dx / dist) * 12 : 5;
        const pushZ = dist > 0.01 ? (dz / dist) * 12 : 5;
        this.ballState.velocity.x += pushX;
        this.ballState.velocity.z += pushZ;
        this.ballState.velocity.y = 6;
        break;
      }
    }
  }

  private updateCollectibles(dt: number) {
    const ballPos = this.ballState.position;
    const magnetActive = this.powerUps.magnet > 0;
    const magnetRadius = 6.0;

    // Coins & Stars
    this.collectibleMeshes.forEach((item, id) => {
      const mesh = item.mesh;
      const def = item.def;

      // Rotate collectible
      mesh.rotation.y += dt * 3.0;

      const dx = ballPos.x - mesh.position.x;
      const dy = ballPos.y - mesh.position.y;
      const dz = ballPos.z - mesh.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Magnet pull
      if (magnetActive && def.type === 'coin' && dist < magnetRadius) {
        const pullSpeed = 14 * dt;
        mesh.position.x += (dx / dist) * pullSpeed;
        mesh.position.y += (dy / dist) * pullSpeed;
        mesh.position.z += (dz / dist) * pullSpeed;
      }

      // Collect radius
      if (dist < this.ballState.radius + 0.7) {
        this.levelGroup.remove(mesh);
        this.collectibleMeshes.delete(id);

        if (def.type === 'coin') {
          this.coinsCount++;
          soundManager.playCoin();
          this.spawnParticles(mesh.position.x, mesh.position.y, mesh.position.z, 12, 0xfbbf24);
          this.callbacks.onCoinCollected(def.points, this.coinsCount);
        } else if (def.type === 'star') {
          this.starsCount++;
          soundManager.playStar();
          this.spawnParticles(mesh.position.x, mesh.position.y, mesh.position.z, 22, 0xfacc15, 1.8);
          this.callbacks.onStarCollected(def.points, this.starsCount);
        }
      }
    });

    // Power-ups
    this.powerUpMeshes.forEach((item, id) => {
      const mesh = item.mesh;
      const def = item.def;

      mesh.rotation.y += dt * 2.5;

      const dx = ballPos.x - mesh.position.x;
      const dy = ballPos.y - mesh.position.y;
      const dz = ballPos.z - mesh.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < this.ballState.radius + 0.8) {
        this.levelGroup.remove(mesh);
        this.powerUpMeshes.delete(id);

        if (def.type === 'speed_boost') this.powerUps.speedBoost = def.duration;
        if (def.type === 'high_jump') this.powerUps.highJump = def.duration;
        if (def.type === 'shield') this.powerUps.shield = def.duration;
        if (def.type === 'magnet') this.powerUps.magnet = def.duration;

        soundManager.playStar();
        this.spawnParticles(mesh.position.x, mesh.position.y, mesh.position.z, 20, 0x38bdf8, 2);
        this.callbacks.onPowerUpActivated(def.type, def.duration);
      }
    });
  }

  private checkCheckpointTriggers() {
    if (!this.currentLevel) return;
    const ballPos = this.ballState.position;

    this.currentLevel.checkpoints.forEach((cp) => {
      if (cp.reached) return;
      const dx = ballPos.x - cp.x;
      const dy = ballPos.y - cp.y;
      const dz = ballPos.z - cp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < cp.radius) {
        cp.reached = true;
        this.lastSafeCheckpoint = { x: cp.x, y: cp.y, z: cp.z };

        // Change checkpoint visual to activated green/cyan
        const visual = this.checkpointMeshes.get(cp.id);
        if (visual) {
          (visual.ring.material as THREE.MeshStandardMaterial).color.set(0x10b981);
          (visual.ring.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x059669);
          (visual.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
          (visual.beacon.material as THREE.MeshBasicMaterial).color.set(0x34d399);
          (visual.beacon.material as THREE.MeshBasicMaterial).opacity = 0.7;
        }

        soundManager.playCheckpoint();
        this.spawnParticles(cp.x, cp.y + 0.5, cp.z, 25, 0x10b981, 1.6);
        this.callbacks.onCheckpointReached(cp.id);
      }
    });
  }

  private checkFinishPortal() {
    if (!this.currentLevel || this.isVictory) return;
    const ballPos = this.ballState.position;
    const finishPos = this.currentLevel.finishPoint;

    const dx = ballPos.x - finishPos.x;
    const dy = ballPos.y - finishPos.y;
    const dz = ballPos.z - finishPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < 2.5) {
      this.isVictory = true;
      soundManager.stopBGM();
      soundManager.playVictory();
      this.spawnParticles(finishPos.x, finishPos.y + 1, finishPos.z, 60, 0xfbbf24, 2.5);
      this.callbacks.onLevelCompleted();
    }
  }

  private handlePlayerFall() {
    this.fallsCount++;
    soundManager.playCrash();
    this.cameraTrauma = 0.6;
    this.spawnParticles(this.ballState.position.x, this.ballState.position.y, this.ballState.position.z, 20, 0xef4444);

    // Clean reset to safe checkpoint with zero momentum
    resetBallAtPoint(this.ballState, this.lastSafeCheckpoint, this.ballState.radius);

    this.callbacks.onFallOut(this.fallsCount);
  }

  private updateParticles(dt: number) {
    if (!this.particlePoints) return;
    let anyActive = false;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particleVelocities[i];
      if (p.life > 0) {
        anyActive = true;
        p.life -= dt;
        p.y -= 9.8 * dt; // gravity on particles

        this.particlePositions[i * 3] += p.x * dt;
        this.particlePositions[i * 3 + 1] += p.y * dt;
        this.particlePositions[i * 3 + 2] += p.z * dt;
      }
    }

    if (anyActive) {
      this.particleGeo.attributes.position.needsUpdate = true;
    }
  }

  private updateCamera(dt: number, currentSpeed: number) {
    const ballPos = this.ballState.position;

    // Follow target smoothly
    const targetX = ballPos.x;
    const targetY = ballPos.y + 0.4;
    const targetZ = ballPos.z;

    const dampAlpha = 1 - Math.exp(-6 * dt);
    this.cameraLookTarget.x += (targetX - this.cameraLookTarget.x) * dampAlpha;
    this.cameraLookTarget.y += (targetY - this.cameraLookTarget.y) * dampAlpha;
    this.cameraLookTarget.z += (targetZ - this.cameraLookTarget.z) * dampAlpha;

    // Desired camera position: behind the ball (in +Z direction) and elevated
    const camDist = 6.8;
    const camHeight = 3.6;

    let desiredX = this.cameraLookTarget.x;
    let desiredY = this.cameraLookTarget.y + camHeight;
    let desiredZ = this.cameraLookTarget.z + camDist;

    // Camera shake (trauma * trauma)
    if (this.cameraTrauma > 0 && this.settings.cameraShakeEnabled) {
      const shake = this.cameraTrauma * this.cameraTrauma * 0.4;
      desiredX += (Math.random() - 0.5) * shake;
      desiredY += (Math.random() - 0.5) * shake;
      desiredZ += (Math.random() - 0.5) * shake;
      this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 2.5);
    }

    // FOV kick during boost
    const targetFov = this.ballState.boostTimer > 0 ? 74 : 65;
    this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-8 * dt));
    this.camera.updateProjectionMatrix();

    // Damped camera movement
    this.cameraCurrentPos.x += (desiredX - this.cameraCurrentPos.x) * dampAlpha;
    this.cameraCurrentPos.y += (desiredY - this.cameraCurrentPos.y) * dampAlpha;
    this.cameraCurrentPos.z += (desiredZ - this.cameraCurrentPos.z) * dampAlpha;

    this.camera.position.copy(this.cameraCurrentPos);
    this.camera.lookAt(this.cameraLookTarget);
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
  }

  public onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

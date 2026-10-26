export type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

export type GameMode = 'adventure' | 'time_trial' | 'coin_hunt' | 'endless' | 'practice';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type SurfaceType = 'normal' | 'ice' | 'sticky' | 'bouncy' | 'booster';

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  surfaceType?: SurfaceType;
  color?: number | string;
  isCollapsing?: boolean;
  collapseDelay?: number;
  moveRange?: { x?: number; y?: number; z?: number; speed?: number };
  rotationSpeed?: { x?: number; y?: number; z?: number };
}

export interface ObstacleDef {
  id: string;
  type: 'rotating_bar' | 'hammer' | 'sliding_block' | 'laser' | 'spikes' | 'hazard_ball';
  x: number;
  y: number;
  z: number;
  size?: [number, number, number];
  speed?: number;
  range?: number;
  axis?: 'x' | 'y' | 'z';
  color?: number | string;
}

export interface CollectibleDef {
  id: string;
  type: 'coin' | 'star' | 'gem' | 'boost_capsule';
  x: number;
  y: number;
  z: number;
  points: number;
  collected?: boolean;
}

export interface PowerUpDef {
  id: string;
  type: 'speed_boost' | 'high_jump' | 'shield' | 'magnet';
  x: number;
  y: number;
  z: number;
  duration: number; // in seconds
}

export interface CheckpointDef {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  reached?: boolean;
}

export interface LevelData {
  id: number;
  worldId: number;
  name: string;
  worldName: string;
  theme: 'green_valley' | 'sky_platforms' | 'ice_world' | 'neon_city' | 'lava_challenge' | 'space_adventure' | 'master_challenge';
  description: string;
  targetTime: number; // seconds for 3 stars
  coinTarget: number;
  spawnPoint: Vector3D;
  finishPoint: Vector3D;
  checkpoints: CheckpointDef[];
  platforms: PlatformDef[];
  obstacles: ObstacleDef[];
  collectibles: CollectibleDef[];
  powerUps: PowerUpDef[];
  gravity?: number;
  ambientColor?: number;
  fogColor?: number;
  backgroundColor?: number;
}

export interface BallSkin {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  color: number;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  emissive?: number;
  emissiveIntensity?: number;
  wireframe?: boolean;
  trailColor: string;
  specialEffect?: 'glow' | 'electric' | 'fire' | 'galaxy' | 'rainbow' | 'crystal' | 'neon';
}

export interface GameSettings {
  touchControlMode: 'joystick' | 'drag';
  joystickSensitivity: number;
  cameraSensitivity: number;
  invertCameraY: boolean;
  soundVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  reducedMotion: boolean;
  cameraShakeEnabled: boolean;
  autoRotateCamera: boolean;
}

export interface PlayerProgress {
  unlockedLevel: number;
  coins: number;
  highScores: Record<number, number>;
  bestTimes: Record<number, number>;
  starsEarned: Record<number, number>; // levelId -> stars (1..3)
  selectedSkin: string;
  unlockedSkins: string[];
  achievements: string[];
}

export interface RunStats {
  score: number;
  coinsCollected: number;
  starsCollected: number;
  timeElapsed: number;
  fallsCount: number;
  checkpointsHit: number;
  finalRating: number; // 1, 2, or 3
}

export interface ActivePowerUps {
  speedBoostRemaining: number;
  highJumpRemaining: number;
  shieldRemaining: number;
  magnetRemaining: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  condition: (progress: PlayerProgress, stats?: RunStats) => boolean;
}

import { LevelData, PlatformDef, ObstacleDef, CollectibleDef, PowerUpDef, CheckpointDef } from '../types/game';

export const WORLDS = [
  { id: 1, name: 'World 1: Green Valley', theme: 'green_valley', desc: 'Lush pastures, gentle slopes, and friendly introductory obstacles.' },
  { id: 2, name: 'World 2: Sky Platforms', theme: 'sky_platforms', desc: 'Vertiginous heights, moving airborne islands, and brisk crosswinds.' },
  { id: 3, name: 'World 3: Ice World', theme: 'ice_world', desc: 'Low-friction glacial paths, treacherous frosty turns, and crystal obstacles.' },
  { id: 4, name: 'World 4: Neon City', theme: 'neon_city', desc: 'Futuristic hyper-tracks with supersonic boosters and cybernetic gates.' },
  { id: 5, name: 'World 5: Lava Challenge', theme: 'lava_challenge', desc: 'Molten magma, collapsing bridges, and fierce volcanic geysers.' },
  { id: 6, name: 'World 6: Space Adventure', theme: 'space_adventure', desc: 'Low-gravity celestial orbital tracks and cosmic launch rings.' },
  { id: 7, name: 'World 7: Master Challenge', theme: 'master_challenge', desc: 'The ultimate trial combining the fiercest obstacles in the universe.' },
];

export const LEVELS: LevelData[] = [
  // LEVEL 1: GREEN VALLEY - TUTORIAL & FIRST ROLL
  {
    id: 1,
    worldId: 1,
    name: 'First Roll',
    worldName: 'World 1: Green Valley',
    theme: 'green_valley',
    description: 'Learn the fundamentals of rolling, steering, collecting coins, and jumping small gaps.',
    targetTime: 28,
    coinTarget: 12,
    spawnPoint: { x: 0, y: 1.0, z: 10 },
    finishPoint: { x: 0, y: 1.0, z: -62 },
    checkpoints: [
      { id: 'cp1_1', x: 0, y: 1.0, z: -25, radius: 2.2 },
    ],
    platforms: [
      // Spawn platform (wide & safe)
      { id: 'p1_start', x: 0, y: 0, z: 6, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0x3b82f6 },
      // Path 1
      { id: 'p1_path1', x: 0, y: 0, z: -10, width: 6, height: 1, depth: 16, surfaceType: 'normal', color: 0x10b981 },
      // Checkpoint platform
      { id: 'p1_cp', x: 0, y: 0, z: -25, width: 7, height: 1, depth: 10, surfaceType: 'normal', color: 0x6366f1 },
      // Small gap, then jump platform
      { id: 'p1_jump1', x: 0, y: 0, z: -38, width: 5, height: 1, depth: 10, surfaceType: 'normal', color: 0x10b981 },
      // Finish platform
      { id: 'p1_finish', x: 0, y: 0, z: -58, width: 8, height: 1, depth: 16, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o1_bar', type: 'rotating_bar', x: 0, y: 0.8, z: -12, size: [4.5, 0.4, 0.4], speed: 1.2, axis: 'y', color: 0xef4444 },
    ],
    collectibles: [
      { id: 'c1_1', type: 'coin', x: 0, y: 0.8, z: 2, points: 100 },
      { id: 'c1_2', type: 'coin', x: -1.5, y: 0.8, z: -2, points: 100 },
      { id: 'c1_3', type: 'coin', x: 1.5, y: 0.8, z: -2, points: 100 },
      { id: 'c1_4', type: 'coin', x: 0, y: 0.8, z: -6, points: 100 },
      { id: 'c1_5', type: 'coin', x: 0, y: 0.8, z: -22, points: 100 },
      { id: 'c1_6', type: 'coin', x: -1, y: 0.8, z: -25, points: 100 },
      { id: 'c1_7', type: 'coin', x: 1, y: 0.8, z: -25, points: 100 },
      { id: 'c1_8', type: 'coin', x: 0, y: 0.8, z: -36, points: 100 },
      { id: 'c1_9', type: 'coin', x: 0, y: 0.8, z: -40, points: 100 },
      { id: 'c1_10', type: 'coin', x: 0, y: 0.8, z: -52, points: 100 },
      { id: 'c1_11', type: 'coin', x: -2, y: 0.8, z: -56, points: 100 },
      { id: 'c1_12', type: 'coin', x: 2, y: 0.8, z: -56, points: 100 },
      // 3 Hidden stars
      { id: 'star1_1', type: 'star', x: 2.2, y: 1.0, z: 6, points: 500 },
      { id: 'star1_2', type: 'star', x: 0, y: 1.6, z: -32, points: 500 }, // Mid-air over gap
      { id: 'star1_3', type: 'star', x: -2.5, y: 1.0, z: -60, points: 500 },
    ],
    powerUps: [
      { id: 'pw1_boost', type: 'speed_boost', x: 0, y: 0.8, z: -28, duration: 6 },
    ],
    gravity: -24,
    backgroundColor: 0x87ceeb,
    fogColor: 0xa0e0ff,
  },

  // LEVEL 2: SKY PLATFORMS - MOVING PLATFORMS & NARROW PATHS
  {
    id: 2,
    worldId: 2,
    name: 'Sky Islands',
    worldName: 'World 2: Sky Platforms',
    theme: 'sky_platforms',
    description: 'Precision balance across floating bridges with moving connecting platforms.',
    targetTime: 36,
    coinTarget: 14,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 1.0, z: -78 },
    checkpoints: [
      { id: 'cp2_1', x: 0, y: 1.0, z: -32, radius: 2.5 },
    ],
    platforms: [
      { id: 'p2_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0x38bdf8 },
      // Narrow beam 1
      { id: 'p2_beam1', x: 0, y: 0, z: -8, width: 2.5, height: 1, depth: 16, surfaceType: 'normal', color: 0x0284c7 },
      // Moving platform 1 (moves horizontally left-right)
      { id: 'p2_move1', x: 0, y: 0, z: -20, width: 4.5, height: 0.8, depth: 5, surfaceType: 'normal', color: 0x06b6d4, moveRange: { x: 4, speed: 2 } },
      // Checkpoint island
      { id: 'p2_island', x: 0, y: 0, z: -32, width: 6.5, height: 1, depth: 8, surfaceType: 'normal', color: 0x38bdf8 },
      // Moving platform 2 (moves vertically)
      { id: 'p2_move2', x: 0, y: 0, z: -43, width: 4.5, height: 0.8, depth: 5, surfaceType: 'normal', color: 0x06b6d4, moveRange: { y: 2.5, speed: 1.8 } },
      // Elevated narrow bridge
      { id: 'p2_beam2', x: 0, y: 2.5, z: -56, width: 2.2, height: 1, depth: 16, surfaceType: 'normal', color: 0x0284c7 },
      // Finish island
      { id: 'p2_finish', x: 0, y: 2.5, z: -76, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o2_hammer1', type: 'hammer', x: 0, y: 1.8, z: -8, size: [0.6, 2.8, 0.6], speed: 2.2, axis: 'x', color: 0xf43f5e },
      { id: 'o2_hammer2', type: 'hammer', x: 0, y: 4.2, z: -56, size: [0.6, 2.8, 0.6], speed: 2.5, axis: 'x', color: 0xf43f5e },
    ],
    collectibles: [
      { id: 'c2_1', type: 'coin', x: 0, y: 0.8, z: 4, points: 100 },
      { id: 'c2_2', type: 'coin', x: 0, y: 0.8, z: -4, points: 100 },
      { id: 'c2_3', type: 'coin', x: 0, y: 0.8, z: -12, points: 100 },
      { id: 'c2_4', type: 'coin', x: 0, y: 0.8, z: -20, points: 100 },
      { id: 'c2_5', type: 'coin', x: -1.5, y: 0.8, z: -32, points: 100 },
      { id: 'c2_6', type: 'coin', x: 1.5, y: 0.8, z: -32, points: 100 },
      { id: 'c2_7', type: 'coin', x: 0, y: 0.8, z: -43, points: 100 },
      { id: 'c2_8', type: 'coin', x: 0, y: 3.3, z: -50, points: 100 },
      { id: 'c2_9', type: 'coin', x: 0, y: 3.3, z: -62, points: 100 },
      { id: 'c2_10', type: 'coin', x: 0, y: 3.3, z: -72, points: 100 },
      // Stars
      { id: 'star2_1', type: 'star', x: 0, y: 1.8, z: -20, points: 500 },
      { id: 'star2_2', type: 'star', x: 0, y: 4.2, z: -43, points: 500 },
      { id: 'star2_3', type: 'star', x: 0, y: 3.5, z: -76, points: 500 },
    ],
    powerUps: [
      { id: 'pw2_jump', type: 'high_jump', x: 0, y: 0.8, z: -30, duration: 8 },
    ],
    gravity: -24,
    backgroundColor: 0x60a5fa,
    fogColor: 0x93c5fd,
  },

  // LEVEL 3: ICE WORLD - SLIPPERY CHALLENGE
  {
    id: 3,
    worldId: 3,
    name: 'Glacial Slide',
    worldName: 'World 3: Ice World',
    theme: 'ice_world',
    description: 'Ice reduces friction dramatically! Master the brake control to stop safely before drop-offs.',
    targetTime: 40,
    coinTarget: 16,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 1.0, z: -86 },
    checkpoints: [
      { id: 'cp3_1', x: 0, y: 1.0, z: -36, radius: 2.5 },
    ],
    platforms: [
      { id: 'p3_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0xbae6fd },
      // Ice slide section 1
      { id: 'p3_ice1', x: 0, y: 0, z: -10, width: 6, height: 1, depth: 20, surfaceType: 'ice', color: 0xe0f2fe },
      // Bounce pad launcher
      { id: 'p3_bounce', x: 0, y: 0, z: -24, width: 4, height: 1, depth: 4, surfaceType: 'bouncy', color: 0xec4899 },
      // Checkpoint safe zone
      { id: 'p3_cp', x: 0, y: 1, z: -36, width: 7, height: 1, depth: 10, surfaceType: 'normal', color: 0x38bdf8 },
      // Narrow winding ice curves
      { id: 'p3_ice2', x: 2, y: 1, z: -50, width: 4, height: 1, depth: 14, surfaceType: 'ice', color: 0xe0f2fe },
      { id: 'p3_ice3', x: -2, y: 1, z: -64, width: 4, height: 1, depth: 14, surfaceType: 'ice', color: 0xe0f2fe },
      // Finish platform
      { id: 'p3_finish', x: 0, y: 1, z: -84, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o3_laser1', type: 'laser', x: 0, y: 1.5, z: -12, size: [5.5, 0.3, 0.3], speed: 1.8, axis: 'x', color: 0x06b6d4 },
      { id: 'o3_block1', type: 'sliding_block', x: 2, y: 1.8, z: -50, size: [1.8, 1.8, 1.8], speed: 2.0, range: 2.5, axis: 'x', color: 0x0284c7 },
    ],
    collectibles: [
      { id: 'c3_1', type: 'coin', x: 0, y: 0.8, z: 2, points: 100 },
      { id: 'c3_2', type: 'coin', x: -1.5, y: 0.8, z: -6, points: 100 },
      { id: 'c3_3', type: 'coin', x: 1.5, y: 0.8, z: -6, points: 100 },
      { id: 'c3_4', type: 'coin', x: 0, y: 0.8, z: -14, points: 100 },
      { id: 'c3_5', type: 'coin', x: 0, y: 0.8, z: -18, points: 100 },
      { id: 'c3_6', type: 'coin', x: 0, y: 1.8, z: -36, points: 100 },
      { id: 'c3_7', type: 'coin', x: 2, y: 1.8, z: -46, points: 100 },
      { id: 'c3_8', type: 'coin', x: 2, y: 1.8, z: -54, points: 100 },
      { id: 'c3_9', type: 'coin', x: -2, y: 1.8, z: -60, points: 100 },
      { id: 'c3_10', type: 'coin', x: -2, y: 1.8, z: -68, points: 100 },
      { id: 'c3_11', type: 'coin', x: 0, y: 1.8, z: -76, points: 100 },
      { id: 'c3_12', type: 'coin', x: 0, y: 1.8, z: -80, points: 100 },
      // Stars
      { id: 'star3_1', type: 'star', x: 0, y: 4.5, z: -24, points: 500 }, // High above bounce pad
      { id: 'star3_2', type: 'star', x: -3.2, y: 1.8, z: -64, points: 500 }, // Perilous edge
      { id: 'star3_3', type: 'star', x: 0, y: 2.0, z: -84, points: 500 },
    ],
    powerUps: [
      { id: 'pw3_shield', type: 'shield', x: 0, y: 1.8, z: -38, duration: 10 },
    ],
    gravity: -24,
    backgroundColor: 0xcffafe,
    fogColor: 0xe0f2fe,
  },

  // LEVEL 4: NEON CITY - BOOST PADS & ROTATING BARS
  {
    id: 4,
    worldId: 4,
    name: 'Cyber Velocity',
    worldName: 'World 4: Neon City',
    theme: 'neon_city',
    description: 'High-speed booster pads and electric laser gates through a cybernetic highway.',
    targetTime: 34,
    coinTarget: 18,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 1.0, z: -88 },
    checkpoints: [
      { id: 'cp4_1', x: 0, y: 1.0, z: -36, radius: 2.5 },
    ],
    platforms: [
      { id: 'p4_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0x1e1b4b },
      // Booster strip 1
      { id: 'p4_boost1', x: 0, y: 0, z: -6, width: 4, height: 1, depth: 10, surfaceType: 'booster', color: 0x06b6d4 },
      // High speed track
      { id: 'p4_track1', x: 0, y: 0, z: -20, width: 5, height: 1, depth: 14, surfaceType: 'normal', color: 0x4338ca },
      // Checkpoint hub
      { id: 'p4_cp', x: 0, y: 0, z: -36, width: 7, height: 1, depth: 10, surfaceType: 'normal', color: 0xa855f7 },
      // Booster strip 2
      { id: 'p4_boost2', x: 0, y: 0, z: -48, width: 4, height: 1, depth: 10, surfaceType: 'booster', color: 0x06b6d4 },
      // Ramp platform
      { id: 'p4_track2', x: 0, y: 0, z: -66, width: 5, height: 1, depth: 18, surfaceType: 'normal', color: 0x4338ca },
      // Finish platform
      { id: 'p4_finish', x: 0, y: 0, z: -86, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o4_bar1', type: 'rotating_bar', x: 0, y: 0.8, z: -20, size: [4.8, 0.4, 0.4], speed: 2.4, axis: 'y', color: 0xec4899 },
      { id: 'o4_laser1', type: 'laser', x: 0, y: 0.8, z: -62, size: [4.8, 0.3, 0.3], speed: 2.2, axis: 'x', color: 0x10b981 },
      { id: 'o4_bar2', type: 'rotating_bar', x: 0, y: 0.8, z: -70, size: [4.8, 0.4, 0.4], speed: -2.8, axis: 'y', color: 0xec4899 },
    ],
    collectibles: [
      { id: 'c4_1', type: 'coin', x: 0, y: 0.8, z: 0, points: 100 },
      { id: 'c4_2', type: 'coin', x: 0, y: 0.8, z: -8, points: 100 },
      { id: 'c4_3', type: 'coin', x: -1.5, y: 0.8, z: -16, points: 100 },
      { id: 'c4_4', type: 'coin', x: 1.5, y: 0.8, z: -16, points: 100 },
      { id: 'c4_5', type: 'coin', x: 0, y: 0.8, z: -24, points: 100 },
      { id: 'c4_6', type: 'coin', x: -2, y: 0.8, z: -36, points: 100 },
      { id: 'c4_7', type: 'coin', x: 2, y: 0.8, z: -36, points: 100 },
      { id: 'c4_8', type: 'coin', x: 0, y: 0.8, z: -46, points: 100 },
      { id: 'c4_9', type: 'coin', x: 0, y: 0.8, z: -52, points: 100 },
      { id: 'c4_10', type: 'coin', x: -1.5, y: 0.8, z: -66, points: 100 },
      { id: 'c4_11', type: 'coin', x: 1.5, y: 0.8, z: -66, points: 100 },
      { id: 'c4_12', type: 'coin', x: 0, y: 0.8, z: -74, points: 100 },
      // Stars
      { id: 'star4_1', type: 'star', x: 0, y: 1.8, z: -12, points: 500 },
      { id: 'star4_2', type: 'star', x: 0, y: 2.2, z: -54, points: 500 },
      { id: 'star4_3', type: 'star', x: 0, y: 1.8, z: -86, points: 500 },
    ],
    powerUps: [
      { id: 'pw4_magnet', type: 'magnet', x: 0, y: 0.8, z: -36, duration: 12 },
    ],
    gravity: -24,
    backgroundColor: 0x0f172a,
    fogColor: 0x1e1b4b,
  },

  // LEVEL 5: LAVA CHALLENGE - COLLAPSING & HAZARDS
  {
    id: 5,
    worldId: 5,
    name: 'Infernal Caldera',
    worldName: 'World 5: Lava Challenge',
    theme: 'lava_challenge',
    description: 'Blazing lava rocks and collapsing bridge stepping stones require swift reflexes.',
    targetTime: 42,
    coinTarget: 15,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 1.0, z: -92 },
    checkpoints: [
      { id: 'cp5_1', x: 0, y: 1.0, z: -40, radius: 2.5 },
    ],
    platforms: [
      { id: 'p5_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0x451a03 },
      // Stepping stones
      { id: 'p5_step1', x: -2, y: 0, z: -6, width: 3.5, height: 1, depth: 4, surfaceType: 'normal', color: 0x78350f },
      { id: 'p5_step2', x: 2, y: 0, z: -14, width: 3.5, height: 1, depth: 4, surfaceType: 'normal', color: 0x78350f },
      { id: 'p5_step3', x: 0, y: 0, z: -24, width: 3.5, height: 1, depth: 5, surfaceType: 'normal', color: 0x78350f },
      // Checkpoint refuge
      { id: 'p5_cp', x: 0, y: 0, z: -40, width: 7, height: 1, depth: 10, surfaceType: 'normal', color: 0xd97706 },
      // Narrow lava ridge
      { id: 'p5_ridge', x: 0, y: 0, z: -58, width: 2.4, height: 1, depth: 18, surfaceType: 'normal', color: 0x78350f },
      // Moving platform over boiling magma
      { id: 'p5_move', x: 0, y: 0, z: -74, width: 4, height: 0.8, depth: 4.5, surfaceType: 'normal', color: 0xb45309, moveRange: { x: 3.5, speed: 2.2 } },
      // Finish bastion
      { id: 'p5_finish', x: 0, y: 0, z: -90, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o5_hammer1', type: 'hammer', x: 0, y: 1.8, z: -58, size: [0.6, 2.8, 0.6], speed: 2.6, axis: 'x', color: 0xdc2626 },
      { id: 'o5_bar1', type: 'rotating_bar', x: 0, y: 0.8, z: -24, size: [4.2, 0.4, 0.4], speed: 2.0, axis: 'y', color: 0xdc2626 },
    ],
    collectibles: [
      { id: 'c5_1', type: 'coin', x: 0, y: 0.8, z: 2, points: 100 },
      { id: 'c5_2', type: 'coin', x: -2, y: 0.8, z: -6, points: 100 },
      { id: 'c5_3', type: 'coin', x: 2, y: 0.8, z: -14, points: 100 },
      { id: 'c5_4', type: 'coin', x: 0, y: 0.8, z: -24, points: 100 },
      { id: 'c5_5', type: 'coin', x: -1.5, y: 0.8, z: -40, points: 100 },
      { id: 'c5_6', type: 'coin', x: 1.5, y: 0.8, z: -40, points: 100 },
      { id: 'c5_7', type: 'coin', x: 0, y: 0.8, z: -52, points: 100 },
      { id: 'c5_8', type: 'coin', x: 0, y: 0.8, z: -64, points: 100 },
      { id: 'c5_9', type: 'coin', x: 0, y: 0.8, z: -74, points: 100 },
      { id: 'c5_10', type: 'coin', x: 0, y: 0.8, z: -86, points: 100 },
      // Stars
      { id: 'star5_1', type: 'star', x: 0, y: 2.0, z: -10, points: 500 }, // Mid-air jump between stepping stones
      { id: 'star5_2', type: 'star', x: 0, y: 1.8, z: -58, points: 500 },
      { id: 'star5_3', type: 'star', x: 0, y: 2.0, z: -90, points: 500 },
    ],
    powerUps: [
      { id: 'pw5_shield', type: 'shield', x: 0, y: 0.8, z: -38, duration: 12 },
    ],
    gravity: -24,
    backgroundColor: 0x450a0a,
    fogColor: 0x7f1d1d,
  },

  // LEVEL 6: SPACE ADVENTURE - LOW GRAVITY & LAUNCH PADS
  {
    id: 6,
    worldId: 6,
    name: 'Orbital Odyssey',
    worldName: 'World 6: Space Adventure',
    theme: 'space_adventure',
    description: 'Reduced gravity enables soaring leaps! Time your boosters to traverse vast cosmic voids.',
    targetTime: 45,
    coinTarget: 20,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 2.0, z: -96 },
    checkpoints: [
      { id: 'cp6_1', x: 0, y: 1.0, z: -42, radius: 2.5 },
    ],
    platforms: [
      { id: 'p6_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0x1e293b },
      // Launch bouncy pad 1
      { id: 'p6_launch1', x: 0, y: 0, z: -8, width: 4.5, height: 1, depth: 4.5, surfaceType: 'bouncy', color: 0xa855f7 },
      // Floating celestial platform 1
      { id: 'p6_float1', x: 0, y: 4, z: -26, width: 5.5, height: 1, depth: 8, surfaceType: 'normal', color: 0x334155 },
      // Checkpoint station
      { id: 'p6_cp', x: 0, y: 2, z: -42, width: 7, height: 1, depth: 10, surfaceType: 'normal', color: 0x6366f1 },
      // Booster launch
      { id: 'p6_boost', x: 0, y: 2, z: -56, width: 4, height: 1, depth: 8, surfaceType: 'booster', color: 0x06b6d4 },
      // Distant asteroid platform
      { id: 'p6_ast1', x: 0, y: 3, z: -78, width: 5.5, height: 1, depth: 8, surfaceType: 'normal', color: 0x334155 },
      // Finish mothership
      { id: 'p6_finish', x: 0, y: 2, z: -96, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o6_laser1', type: 'laser', x: 0, y: 4.8, z: -26, size: [5.2, 0.3, 0.3], speed: 1.8, axis: 'x', color: 0x38bdf8 },
      { id: 'o6_hammer', type: 'hammer', x: 0, y: 4.5, z: -78, size: [0.6, 2.8, 0.6], speed: 2.4, axis: 'x', color: 0xc084fc },
    ],
    collectibles: [
      { id: 'c6_1', type: 'coin', x: 0, y: 0.8, z: 2, points: 100 },
      { id: 'c6_2', type: 'coin', x: 0, y: 0.8, z: -4, points: 100 },
      { id: 'c6_3', type: 'coin', x: 0, y: 5.0, z: -16, points: 100 }, // High in the air
      { id: 'c6_4', type: 'coin', x: 0, y: 4.8, z: -24, points: 100 },
      { id: 'c6_5', type: 'coin', x: 0, y: 4.8, z: -30, points: 100 },
      { id: 'c6_6', type: 'coin', x: -1.5, y: 2.8, z: -42, points: 100 },
      { id: 'c6_7', type: 'coin', x: 1.5, y: 2.8, z: -42, points: 100 },
      { id: 'c6_8', type: 'coin', x: 0, y: 2.8, z: -54, points: 100 },
      { id: 'c6_9', type: 'coin', x: 0, y: 4.5, z: -68, points: 100 },
      { id: 'c6_10', type: 'coin', x: 0, y: 3.8, z: -76, points: 100 },
      { id: 'c6_11', type: 'coin', x: 0, y: 3.8, z: -82, points: 100 },
      { id: 'c6_12', type: 'coin', x: 0, y: 2.8, z: -92, points: 100 },
      // Stars
      { id: 'star6_1', type: 'star', x: 0, y: 6.5, z: -17, points: 500 }, // Apex of jump
      { id: 'star6_2', type: 'star', x: 0, y: 5.5, z: -67, points: 500 }, // Apex of booster flight
      { id: 'star6_3', type: 'star', x: 0, y: 3.0, z: -96, points: 500 },
    ],
    powerUps: [
      { id: 'pw6_jump', type: 'high_jump', x: 0, y: 2.8, z: -40, duration: 12 },
    ],
    gravity: -14, // Lower gravity for floaty cosmic jumps!
    backgroundColor: 0x050510,
    fogColor: 0x0b0f2a,
  },

  // LEVEL 7: MASTER CHALLENGE - THE GAUNTLET
  {
    id: 7,
    worldId: 7,
    name: 'Apex Labyrinth',
    worldName: 'World 7: Master Challenge',
    theme: 'master_challenge',
    description: 'The supreme test: rotating bars, sliding blocks, narrow bridges, icy corners, and moving elevators.',
    targetTime: 50,
    coinTarget: 25,
    spawnPoint: { x: 0, y: 1.0, z: 12 },
    finishPoint: { x: 0, y: 3.0, z: -108 },
    checkpoints: [
      { id: 'cp7_1', x: 0, y: 1.0, z: -38, radius: 2.5 },
      { id: 'cp7_2', x: 0, y: 2.0, z: -76, radius: 2.5 },
    ],
    platforms: [
      { id: 'p7_start', x: 0, y: 0, z: 8, width: 7, height: 1, depth: 12, surfaceType: 'normal', color: 0x312e81 },
      // Obstacle path 1
      { id: 'p7_path1', x: 0, y: 0, z: -12, width: 4.5, height: 1, depth: 20, surfaceType: 'normal', color: 0x4338ca },
      // Narrow bridge with moving platform
      { id: 'p7_move1', x: 0, y: 0, z: -27, width: 4.2, height: 0.8, depth: 4.5, surfaceType: 'normal', color: 0x6366f1, moveRange: { x: 3.5, speed: 2.4 } },
      // Checkpoint 1
      { id: 'p7_cp1', x: 0, y: 0, z: -38, width: 6.5, height: 1, depth: 8, surfaceType: 'normal', color: 0x7c3aed },
      // Ice curve section
      { id: 'p7_ice', x: 2, y: 0, z: -52, width: 4, height: 1, depth: 16, surfaceType: 'ice', color: 0xbae6fd },
      // Bouncy launch platform
      { id: 'p7_bounce', x: 0, y: 0, z: -65, width: 4, height: 1, depth: 4, surfaceType: 'bouncy', color: 0xec4899 },
      // Checkpoint 2 (elevated)
      { id: 'p7_cp2', x: 0, y: 2, z: -76, width: 6.5, height: 1, depth: 8, surfaceType: 'normal', color: 0x7c3aed },
      // Final narrow gauntlet
      { id: 'p7_gauntlet', x: 0, y: 2, z: -92, width: 2.4, height: 1, depth: 18, surfaceType: 'normal', color: 0x4338ca },
      // Finish monument
      { id: 'p7_finish', x: 0, y: 3, z: -108, width: 8, height: 1, depth: 14, surfaceType: 'normal', color: 0xf59e0b },
    ],
    obstacles: [
      { id: 'o7_bar1', type: 'rotating_bar', x: 0, y: 0.8, z: -8, size: [4.2, 0.4, 0.4], speed: 2.2, axis: 'y', color: 0xef4444 },
      { id: 'o7_bar2', type: 'rotating_bar', x: 0, y: 0.8, z: -16, size: [4.2, 0.4, 0.4], speed: -2.5, axis: 'y', color: 0xef4444 },
      { id: 'o7_block', type: 'sliding_block', x: 2, y: 0.8, z: -52, size: [1.8, 1.8, 1.8], speed: 2.4, range: 2.2, axis: 'x', color: 0xdc2626 },
      { id: 'o7_hammer', type: 'hammer', x: 0, y: 3.8, z: -92, size: [0.6, 2.8, 0.6], speed: 2.8, axis: 'x', color: 0xef4444 },
    ],
    collectibles: [
      { id: 'c7_1', type: 'coin', x: 0, y: 0.8, z: 2, points: 100 },
      { id: 'c7_2', type: 'coin', x: -1.2, y: 0.8, z: -4, points: 100 },
      { id: 'c7_3', type: 'coin', x: 1.2, y: 0.8, z: -4, points: 100 },
      { id: 'c7_4', type: 'coin', x: 0, y: 0.8, z: -12, points: 100 },
      { id: 'c7_5', type: 'coin', x: 0, y: 0.8, z: -27, points: 100 },
      { id: 'c7_6', type: 'coin', x: 0, y: 0.8, z: -38, points: 100 },
      { id: 'c7_7', type: 'coin', x: 2, y: 0.8, z: -48, points: 100 },
      { id: 'c7_8', type: 'coin', x: 2, y: 0.8, z: -56, points: 100 },
      { id: 'c7_9', type: 'coin', x: 0, y: 2.8, z: -76, points: 100 },
      { id: 'c7_10', type: 'coin', x: 0, y: 2.8, z: -86, points: 100 },
      { id: 'c7_11', type: 'coin', x: 0, y: 2.8, z: -98, points: 100 },
      { id: 'c7_12', type: 'coin', x: 0, y: 3.8, z: -106, points: 100 },
      // Stars
      { id: 'star7_1', type: 'star', x: 0, y: 2.0, z: -27, points: 500 },
      { id: 'star7_2', type: 'star', x: 0, y: 5.0, z: -65, points: 500 }, // High bounce jump
      { id: 'star7_3', type: 'star', x: 0, y: 4.2, z: -108, points: 500 },
    ],
    powerUps: [
      { id: 'pw7_boost', type: 'speed_boost', x: 0, y: 0.8, z: -36, duration: 8 },
      { id: 'pw7_shield', type: 'shield', x: 0, y: 2.8, z: -74, duration: 10 },
    ],
    gravity: -24,
    backgroundColor: 0x18181b,
    fogColor: 0x27272a,
  },
];

/**
 * Generate dynamic endless runner level segment
 */
export function generateEndlessSegment(segmentIndex: number): LevelData {
  const zOffset = -segmentIndex * 70;
  const colors = [0x10b981, 0x06b6d4, 0x38bdf8, 0x8b5cf6, 0xf59e0b];
  const color = colors[segmentIndex % colors.length];

  return {
    id: 999 + segmentIndex,
    worldId: 1,
    name: `Endless Stage ${segmentIndex + 1}`,
    worldName: 'Endless Challenge',
    theme: 'neon_city',
    description: 'Keep rolling as far as possible without falling!',
    targetTime: 60,
    coinTarget: 20,
    spawnPoint: { x: 0, y: 1.0, z: zOffset + 10 },
    finishPoint: { x: 0, y: 1.0, z: zOffset - 60 },
    checkpoints: [
      { id: `endless_cp_${segmentIndex}`, x: 0, y: 1.0, z: zOffset - 25, radius: 2.5 },
    ],
    platforms: [
      { id: `ep_1_${segmentIndex}`, x: 0, y: 0, z: zOffset + 5, width: 6, height: 1, depth: 14, color },
      { id: `ep_2_${segmentIndex}`, x: 0, y: 0, z: zOffset - 12, width: 4.5, height: 1, depth: 14, color },
      { id: `ep_3_${segmentIndex}`, x: 0, y: 0, z: zOffset - 25, width: 6.5, height: 1, depth: 8, color: 0x6366f1 },
      { id: `ep_4_${segmentIndex}`, x: (segmentIndex % 2 === 0 ? 1 : -1) * 2, y: 0, z: zOffset - 40, width: 4, height: 1, depth: 16, color },
      { id: `ep_5_${segmentIndex}`, x: 0, y: 0, z: zOffset - 58, width: 7, height: 1, depth: 12, color: 0xf59e0b },
    ],
    obstacles: [
      {
        id: `eo_1_${segmentIndex}`,
        type: segmentIndex % 2 === 0 ? 'rotating_bar' : 'hammer',
        x: 0,
        y: 0.8,
        z: zOffset - 12,
        size: [4.2, 0.4, 0.4],
        speed: 2.0 + (segmentIndex * 0.2),
        axis: 'y',
        color: 0xef4444,
      },
    ],
    collectibles: [
      { id: `ec_1_${segmentIndex}`, type: 'coin', x: 0, y: 0.8, z: zOffset + 2, points: 100 },
      { id: `ec_2_${segmentIndex}`, type: 'coin', x: 0, y: 0.8, z: zOffset - 4, points: 100 },
      { id: `ec_3_${segmentIndex}`, type: 'coin', x: 0, y: 0.8, z: zOffset - 10, points: 100 },
      { id: `ec_4_${segmentIndex}`, type: 'coin', x: 0, y: 0.8, z: zOffset - 25, points: 100 },
      { id: `ec_5_${segmentIndex}`, type: 'coin', x: 0, y: 0.8, z: zOffset - 40, points: 100 },
      { id: `ec_star_${segmentIndex}`, type: 'star', x: 0, y: 1.8, z: zOffset - 18, points: 500 },
    ],
    powerUps: [
      { id: `epw_${segmentIndex}`, type: 'speed_boost', x: 0, y: 0.8, z: zOffset - 25, duration: 6 },
    ],
    gravity: -24,
  };
}

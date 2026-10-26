import { GameSettings, PlayerProgress } from '../types/game';

const PROGRESS_KEY = 'ball_adventure_progress_v1';
const SETTINGS_KEY = 'ball_adventure_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  touchControlMode: 'joystick',
  joystickSensitivity: 1.0,
  cameraSensitivity: 1.0,
  invertCameraY: false,
  soundVolume: 0.8,
  musicVolume: 0.6,
  soundEnabled: true,
  graphicsQuality: 'high',
  reducedMotion: false,
  cameraShakeEnabled: true,
  autoRotateCamera: true,
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  coins: 50, // Starting bonus for nice first-time play
  highScores: {},
  bestTimes: {},
  starsEarned: {},
  selectedSkin: 'classic',
  unlockedSkins: ['classic'],
  achievements: [],
};

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      unlockedLevel: typeof parsed.unlockedLevel === 'number' ? parsed.unlockedLevel : 1,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      highScores: parsed.highScores || {},
      bestTimes: parsed.bestTimes || {},
      starsEarned: parsed.starsEarned || {},
      selectedSkin: parsed.selectedSkin || 'classic',
      unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ['classic'],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage might be disabled in private mode or full
  }
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      touchControlMode: parsed.touchControlMode === 'drag' ? 'drag' : 'joystick',
      joystickSensitivity: typeof parsed.joystickSensitivity === 'number' ? parsed.joystickSensitivity : 1.0,
      cameraSensitivity: typeof parsed.cameraSensitivity === 'number' ? parsed.cameraSensitivity : 1.0,
      invertCameraY: Boolean(parsed.invertCameraY),
      soundVolume: typeof parsed.soundVolume === 'number' ? parsed.soundVolume : 0.8,
      musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.6,
      soundEnabled: parsed.soundEnabled !== false,
      graphicsQuality: ['low', 'medium', 'high'].includes(parsed.graphicsQuality) ? parsed.graphicsQuality : 'high',
      reducedMotion: Boolean(parsed.reducedMotion),
      cameraShakeEnabled: parsed.cameraShakeEnabled !== false,
      autoRotateCamera: parsed.autoRotateCamera !== false,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage silent fail
  }
}

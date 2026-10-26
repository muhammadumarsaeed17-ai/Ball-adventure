import { AchievementDef, LevelData, PlayerProgress, RunStats } from '../types/game';

/**
 * Calculates final score from run metrics
 */
export function calculateLevelScore(
  targetTime: number,
  timeElapsed: number,
  coinsCollected: number,
  starsCollected: number,
  fallsCount: number
): number {
  const basePoints = 1000;
  const coinPoints = coinsCollected * 100;
  const starPoints = starsCollected * 500;
  const timeBonus = Math.max(0, Math.round((targetTime - timeElapsed) * 60));
  const fallPenalty = fallsCount * 150;

  const rawScore = basePoints + coinPoints + starPoints + timeBonus - fallPenalty;
  return Math.max(500, rawScore);
}

/**
 * Calculates star rating (1, 2, or 3 stars)
 */
export function calculateStarRating(
  level: LevelData,
  timeElapsed: number,
  coinsCollected: number,
  starsCollected: number,
  fallsCount: number
): number {
  const metTargetTime = timeElapsed <= level.targetTime;
  const metCoinThreshold = coinsCollected >= Math.floor(level.coinTarget * 0.7);
  const collectedAllStars = starsCollected >= 3;
  const cleanRun = fallsCount === 0;

  if ((metTargetTime && metCoinThreshold) || (collectedAllStars && cleanRun)) {
    return 3;
  }

  if (metTargetTime || metCoinThreshold || starsCollected >= 2) {
    return 2;
  }

  return 1;
}

/**
 * List of all available achievements in the game
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_roll',
    title: 'First Roll',
    description: 'Complete your first level in Green Valley',
    icon: '🎯',
    rewardCoins: 50,
    condition: (progress) => progress.unlockedLevel > 1 || Object.keys(progress.starsEarned).length > 0,
  },
  {
    id: 'coin_collector',
    title: 'Coin Hoarder',
    description: 'Accumulate 100 total gold coins',
    icon: '💰',
    rewardCoins: 100,
    condition: (progress) => progress.coins >= 100,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Beat any level target time with seconds to spare',
    icon: '⚡',
    rewardCoins: 150,
    condition: (_progress, stats) => (stats ? stats.timeElapsed < 25 && stats.finalRating >= 2 : false),
  },
  {
    id: 'no_falling',
    title: 'Solid Balance',
    description: 'Complete a level without falling a single time',
    icon: '🛡️',
    rewardCoins: 200,
    condition: (_progress, stats) => (stats ? stats.fallsCount === 0 : false),
  },
  {
    id: 'three_stars_master',
    title: 'Perfectionist',
    description: 'Earn a 3-star rating on any level',
    icon: '⭐',
    rewardCoins: 250,
    condition: (progress) => Object.values(progress.starsEarned).some((stars) => stars >= 3),
  },
  {
    id: 'skin_collector',
    title: 'Fashion Roller',
    description: 'Unlock 3 or more ball custom styles',
    icon: '🔮',
    rewardCoins: 300,
    condition: (progress) => progress.unlockedSkins.length >= 3,
  },
  {
    id: 'sky_voyager',
    title: 'Sky Platformer',
    description: 'Reach and unlock World 3',
    icon: '☁️',
    rewardCoins: 250,
    condition: (progress) => progress.unlockedLevel >= 3,
  },
  {
    id: 'grand_champion',
    title: 'Ball Master',
    description: 'Complete all 7 worlds in Adventure mode',
    icon: '👑',
    rewardCoins: 1000,
    condition: (progress) => progress.unlockedLevel >= 8 || Object.keys(progress.starsEarned).length >= 7,
  },
];

/**
 * Checks for newly unlocked achievements given current player progress & stats
 */
export function checkNewAchievements(
  progress: PlayerProgress,
  stats?: RunStats
): AchievementDef[] {
  const currentIds = new Set(progress.achievements);
  const newlyUnlocked: AchievementDef[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!currentIds.has(ach.id) && ach.condition(progress, stats)) {
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

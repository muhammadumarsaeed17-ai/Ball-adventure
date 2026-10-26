import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevelScore, calculateStarRating, checkNewAchievements } from './rules';
import { LevelData, PlayerProgress } from '../types/game';

test('calculateLevelScore awards bonuses and computes correct score', () => {
  const targetTime = 40;
  const timeElapsed = 30; // 10s faster -> 600 bonus
  const coinsCollected = 8; // 800
  const starsCollected = 2; // 1000
  const fallsCount = 0;

  const score = calculateLevelScore(targetTime, timeElapsed, coinsCollected, starsCollected, fallsCount);
  // Base 1000 + 800 + 1000 + 600 = 3400
  assert.equal(score, 3400);
});

test('calculateStarRating awards 3 stars for beating target time and coins target', () => {
  const mockLevel: LevelData = {
    id: 1,
    worldId: 1,
    name: 'Tutorial',
    worldName: 'Green Valley',
    theme: 'green_valley',
    description: 'Learn to roll',
    targetTime: 30,
    coinTarget: 10,
    spawnPoint: { x: 0, y: 1, z: 0 },
    finishPoint: { x: 0, y: 1, z: -50 },
    checkpoints: [],
    platforms: [],
    obstacles: [],
    collectibles: [],
    powerUps: [],
  };

  const stars = calculateStarRating(mockLevel, 25, 8, 3, 0);
  assert.equal(stars, 3);
});

test('checkNewAchievements triggers first_roll when level is completed', () => {
  const initialProgress: PlayerProgress = {
    unlockedLevel: 2,
    coins: 10,
    highScores: {},
    bestTimes: {},
    starsEarned: { 1: 3 },
    selectedSkin: 'classic',
    unlockedSkins: ['classic'],
    achievements: [],
  };

  const unlocked = checkNewAchievements(initialProgress);
  assert.ok(unlocked.some((a) => a.id === 'first_roll'));
});

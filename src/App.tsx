import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameMode, GameSettings, GameState, LevelData, PlayerProgress, RunStats } from './types/game';
import { LEVELS, generateEndlessSegment } from './game/levels';
import { BALL_SKINS } from './game/ballSkins';
import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, loadGameSettings, loadPlayerProgress, saveGameSettings, savePlayerProgress } from './game/storage';
import { calculateLevelScore, calculateStarRating, checkNewAchievements } from './game/rules';
import { soundManager } from './game/audio';

import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { PauseModal } from './components/Modals/PauseModal';
import { VictoryModal } from './components/Modals/VictoryModal';
import { LevelSelectModal } from './components/Modals/LevelSelectModal';
import { SkinsModal } from './components/Modals/SkinsModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { HowToPlayModal } from './components/Modals/HowToPlayModal';
import { AchievementsModal } from './components/Modals/AchievementsModal';

export const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level Game States
  const [gameState, setGameState] = useState<GameState>('title');
  const [activeModal, setActiveModal] = useState<'levels' | 'skins' | 'settings' | 'guide' | 'achievements' | null>(null);

  // Persistent user data
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);
  const [isMuted, setIsMuted] = useState(false);

  // Active level & mode
  const [currentLevel, setCurrentLevel] = useState<LevelData>(LEVELS[0]);
  const [gameMode, setGameMode] = useState<GameMode>('adventure');
  const [endlessSegmentIdx, setEndlessSegmentIdx] = useState(0);

  // Real-time HUD states (throttled)
  const [hudStats, setHudStats] = useState({
    coins: 0,
    starsCount: 0,
    score: 0,
    speed: 0,
    boostMeter: 1.0,
    timeElapsed: 0,
  });
  const [activePowerUps, setActivePowerUps] = useState({
    speedBoost: 0,
    highJump: 0,
    shield: 0,
    magnet: 0,
  });
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);

  // Victory Run Stats snapshot
  const [victoryStats, setVictoryStats] = useState<RunStats | null>(null);

  // Held keys tracker
  const keysPressed = useRef<Set<string>>(new Set());

  // Keep latest state in refs for stable engine callbacks
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;

  // Sync document.body data-state
  useEffect(() => {
    document.body.dataset.state = gameState === 'victory' ? 'gameover' : gameState;
  }, [gameState]);

  // Handle Level Completion
  const handleLevelCompleted = useCallback(() => {
    if (!engineRef.current || !currentLevelRef.current) return;
    const engine = engineRef.current;
    const lvl = currentLevelRef.current;

    const timeElapsed = hudStats.timeElapsed;
    const coinsCollected = hudStats.coins;
    const starsCollected = hudStats.starsCount;
    const fallsCount = 0; // successfully navigated

    const rating = calculateStarRating(lvl, timeElapsed, coinsCollected, starsCollected, fallsCount);
    const score = calculateLevelScore(lvl.targetTime, timeElapsed, coinsCollected, starsCollected, fallsCount);

    const stats: RunStats = {
      score,
      coinsCollected,
      starsCollected,
      timeElapsed,
      fallsCount,
      checkpointsHit: 1,
      finalRating: rating,
    };

    setVictoryStats(stats);
    setGameState('victory');

    // Update Player Progress
    setProgress((prev) => {
      const nextUnlocked = Math.max(prev.unlockedLevel, lvl.id + 1);
      const newCoins = prev.coins + coinsCollected;
      const prevStars = prev.starsEarned[lvl.id] || 0;
      const newStars = Math.max(prevStars, rating);
      const prevHigh = prev.highScores[lvl.id] || 0;
      const newHigh = Math.max(prevHigh, score);

      const updated: PlayerProgress = {
        ...prev,
        unlockedLevel: nextUnlocked,
        coins: newCoins,
        starsEarned: { ...prev.starsEarned, [lvl.id]: newStars },
        highScores: { ...prev.highScores, [lvl.id]: newHigh },
      };

      // Check achievements
      const newlyEarned = checkNewAchievements(updated, stats);
      if (newlyEarned.length > 0) {
        newlyEarned.forEach((ach) => {
          updated.achievements.push(ach.id);
          updated.coins += ach.rewardCoins;
        });
      }

      savePlayerProgress(updated);
      return updated;
    });
  }, [hudStats]);

  // Mount Three.js Engine strictly once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, settings, {
      onCoinCollected: (_pts, totalCoins) => {
        setHudStats((prev) => ({
          ...prev,
          coins: totalCoins,
          score: prev.score + 100,
        }));
      },
      onStarCollected: (_pts, totalStars) => {
        setHudStats((prev) => ({
          ...prev,
          starsCount: totalStars,
          score: prev.score + 500,
        }));
      },
      onCheckpointReached: () => {
        setCheckpointMessage('Checkpoint Reached!');
        setTimeout(() => setCheckpointMessage(null), 2400);
      },
      onPowerUpActivated: (type, duration) => {
        setActivePowerUps((prev) => ({ ...prev, [type]: duration }));
      },
      onFallOut: () => {
        setCheckpointMessage('Respawned at Checkpoint');
        setTimeout(() => setCheckpointMessage(null), 2000);
      },
      onLevelCompleted: () => {
        handleLevelCompleted();
      },
      onStatsUpdate: (stats) => {
        setHudStats((prev) => ({
          ...prev,
          speed: stats.speed,
          boostMeter: stats.boost,
          timeElapsed: stats.timeElapsed,
        }));
      },
    });

    engineRef.current = engine;

    // Apply active skin
    const skin = BALL_SKINS.find((s) => s.id === progress.selectedSkin) || BALL_SKINS[0];
    engine.setSkin(skin);

    // Check autostart query param (?autostart=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      engine.loadLevel(LEVELS[0]);
      engine.start();
      setGameState('playing');
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run only once

  // Keyboard input listeners
  useEffect(() => {
    const updateEngineInput = () => {
      if (!engineRef.current || gameState !== 'playing') return;
      const keys = keysPressed.current;

      let inX = 0;
      let inZ = 0;

      if (keys.has('KeyW') || keys.has('ArrowUp')) inZ -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) inZ += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) inX -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) inX += 1;

      const jump = keys.has('Space');
      const brake = keys.has('ControlLeft') || keys.has('ControlRight');
      const boost = keys.has('ShiftLeft') || keys.has('ShiftRight');

      engineRef.current.input = {
        x: inX,
        z: inZ,
        jump,
        brake,
        boost,
      };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter on Title Screen starts the game!
      if (gameState === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        startGame(currentLevel);
        return;
      }

      // Escape or P toggles Pause
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
        return;
      }

      if (!keysPressed.current.has(e.code)) {
        keysPressed.current.add(e.code);
        updateEngineInput();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
      updateEngineInput();
    };

    const handleWindowBlur = () => {
      // Clear all keys without pausing so automated test scripts / captures don't stall
      keysPressed.current.clear();
      if (engineRef.current) {
        engineRef.current.input = { x: 0, z: 0, jump: false, brake: false, boost: false };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameState, currentLevel]);

  // Start Level
  const startGame = (lvl: LevelData) => {
    soundManager.playClick();
    setCurrentLevel(lvl);
    setActiveModal(null);
    setHudStats({
      coins: 0,
      starsCount: 0,
      score: 0,
      speed: 0,
      boostMeter: 1.0,
      timeElapsed: 0,
    });
    setActivePowerUps({ speedBoost: 0, highJump: 0, shield: 0, magnet: 0 });

    if (engineRef.current) {
      engineRef.current.loadLevel(lvl);
      engineRef.current.start();
    }
    setGameState('playing');
  };

  const startEndless = () => {
    soundManager.playClick();
    setGameMode('endless');
    setEndlessSegmentIdx(0);
    const seg = generateEndlessSegment(0);
    startGame(seg);
  };

  const pauseGame = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setGameState('paused');
  };

  const resumeGame = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.resume();
    }
    setGameState('playing');
  };

  const restartCurrentLevel = () => {
    soundManager.playClick();
    startGame(currentLevel);
  };

  const returnToMainMenu = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setGameState('title');
    setActiveModal(null);
  };

  const nextLevel = () => {
    const nextIdx = currentLevel.id + 1;
    const next = LEVELS.find((l) => l.id === nextIdx);
    if (next) {
      startGame(next);
    } else {
      returnToMainMenu();
    }
  };

  // Skin equip & purchase
  const handleSelectSkin = (skin: (typeof BALL_SKINS)[0]) => {
    soundManager.playClick();
    const updated: PlayerProgress = { ...progress, selectedSkin: skin.id };
    setProgress(updated);
    savePlayerProgress(updated);
    if (engineRef.current) {
      engineRef.current.setSkin(skin);
    }
  };

  const handleUnlockSkin = (skin: (typeof BALL_SKINS)[0]) => {
    if (progress.coins < skin.price) return;
    soundManager.playStar();
    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - skin.price,
      unlockedSkins: [...progress.unlockedSkins, skin.id],
      selectedSkin: skin.id,
    };
    setProgress(updated);
    savePlayerProgress(updated);
    if (engineRef.current) {
      engineRef.current.setSkin(skin);
    }
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
    soundManager.setSoundVolume(newSettings.soundVolume);
    soundManager.setMusicVolume(newSettings.musicVolume);
    if (engineRef.current) {
      engineRef.current.setSettings(newSettings);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // Mobile virtual joystick input callbacks
  const handleJoystickVector = useCallback((x: number, z: number) => {
    if (engineRef.current) {
      engineRef.current.input.x = x * settings.joystickSensitivity;
      engineRef.current.input.z = z * settings.joystickSensitivity;
    }
  }, [settings.joystickSensitivity]);

  const handleJumpPress = useCallback((pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.input.jump = pressed;
    }
  }, []);

  const handleBrakePress = useCallback((pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.input.brake = pressed;
    }
  }, []);

  const handleBoostPress = useCallback((pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.input.boost = pressed;
    }
  }, []);

  const activeSkin = BALL_SKINS.find((s) => s.id === progress.selectedSkin) || BALL_SKINS[0];

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-['Outfit',sans-serif]">
      {/* Three.js Isolated WebGL Canvas Container */}
      <div
        ref={mountRef}
        data-testid="three-viewport"
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={() => startGame(currentLevel)}
          onOpenLevels={() => setActiveModal('levels')}
          onOpenSkins={() => setActiveModal('skins')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenHowToPlay={() => setActiveModal('guide')}
          onOpenAchievements={() => setActiveModal('achievements')}
          currentCoins={progress.coins}
          activeSkin={activeSkin}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Active In-Game HUD */}
      {gameState === 'playing' && (
        <HUD
          level={currentLevel}
          coins={hudStats.coins}
          starsCount={hudStats.starsCount}
          score={hudStats.score}
          speed={hudStats.speed}
          boostMeter={hudStats.boostMeter}
          timeElapsed={hudStats.timeElapsed}
          activePowerUps={activePowerUps}
          checkpointMessage={checkpointMessage}
          onPause={pauseGame}
          onInputVector={handleJoystickVector}
          onJumpPress={handleJumpPress}
          onBrakePress={handleBrakePress}
          onBoostPress={handleBoostPress}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={restartCurrentLevel}
          onHome={returnToMainMenu}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenHowToPlay={() => setActiveModal('guide')}
        />
      )}

      {/* Victory Stage Clear Modal */}
      {gameState === 'victory' && victoryStats && (
        <VictoryModal
          stats={victoryStats}
          levelName={currentLevel.name}
          targetTime={currentLevel.targetTime}
          hasNextLevel={currentLevel.id < LEVELS.length}
          onNextLevel={nextLevel}
          onRetry={restartCurrentLevel}
          onHome={returnToMainMenu}
        />
      )}

      {/* Sub-modals */}
      {activeModal === 'levels' && (
        <LevelSelectModal
          progress={progress}
          onSelectLevel={startGame}
          onSelectEndless={startEndless}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'skins' && (
        <SkinsModal
          progress={progress}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'guide' && (
        <HowToPlayModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          progress={progress}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default App;

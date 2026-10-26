import React from 'react';
import { Play, Grid, Sparkles, Settings, HelpCircle, Trophy, Volume2, VolumeX } from 'lucide-react';
import { BallSkin } from '../types/game';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenSkins: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenAchievements: () => void;
  currentCoins: number;
  activeSkin: BallSkin;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevels,
  onOpenSkins,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenAchievements,
  currentCoins,
  activeSkin,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 pointer-events-none select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Coins indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-lg backdrop-blur-md">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
            $
          </div>
          <span className="font-extrabold text-amber-300 font-mono text-base">{currentCoins}</span>
          <span className="text-xs text-slate-400 font-medium">COINS</span>
        </div>

        {/* Quick Settings & Audio buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Center Branding and Logo */}
      <div className="flex flex-col items-center justify-center my-auto text-center pointer-events-none">
        {/* Modern 3D Logo Lockup */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-rose-500/20 to-amber-500/20 rounded-full blur-xl animate-pulse" />
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl" viewBox="0 0 100 100" fill="none">
            <defs>
              <radialGradient id="ballGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor={activeSkin.trailColor} />
                <stop offset="75%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="url(#ballGrad)" />
            <ellipse cx="50" cy="50" rx="46" ry="16" stroke="url(#ringGrad)" strokeWidth="4" transform="rotate(-25 50 50)" opacity="0.85" />
            <circle cx="36" cy="34" r="8" fill="#ffffff" opacity="0.5" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          BALL ADVENTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400">3D</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base font-semibold text-slate-300 max-w-md drop-shadow">
          Roll, jump, balance, and conquer 7 perilous 3D worlds!
        </p>

        {/* Selected Skin pill badge */}
        <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 shadow">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSkin.trailColor }} />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{activeSkin.name}</span>
        </div>

        {/* Primary CTA Play Button */}
        <div className="mt-7 flex flex-col items-center gap-3 pointer-events-auto">
          <button
            data-start="true"
            onClick={onStartGame}
            aria-label="Play Game"
            className="group relative flex items-center justify-center gap-3 px-10 sm:px-14 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-xl sm:text-2xl shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_40px_rgba(244,63,94,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-white group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY GAME</span>
          </button>
          <span className="text-xs font-mono text-slate-400">PRESS SPACE OR ENTER TO PLAY</span>
        </div>
      </div>

      {/* Bottom Main Menu Dock */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto pointer-events-auto">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
          <button
            onClick={onOpenLevels}
            aria-label="Level Selection"
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition active:scale-95 shadow-md"
          >
            <Grid className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xs font-bold">Levels</span>
          </button>

          <button
            onClick={onOpenSkins}
            aria-label="Ball Skins and Shop"
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition active:scale-95 shadow-md"
          >
            <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-bold">Skins</span>
          </button>

          <button
            onClick={onOpenAchievements}
            aria-label="Achievements"
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition active:scale-95 shadow-md"
          >
            <Trophy className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs font-bold">Trophies</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            aria-label="How to Play"
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition active:scale-95 shadow-md"
          >
            <HelpCircle className="w-5 h-5 text-indigo-400 mb-1" />
            <span className="text-xs font-bold">Guide</span>
          </button>
        </div>

        {/* Non-interactive control hint in safe margin */}
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium text-center">
          WASD / Arrow Keys Move · Space Jump · Shift Boost · Ctrl Brake · Touch on Mobile
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { Star, RotateCcw, ArrowRight, Home, Trophy, Clock, Coins } from 'lucide-react';
import { RunStats } from '../../types/game';

interface VictoryModalProps {
  stats: RunStats;
  levelName: string;
  targetTime: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  levelName,
  targetTime,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onHome,
}) => {
  const minutes = Math.floor(stats.timeElapsed / 60);
  const seconds = Math.floor(stats.timeElapsed % 60);
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide">STAGE CLEARED!</h2>
        <p className="text-sm font-semibold text-slate-300 mt-1">{levelName}</p>

        {/* 3 Stars display */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stats.finalRating;
            return (
              <div
                key={starIdx}
                className={`p-2 rounded-2xl border transition-all duration-300 ${
                  isEarned
                    ? 'bg-amber-500/20 border-amber-400/50 scale-110'
                    : 'bg-slate-800/40 border-slate-700/40 opacity-40'
                }`}
              >
                <Star
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    isEarned ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Run Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6 text-left">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">COINS</span>
              <span className="text-base font-extrabold text-white font-mono">{stats.coinsCollected}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">TIME / TARGET</span>
              <span className="text-base font-extrabold text-white font-mono">
                {timeFormatted} <span className="text-xs text-slate-400">/ {targetTime}s</span>
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">STARS FOUND</span>
              <span className="text-base font-extrabold text-white font-mono">{stats.starsCollected} / 3</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">TOTAL SCORE</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">{stats.score.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {hasNextLevel && (
            <button
              data-start="true"
              onClick={onNextLevel}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white font-black text-lg shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Retry</span>
            </button>

            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

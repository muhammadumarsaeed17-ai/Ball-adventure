import React from 'react';
import { X, Lock, Star, Play, Flame } from 'lucide-react';
import { LevelData, PlayerProgress } from '../../types/game';
import { LEVELS } from '../../game/levels';

interface LevelSelectModalProps {
  progress: PlayerProgress;
  onSelectLevel: (level: LevelData) => void;
  onSelectEndless: () => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onSelectEndless,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">SELECT STAGE</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Explore 7 challenging worlds and endless platform run</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex flex-col gap-3 overflow-y-auto py-4 pr-1">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= progress.unlockedLevel;
            const stars = progress.starsEarned[level.id] || 0;
            const highScore = progress.highScores[level.id] || 0;

            return (
              <div
                key={level.id}
                onClick={() => {
                  if (isUnlocked) onSelectLevel(level);
                }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition ${
                  isUnlocked
                    ? 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/80 cursor-pointer hover:border-cyan-500/60 shadow-md active:scale-[0.99]'
                    : 'bg-slate-900/60 border-slate-800/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3.5 mb-2 sm:mb-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? level.id : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{level.worldName}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">{level.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">{level.description}</p>
                  </div>
                </div>

                {/* Right stars & launch */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {isUnlocked && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                      {highScore > 0 && (
                        <span className="text-[11px] font-mono text-slate-400 font-semibold mt-0.5">
                          BEST: {highScore.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    disabled={!isUnlocked}
                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition ${
                      isUnlocked
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>PLAY</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Endless Runner Mode Card */}
          <div
            onClick={onSelectEndless}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 hover:border-purple-400 transition cursor-pointer shadow-lg mt-1"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Special Mode</span>
                <h3 className="text-base sm:text-lg font-black text-white">Endless Runner</h3>
                <p className="text-xs text-slate-400">Continuous procedurally chained tracks and hazards!</p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-1.5 shadow">
              <Play className="w-4 h-4 fill-current" />
              <span>START</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

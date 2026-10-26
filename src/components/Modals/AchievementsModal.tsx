import React from 'react';
import { X, Trophy, CheckCircle, Coins } from 'lucide-react';
import { PlayerProgress } from '../../types/game';
import { ACHIEVEMENTS } from '../../game/rules';

interface AchievementsModalProps {
  progress: PlayerProgress;
  onClaimReward?: (achievementId: string, rewardCoins: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  progress,
  onClose,
}) => {
  const completedCount = ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id)).length;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>ACHIEVEMENTS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Completed: <span className="text-amber-400 font-bold">{completedCount} / {ACHIEVEMENTS.length}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement list */}
        <div className="flex flex-col gap-2.5 overflow-y-auto py-4 pr-1">
          {ACHIEVEMENTS.map((ach) => {
            const isCompleted = progress.achievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/50 shadow'
                    : 'bg-slate-900/60 border-slate-800/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                    {ach.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">{ach.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{ach.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{ach.rewardCoins}</span>
                  </div>

                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Done Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition active:scale-95"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

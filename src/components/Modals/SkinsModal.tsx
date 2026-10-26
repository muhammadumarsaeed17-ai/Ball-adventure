import React from 'react';
import { X, Check, Lock, Sparkles, Coins } from 'lucide-react';
import { BallSkin, PlayerProgress } from '../../types/game';
import { BALL_SKINS } from '../../game/ballSkins';

interface SkinsModalProps {
  progress: PlayerProgress;
  onSelectSkin: (skin: BallSkin) => void;
  onUnlockSkin: (skin: BallSkin) => void;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  progress,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>BALL CUSTOMIZER</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Unlock 10 distinct ball materials, neon glows, and trails</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-amber-300 font-mono text-sm">{progress.coins}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto py-4 pr-1">
          {BALL_SKINS.map((skin) => {
            const isUnlocked = progress.unlockedSkins.includes(skin.id);
            const isEquipped = progress.selectedSkin === skin.id;
            const canAfford = progress.coins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition ${
                  isEquipped
                    ? 'bg-slate-800/90 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                    : 'bg-slate-900/60 border-slate-800/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Ball Preview Sphere Graphic */}
                  <div className="relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-white/40 overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${skin.trailColor} 50%, #090d16 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base">{skin.name}</h3>
                      {skin.specialEffect && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700/50 uppercase">
                          {skin.specialEffect}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{skin.description}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skin.trailColor }} />
                    <span className="text-[11px] font-mono text-slate-400">Trail Hue</span>
                  </div>

                  {isEquipped ? (
                    <span className="flex items-center gap-1 text-xs font-black text-rose-400 uppercase tracking-wider py-1.5 px-3 rounded-xl bg-rose-950/60 border border-rose-800/60">
                      <Check className="w-4 h-4" />
                      <span>Equipped</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin)}
                      className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shadow active:scale-95 transition"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onUnlockSkin(skin)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{skin.price} Coins</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Play, RotateCcw, Home, Settings, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
  onOpenHowToPlay,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-3xl font-black text-white tracking-wide mb-6">GAME PAUSED</h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-lg shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>RESTART LEVEL</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Guide</span>
            </button>
          </div>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-sm border border-rose-800/60 transition mt-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span>RETURN TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

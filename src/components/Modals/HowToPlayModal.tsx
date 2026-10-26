import React from 'react';
import { X, Keyboard, Smartphone, Compass, Shield, Zap, ArrowUp, Flag } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">HOW TO PLAY</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Controls, surfaces, obstacles, and objectives</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions content */}
        <div className="flex flex-col gap-4 overflow-y-auto py-4 pr-1 text-sm text-slate-300">
          {/* Controls Dual Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Desktop Controls */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Keyboard className="w-4 h-4" />
                <span>Desktop Controls</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li><b className="text-white">W / A / S / D</b> or <b className="text-white">Arrows</b> : Move & steer</li>
                <li><b className="text-white">Spacebar</b> : Jump over gaps</li>
                <li><b className="text-white">Shift</b> : Activate Speed Boost</li>
                <li><b className="text-white">Ctrl</b> : Brake & control speed</li>
                <li><b className="text-white">Esc / P</b> : Pause & settings</li>
              </ul>
            </div>

            {/* Mobile Controls */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Touch Controls</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li><b className="text-white">Left Thumb Joystick</b> : 360° steering</li>
                <li><b className="text-white">Jump Button</b> : Vault obstacles</li>
                <li><b className="text-white">Boost Button</b> : Burst of velocity</li>
                <li><b className="text-white">Brake Button</b> : Decelerate safely</li>
              </ul>
            </div>
          </div>

          {/* Special Surfaces */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-amber-400">
              <Compass className="w-4 h-4" />
              <span>Surface Mechanics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <span className="font-extrabold text-blue-300 block mb-1">Standard</span>
                <span className="text-slate-400 text-[11px]">Normal traction and steady balance.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-800/60">
                <span className="font-extrabold text-cyan-300 block mb-1">Glacial Ice</span>
                <span className="text-slate-400 text-[11px]">Zero friction. Brake early before turns!</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-pink-800/60">
                <span className="font-extrabold text-pink-300 block mb-1">Bounce Pad</span>
                <span className="text-slate-400 text-[11px]">Launches your ball high into the air.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-teal-800/60">
                <span className="font-extrabold text-teal-300 block mb-1">Speed Booster</span>
                <span className="text-slate-400 text-[11px]">Instant forward acceleration boost.</span>
              </div>
            </div>
          </div>

          {/* Objectives & Checkpoints */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-emerald-400">
              <Flag className="w-4 h-4" />
              <span>Checkpoints & Victory Portal</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Roll through glowing circular checkpoint rings to save your recovery position. If your ball plunges off the platform or strikes a lethal hazard, you respawn safely at your latest checkpoint with zero penalty! Reach the golden victory portal at the end of the course to complete the stage and unlock the next world.
            </p>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition active:scale-95"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
};

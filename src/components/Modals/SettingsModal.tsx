import React from 'react';
import { X, Volume2, Gamepad2, Eye, ShieldCheck } from 'lucide-react';
import { GameSettings } from '../../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-black text-white">SETTINGS</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-5 overflow-y-auto py-4 pr-1 text-sm text-slate-300">
          {/* Audio Section */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Volume2 className="w-4 h-4" />
              <span>Audio Configuration</span>
            </h3>

            {/* Sound FX slider */}
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Sound Effects Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                className="w-32 sm:w-40 accent-rose-500"
              />
            </div>

            {/* Music slider */}
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Ambient Music Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                className="w-32 sm:w-40 accent-rose-500"
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Gamepad2 className="w-4 h-4" />
              <span>Controls & Touch Scheme</span>
            </h3>

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Mobile Touch Mode</span>
              <div className="flex gap-1.5 p-1 rounded-xl bg-slate-800">
                <button
                  onClick={() => handleChange('touchControlMode', 'joystick')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    settings.touchControlMode === 'joystick'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Joystick
                </button>
                <button
                  onClick={() => handleChange('touchControlMode', 'drag')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    settings.touchControlMode === 'drag'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Drag & Steer
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Control Sensitivity</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.joystickSensitivity}
                onChange={(e) => handleChange('joystickSensitivity', parseFloat(e.target.value))}
                className="w-32 sm:w-40 accent-amber-500"
              />
            </div>
          </div>

          {/* Graphics & Camera Section */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>Graphics & Visual Comfort</span>
            </h3>

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Visual Quality Preset</span>
              <div className="flex gap-1.5 p-1 rounded-xl bg-slate-800">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleChange('graphicsQuality', q)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      settings.graphicsQuality === q
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Camera Impact Shake</span>
              <button
                onClick={() => handleChange('cameraShakeEnabled', !settings.cameraShakeEnabled)}
                className={`w-12 h-6 rounded-full transition relative ${
                  settings.cameraShakeEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    settings.cameraShakeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-200">Reduced Motion Mode</span>
              <button
                onClick={() => handleChange('reducedMotion', !settings.reducedMotion)}
                className={`w-12 h-6 rounded-full transition relative ${
                  settings.reducedMotion ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition active:scale-95"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { Pause, Zap, Shield, ArrowUp, Magnet, Star } from 'lucide-react';
import { LevelData } from '../types/game';

interface HUDProps {
  level: LevelData;
  coins: number;
  starsCount: number;
  score: number;
  speed: number; // km/h
  boostMeter: number; // 0 to 1
  timeElapsed: number;
  activePowerUps: {
    speedBoost: number;
    highJump: number;
    shield: number;
    magnet: number;
  };
  checkpointMessage: string | null;
  onPause: () => void;
  onInputVector: (x: number, z: number) => void;
  onJumpPress: (pressed: boolean) => void;
  onBrakePress: (pressed: boolean) => void;
  onBoostPress: (pressed: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  coins,
  starsCount,
  score,
  speed,
  boostMeter,
  timeElapsed,
  activePowerUps,
  checkpointMessage,
  onPause,
  onInputVector,
  onJumpPress,
  onBrakePress,
  onBoostPress,
}) => {
  // Mobile touch joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  // Format time mm:ss
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Touch joystick listeners
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const dist = Math.sqrt(dx * dx + dy * dy);
    let clampedX = dx;
    let clampedY = dy;

    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Send normalized vector (-1 to 1)
    const normX = clampedX / maxRadius;
    const normZ = clampedY / maxRadius;
    onInputVector(normX, normZ);
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          updateKnob(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          setIsDragging(false);
          setKnobPos({ x: 0, y: 0 });
          onInputVector(0, 0);
          break;
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onInputVector]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Level Name & World info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">{level.name}</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">| {level.worldName}</span>
          </div>

          {/* Active Power-up badging */}
          <div className="flex items-center gap-1.5 mt-1">
            {activePowerUps.speedBoost > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
                <span>BOOST {Math.ceil(activePowerUps.speedBoost)}s</span>
              </div>
            )}
            {activePowerUps.highJump > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-bold shadow">
                <ArrowUp className="w-3.5 h-3.5 text-purple-400" />
                <span>JUMP {Math.ceil(activePowerUps.highJump)}s</span>
              </div>
            )}
            {activePowerUps.shield > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow">
                <Shield className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>SHIELD {Math.ceil(activePowerUps.shield)}s</span>
              </div>
            )}
            {activePowerUps.magnet > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold shadow">
                <Magnet className="w-3.5 h-3.5 text-amber-400" />
                <span>MAGNET {Math.ceil(activePowerUps.magnet)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Checkpoint notification banner */}
        {checkpointMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm sm:text-base shadow-xl animate-bounce border border-emerald-300/40">
            {checkpointMessage}
          </div>
        )}

        {/* Right Corner Stats & Pause Button */}
        <div className="flex items-center gap-2">
          {/* Stars Collected (3 slots) */}
          <div className="flex items-center gap-1 px-2.5 py-2 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow">
            {[0, 1, 2].map((idx) => (
              <Star
                key={idx}
                className={`w-4 h-4 ${idx < starsCount ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
              />
            ))}
          </div>

          {/* Coins readout */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/85 border border-slate-700/60 shadow">
            <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              $
            </div>
            <span className="font-extrabold text-amber-300 font-mono text-sm sm:text-base">{coins}</span>
          </div>

          {/* Time timer */}
          <div className="hidden sm:flex items-center px-3 py-2 rounded-2xl bg-slate-900/85 border border-slate-700/60 text-slate-300 font-mono text-sm shadow">
            {timeFormatted}
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="p-3 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-white transition active:scale-95 shadow-lg"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Controls / Speedometer Dock */}
      <div className="flex items-end justify-between w-full">
        {/* Mobile Left: Virtual Joystick */}
        <div className="pointer-events-auto touch-none">
          <div
            ref={joystickBaseRef}
            onTouchStart={handleTouchStart}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/60 border-2 border-slate-700/50 flex items-center justify-center shadow-2xl backdrop-blur-sm"
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 shadow-lg border-2 border-white/80 transition-transform ${
                isDragging ? 'scale-110' : 'duration-200'
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            />
          </div>
        </div>

        {/* Center: Speedometer & Boost Meter */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto mb-1">
          {/* Boost Energy Bar */}
          <div className="flex items-center gap-1.5 w-36 sm:w-48 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{ width: `${Math.round(boostMeter * 100)}%` }}
              />
            </div>
          </div>

          {/* Speed display */}
          <div className="flex items-baseline gap-1 font-mono text-slate-200 text-xs sm:text-sm drop-shadow">
            <span className="text-base sm:text-lg font-black text-white">{speed}</span>
            <span className="text-[10px] text-slate-400 font-sans">KM/H</span>
          </div>
        </div>

        {/* Mobile Right: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto touch-none">
          {/* Brake Button */}
          <button
            onTouchStart={() => onBrakePress(true)}
            onTouchEnd={() => onBrakePress(false)}
            onMouseDown={() => onBrakePress(true)}
            onMouseUp={() => onBrakePress(false)}
            aria-label="Brake"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border-2 border-amber-500/50 text-amber-400 flex flex-col items-center justify-center font-bold text-xs shadow-lg active:scale-95 transition"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">BRAKE</span>
          </button>

          {/* Boost Button */}
          <button
            onTouchStart={() => onBoostPress(true)}
            onTouchEnd={() => onBoostPress(false)}
            onMouseDown={() => onBoostPress(true)}
            onMouseUp={() => onBoostPress(false)}
            aria-label="Speed Boost"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex flex-col items-center justify-center font-bold text-xs shadow-[0_4px_16px_rgba(6,182,212,0.4)] active:scale-95 transition border border-cyan-300/40"
          >
            <Zap className="w-5 h-5 mb-0.5 fill-white" />
            <span className="text-[9px]">BOOST</span>
          </button>

          {/* Jump Button */}
          <button
            onTouchStart={() => onJumpPress(true)}
            onTouchEnd={() => onJumpPress(false)}
            onMouseDown={() => onJumpPress(true)}
            onMouseUp={() => onJumpPress(false)}
            aria-label="Jump"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex flex-col items-center justify-center font-black text-sm shadow-[0_6px_20px_rgba(244,63,94,0.45)] active:scale-95 transition border-2 border-white/60"
          >
            <ArrowUp className="w-6 h-6 mb-0.5 stroke-[3]" />
            <span className="text-[10px]">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

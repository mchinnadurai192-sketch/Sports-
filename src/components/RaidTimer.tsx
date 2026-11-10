import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Flame } from 'lucide-react';
import { soundFX } from '../services/audioService';

interface RaidTimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  currentRaidingTeamName: string;
  isDoOrDie: boolean;
  onToggleDoOrDie: () => void;
}

export const RaidTimer: React.FC<RaidTimerProps> = ({
  seconds,
  isRunning,
  onToggle,
  onReset,
  currentRaidingTeamName,
  isDoOrDie,
  onToggleDoOrDie,
}) => {
  // Color coding based on remaining raid seconds
  const isCritical = seconds <= 5;
  const isWarning = seconds <= 10 && seconds > 5;

  const colorClass = isCritical
    ? 'text-red-500 led-glow-red'
    : isWarning
    ? 'text-amber-400 led-glow-amber'
    : 'text-emerald-400 led-glow-green';

  const progressPercentage = Math.min(100, Math.max(0, (seconds / 30) * 100));

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all p-3.5 shadow-xl ${
      isDoOrDie
        ? 'bg-gradient-to-b from-red-950/90 via-slate-900 to-black border-red-500/80 shadow-red-500/20'
        : 'bg-slate-900/90 border-slate-700/80 shadow-black/50'
    }`}>
      {/* Do-or-Die Banner if active */}
      {isDoOrDie && (
        <div className="absolute top-0 inset-x-0 bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase text-center py-0.5 tracking-widest animate-pulse flex items-center justify-center gap-1.5 shadow-md">
          <Flame className="w-3.5 h-3.5 animate-bounce" />
          <span>DO-OR-DIE RAID! புள்ளி பெற வேண்டும்!</span>
          <Flame className="w-3.5 h-3.5 animate-bounce" />
        </div>
      )}

      <div className={`flex items-center justify-between gap-3 ${isDoOrDie ? 'mt-3' : ''}`}>
        {/* Left: Raid Label & Current Raiding Team */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              30s Official Raid Clock
            </span>
            {isCritical && seconds > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-400 animate-pulse bg-red-950 px-1.5 py-0.2 rounded border border-red-500/50">
                <AlertTriangle className="w-3 h-3" /> Time Low!
              </span>
            )}
            {seconds === 0 && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-950 px-1.5 py-0.2 rounded border border-red-500/60 animate-bounce">
                📢 Visal Blown! Time Up!
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm font-bold text-amber-300 truncate max-w-[150px] sm:max-w-[220px]">
            ⚡ Raiding: <span className="text-white uppercase">{currentRaidingTeamName}</span>
          </div>
        </div>

        {/* Center: Digital Seconds Display */}
        <div className="flex items-center gap-2">
          <div className={`font-['Teko'] text-5xl sm:text-6xl font-black tracking-tighter leading-none font-mono ${colorClass} ${
            isCritical ? 'animate-pulse scale-105' : ''
          }`}>
            {seconds < 10 ? `0${seconds}` : seconds}
            <span className="text-xs font-sans font-bold text-slate-500 ml-0.5">s</span>
          </div>
        </div>

        {/* Right: Timer Quick Controls & Whistle Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggle}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow transition active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Start 30s'}</span>
          </button>

          <button
            onClick={onReset}
            title="Reset Raid Clock to 30s"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => soundFX.playVisal()}
            title="Blow Referee Whistle (Visal Sound)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950 text-amber-300 border border-amber-500/40 active:scale-95 transition flex items-center gap-1"
          >
            <span>📢</span>
            <span className="hidden md:inline text-[10px] font-bold">Visal</span>
          </button>

          <button
            onClick={onToggleDoOrDie}
            title="Toggle Do-or-Die Raid"
            className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition active:scale-95 ${
              isDoOrDie
                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/40'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400'
            }`}
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

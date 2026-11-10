import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Flag, Users, ShieldAlert, Award } from 'lucide-react';
import { MatchState } from '../types/kabaddi';
import { soundFX, announcer } from '../services/audioService';

interface ScoreboardMainProps {
  match: MatchState;
  onToggleMatchTimer: () => void;
  onAdjustTimer: (deltaSeconds: number) => void;
  onSwitchHalf: () => void;
  onFinishMatch: () => void;
  onCreateNextMatch?: () => void;
  selectedTeamId: 'teamA' | 'teamB';
  onSelectTeam: (teamId: 'teamA' | 'teamB') => void;
}

export const ScoreboardMain: React.FC<ScoreboardMainProps> = ({
  match,
  onToggleMatchTimer,
  onAdjustTimer,
  onSwitchHalf,
  onFinishMatch,
  onCreateNextMatch,
  selectedTeamId,
  onSelectTeam,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getHalfLabel = () => {
    switch (match.half) {
      case 'first_half':
        return 'FIRST HALF (முதல் பாதி)';
      case 'half_time':
        return 'HALF TIME BREAK (இடைவேளை)';
      case 'second_half':
        return 'SECOND HALF (இரண்டாம் பாதி)';
      case 'extra_time':
        return 'EXTRA TIME (கூடுதல் நேரம்)';
      case 'finished':
        return 'MATCH FINISHED (போட்டி முடிந்தது)';
      default:
        return 'FIRST HALF';
    }
  };

  // On-mat player counts
  const teamAOnMat = match.teamA.players.filter((p) => p.isOnMat).length;
  const teamBOnMat = match.teamB.players.filter((p) => p.isOnMat).length;

  // Super Tackle is ON when defending team has 3 or fewer players on mat
  const isTeamASuperTackleOn = match.currentRaidingTeam === 'teamB' && teamAOnMat <= 3 && teamAOnMat > 0;
  const isTeamBSuperTackleOn = match.currentRaidingTeam === 'teamA' && teamBOnMat <= 3 && teamBOnMat > 0;

  return (
    <div className="space-y-3">
      {/* Top Main Scoreboard Display (LED Sports Arena Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-orange-500/40 shadow-2xl p-3 sm:p-5">
        {/* Background stadium light wash */}
        <div className="absolute inset-0 bg-mat-grid opacity-30 pointer-events-none"></div>

        {/* Center Top: Match Header, Half indicator, Date & Time */}
        <div className="relative z-10 flex flex-col items-center justify-center border-b border-slate-800 pb-3 mb-3">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5 text-xs">
            <span className="font-['Teko'] text-sm tracking-widest text-orange-400 font-bold uppercase">
              KABADDI LIVE SCOREBOARD
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300 font-mono font-bold tracking-wide">
              {getHalfLabel()}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono text-[11px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              📅 {match.date} • ⏰ {match.startTime}{match.endTime ? ` - ${match.endTime}` : ''}
            </span>
          </div>

          {/* Big Match Clock */}
          <div className="flex items-center gap-3">
            <div className="font-['Teko'] text-5xl sm:text-6xl font-black text-amber-400 led-glow-amber tracking-wider font-mono leading-none">
              {formatTime(match.timeRemainingSeconds)}
            </div>

            {/* Quick Timer Controls */}
            <div className="flex flex-col gap-1">
              <button
                onClick={onToggleMatchTimer}
                title={match.isTimerRunning ? 'Pause Match' : 'Start Match'}
                className={`p-1.5 rounded-lg border font-bold text-xs transition active:scale-95 flex items-center justify-center ${
                  match.isTimerRunning
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                }`}
              >
                {match.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => onAdjustTimer(60)}
                  title="+1 Minute"
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
                >
                  +1m
                </button>
                <button
                  onClick={() => onAdjustTimer(-60)}
                  title="-1 Minute"
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded border border-slate-700"
                >
                  -1m
                </button>
              </div>
            </div>
          </div>

          {/* Half Controls & TOTAL POINTS SPEAK Button */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
            {/* 🏆 Dedicated TOTAL POINTS SPEAK Button */}
            <button
              onClick={() => announcer.speakTamilTotalPoints(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score)}
              className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-lg shadow-amber-500/30 active:scale-95 transition"
              title="Announce total points in natural Tamil male voice"
            >
              <span>🎙️</span>
              <span>TOTAL POINTS SPEAK (மொத்த புள்ளிகள்)</span>
            </button>

            <button
              onClick={onSwitchHalf}
              className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <FastForward className="w-3 h-3" />
              <span>
                {match.half === 'first_half'
                  ? 'End 1st Half / Half-Time'
                  : match.half === 'half_time'
                  ? 'Start 2nd Half'
                  : 'Start Extra Time'}
              </span>
            </button>

            <button
              onClick={onFinishMatch}
              className="flex items-center gap-1 text-[11px] font-bold bg-red-950/70 hover:bg-red-900/80 text-red-300 px-2.5 py-1.5 rounded-lg border border-red-500/40 transition"
            >
              <Flag className="w-3 h-3" />
              <span>Final Whistle & Save</span>
            </button>
          </div>
        </div>

        {/* 🏆 Automatic Winner Display & Create Next Match Button */}
        {(match.status === 'completed' || match.half === 'finished') && (
          <div className="relative z-20 mb-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-2 border-yellow-300 rounded-xl p-3 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    MATCH RESULT
                  </span>
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {match.teamA.score > match.teamB.score
                      ? `${match.teamA.name} WON THE MATCH!`
                      : match.teamB.score > match.teamA.score
                      ? `${match.teamB.name} WON THE MATCH!`
                      : 'MATCH TIED (சமம்)!'}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-950">
                  Final Score: <strong>{match.teamA.name} {match.teamA.score}</strong> - <strong>{match.teamB.name} {match.teamB.score}</strong>
                </p>
              </div>
            </div>

            {onCreateNextMatch && (
              <button
                onClick={onCreateNextMatch}
                className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>🏆</span>
                <span>Create Next Match (அடுத்த போட்டி)</span>
              </button>
            )}
          </div>
        )}

        {/* Team Scoreboard Grid (Team A vs Team B) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 relative z-10">
          {/* Team A Card */}
          <div
            onClick={() => onSelectTeam('teamA')}
            className={`cursor-pointer rounded-2xl p-3 sm:p-4 transition-all relative overflow-hidden border-2 ${
              selectedTeamId === 'teamA'
                ? 'bg-gradient-to-b from-orange-950/80 to-slate-900 border-orange-500 shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/40'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Raiding Badge */}
            {match.currentRaidingTeam === 'teamA' && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow animate-pulse">
                <span>⚡ RAIDING</span>
              </div>
            )}

            {/* Team A Name & Captain */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                TEAM A
              </span>
              <h3 className="font-['Teko'] text-lg sm:text-2xl font-black text-white uppercase tracking-wide truncate">
                {match.teamA.name}
              </h3>
              <div className="text-[11px] text-amber-300 font-semibold truncate">
                <span className="text-slate-400 font-normal">Capt: </span>
                <span>{match.captainA || match.teamA.players[0]?.name || 'Captain A'}</span>
              </div>
            </div>

            {/* Giant Digital Score */}
            <div className="py-1">
              <div className="font-['Teko'] text-6xl sm:text-7xl font-black text-orange-400 led-glow-amber tracking-tighter leading-none">
                {match.teamA.score < 10 ? `0${match.teamA.score}` : match.teamA.score}
              </div>
            </div>

            {/* On Mat Players & Super Tackle Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  On Mat:
                </span>
                <span className="font-bold text-orange-300 font-mono">
                  {teamAOnMat}/7
                </span>
              </div>

              {/* Super Tackle Alert */}
              {isTeamASuperTackleOn && (
                <div className="bg-amber-950/80 border border-amber-500/60 rounded px-1.5 py-0.5 text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span>SUPER TACKLE ON! (2 PTS)</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>All-Outs: {match.teamA.allOutsInflicted}</span>
                <span>Timeouts: {match.teamA.timeoutsRemaining}</span>
              </div>
            </div>
          </div>

          {/* Team B Card */}
          <div
            onClick={() => onSelectTeam('teamB')}
            className={`cursor-pointer rounded-2xl p-3 sm:p-4 transition-all relative overflow-hidden border-2 ${
              selectedTeamId === 'teamB'
                ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Raiding Badge */}
            {match.currentRaidingTeam === 'teamB' && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow animate-pulse">
                <span>⚡ RAIDING</span>
              </div>
            )}

            {/* Team B Name & Captain */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                TEAM B
              </span>
              <h3 className="font-['Teko'] text-lg sm:text-2xl font-black text-white uppercase tracking-wide truncate">
                {match.teamB.name}
              </h3>
              <div className="text-[11px] text-cyan-300 font-semibold truncate">
                <span className="text-slate-400 font-normal">Capt: </span>
                <span>{match.captainB || match.teamB.players[0]?.name || 'Captain B'}</span>
              </div>
            </div>

            {/* Giant Digital Score */}
            <div className="py-1">
              <div className="font-['Teko'] text-6xl sm:text-7xl font-black text-cyan-400 led-glow-cyan tracking-tighter leading-none">
                {match.teamB.score < 10 ? `0${match.teamB.score}` : match.teamB.score}
              </div>
            </div>

            {/* On Mat Players & Super Tackle Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  On Mat:
                </span>
                <span className="font-bold text-blue-300 font-mono">
                  {teamBOnMat}/7
                </span>
              </div>

              {/* Super Tackle Alert */}
              {isTeamBSuperTackleOn && (
                <div className="bg-amber-950/80 border border-amber-500/60 rounded px-1.5 py-0.5 text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span>SUPER TACKLE ON! (2 PTS)</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>All-Outs: {match.teamB.allOutsInflicted}</span>
                <span>Timeouts: {match.teamB.timeoutsRemaining}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Team Notice for Score Entry */}
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="text-slate-400">Active scoring team:</span>
          <span className={`font-black uppercase px-2 py-0.5 rounded ${
            selectedTeamId === 'teamA' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
          }`}>
            👉 {selectedTeamId === 'teamA' ? match.teamA.name : match.teamB.name}
          </span>
        </div>
      </div>
    </div>
  );
};

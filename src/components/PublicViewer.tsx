import React, { useState } from 'react';
import { Maximize2, Minimize2, Radio, Trophy, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { MatchState } from '../types/kabaddi';

interface PublicViewerProps {
  match: MatchState;
}

export const PublicViewer: React.FC<PublicViewerProps> = ({ match }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const teamAOnMat = match.teamA.players.filter((p) => p.isOnMat).length;
  const teamBOnMat = match.teamB.players.filter((p) => p.isOnMat).length;

  const isTeamASuperTackleOn = match.currentRaidingTeam === 'teamB' && teamAOnMat <= 3 && teamAOnMat > 0;
  const isTeamBSuperTackleOn = match.currentRaidingTeam === 'teamA' && teamBOnMat <= 3 && teamBOnMat > 0;

  const recentEvents = [...match.events].reverse().slice(0, 4);

  return (
    <div className={`space-y-4 ${isFullscreen ? 'p-6 bg-slate-950 min-h-screen flex flex-col justify-between' : ''}`}>
      {/* Broadcast Header Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
          <span className="font-extrabold text-white tracking-widest uppercase">
            STADIUM BROADCAST FEED • THAMIYANUR AGNI BOYS SPORTS
          </span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV Mode'}</span>
        </button>
      </div>

      {/* Main Stadium TV Scoreboard Display */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-4 border-orange-500/60 shadow-2xl p-4 sm:p-8">
        <div className="absolute inset-0 bg-mat-grid opacity-20 pointer-events-none"></div>

        {/* Top Center: Tournament Branding & Match Clock */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 rounded-full px-4 py-1 mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold uppercase text-amber-300 tracking-wider">
              THAMIYANUR AGNI BOYS KABADDI TOURNAMENT
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest font-mono">
              {match.half.replace('_', ' ').toUpperCase()}
            </div>
            <div className="font-['Teko'] text-6xl sm:text-8xl font-black text-amber-400 led-glow-amber tracking-widest font-mono">
              {formatTime(match.timeRemainingSeconds)}
            </div>
            {/* 30s Raid Clock Mini Badge */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl px-3 py-1 flex flex-col items-center shadow-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400">Raid</span>
              <span className={`font-['Teko'] text-2xl sm:text-3xl font-black ${
                match.raidClockSeconds <= 5 ? 'text-red-500 led-glow-red' : 'text-emerald-400'
              }`}>
                {match.raidClockSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Team Matchup Cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 relative z-10 items-stretch">
          {/* Team A */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-orange-950/70 to-slate-950 border-2 border-orange-500/60 p-4 sm:p-6 text-center flex flex-col justify-between shadow-2xl">
            {match.currentRaidingTeam === 'teamA' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase px-3 py-0.5 rounded-full shadow-lg animate-bounce">
                ⚡ RAIDING NOW
              </div>
            )}

            <div>
              <span className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">
                TEAM A
              </span>
              <h2 className="font-['Teko'] text-2xl sm:text-5xl font-black text-white uppercase tracking-wide leading-none truncate">
                {match.teamA.name}
              </h2>
            </div>

            <div className="my-2">
              <div className="font-['Teko'] text-7xl sm:text-9xl font-black text-orange-400 led-glow-amber tracking-tight leading-none">
                {match.teamA.score < 10 ? `0${match.teamA.score}` : match.teamA.score}
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="bg-slate-900 px-2.5 py-1 rounded-full text-slate-300 font-bold border border-slate-800">
                On Mat: <strong className="text-orange-400">{teamAOnMat}/7</strong>
              </span>
              {isTeamASuperTackleOn && (
                <span className="bg-amber-950 text-amber-300 border border-amber-500/60 px-2.5 py-1 rounded-full font-black animate-pulse">
                  SUPER TACKLE ON
                </span>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-950/70 to-slate-950 border-2 border-blue-500/60 p-4 sm:p-6 text-center flex flex-col justify-between shadow-2xl">
            {match.currentRaidingTeam === 'teamB' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase px-3 py-0.5 rounded-full shadow-lg animate-bounce">
                ⚡ RAIDING NOW
              </div>
            )}

            <div>
              <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
                TEAM B
              </span>
              <h2 className="font-['Teko'] text-2xl sm:text-5xl font-black text-white uppercase tracking-wide leading-none truncate">
                {match.teamB.name}
              </h2>
            </div>

            <div className="my-2">
              <div className="font-['Teko'] text-7xl sm:text-9xl font-black text-cyan-400 led-glow-cyan tracking-tight leading-none">
                {match.teamB.score < 10 ? `0${match.teamB.score}` : match.teamB.score}
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="bg-slate-900 px-2.5 py-1 rounded-full text-slate-300 font-bold border border-slate-800">
                On Mat: <strong className="text-blue-400">{teamBOnMat}/7</strong>
              </span>
              {isTeamBSuperTackleOn && (
                <span className="bg-amber-950 text-amber-300 border border-amber-500/60 px-2.5 py-1 rounded-full font-black animate-pulse">
                  SUPER TACKLE ON
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Commentary Feed Ticker */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>Live Action Commentary Feed:</span>
          </div>

          <div className="space-y-1.5">
            {recentEvents.length > 0 ? (
              recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {formatTime(evt.gameTimeSeconds)}
                    </span>
                    <span className="font-bold text-white truncate">
                      {evt.description}
                    </span>
                  </div>
                  <span className="font-black font-['Teko'] text-base text-amber-400 shrink-0 ml-2">
                    +{evt.points} PTS
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No points scored yet. Raiders ready on the line!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

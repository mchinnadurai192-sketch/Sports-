import React from 'react';
import { Volume2, VolumeX, Shield, History, Users, Monitor, PlusCircle, Mic, FileSpreadsheet } from 'lucide-react';
import { announcer, soundFX } from '../services/audioService';

export type AppTabType = 'controller' | 'raid_history' | 'microphone' | 'viewer' | 'lineups' | 'history';

interface HeaderProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  onOpenNewMatch: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  matchStatus: string;
  onSpeakTotalPoints?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewMatch,
  isMuted,
  setIsMuted,
  matchStatus,
  onSpeakTotalPoints,
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    announcer.setMuted(next);
  };

  return (
    <header className="bg-slate-950 border-b border-orange-500/30 sticky top-0 z-40 shadow-xl backdrop-blur-md">
      {/* Top Branding Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-3 py-1.5 text-white flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm font-['Teko'] uppercase leading-none drop-shadow">
              THAMIYANUR AGNI BOYS SPORTS
            </span>
            <span className="text-[10px] text-orange-100 font-semibold tracking-wide">
              AGNI BOYS GROUND • KABADDI LIVE SCOREBOARD & MICROPHONE SYSTEM
            </span>
          </div>
        </div>

        {/* Live Badge, Ground Welcome, Total Points & Visal Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ground Welcome Announcement Button */}
          <button
            onClick={() => announcer.playWelcomeAgniBoysGround()}
            title="Play Ground Welcome: Vanakkam! Welcome to Agni Boys Ground!"
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs px-2.5 py-1 rounded border border-amber-400/50 active:scale-95 transition"
          >
            <span>🎙️</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wide">Vanakkam Welcome</span>
          </button>

          {/* Dedicated Total Points Button */}
          {onSpeakTotalPoints && (
            <button
              onClick={onSpeakTotalPoints}
              title="Announce Current Total Points (Natural Tamil Male Voice)"
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs px-2.5 py-1 rounded font-black active:scale-95 transition shadow-sm"
            >
              <span>📢</span>
              <span className="font-extrabold text-[11px] uppercase tracking-wide">Total Points</span>
            </button>
          )}

          {/* Referee Visal Whistle Blast */}
          <button
            onClick={() => soundFX.playVisal()}
            title="Blow Referee Whistle (Visal Sound)"
            className="flex items-center gap-1 bg-black/40 hover:bg-black/60 text-amber-300 text-xs px-2.5 py-1 rounded border border-amber-400/50 active:scale-95 transition shadow-sm"
          >
            <span>📢</span>
            <span className="font-bold">Visal</span>
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/60 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="uppercase text-[11px] font-mono tracking-wider">
              {matchStatus === 'live' ? 'LIVE' : matchStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('controller')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'controller'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Scoreboard</span>
          </button>

          <button
            onClick={() => setActiveTab('raid_history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'raid_history'
                ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/30 font-black'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Raid History & Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('microphone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'microphone'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Mic Controller</span>
          </button>

          <button
            onClick={() => setActiveTab('viewer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'viewer'
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Public Viewer</span>
          </button>

          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'lineups'
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lineups</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Archives</span>
          </button>
        </div>

        {/* Action Controls: New Match, Audio */}
        <div className="flex items-center gap-2 ml-auto">
          {/* New Match Button */}
          <button
            onClick={onOpenNewMatch}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Match</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Sound & Announcer' : 'Mute Sound & Announcer'}
            className={`p-1.5 rounded-lg border transition ${
              isMuted
                ? 'bg-red-950/60 border-red-500/50 text-red-400 hover:bg-red-900/60'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

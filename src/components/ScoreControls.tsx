import React, { useState } from 'react';
import { Undo2, Zap, Shield, Plus, Award, AlertCircle, Ban, Sparkles, Volume2, Radio, Check } from 'lucide-react';
import { MatchState, ScoreEventType } from '../types/kabaddi';
import { announcer, soundFX } from '../services/audioService';

interface ScoreControlsProps {
  match: MatchState;
  selectedTeamId: 'teamA' | 'teamB';
  onSelectTeam: (teamId: 'teamA' | 'teamB') => void;
  onScoreAction: (payload: {
    type: ScoreEventType;
    points: number;
    description: string;
    announcementText: string;
    tamilAnnouncementText: string;
    playerId?: string;
  }) => Promise<void>;
  onUndoLast: () => Promise<void>;
}

export const ScoreControls: React.FC<ScoreControlsProps> = ({
  match,
  selectedTeamId,
  onSelectTeam,
  onScoreAction,
  onUndoLast,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakingTotal, setIsSpeakingTotal] = useState(false);

  const scoringTeam = selectedTeamId === 'teamA' ? match.teamA : match.teamB;
  const opposingTeam = selectedTeamId === 'teamA' ? match.teamB : match.teamA;

  // 🏆 1. SEPARATE TOTAL POINTS SPEAK BUTTON
  // Automatically calculates both teams' points and speaks in natural Tamil male voice
  const handleSpeakTotalPoints = async () => {
    if (isSpeakingTotal) return;
    setIsSpeakingTotal(true);
    try {
      await announcer.speakTamilTotalPoints(
        match.teamA.name,
        match.teamA.score,
        match.teamB.name,
        match.teamB.score
      );
    } finally {
      setTimeout(() => setIsSpeakingTotal(false), 2500);
    }
  };

  // ⚡ 2. FAST 1-TAP POINT ENTRY (Automatic voice removed for silent, instantaneous scoring)
  const handleScore = async (
    type: ScoreEventType,
    points: number,
    baseDesc: string,
    actionHeadline: string,
    isSuper: boolean = false
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const finalDesc = `${baseDesc} for ${scoringTeam.name}`;

      // Fast reaction sound effects only (no speaking voice interruption)
      if (type === 'tackle_point' || type === 'super_tackle') {
        soundFX.playTackleSound();
      } else if (isSuper || type === 'super_raid' || type === 'all_out') {
        soundFX.playCheer();
      } else if (type === 'empty_raid') {
        soundFX.playWhistle(true);
      } else {
        soundFX.playWhistle(false);
      }

      await onScoreAction({
        type,
        points,
        description: finalDesc,
        announcementText: `${actionHeadline} - ${scoringTeam.name}`,
        tamilAnnouncementText: `${scoringTeam.name} புள்ளி பெற்றது`,
      });
    } catch (err) {
      console.error('Error registering score:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-4">
      {/* 1. SEPARATE TOTAL POINTS SPEAK BUTTON (Prominent & Dedicated) */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border-2 border-amber-500/60 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase text-amber-300 font-['Teko'] tracking-wider">
                TOTAL POINTS ANNOUNCER
              </span>
              <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                Tamil Male Voice
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              {match.teamA.name}: <strong className="text-amber-400 font-bold">{match.teamA.score}</strong> • {match.teamB.name}: <strong className="text-blue-400 font-bold">{match.teamB.score}</strong>
            </p>
          </div>
        </div>

        {/* The Action Button */}
        <button
          onClick={handleSpeakTotalPoints}
          disabled={isSpeakingTotal}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
            isSpeakingTotal
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-amber-500/30'
          }`}
          title="Announce total points in Tamil male voice"
        >
          <Radio className={`w-4 h-4 ${isSpeakingTotal ? 'animate-bounce text-red-700' : ''}`} />
          <span>
            {isSpeakingTotal ? 'ANNOUNCING TOTAL POINTS...' : '🎙️ TOTAL POINTS SPEAK (மொத்த புள்ளிகள்)'}
          </span>
        </button>
      </div>

      {/* 2. Team Selection Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Scoring Team (புள்ளி பெறும் அணி):
        </span>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectTeam('teamA')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase transition truncate flex items-center justify-center gap-1.5 ${
              selectedTeamId === 'teamA'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 ring-2 ring-orange-400'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>🔥</span>
            <span className="truncate">{match.teamA.name}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTeam('teamB')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase transition truncate flex items-center justify-center gap-1.5 ${
              selectedTeamId === 'teamB'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>🛡️</span>
            <span className="truncate">{match.teamB.name}</span>
          </button>
        </div>
      </div>

      {/* 3. Fast 1-Tap Action Buttons Grid (No comment option) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            1-Tap Point Entry (புள்ளிகள் பதிவு):
          </span>
          <span className="text-[11px] text-slate-400">
            Simple & Fast • Scoreboard updates automatically
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Raid Point (+1) */}
          <button
            onClick={() =>
              handleScore(
                'raid_point',
                1,
                'Raid Point',
                'Touch point scored by {team}'
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm uppercase shadow-lg shadow-orange-600/20 active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-orange-400/40"
          >
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Raid Point</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold leading-none">+1 Point</span>
          </button>

          {/* 2. 2 Touch Points (+2) */}
          <button
            onClick={() =>
              handleScore(
                'touch_point',
                2,
                '2 Touch Points',
                'Two touch points scored by {team}'
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm uppercase shadow active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-amber-500/40"
          >
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>2 Touch Points</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-white leading-none">+2 Points</span>
          </button>

          {/* 3. Super Raid (+3) */}
          <button
            onClick={() =>
              handleScore(
                'super_raid',
                3,
                'SUPER RAID!',
                'Sensational Super Raid by {team}',
                true
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-xs sm:text-sm uppercase shadow-lg shadow-red-600/30 active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-amber-300 animate-pulse"
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SUPER RAID!</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-amber-200 leading-none">+3 Points</span>
          </button>

          {/* 4. Tackle Point (+1) - Instant Fast Reaction Sound! */}
          <button
            onClick={() =>
              handleScore(
                'tackle_point',
                1,
                'Successful Tackle Point',
                'Successful tackle point awarded to {team}'
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-blue-400/50"
          >
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 fill-white" />
              <span>Tackle Point</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-cyan-200 leading-none">+1 Tackle</span>
            <span className="text-[9px] text-cyan-200/90 font-mono">⚡ Mat Sound</span>
          </button>

          {/* 5. Super Tackle (+2) - Instant Fast Reaction Sound! */}
          <button
            onClick={() =>
              handleScore(
                'super_tackle',
                2,
                'SUPER TACKLE!',
                'Monumental Super Tackle by {team}',
                true
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 hover:brightness-110 text-white font-black text-xs sm:text-sm uppercase shadow-lg shadow-purple-600/30 active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-purple-400"
          >
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-300" />
              <span>Super Tackle</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-yellow-300 leading-none">+2 Points</span>
            <span className="text-[9px] text-yellow-200/90 font-mono">⚡ Mat Sound</span>
          </button>

          {/* 6. Bonus Point (+1) */}
          <button
            onClick={() =>
              handleScore(
                'bonus_point',
                1,
                'Bonus Point',
                'Bonus point awarded to {team}'
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 font-black text-xs sm:text-sm uppercase shadow active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-emerald-500/40"
          >
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>Bonus Point</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-white leading-none">+1 Bonus</span>
          </button>

          {/* 7. All Out (+2) */}
          <button
            onClick={() =>
              handleScore(
                'all_out',
                2,
                `ALL OUT inflicted on ${opposingTeam.name}!`,
                'All-Out inflicted by {team}',
                true
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-gradient-to-br from-rose-700 to-red-900 hover:brightness-110 text-white font-black text-xs sm:text-sm uppercase shadow-lg shadow-rose-900/40 active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-rose-400"
          >
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>ALL OUT (லோனா)</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-yellow-300 leading-none">+2 Lona</span>
          </button>

          {/* 8. Empty Raid (0) */}
          <button
            onClick={() =>
              handleScore(
                'empty_raid',
                0,
                'Empty Raid',
                'Empty raid for {team}'
              )
            }
            disabled={isProcessing}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs sm:text-sm uppercase shadow active:scale-95 transition flex flex-col items-center justify-center gap-1 border border-slate-700"
          >
            <div className="flex items-center gap-1">
              <Ban className="w-4 h-4" />
              <span>Empty Raid</span>
            </div>
            <span className="text-lg font-['Teko'] font-extrabold text-slate-500 leading-none">0 Pts</span>
          </button>
        </div>
      </div>

      {/* Undo Last Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">
          {match.lastAction ? (
            <span>
              Last Action: <strong className="text-amber-300">{match.lastAction}</strong>
            </span>
          ) : (
            <span>Ready for point entry.</span>
          )}
        </div>

        <button
          onClick={onUndoLast}
          disabled={match.events.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-rose-300 text-xs font-bold border border-rose-500/30 active:scale-95 transition"
        >
          <Undo2 className="w-4 h-4" />
          <span>Undo Last</span>
        </button>
      </div>
    </div>
  );
};

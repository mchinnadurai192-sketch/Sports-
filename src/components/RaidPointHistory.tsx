import React, { useState } from 'react';
import { Download, FileSpreadsheet, Undo2, Filter, Zap, Shield, Plus, Award, AlertCircle, Ban, History, Clock } from 'lucide-react';
import { MatchState, RaidRecord } from '../types/kabaddi';
import { exportMatchToExcel } from '../services/excelService';

interface RaidPointHistoryProps {
  match: MatchState;
  onUndoLast: () => Promise<void>;
}

export const RaidPointHistory: React.FC<RaidPointHistoryProps> = ({ match, onUndoLast }) => {
  const [filterView, setFilterView] = useState<'both' | 'teamA' | 'teamB'>('both');

  const allRaids: RaidRecord[] = match.raids || [];
  const teamARaids = allRaids.filter((r) => r.raidingTeamId === 'teamA');
  const teamBRaids = allRaids.filter((r) => r.raidingTeamId === 'teamB');

  const displayedRaids =
    filterView === 'teamA'
      ? teamARaids
      : filterView === 'teamB'
      ? teamBRaids
      : allRaids;

  const latestRaid = allRaids.length > 0 ? allRaids[allRaids.length - 1] : null;

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'super_raid':
        return <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">SUPER RAID</span>;
      case 'super_tackle':
        return <span className="bg-purple-600 text-yellow-300 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">SUPER TACKLE</span>;
      case 'tackle_point':
      case 'successful_tackle':
        return <span className="bg-blue-600 text-cyan-200 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">TACKLE</span>;
      case 'touch_point':
      case 'raid_point':
        return <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">TOUCH PT</span>;
      case 'bonus_point':
        return <span className="bg-teal-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">BONUS</span>;
      case 'all_out':
        return <span className="bg-rose-700 text-yellow-200 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">ALL OUT</span>;
      case 'empty_raid':
        return <span className="bg-slate-800 text-slate-400 font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">EMPTY</span>;
      default:
        return <span className="bg-slate-700 text-slate-200 font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{outcome}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Header & Excel Download Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Two-Team Raid Record
            </span>
            <span className="text-xs font-bold text-slate-400">
              AGNI BOYS GROUND OFFICIAL SCOREBOOK
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Teko'] uppercase text-white tracking-wide mt-0.5">
            📋 TWO-TEAM RAID POINT HISTORY & EXCEL SHEET
          </h2>
        </div>

        {/* Action Buttons: Export to Excel Sheet (.xlsx) and Undo Last */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportMatchToExcel(match)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/40 active:scale-95 transition"
            title="Export complete match data and raid histories to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📥 Export to Excel Sheet (.xlsx)</span>
          </button>

          <button
            onClick={onUndoLast}
            disabled={allRaids.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 active:scale-95 transition"
            title="Correct or undo the last recorded raid"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo</span>
          </button>
        </div>
      </div>

      {/* Two-Team Comparative Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Team A Stats Card */}
        <div className="bg-slate-950/80 border-2 border-orange-500/40 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wide truncate">
                {match.teamA.name}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-orange-400 font-bold uppercase">Total:</span>
              <span className="text-2xl font-['Teko'] font-black text-white leading-none">
                {match.teamA.score}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-800">
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Raid Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-amber-400">
                {match.teamA.totalRaidPoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Tackle Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-cyan-400">
                {match.teamA.totalTacklePoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Bonus Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-emerald-400">
                {match.teamA.totalBonusPoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Raids</span>
              <span className="text-sm font-['Teko'] font-bold text-slate-300">
                {teamARaids.length}
              </span>
            </div>
          </div>
        </div>

        {/* Team B Stats Card */}
        <div className="bg-slate-950/80 border-2 border-blue-500/40 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wide truncate">
                {match.teamB.name}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-blue-400 font-bold uppercase">Total:</span>
              <span className="text-2xl font-['Teko'] font-black text-white leading-none">
                {match.teamB.score}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-800">
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Raid Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-amber-400">
                {match.teamB.totalRaidPoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Tackle Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-cyan-400">
                {match.teamB.totalTacklePoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Bonus Pts</span>
              <span className="text-sm font-['Teko'] font-bold text-emerald-400">
                {match.teamB.totalBonusPoints || 0}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Raids</span>
              <span className="text-sm font-['Teko'] font-bold text-slate-300">
                {teamBRaids.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Raid Instant Result Display */}
      {latestRaid && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
              Latest Raid #{latestRaid.raidNumber}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {latestRaid.raidingTeamName}: {latestRaid.raiderName} ({getOutcomeBadge(latestRaid.outcome)})
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-300 font-bold">
              +{latestRaid.totalPointsScored} Pts
            </span>
            <span className="text-slate-400">
              Running: {match.teamA.shortName} <strong className="text-white">{latestRaid.runningScoreA}</strong> - <strong className="text-white">{latestRaid.runningScoreB}</strong> {match.teamB.shortName}
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs (All Raids | Team A Raids | Team B Raids) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterView('both')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterView === 'both'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Raids ({allRaids.length})
          </button>
          <button
            onClick={() => setFilterView('teamA')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterView === 'teamA'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {match.teamA.shortName} Raids ({teamARaids.length})
          </button>
          <button
            onClick={() => setFilterView('teamB')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterView === 'teamB'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {match.teamB.shortName} Raids ({teamBRaids.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing authentic match entries only
        </span>
      </div>

      {/* Raid Point History Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <th className="py-2.5 px-3">Raid #</th>
              <th className="py-2.5 px-3">Team</th>
              <th className="py-2.5 px-3">Raider</th>
              <th className="py-2.5 px-3">Outcome</th>
              <th className="py-2.5 px-2 text-center">Touch</th>
              <th className="py-2.5 px-2 text-center">Bonus</th>
              <th className="py-2.5 px-2 text-center">Tackle</th>
              <th className="py-2.5 px-2 text-center">Pts</th>
              <th className="py-2.5 px-3 text-right">Running Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {displayedRaids.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                  No raids recorded yet. Raids will be automatically listed here when scored.
                </td>
              </tr>
            ) : (
              [...displayedRaids].reverse().map((raid) => (
                <tr key={raid.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3 font-mono text-slate-300 font-bold">
                    #{raid.raidNumber}
                    {raid.teamRaidNumber && (
                      <span className="text-[10px] text-slate-500 block">
                        T#{raid.teamRaidNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-extrabold text-white">
                    <span className={raid.raidingTeamId === 'teamA' ? 'text-orange-400' : 'text-blue-400'}>
                      {raid.raidingTeamName}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-slate-200 font-semibold">{raid.raiderName}</span>
                    {raid.raiderJersey > 0 && (
                      <span className="text-slate-500 text-[10px] ml-1">#{raid.raiderJersey}</span>
                    )}
                    {raid.isDoOrDie && (
                      <span className="ml-1.5 bg-red-950 border border-red-500/50 text-red-300 text-[9px] px-1 rounded uppercase font-bold">
                        Do-or-Die
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {getOutcomeBadge(raid.outcome)}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-amber-400">
                    {raid.touchPoints || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">
                    {raid.bonusPoints || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-cyan-400">
                    {raid.tacklePoints || '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-black text-sm text-yellow-300">
                    +{raid.totalPointsScored}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-200">
                    <span className="text-orange-400">{raid.runningScoreA}</span>
                    <span className="text-slate-500 mx-1">-</span>
                    <span className="text-blue-400">{raid.runningScoreB}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

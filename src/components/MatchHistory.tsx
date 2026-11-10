import React, { useState } from 'react';
import { History, Trophy, Calendar, Award, ChevronRight, FileSpreadsheet, Clock, User, Shield, Flame } from 'lucide-react';
import { MatchSummary } from '../types/kabaddi';
import { exportHistoryListToExcel } from '../services/excelService';

interface MatchHistoryProps {
  history: MatchSummary[];
  onRefresh: () => void;
  onCreateNextMatch?: (winner: string) => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ history, onRefresh, onCreateNextMatch }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);

  const handleExportExcel = () => {
    if (history.length === 0) return;
    exportHistoryListToExcel(history);
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base sm:text-lg font-black font-['Teko'] uppercase tracking-wider text-white">
              Official Match Records & History (போட்டி வரலாறுகள்)
            </h2>
            <p className="text-xs text-slate-400">
              Preserved actual match results with timestamps, captains & points breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {history.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md transition active:scale-95"
              title="Download entire match history in Excel spreadsheet format"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export History (.xlsx)</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 space-y-2 text-slate-500">
          <Trophy className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-base font-semibold text-slate-400">No completed matches recorded yet.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Play through a match and click "Final Whistle & Save" to automatically archive official match details, scores, dates, and times.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {history.map((m, idx) => (
            <div
              key={m.id || idx}
              onClick={() => setSelectedMatch(m)}
              className="bg-slate-950 border border-slate-800 hover:border-orange-500/60 rounded-xl p-4 cursor-pointer transition shadow-md hover:shadow-orange-500/10 space-y-3"
            >
              {/* Header with Date & Time */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> {m.date}
                  </span>
                  {(m.startTime || m.endTime) && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-orange-400" /> {m.startTime || 'Live'} {m.endTime ? `- ${m.endTime}` : ''}
                    </span>
                  )}
                </div>
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                  🏆 Winner: {m.winner}
                </span>
              </div>

              {/* Team Scores and Captains */}
              <div className="flex items-center justify-between gap-3">
                {/* Team A */}
                <div className="flex-1 text-left truncate">
                  <span className="text-xs font-bold text-white uppercase block truncate flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                    {m.teamA.name}
                  </span>
                  {m.captainA && (
                    <span className="text-[10px] text-amber-400 font-medium block truncate">
                      Capt: {m.captainA}
                    </span>
                  )}
                  <span className="font-['Teko'] text-3xl sm:text-4xl font-black text-orange-400 leading-none">
                    {m.teamA.score}
                  </span>
                </div>

                <div className="text-center px-2">
                  <span className="text-xs font-black text-slate-600 uppercase">VS</span>
                </div>

                {/* Team B */}
                <div className="flex-1 text-right truncate">
                  <span className="text-xs font-bold text-white uppercase block truncate flex items-center justify-end gap-1">
                    {m.teamB.name}
                    <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                  </span>
                  {m.captainB && (
                    <span className="text-[10px] text-cyan-400 font-medium block truncate">
                      Capt: {m.captainB}
                    </span>
                  )}
                  <span className="font-['Teko'] text-3xl sm:text-4xl font-black text-cyan-400 leading-none">
                    {m.teamB.score}
                  </span>
                </div>
              </div>

              {/* Points Breakdown Bar */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-orange-400 font-bold block">Team A Points:</span>
                  <span>Raid: {m.teamA.raidPoints || 0} • Tackle: {m.teamA.tacklePoints || 0} • Bonus: {m.teamA.bonusPoints || 0}</span>
                </div>
                <div className="bg-slate-900/60 p-1.5 rounded text-right">
                  <span className="text-blue-400 font-bold block">Team B Points:</span>
                  <span>Raid: {m.teamB.raidPoints || 0} • Tackle: {m.teamB.tacklePoints || 0} • Bonus: {m.teamB.bonusPoints || 0}</span>
                </div>
              </div>

              {/* Bottom footer: Top performer / click details */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                {m.topRaider ? (
                  <span className="truncate">
                    🔥 Top Raider: <strong className="text-white">{m.topRaider.name}</strong> ({m.topRaider.points} pts)
                  </span>
                ) : (
                  <span>Click to view official scorecard</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Detail Scorecard Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-['Teko'] text-xl font-black text-white uppercase tracking-wider">
                  Official Match Scorecard
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Scorecard Hero */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-mono">
                <span>📅 Date: {selectedMatch.date}</span>
                <span>•</span>
                <span>⏰ Time: {selectedMatch.startTime || 'Live'} {selectedMatch.endTime ? `to ${selectedMatch.endTime}` : ''}</span>
              </div>

              <div className="flex items-center justify-around pt-2">
                <div>
                  <h4 className="text-sm font-black text-orange-400 uppercase">{selectedMatch.teamA.name}</h4>
                  {selectedMatch.captainA && (
                    <span className="text-[11px] text-amber-300 font-semibold block">Capt: {selectedMatch.captainA}</span>
                  )}
                  <span className="font-['Teko'] text-5xl font-black text-white leading-none">{selectedMatch.teamA.score}</span>
                </div>
                <span className="text-2xl font-black text-slate-600">VS</span>
                <div>
                  <h4 className="text-sm font-black text-blue-400 uppercase">{selectedMatch.teamB.name}</h4>
                  {selectedMatch.captainB && (
                    <span className="text-[11px] text-cyan-300 font-semibold block">Capt: {selectedMatch.captainB}</span>
                  )}
                  <span className="font-['Teko'] text-5xl font-black text-white leading-none">{selectedMatch.teamB.score}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 text-sm font-black text-amber-400 uppercase">
                🏆 Winner: {selectedMatch.winner === 'Match Tied' ? 'Match Tied (சமம்)' : `${selectedMatch.winner} Won!`}
              </div>
            </div>

            {/* Detailed Points Table */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Points Breakdown
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="space-y-1 bg-slate-900/60 p-2 rounded">
                  <strong className="text-orange-400 block">{selectedMatch.teamA.name}</strong>
                  <div>Raid Points: {selectedMatch.teamA.raidPoints || 0}</div>
                  <div>Tackle Points: {selectedMatch.teamA.tacklePoints || 0}</div>
                  <div>Bonus Points: {selectedMatch.teamA.bonusPoints || 0}</div>
                  <div className="font-bold text-white pt-1 border-t border-slate-800">
                    Total: {selectedMatch.teamA.score}
                  </div>
                </div>
                <div className="space-y-1 bg-slate-900/60 p-2 rounded">
                  <strong className="text-blue-400 block">{selectedMatch.teamB.name}</strong>
                  <div>Raid Points: {selectedMatch.teamB.raidPoints || 0}</div>
                  <div>Tackle Points: {selectedMatch.teamB.tacklePoints || 0}</div>
                  <div>Bonus Points: {selectedMatch.teamB.bonusPoints || 0}</div>
                  <div className="font-bold text-white pt-1 border-t border-slate-800">
                    Total: {selectedMatch.teamB.score}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="space-y-2 text-xs">
              {selectedMatch.topRaider && (
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-400" /> Best Raider:
                  </span>
                  <span className="font-bold text-white">
                    {selectedMatch.topRaider.name} ({selectedMatch.topRaider.points} pts)
                  </span>
                </div>
              )}
              {selectedMatch.topDefender && (
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-400" /> Best Defender:
                  </span>
                  <span className="font-bold text-white">
                    {selectedMatch.topDefender.name} ({selectedMatch.topDefender.points} pts)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons: Create Next Match & Print */}
            <div className="flex items-center gap-2 pt-2">
              {onCreateNextMatch && selectedMatch.winner !== 'Match Tied' && (
                <button
                  onClick={() => {
                    const win = selectedMatch.winner;
                    setSelectedMatch(null);
                    onCreateNextMatch(win);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Start Next Match with Winner</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl transition"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Users, UserPlus, Shield, Zap, Award, CheckCircle, XCircle } from 'lucide-react';
import { Player, Team, PlayerRole } from '../types/kabaddi';

interface LineupManagerProps {
  teamA: Team;
  teamB: Team;
  onUpdateTeamPlayers: (teamId: 'teamA' | 'teamB', players: Player[]) => void;
}

export const LineupManager: React.FC<LineupManagerProps> = ({
  teamA,
  teamB,
  onUpdateTeamPlayers,
}) => {
  const [selectedTeamTab, setSelectedTeamTab] = useState<'teamA' | 'teamB'>('teamA');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newJerseyNum, setNewJerseyNum] = useState('');
  const [newRole, setNewRole] = useState<PlayerRole>('Raider');

  const currentTeam = selectedTeamTab === 'teamA' ? teamA : teamB;

  // Toggle on mat / out status
  const handleToggleOnMat = (playerId: string) => {
    const updated = currentTeam.players.map((p) => {
      if (p.id === playerId) {
        return { ...p, isOnMat: !p.isOnMat };
      }
      return p;
    });
    onUpdateTeamPlayers(selectedTeamTab, updated);
  };

  // Add new player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newPlayer: Player = {
      id: `${selectedTeamTab}-${Date.now()}`,
      jerseyNumber: parseInt(newJerseyNum, 10) || currentTeam.players.length + 1,
      name: newPlayerName.trim(),
      role: newRole,
      isOnMat: currentTeam.players.filter((p) => p.isOnMat).length < 7,
      raidPoints: 0,
      tacklePoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
    };

    onUpdateTeamPlayers(selectedTeamTab, [...currentTeam.players, newPlayer]);
    setNewPlayerName('');
    setNewJerseyNum('');
    setIsAddingPlayer(false);
  };

  const startingSeven = currentTeam.players.slice(0, 7);
  const substitutes = currentTeam.players.slice(7);

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Team Selector Tab */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-400" />
          <h2 className="text-base sm:text-lg font-black font-['Teko'] uppercase tracking-wider text-white">
            Team Lineups & Player Tracking (வீரர்கள் பட்டியல்)
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedTeamTab('teamA')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition ${
              selectedTeamTab === 'teamA'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            {teamA.name}
          </button>
          <button
            onClick={() => setSelectedTeamTab('teamB')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition ${
              selectedTeamTab === 'teamB'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            {teamB.name}
          </button>
        </div>
      </div>

      {/* Starting 7 on Mat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Starting 7 Squad (களத்தில் உள்ள வீரர்கள்)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Active: {currentTeam.players.filter((p) => p.isOnMat).length} / 7
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Player Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-center">Mat Status</th>
                <th className="py-2.5 px-3 text-center">Raid Pts</th>
                <th className="py-2.5 px-3 text-center">Tackle Pts</th>
                <th className="py-2.5 px-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {currentTeam.players.map((player) => (
                <tr
                  key={player.id}
                  className={`hover:bg-slate-900/60 transition ${
                    !player.isOnMat ? 'opacity-60 bg-red-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold font-mono text-amber-400">
                    #{player.jerseyNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {player.name}
                      </span>
                      {player.isCaptain && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                          (C)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {player.role}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleToggleOnMat(player.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                        player.isOnMat
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900'
                          : 'bg-red-950/80 text-red-400 border border-red-500/50 hover:bg-red-900'
                      }`}
                    >
                      {player.isOnMat ? 'ON MAT' : 'OUT (BENCH)'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-orange-400">
                    {player.raidPoints}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-400">
                    {player.tacklePoints}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-black text-amber-300 text-sm">
                    {player.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Player Form */}
      <div className="pt-2">
        {!isAddingPlayer ? (
          <button
            onClick={() => setIsAddingPlayer(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-950 border border-slate-800 hover:border-amber-500/50 px-3 py-2 rounded-xl transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player to {currentTeam.name}</span>
          </button>
        ) : (
          <form
            onSubmit={handleAddPlayer}
            className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3"
          >
            <span className="text-xs font-bold text-white uppercase">Register New Player</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                required
                placeholder="Player Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Jersey #"
                value={newJerseyNum}
                onChange={(e) => setNewJerseyNum(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as PlayerRole)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
              >
                <option value="Raider">Raider</option>
                <option value="Defender">Defender</option>
                <option value="All-Rounder">All-Rounder</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg py-1.5"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPlayer(false)}
                  className="px-2.5 bg-slate-800 text-slate-400 text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

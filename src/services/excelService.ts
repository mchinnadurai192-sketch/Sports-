import * as XLSX from 'xlsx';
import { MatchState, RaidRecord } from '../types/kabaddi';

/**
 * Generates and downloads a multi-tab Microsoft Excel (.xlsx) spreadsheet
 * for Agni Boys Ground Kabaddi Match and Raid Point History.
 */
export function exportMatchToExcel(match: MatchState) {
  const wb = XLSX.utils.book_new();

  // 1. MATCH SUMMARY SHEET
  const summaryData = [
    ['THAMIYANUR AGNI BOYS SPORTS – KABADDI MATCH REPORT'],
    ['AGNI BOYS GROUND LIVE SCORECARD & RAID POINT HISTORY'],
    [''],
    ['Match Information'],
    ['Ground Name', match.groundName || 'Agni Boys Ground'],
    ['Match Number', `Match #${match.matchNumber}`],
    ['Date', match.date || new Date().toLocaleDateString('en-GB')],
    ['Start Time', match.startTime || 'Live'],
    ['Status', match.status.toUpperCase()],
    ['Current Half', match.half.replace('_', ' ').toUpperCase()],
    [''],
    ['Final / Current Scoreline'],
    ['Team Name', 'Total Score', 'Raid Points', 'Tackle Points', 'Bonus Points', 'Successful Raids', 'Empty Raids', 'All-Outs Inflicted'],
    [
      match.teamA.name,
      match.teamA.score,
      match.teamA.totalRaidPoints || 0,
      match.teamA.totalTacklePoints || 0,
      match.teamA.totalBonusPoints || 0,
      match.teamA.successfulRaids || 0,
      match.teamA.emptyRaids || 0,
      match.teamA.allOutsInflicted || 0,
    ],
    [
      match.teamB.name,
      match.teamB.score,
      match.teamB.totalRaidPoints || 0,
      match.teamB.totalTacklePoints || 0,
      match.teamB.totalBonusPoints || 0,
      match.teamB.successfulRaids || 0,
      match.teamB.emptyRaids || 0,
      match.teamB.allOutsInflicted || 0,
    ],
    [''],
    ['Toss Information'],
    ['Toss Winner', match.toss.wonBy === 'teamA' ? match.teamA.name : match.teamB.name],
    ['Toss Choice', match.toss.choice],
    [''],
    ['Match Leader / Winner', match.winner ? match.winner.toUpperCase() : (match.teamA.score > match.teamB.score ? match.teamA.name : (match.teamB.score > match.teamA.score ? match.teamB.name : 'TIE'))],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Match Summary');

  // Format helper for raids
  const formatRaidsForSheet = (raids: RaidRecord[]) => {
    return raids.map((r, idx) => ({
      'Raid #': r.raidNumber || idx + 1,
      'Team Raid #': r.teamRaidNumber || '-',
      'Time (MM:SS)': `${Math.floor(r.gameTimeSeconds / 60).toString().padStart(2, '0')}:${(r.gameTimeSeconds % 60).toString().padStart(2, '0')}`,
      'Half': r.half ? r.half.replace('_', ' ').toUpperCase() : 'FIRST HALF',
      'Raiding Team': r.raidingTeamName,
      'Raider Name': r.raiderName || 'Unassigned',
      'Raider Jersey': r.raiderJersey ? `#${r.raiderJersey}` : '-',
      'Outcome': r.outcome ? r.outcome.replace('_', ' ').toUpperCase() : 'POINT',
      'Touch Points': r.touchPoints || 0,
      'Bonus Points': r.bonusPoints || 0,
      'Tackle Points': r.tacklePoints || 0,
      'Total Points Scored': r.totalPointsScored || (r.touchPoints + r.bonusPoints + r.tacklePoints),
      'Scoring Team': r.scoringTeamId === 'teamA' ? match.teamA.name : match.teamB.name,
      'Do-or-Die?': r.isDoOrDie ? 'YES' : 'NO',
      [`${match.teamA.shortName || 'Team A'} Score`]: r.runningScoreA,
      [`${match.teamB.shortName || 'Team B'} Score`]: r.runningScoreB,
      'Tamil Commentary': r.tanglishAnnouncement || r.description,
    }));
  };

  const allRaids = match.raids || [];
  const teamARaids = allRaids.filter((r) => r.raidingTeamId === 'teamA');
  const teamBRaids = allRaids.filter((r) => r.raidingTeamId === 'teamB');

  // 2. TEAM A RAID HISTORY SHEET
  if (teamARaids.length > 0) {
    const wsTeamA = XLSX.utils.json_to_sheet(formatRaidsForSheet(teamARaids));
    XLSX.utils.book_append_sheet(wb, wsTeamA, `${(match.teamA.shortName || 'Team A').substring(0, 20)} Raids`);
  } else {
    const wsTeamA = XLSX.utils.aoa_to_sheet([
      [`No raids recorded yet for ${match.teamA.name}`],
      ['Raids will appear here in real time as the match progresses at Agni Boys Ground.']
    ]);
    XLSX.utils.book_append_sheet(wb, wsTeamA, `${(match.teamA.shortName || 'Team A').substring(0, 20)} Raids`);
  }

  // 3. TEAM B RAID HISTORY SHEET
  if (teamBRaids.length > 0) {
    const wsTeamB = XLSX.utils.json_to_sheet(formatRaidsForSheet(teamBRaids));
    XLSX.utils.book_append_sheet(wb, wsTeamB, `${(match.teamB.shortName || 'Team B').substring(0, 20)} Raids`);
  } else {
    const wsTeamB = XLSX.utils.aoa_to_sheet([
      [`No raids recorded yet for ${match.teamB.name}`],
      ['Raids will appear here in real time as the match progresses at Agni Boys Ground.']
    ]);
    XLSX.utils.book_append_sheet(wb, wsTeamB, `${(match.teamB.shortName || 'Team B').substring(0, 20)} Raids`);
  }

  // 4. COMPLETE RAID-BY-RAID CHRONOLOGICAL LOG
  if (allRaids.length > 0) {
    const wsAll = XLSX.utils.json_to_sheet(formatRaidsForSheet(allRaids));
    XLSX.utils.book_append_sheet(wb, wsAll, 'Complete Raid Log');
  }

  // 5. PLAYER PERFORMANCE BREAKDOWN
  const playerStats: any[] = [];
  [match.teamA, match.teamB].forEach((team) => {
    team.players.forEach((p) => {
      playerStats.push({
        'Team': team.name,
        'Jersey #': p.jerseyNumber,
        'Player Name': p.name,
        'Role': p.role,
        'Captain': p.isCaptain ? 'YES' : 'NO',
        'Raid Points': p.raidPoints || 0,
        'Tackle Points': p.tacklePoints || 0,
        'Bonus Points': p.bonusPoints || 0,
        'Total Points': p.totalPoints || 0,
      });
    });
  });

  if (playerStats.length > 0) {
    const wsPlayers = XLSX.utils.json_to_sheet(playerStats);
    XLSX.utils.book_append_sheet(wb, wsPlayers, 'Player Performance');
  }

  // Generate Excel filename and trigger browser download
  const dateStr = (match.date || 'match').replace(/\//g, '-');
  const fileName = `Agni_Boys_Ground_${match.teamA.shortName || 'A'}_vs_${match.teamB.shortName || 'B'}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports complete archived match history records to an Excel (.xlsx) file.
 */
export function exportHistoryListToExcel(history: any[]) {
  const wb = XLSX.utils.book_new();

  const rows = history.map((m, idx) => ({
    'Match #': m.matchNumber || idx + 1,
    'Date': m.date || '',
    'Start Time': m.startTime || '',
    'End Time': m.endTime || '',
    'Team A': m.teamA.name,
    'Captain A': m.captainA || '',
    'Team A Score': m.teamA.score,
    'Team A Raid Pts': m.teamA.raidPoints || 0,
    'Team A Tackle Pts': m.teamA.tacklePoints || 0,
    'Team A Bonus Pts': m.teamA.bonusPoints || 0,
    'Team B': m.teamB.name,
    'Captain B': m.captainB || '',
    'Team B Score': m.teamB.score,
    'Team B Raid Pts': m.teamB.raidPoints || 0,
    'Team B Tackle Pts': m.teamB.tacklePoints || 0,
    'Team B Bonus Pts': m.teamB.bonusPoints || 0,
    'Winner': m.winner,
    'Final Score': m.finalScoreText,
    'Best Raider': m.topRaider ? `${m.topRaider.name} (${m.topRaider.points} pts)` : '',
    'Best Defender': m.topDefender ? `${m.topDefender.name} (${m.topDefender.points} pts)` : '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Match History Records');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Agni_Boys_Ground_Match_History_${nowStr}.xlsx`);
}


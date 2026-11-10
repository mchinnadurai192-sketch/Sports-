import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI instance for server-side TTS
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1alpha',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache generated audio base64 in memory
const audioCache = new Map<string, string>();

// Data directory for persistence
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MATCH_FILE = path.join(DATA_DIR, 'current_match.json');
const HISTORY_FILE = path.join(DATA_DIR, 'match_history.json');

// Default starting players for Team A & Team B
const defaultTeamAPlayers = [
  { id: 'a1', jerseyNumber: 7, name: 'Karthik Raja', role: 'Raider', isCaptain: true, isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a2', jerseyNumber: 3, name: 'Mani Bharathi', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a3', jerseyNumber: 5, name: 'Siva Prakash', role: 'Raider', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a4', jerseyNumber: 9, name: 'Arun Kumar', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a5', jerseyNumber: 11, name: 'Vetri Vel', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a6', jerseyNumber: 2, name: 'Prasanth', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a7', jerseyNumber: 10, name: 'Dinesh Agni', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a8', jerseyNumber: 14, name: 'Kannan (Sub)', role: 'Raider', isOnMat: false, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'a9', jerseyNumber: 17, name: 'Surya (Sub)', role: 'Defender', isOnMat: false, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
];

const defaultTeamBPlayers = [
  { id: 'b1', jerseyNumber: 1, name: 'Vijay Anand', role: 'Raider', isCaptain: true, isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b2', jerseyNumber: 4, name: 'Saravanan', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b3', jerseyNumber: 8, name: 'Muthu Vel', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b4', jerseyNumber: 6, name: 'Anbarasu', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b5', jerseyNumber: 12, name: 'Raghavan', role: 'Raider', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b6', jerseyNumber: 15, name: 'Gokul Nath', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b7', jerseyNumber: 99, name: 'Sathish Kumar', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b8', jerseyNumber: 18, name: 'Deepak (Sub)', role: 'Raider', isOnMat: false, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
  { id: 'b9', jerseyNumber: 21, name: 'Ranjith (Sub)', role: 'Defender', isOnMat: false, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
];

function createInitialMatch(): any {
  return {
    id: 'match-' + Date.now(),
    matchNumber: 1,
    date: '09/11/26',
    startTime: '06:00 PM',
    groundName: 'Agni Boys Ground',
    status: 'upcoming',
    half: 'first_half',
    matchDurationMinutes: 20,
    halfDurationMinutes: 10,
    timeRemainingSeconds: 600, // 10 minutes for first half
    isTimerRunning: false,
    raidClockSeconds: 30,
    isRaidClockRunning: false,
    currentRaidingTeam: 'teamA',
    isDoOrDieRaid: false,
    teamA: {
      id: 'teamA',
      name: 'THAMIYANUR AGNI BOYS',
      shortName: 'TAB',
      color: '#ea580c', // Fire orange
      score: 0,
      totalRaidPoints: 0,
      totalTacklePoints: 0,
      totalBonusPoints: 0,
      successfulRaids: 0,
      emptyRaids: 0,
      unsuccessfulRaids: 0,
      superRaids: 0,
      superTackles: 0,
      players: defaultTeamAPlayers,
      timeoutsRemaining: 2,
      allOutsInflicted: 0,
      emptyRaidCount: 0,
    },
    teamB: {
      id: 'teamB',
      name: 'KONGU WARRIORS',
      shortName: 'KGW',
      color: '#2563eb', // Royal Blue
      score: 0,
      totalRaidPoints: 0,
      totalTacklePoints: 0,
      totalBonusPoints: 0,
      successfulRaids: 0,
      emptyRaids: 0,
      unsuccessfulRaids: 0,
      superRaids: 0,
      superTackles: 0,
      players: defaultTeamBPlayers,
      timeoutsRemaining: 2,
      allOutsInflicted: 0,
      emptyRaidCount: 0,
    },
    toss: {
      wonBy: 'teamA',
      choice: 'Raid',
      announced: false,
    },
    raids: [],
    events: [],
    lastAction: 'Match Created',
    announcementQueue: [],
  };
}

let currentMatch = createInitialMatch();
let matchHistory: any[] = [];

// Load persisted state if exists
try {
  if (fs.existsSync(MATCH_FILE)) {
    const data = fs.readFileSync(MATCH_FILE, 'utf-8');
    currentMatch = JSON.parse(data);
  }
} catch (e) {
  console.error('Failed to load match state:', e);
}

try {
  if (fs.existsSync(HISTORY_FILE)) {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    matchHistory = JSON.parse(data);
  }
} catch (e) {
  console.error('Failed to load match history:', e);
}

function saveState() {
  try {
    fs.writeFileSync(MATCH_FILE, JSON.stringify(currentMatch, null, 2));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(matchHistory, null, 2));
  } catch (e) {
    console.error('Failed to persist state:', e);
  }
}

// REST API Endpoints

// 1. Get current match state
app.get('/api/match', (req: Request, res: Response) => {
  res.json({ success: true, match: currentMatch });
});

// 2. Setup / create new match
app.post('/api/match/create', (req: Request, res: Response) => {
  const {
    teamAName,
    teamBName,
    captainA,
    captainB,
    startTime,
    matchDate,
    matchDuration,
    halfDuration,
    tossWinner,
    tossChoice,
    playersA,
    playersB,
  } = req.body;

  const now = new Date();
  const autoDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
  const autoStartTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const halfMins = Number(halfDuration) || 10;
  const totalMins = Number(matchDuration) || 20;

  const resolvedPlayersA = (playersA && playersA.length ? [...playersA] : defaultTeamAPlayers).map((p, idx) => {
    if (captainA && idx === 0) {
      return { ...p, name: captainA.trim(), isCaptain: true };
    }
    return p;
  });

  const resolvedPlayersB = (playersB && playersB.length ? [...playersB] : defaultTeamBPlayers).map((p, idx) => {
    if (captainB && idx === 0) {
      return { ...p, name: captainB.trim(), isCaptain: true };
    }
    return p;
  });

  currentMatch = {
    id: 'match-' + Date.now(),
    matchNumber: (matchHistory.length || 0) + 1,
    date: matchDate || autoDate,
    startTime: startTime || autoStartTime,
    captainA: captainA?.trim() || resolvedPlayersA[0]?.name || 'Captain A',
    captainB: captainB?.trim() || resolvedPlayersB[0]?.name || 'Captain B',
    groundName: 'Agni Boys Ground',
    status: 'upcoming',
    half: 'first_half',
    matchDurationMinutes: totalMins,
    halfDurationMinutes: halfMins,
    timeRemainingSeconds: halfMins * 60,
    isTimerRunning: false,
    raidClockSeconds: 30,
    isRaidClockRunning: false,
    currentRaidingTeam: tossChoice === 'Raid' ? tossWinner : (tossWinner === 'teamA' ? 'teamB' : 'teamA'),
    isDoOrDieRaid: false,
    teamA: {
      id: 'teamA',
      name: teamAName?.trim() || 'THAMIYANUR AGNI BOYS',
      shortName: (teamAName?.trim() || 'TAB').substring(0, 4).toUpperCase(),
      color: '#ea580c',
      score: 0,
      totalRaidPoints: 0,
      totalTacklePoints: 0,
      totalBonusPoints: 0,
      successfulRaids: 0,
      emptyRaids: 0,
      unsuccessfulRaids: 0,
      superRaids: 0,
      superTackles: 0,
      players: resolvedPlayersA,
      timeoutsRemaining: 2,
      allOutsInflicted: 0,
      emptyRaidCount: 0,
    },
    teamB: {
      id: 'teamB',
      name: teamBName?.trim() || 'TEAM B',
      shortName: (teamBName?.trim() || 'TB').substring(0, 4).toUpperCase(),
      color: '#2563eb',
      score: 0,
      totalRaidPoints: 0,
      totalTacklePoints: 0,
      totalBonusPoints: 0,
      successfulRaids: 0,
      emptyRaids: 0,
      unsuccessfulRaids: 0,
      superRaids: 0,
      superTackles: 0,
      players: resolvedPlayersB,
      timeoutsRemaining: 2,
      allOutsInflicted: 0,
      emptyRaidCount: 0,
    },
    toss: {
      wonBy: tossWinner || 'teamA',
      choice: tossChoice || 'Raid',
      announced: true,
    },
    raids: [],
    events: [],
    lastAction: 'Match initialized with toss announcement',
    announcementQueue: [],
  };

  saveState();
  res.json({ success: true, match: currentMatch });
});

// 3. Update match sync state (timer, raid clock, status)
app.post('/api/match/state', (req: Request, res: Response) => {
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  // Merge allowed state updates
  if (typeof updates.timeRemainingSeconds === 'number') currentMatch.timeRemainingSeconds = updates.timeRemainingSeconds;
  if (typeof updates.isTimerRunning === 'boolean') currentMatch.isTimerRunning = updates.isTimerRunning;
  if (typeof updates.raidClockSeconds === 'number') currentMatch.raidClockSeconds = updates.raidClockSeconds;
  if (typeof updates.isRaidClockRunning === 'boolean') currentMatch.isRaidClockRunning = updates.isRaidClockRunning;
  if (updates.status) currentMatch.status = updates.status;
  if (updates.half) currentMatch.half = updates.half;
  if (updates.currentRaidingTeam) currentMatch.currentRaidingTeam = updates.currentRaidingTeam;
  if (typeof updates.isDoOrDieRaid === 'boolean') currentMatch.isDoOrDieRaid = updates.isDoOrDieRaid;

  saveState();
  res.json({ success: true, match: currentMatch });
});

// 4. Score event action (raid point, tackle, super tackle, all-out, empty raid, undo)
app.post('/api/match/action', (req: Request, res: Response) => {
  const { action, teamId, points, type, description, announcementText, playerId, replaceState } = req.body;

  if (action === 'undo') {
    if (currentMatch.events.length === 0) {
      return res.json({ success: true, match: currentMatch, message: 'No events to undo' });
    }

    const lastEvent = currentMatch.events.pop();
    if (lastEvent) {
      const scoringTeam = lastEvent.teamId === 'teamA' ? currentMatch.teamA : currentMatch.teamB;

      // Revert scores
      if (lastEvent.teamId === 'teamA') {
        currentMatch.teamA.score = Math.max(0, currentMatch.teamA.score - lastEvent.points);
      } else {
        currentMatch.teamB.score = Math.max(0, currentMatch.teamB.score - lastEvent.points);
      }

      // Revert team breakdown points
      if (lastEvent.type === 'raid_point' || lastEvent.type === 'touch_point' || lastEvent.type === 'super_raid') {
        scoringTeam.totalRaidPoints = Math.max(0, (scoringTeam.totalRaidPoints || 0) - lastEvent.points);
        scoringTeam.successfulRaids = Math.max(0, (scoringTeam.successfulRaids || 0) - 1);
        if (lastEvent.type === 'super_raid') scoringTeam.superRaids = Math.max(0, (scoringTeam.superRaids || 0) - 1);
      } else if (lastEvent.type === 'tackle_point' || lastEvent.type === 'super_tackle') {
        scoringTeam.totalTacklePoints = Math.max(0, (scoringTeam.totalTacklePoints || 0) - lastEvent.points);
        if (lastEvent.type === 'super_tackle') scoringTeam.superTackles = Math.max(0, (scoringTeam.superTackles || 0) - 1);
      } else if (lastEvent.type === 'bonus_point') {
        scoringTeam.totalBonusPoints = Math.max(0, (scoringTeam.totalBonusPoints || 0) - lastEvent.points);
      } else if (lastEvent.type === 'empty_raid') {
        scoringTeam.emptyRaids = Math.max(0, (scoringTeam.emptyRaids || 0) - 1);
      }

      // Revert raids record
      if (currentMatch.raids && currentMatch.raids.length > 0) {
        currentMatch.raids.pop();
      }

      // Revert player points if associated
      if (lastEvent.playerId) {
        const team = lastEvent.teamId === 'teamA' ? currentMatch.teamA : currentMatch.teamB;
        const player = team.players.find((p: any) => p.id === lastEvent.playerId);
        if (player) {
          if (lastEvent.type === 'tackle_point' || lastEvent.type === 'super_tackle') {
            player.tacklePoints = Math.max(0, player.tacklePoints - lastEvent.points);
          } else if (lastEvent.type === 'bonus_point') {
            player.bonusPoints = Math.max(0, player.bonusPoints - 1);
          } else {
            player.raidPoints = Math.max(0, player.raidPoints - lastEvent.points);
          }
          player.totalPoints = Math.max(0, player.totalPoints - lastEvent.points);
        }
      }

      currentMatch.lastAction = `Undo: ${lastEvent.description}`;
    }

    saveState();
    return res.json({ success: true, match: currentMatch });
  }

  if (action === 'full_update' && replaceState) {
    currentMatch = replaceState;
    saveState();
    return res.json({ success: true, match: currentMatch });
  }

  // Add event
  const scoringTeam = teamId === 'teamA' ? currentMatch.teamA : currentMatch.teamB;
  const opposingTeam = teamId === 'teamA' ? currentMatch.teamB : currentMatch.teamA;
  const pts = Number(points) || 0;

  scoringTeam.score += pts;

  // Track team-specific point breakdown
  if (type === 'raid_point' || type === 'touch_point' || type === 'super_raid') {
    scoringTeam.totalRaidPoints = (scoringTeam.totalRaidPoints || 0) + pts;
    scoringTeam.successfulRaids = (scoringTeam.successfulRaids || 0) + 1;
    if (type === 'super_raid') scoringTeam.superRaids = (scoringTeam.superRaids || 0) + 1;
  } else if (type === 'tackle_point' || type === 'super_tackle') {
    scoringTeam.totalTacklePoints = (scoringTeam.totalTacklePoints || 0) + pts;
    if (type === 'super_tackle') scoringTeam.superTackles = (scoringTeam.superTackles || 0) + 1;
  } else if (type === 'bonus_point') {
    scoringTeam.totalBonusPoints = (scoringTeam.totalBonusPoints || 0) + pts;
  }

  // Handle empty raid tracking for Do-or-Die
  if (type === 'empty_raid') {
    scoringTeam.emptyRaidCount = (scoringTeam.emptyRaidCount || 0) + 1;
    scoringTeam.emptyRaids = (scoringTeam.emptyRaids || 0) + 1;
  } else if (pts > 0 && type !== 'technical_point') {
    scoringTeam.emptyRaidCount = 0;
  }

  // Handle All Out
  if (type === 'all_out') {
    scoringTeam.allOutsInflicted = (scoringTeam.allOutsInflicted || 0) + 1;
    // Revive all players for opponent
    opposingTeam.players.slice(0, 7).forEach((p: any) => {
      p.isOnMat = true;
    });
  }

  // Update individual player statistics
  let selectedPlayerName = 'Team Raider';
  let selectedPlayerJersey = 0;
  if (playerId) {
    const player = scoringTeam.players.find((p: any) => p.id === playerId);
    if (player) {
      selectedPlayerName = player.name;
      selectedPlayerJersey = player.jerseyNumber;
      if (type === 'tackle_point' || type === 'super_tackle') {
        player.tacklePoints = (player.tacklePoints || 0) + pts;
      } else if (type === 'bonus_point') {
        player.bonusPoints = (player.bonusPoints || 0) + 1;
      } else {
        player.raidPoints = (player.raidPoints || 0) + pts;
      }
      player.totalPoints = (player.totalPoints || 0) + pts;
    }
  }

  // Auto switch raiding team after raid or tackle
  if (type !== 'technical_point') {
    currentMatch.currentRaidingTeam = currentMatch.currentRaidingTeam === 'teamA' ? 'teamB' : 'teamA';
    // Check if next raid is Do-or-Die (if next team has 2 empty raids)
    const nextTeam = currentMatch.currentRaidingTeam === 'teamA' ? currentMatch.teamA : currentMatch.teamB;
    currentMatch.isDoOrDieRaid = (nextTeam.emptyRaidCount || 0) >= 2;
    currentMatch.raidClockSeconds = 30;
  }

  // Record Raid in raids list for two-team history & Excel export
  if (!currentMatch.raids) currentMatch.raids = [];
  const raidNumber = currentMatch.raids.length + 1;
  const teamRaidNumber = currentMatch.raids.filter((r: any) => r.raidingTeamId === teamId).length + 1;

  const newRaid = {
    id: 'raid-' + Date.now(),
    raidNumber,
    teamRaidNumber,
    timestamp: Date.now(),
    gameTimeSeconds: currentMatch.timeRemainingSeconds,
    half: currentMatch.half,
    raidingTeamId: teamId,
    raidingTeamName: scoringTeam.name,
    raiderId: playerId,
    raiderName: selectedPlayerName,
    raiderJersey: selectedPlayerJersey,
    outcome: type,
    touchPoints: (type === 'raid_point' || type === 'touch_point' || type === 'super_raid') ? pts : 0,
    bonusPoints: type === 'bonus_point' ? pts : 0,
    tacklePoints: (type === 'tackle_point' || type === 'super_tackle') ? pts : 0,
    totalPointsScored: pts,
    scoringTeamId: teamId,
    isDoOrDie: currentMatch.isDoOrDieRaid || false,
    runningScoreA: currentMatch.teamA.score,
    runningScoreB: currentMatch.teamB.score,
    description: description || `Points for ${scoringTeam.name}`,
    tanglishAnnouncement: announcementText || `${scoringTeam.name} scored ${pts} points`,
  };
  currentMatch.raids.push(newRaid);

  const newEvent = {
    id: 'evt-' + Date.now(),
    timestamp: Date.now(),
    gameTimeSeconds: currentMatch.timeRemainingSeconds,
    type,
    teamId,
    points: pts,
    description: description || `Points for ${scoringTeam.name}`,
    announcementText: announcementText || `${pts} point for ${scoringTeam.name}!`,
    playerId,
    scoreSnapshot: {
      teamA: currentMatch.teamA.score,
      teamB: currentMatch.teamB.score,
    },
  };

  currentMatch.events.push(newEvent);
  currentMatch.lastAction = newEvent.description;

  saveState();
  res.json({ success: true, match: currentMatch, event: newEvent });
});

// 5. Save & finish match
app.post('/api/match/finish', (req: Request, res: Response) => {
  currentMatch.status = 'completed';
  currentMatch.isTimerRunning = false;
  currentMatch.isRaidClockRunning = false;
  currentMatch.half = 'finished';

  const now = new Date();
  const autoEndTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  currentMatch.endTime = autoEndTime;

  let winner: 'teamA' | 'teamB' | 'tie' = 'tie';
  let winnerName = 'Match Tied';
  if (currentMatch.teamA.score > currentMatch.teamB.score) {
    winner = 'teamA';
    winnerName = currentMatch.teamA.name;
  } else if (currentMatch.teamB.score > currentMatch.teamA.score) {
    winner = 'teamB';
    winnerName = currentMatch.teamB.name;
  }
  currentMatch.winner = winner;

  // Find top raider and defender
  const allPlayers = [...currentMatch.teamA.players, ...currentMatch.teamB.players];
  const topRaiderPlayer = [...allPlayers].sort((a, b) => (b.raidPoints || 0) - (a.raidPoints || 0))[0];
  const topDefenderPlayer = [...allPlayers].sort((a, b) => (b.tacklePoints || 0) - (a.tacklePoints || 0))[0];

  const summary = {
    id: currentMatch.id,
    date: currentMatch.date,
    startTime: currentMatch.startTime,
    endTime: autoEndTime,
    captainA: currentMatch.captainA || currentMatch.teamA.players[0]?.name || 'Captain A',
    captainB: currentMatch.captainB || currentMatch.teamB.players[0]?.name || 'Captain B',
    matchNumber: currentMatch.matchNumber,
    teamA: {
      name: currentMatch.teamA.name,
      score: currentMatch.teamA.score,
      raidPoints: currentMatch.teamA.totalRaidPoints || 0,
      tacklePoints: currentMatch.teamA.totalTacklePoints || 0,
      bonusPoints: currentMatch.teamA.totalBonusPoints || 0,
    },
    teamB: {
      name: currentMatch.teamB.name,
      score: currentMatch.teamB.score,
      raidPoints: currentMatch.teamB.totalRaidPoints || 0,
      tacklePoints: currentMatch.teamB.totalTacklePoints || 0,
      bonusPoints: currentMatch.teamB.totalBonusPoints || 0,
    },
    winner: winnerName,
    finalScoreText: `${currentMatch.teamA.score} - ${currentMatch.teamB.score}`,
    topRaider: topRaiderPlayer ? {
      name: topRaiderPlayer.name,
      points: topRaiderPlayer.raidPoints || 0,
      team: currentMatch.teamA.players.some((p: any) => p.id === topRaiderPlayer.id) ? currentMatch.teamA.name : currentMatch.teamB.name,
    } : undefined,
    topDefender: topDefenderPlayer ? {
      name: topDefenderPlayer.name,
      points: topDefenderPlayer.tacklePoints || 0,
      team: currentMatch.teamA.players.some((p: any) => p.id === topDefenderPlayer.id) ? currentMatch.teamA.name : currentMatch.teamB.name,
    } : undefined,
    totalEvents: currentMatch.events.length,
    timestamp: Date.now(),
  };

  matchHistory.unshift(summary);
  saveState();

  res.json({ success: true, match: currentMatch, summary });
});

// 6. Get match history
app.get('/api/matches', (req: Request, res: Response) => {
  res.json({ success: true, history: matchHistory });
});

const QUOTA_FILE = path.join(DATA_DIR, 'tts_quota.json');
let quotaExhaustedUntil = 0;
try {
  if (fs.existsSync(QUOTA_FILE)) {
    const qData = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
    if (qData.quotaExhaustedUntil && Number(qData.quotaExhaustedUntil) > Date.now()) {
      quotaExhaustedUntil = Number(qData.quotaExhaustedUntil);
    }
  }
} catch (e) {
  // Ignore quota file parse error
}

function recordQuotaExhausted(durationMs: number = 24 * 60 * 60 * 1000) {
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify({ quotaExhaustedUntil }, null, 2));
  } catch (e) {
    // Ignore persistence error
  }
}

// 7. AI Male Voice TTS endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    const currentKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    if (!currentKey) {
      return res.json({
        success: false,
        useFallback: true,
        message: 'No GEMINI_API_KEY configured; using browser male voice fallback',
      });
    }

    // Circuit breaker: If free-tier quota is exhausted, immediately return fallback without throwing 429
    if (Date.now() < quotaExhaustedUntil) {
      return res.json({
        success: false,
        useFallback: true,
        quotaExceeded: true,
        message: 'Free tier TTS daily quota active (10 requests/day limit). Seamlessly using instant browser male voice.',
      });
    }

    const cacheKey = `${voiceName || 'Fenrir'}-${text.trim()}`;
    if (audioCache.has(cacheKey)) {
      return res.json({
        success: true,
        audio: audioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey: currentKey,
      apiVersion: 'v1alpha',
    });

    // Call Gemini 3.8 Flash Lite TTS with authoritative male announcer voice
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName === 'Charon' ? 'Charon' : 'Fenrir', // Deep authoritative male voices only (No female voice)
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      audioCache.set(cacheKey, base64Audio);
      return res.json({
        success: true,
        audio: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      return res.json({
        success: false,
        useFallback: true,
      });
    }
  } catch (err: any) {
    const errMsg = typeof err === 'object' ? JSON.stringify(err) : String(err || '');
    const isQuota =
      err?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('Quota exceeded') ||
      errMsg.includes('rate-limits');

    if (isQuota) {
      // Free tier limit on gemini-3.8-flash-lite-tts is 10 req/day; back off for 24 hours
      recordQuotaExhausted(24 * 60 * 60 * 1000);
      console.log('Gemini TTS: Free Tier daily quota limit active (10 requests/day). Seamlessly using instant browser male voice.');
      return res.json({
        success: false,
        useFallback: true,
        quotaExceeded: true,
        message: 'Free tier TTS daily quota limit reached. Using instant browser male voice.',
      });
    }

    console.log('Gemini TTS: Falling back to browser male voice announcer.');
    return res.json({
      success: false,
      useFallback: true,
      message: 'TTS generation unavailable, falling back to browser synthesis',
    });
  }
});

// Fallback for any unknown /api/* routes so they never return HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Vite middleware for frontend assets and SPA routes
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kabaddi Live Scoreboard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

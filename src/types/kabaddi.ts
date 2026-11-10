export type PlayerRole = 'Raider' | 'Defender' | 'All-Rounder';

export interface Player {
  id: string;
  jerseyNumber: number;
  name: string;
  role: PlayerRole;
  isCaptain?: boolean;
  isOnMat: boolean;
  raidPoints: number;
  tacklePoints: number;
  bonusPoints: number;
  totalPoints: number;
}

export interface Team {
  id: 'teamA' | 'teamB';
  name: string;
  shortName: string;
  color: string;
  score: number;
  totalRaidPoints: number;
  totalTacklePoints: number;
  totalBonusPoints: number;
  successfulRaids: number;
  emptyRaids: number;
  unsuccessfulRaids: number;
  superRaids: number;
  superTackles: number;
  players: Player[];
  timeoutsRemaining: number;
  allOutsInflicted: number;
  emptyRaidCount: number; // for consecutive empty raids & do-or-die tracking
}

export type MatchHalf = 'first_half' | 'half_time' | 'second_half' | 'extra_time' | 'finished';

export type TossChoice = 'Raid' | 'Court';

export interface TossInfo {
  wonBy: 'teamA' | 'teamB';
  choice: TossChoice;
  announced: boolean;
}

export type RaidOutcomeType =
  | 'touch_point'
  | 'super_raid'
  | 'bonus_point'
  | 'successful_tackle'
  | 'super_tackle'
  | 'empty_raid'
  | 'all_out'
  | 'technical_point';

export interface RaidRecord {
  id: string;
  raidNumber: number; // Overall match raid number
  teamRaidNumber: number; // Team specific raid number (Team A Raid #1, Team A Raid #2)
  timestamp: number;
  gameTimeSeconds: number;
  half: MatchHalf;
  raidingTeamId: 'teamA' | 'teamB';
  raidingTeamName: string;
  raiderId?: string;
  raiderName: string;
  raiderJersey: number;
  outcome: RaidOutcomeType;
  touchPoints: number;
  bonusPoints: number;
  tacklePoints: number;
  totalPointsScored: number;
  scoringTeamId: 'teamA' | 'teamB';
  isDoOrDie: boolean;
  runningScoreA: number;
  runningScoreB: number;
  description: string;
  tanglishAnnouncement: string;
}

export type ScoreEventType =
  | 'raid_point'
  | 'touch_point'
  | 'bonus_point'
  | 'super_raid'
  | 'tackle_point'
  | 'super_tackle'
  | 'all_out'
  | 'empty_raid'
  | 'technical_point';

export interface MatchEvent {
  id: string;
  timestamp: number;
  gameTimeSeconds: number;
  type: ScoreEventType;
  teamId: 'teamA' | 'teamB';
  points: number;
  description: string;
  tamilDescription: string;
  announcementText: string;
  tamilAnnouncementText: string;
  tanglishAnnouncement?: string;
  playerId?: string;
  playerName?: string;
  playersRevived?: number;
  playersOut?: number;
  scoreSnapshot: {
    teamA: number;
    teamB: number;
  };
}

export interface MatchState {
  id: string;
  matchNumber: number;
  date: string;
  startTime: string;
  endTime?: string;
  captainA?: string;
  captainB?: string;
  groundName: string;
  status: 'upcoming' | 'live' | 'paused' | 'half_time' | 'completed';
  half: MatchHalf;
  matchDurationMinutes: number;
  halfDurationMinutes: number;
  timeRemainingSeconds: number;
  isTimerRunning: boolean;
  
  // 30-second raid clock
  raidClockSeconds: number;
  isRaidClockRunning: boolean;
  currentRaidingTeam: 'teamA' | 'teamB';
  isDoOrDieRaid: boolean;

  teamA: Team;
  teamB: Team;
  toss: TossInfo;

  raids: RaidRecord[];
  events: MatchEvent[];
  lastAction?: string;
  winner?: 'teamA' | 'teamB' | 'tie';
  announcementQueue: string[];
  announcementsTriggered?: {
    matchStart?: boolean;
    secondHalfStart?: boolean;
    fiveMinWarning?: boolean;
    fourMinWarning?: boolean;
    threeMinWarning?: boolean;
    twoMinWarning?: boolean;
    oneMinWarning?: boolean;
    finalWhistle?: boolean;
  };
}

export interface MatchSummary {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  captainA?: string;
  captainB?: string;
  matchNumber?: number;
  groundName: string;
  teamA: {
    name: string;
    score: number;
    raidPoints: number;
    tacklePoints: number;
    bonusPoints: number;
  };
  teamB: {
    name: string;
    score: number;
    raidPoints: number;
    tacklePoints: number;
    bonusPoints: number;
  };
  winner: string;
  finalScoreText: string;
  topRaider?: {
    name: string;
    team: string;
    points: number;
  };
  topDefender?: {
    name: string;
    team: string;
    points: number;
  };
  totalRaids: number;
  totalEvents: number;
  timestamp?: number;
}

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header, AppTabType } from './components/Header';
import { WelcomeBanner } from './components/WelcomeBanner';
import { ScoreboardMain } from './components/ScoreboardMain';
import { RaidTimer } from './components/RaidTimer';
import { ScoreControls } from './components/ScoreControls';
import { TossSetupModal } from './components/TossSetupModal';
import { LineupManager } from './components/LineupManager';
import { PublicViewer } from './components/PublicViewer';
import { MatchHistory } from './components/MatchHistory';
import { RaidPointHistory } from './components/RaidPointHistory';
import { MicrophoneController } from './components/MicrophoneController';
import { MatchState, MatchSummary, ScoreEventType, Player } from './types/kabaddi';
import {
  fetchCurrentMatch,
  createNewMatch,
  postMatchAction,
  syncMatchState,
  finishAndSaveMatch,
  fetchMatchHistory,
  CreateMatchParams,
} from './services/api';
import { announcer, soundFX } from './services/audioService';

const defaultInitialMatch: MatchState = {
  id: 'match-default',
  matchNumber: 1,
  date: '09/11/26',
  startTime: '06:00 PM',
  groundName: 'Agni Boys Ground',
  status: 'upcoming',
  half: 'first_half',
  matchDurationMinutes: 20,
  halfDurationMinutes: 10,
  timeRemainingSeconds: 600,
  isTimerRunning: false,
  raidClockSeconds: 30,
  isRaidClockRunning: false,
  currentRaidingTeam: 'teamA',
  isDoOrDieRaid: false,
  teamA: {
    id: 'teamA',
    name: 'THAMIYANUR AGNI BOYS',
    shortName: 'TAB',
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
    players: [
      { id: 'a1', jerseyNumber: 7, name: 'Karthik Raja', role: 'Raider', isCaptain: true, isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a2', jerseyNumber: 3, name: 'Mani Bharathi', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a3', jerseyNumber: 5, name: 'Siva Prakash', role: 'Raider', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a4', jerseyNumber: 9, name: 'Arun Kumar', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a5', jerseyNumber: 11, name: 'Vetri Vel', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a6', jerseyNumber: 2, name: 'Prasanth', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'a7', jerseyNumber: 10, name: 'Dinesh Agni', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
    ],
    timeoutsRemaining: 2,
    allOutsInflicted: 0,
    emptyRaidCount: 0,
  },
  teamB: {
    id: 'teamB',
    name: 'KONGU WARRIORS',
    shortName: 'KGW',
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
    players: [
      { id: 'b1', jerseyNumber: 1, name: 'Vijay Anand', role: 'Raider', isCaptain: true, isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b2', jerseyNumber: 4, name: 'Saravanan', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b3', jerseyNumber: 8, name: 'Muthu Vel', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b4', jerseyNumber: 6, name: 'Anbarasu', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b5', jerseyNumber: 12, name: 'Raghavan', role: 'Raider', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b6', jerseyNumber: 15, name: 'Gokul Nath', role: 'Defender', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
      { id: 'b7', jerseyNumber: 99, name: 'Sathish Kumar', role: 'All-Rounder', isOnMat: true, raidPoints: 0, tacklePoints: 0, bonusPoints: 0, totalPoints: 0 },
    ],
    timeoutsRemaining: 2,
    allOutsInflicted: 0,
    emptyRaidCount: 0,
  },
  toss: {
    wonBy: 'teamA',
    choice: 'Raid',
    announced: true,
  },
  raids: [],
  events: [],
  lastAction: 'Ready to play',
  announcementQueue: [],
};

export default function App() {
  const [match, setMatch] = useState<MatchState>(() => {
    try {
      const cached = localStorage.getItem('agni_kabaddi_current_match');
      if (cached) return JSON.parse(cached);
    } catch {}
    return defaultInitialMatch;
  });
  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [activeTab, setActiveTab] = useState<AppTabType>('controller');
  const [isTossModalOpen, setIsTossModalOpen] = useState(false);
  const [isNextMatchMode, setIsNextMatchMode] = useState(false);
  const [previousWinnerName, setPreviousWinnerName] = useState<string | undefined>();
  const [selectedTeamId, setSelectedTeamId] = useState<'teamA' | 'teamB'>('teamA');
  const [isMuted, setIsMuted] = useState(false);

  // Initial load & hydration
  useEffect(() => {
    async function loadData() {
      const [current, pastMatches] = await Promise.all([
        fetchCurrentMatch(),
        fetchMatchHistory(),
      ]);
      if (current) {
        setMatch(current);
        setSelectedTeamId(current.currentRaidingTeam || 'teamA');
      }
      if (pastMatches && pastMatches.length > 0) {
        setHistory(pastMatches);
      }
    }
    loadData();

    // Auto sync match from backend every 3 seconds for live spectator updates
    const syncInterval = setInterval(async () => {
      const live = await fetchCurrentMatch();
      if (live) {
        setMatch((prev) => {
          // If local match timer or raid clock is running, protect local countdowns
          if (prev && (prev.isTimerRunning || prev.isRaidClockRunning)) {
            return {
              ...live,
              timeRemainingSeconds: prev.timeRemainingSeconds,
              isTimerRunning: prev.isTimerRunning,
              raidClockSeconds: prev.raidClockSeconds,
              isRaidClockRunning: prev.isRaidClockRunning,
            };
          }
          return live;
        });
      }
    }, 3000);

    return () => clearInterval(syncInterval);
  }, []);

  // Match Timer interval with 5, 4, 3, 2, 1-minute automated warnings and final whistle
  useEffect(() => {
    let interval: any = null;
    if (match && match.isTimerRunning) {
      interval = setInterval(() => {
        setMatch((prev) => {
          if (!prev || !prev.isTimerRunning) return prev;

          // Half time / time expiry reached
          if (prev.timeRemainingSeconds <= 1) {
            soundFX.playWhistle();
            if (prev.half === 'first_half') {
              announcer.announceSecondHalf(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
              syncMatchState({ isTimerRunning: false, timeRemainingSeconds: 0, half: 'half_time' });
              return {
                ...prev,
                timeRemainingSeconds: 0,
                isTimerRunning: false,
                half: 'half_time',
              };
            } else {
              // Final whistle automatically!
              const winnerText =
                prev.teamA.score > prev.teamB.score
                  ? prev.teamA.name
                  : prev.teamB.score > prev.teamA.score
                  ? prev.teamB.name
                  : 'Match Tied';
              announcer.announceMatchResult(winnerText, prev.teamA.score, prev.teamB.score, prev.teamA.name, prev.teamB.name);
              syncMatchState({ isTimerRunning: false, timeRemainingSeconds: 0, half: 'finished', status: 'completed' });
              return {
                ...prev,
                timeRemainingSeconds: 0,
                isTimerRunning: false,
                half: 'finished',
                status: 'completed',
              };
            }
          }

          const next = prev.timeRemainingSeconds - 1;

          // 5 Minutes Warning Announcement (at exactly 300 seconds)
          if (next === 300 && !prev.announcementsTriggered?.fiveMinWarning) {
            announcer.announceFiveMinutesRemaining(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
            return {
              ...prev,
              timeRemainingSeconds: next,
              announcementsTriggered: { ...prev.announcementsTriggered, fiveMinWarning: true },
            };
          }

          // 4 Minutes Warning Announcement (at exactly 240 seconds)
          if (next === 240 && !prev.announcementsTriggered?.fourMinWarning) {
            announcer.announceFourMinutesRemaining(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
            return {
              ...prev,
              timeRemainingSeconds: next,
              announcementsTriggered: { ...prev.announcementsTriggered, fourMinWarning: true },
            };
          }

          // 3 Minutes Warning Announcement (at exactly 180 seconds)
          if (next === 180 && !prev.announcementsTriggered?.threeMinWarning) {
            announcer.announceThreeMinutesRemaining(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
            return {
              ...prev,
              timeRemainingSeconds: next,
              announcementsTriggered: { ...prev.announcementsTriggered, threeMinWarning: true },
            };
          }

          // 2 Minutes Warning Announcement (at exactly 120 seconds)
          if (next === 120 && !prev.announcementsTriggered?.twoMinWarning) {
            announcer.announceTwoMinutesRemaining(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
            return {
              ...prev,
              timeRemainingSeconds: next,
              announcementsTriggered: { ...prev.announcementsTriggered, twoMinWarning: true },
            };
          }

          // 1 Minute Final Warning Announcement (at exactly 60 seconds)
          if (next === 60 && !prev.announcementsTriggered?.oneMinWarning) {
            announcer.announceOneMinuteRemaining(prev.teamA.name, prev.teamA.score, prev.teamB.name, prev.teamB.score);
            return {
              ...prev,
              timeRemainingSeconds: next,
              announcementsTriggered: { ...prev.announcementsTriggered, oneMinWarning: true },
            };
          }

          // Periodically sync every 15s
          if (next % 15 === 0) {
            syncMatchState({ timeRemainingSeconds: next });
          }
          return { ...prev, timeRemainingSeconds: next };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match?.isTimerRunning]);

  // Dedicated 30-Second Raid Clock interval
  useEffect(() => {
    let interval: any = null;
    if (match && match.isRaidClockRunning) {
      interval = setInterval(() => {
        setMatch((prev) => {
          if (!prev || !prev.isRaidClockRunning) return prev;
          if (prev.raidClockSeconds <= 1) {
            // 30 Seconds Complete!
            // Referee double whistle blast (visal sound) + loud horn buzzer
            soundFX.playRaidCompleteSound();

            const raidingTeamName = prev.currentRaidingTeam === 'teamA' ? prev.teamA.name : prev.teamB.name;
            const defendingTeamName = prev.currentRaidingTeam === 'teamA' ? prev.teamB.name : prev.teamA.name;

            if (prev.isDoOrDieRaid) {
              soundFX.playCheer();
              announcer.speakGeminiMaleVoice(
                `30 நொடிகள் முடிந்தது! டூ-ஆர்-டை ரெய்டில் புள்ளி கிடைக்கவில்லை. ${defendingTeamName} அணிக்கு டேக்கிள் புள்ளி!`
              );
            } else {
              announcer.speakGeminiMaleVoice(
                `30 நொடிகள் ரெய்டு நேரம் முடிந்தது! ${raidingTeamName} அணியின் எம்டி ரெய்டு!`
              );
            }

            const nextRaider = prev.currentRaidingTeam === 'teamA' ? 'teamB' : 'teamA';
            syncMatchState({
              raidClockSeconds: 30,
              isRaidClockRunning: false,
              currentRaidingTeam: nextRaider,
            });

            return {
              ...prev,
              raidClockSeconds: 30,
              isRaidClockRunning: false,
              currentRaidingTeam: nextRaider,
            };
          }

          const nextSec = prev.raidClockSeconds - 1;
          // Warning beeps for last 5 seconds (5, 4, 3, 2, 1)
          if (nextSec <= 5 && nextSec > 0) {
            soundFX.playBeep(false);
          }
          return { ...prev, raidClockSeconds: nextSec };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match?.isRaidClockRunning]);

  // Toggle match timer with automated Match Start & Second Half Voice Announcements
  const handleToggleMatchTimer = async () => {
    const nextRunning = !match.isTimerRunning;
    soundFX.playWhistle();

    // 1. Automatic Match Start Announcement with Captains when starting for first time
    if (nextRunning && !match.announcementsTriggered?.matchStart && match.half === 'first_half') {
      const captainA = match.captainA || match.teamA.players.find((p) => p.isCaptain)?.name || match.teamA.players[0]?.name || 'Captain A';
      const captainB = match.captainB || match.teamB.players.find((p) => p.isCaptain)?.name || match.teamB.players[0]?.name || 'Captain B';
      announcer.announceMatchStart(match.teamA.name, captainA, match.teamB.name, captainB, match.startTime);

      const updated = {
        ...match,
        isTimerRunning: true,
        status: 'live' as const,
        announcementsTriggered: { ...match.announcementsTriggered, matchStart: true },
      };
      setMatch(updated);
      await syncMatchState({
        isTimerRunning: true,
        status: 'live',
        announcementsTriggered: updated.announcementsTriggered,
      });
      return;
    }

    // 2. Automatic Second-Half Starting Announcement when resuming in second half
    if (nextRunning && !match.announcementsTriggered?.secondHalfStart && match.half === 'second_half') {
      announcer.announceSecondHalf(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score);
      const updated = {
        ...match,
        isTimerRunning: true,
        status: 'live' as const,
        announcementsTriggered: { ...match.announcementsTriggered, secondHalfStart: true },
      };
      setMatch(updated);
      await syncMatchState({
        isTimerRunning: true,
        status: 'live',
        announcementsTriggered: updated.announcementsTriggered,
      });
      return;
    }

    setMatch((prev) => ({ ...prev, isTimerRunning: nextRunning, status: nextRunning ? 'live' : 'paused' }));
    await syncMatchState({ isTimerRunning: nextRunning, status: nextRunning ? 'live' : 'paused' });
  };

  // Adjust match timer
  const handleAdjustTimer = async (deltaSeconds: number) => {
    const nextSec = Math.max(0, match.timeRemainingSeconds + deltaSeconds);
    setMatch((prev) => ({ ...prev, timeRemainingSeconds: nextSec }));
    await syncMatchState({ timeRemainingSeconds: nextSec });
  };

  // Switch Half (1st half -> half time -> 2nd half)
  const handleSwitchHalf = async () => {
    soundFX.playWhistle();

    let nextHalf: any = 'half_time';
    let nextSeconds = match.halfDurationMinutes * 60;

    if (match.half === 'first_half') {
      nextHalf = 'half_time';
      announcer.speakGeminiMaleVoice(
        `முதல் பாதி முடிவடைந்தது! அக்னி பாய்ஸ் மைதானம்! தற்போதைய புள்ளி விவரம்: ${match.teamA.name} ${match.teamA.score}, ${match.teamB.name} ${match.teamB.score}!`,
        `First half complete! Current score: ${match.teamA.name} ${match.teamA.score}, ${match.teamB.name} ${match.teamB.score}!`
      );
    } else if (match.half === 'half_time') {
      nextHalf = 'second_half';
      nextSeconds = match.halfDurationMinutes * 60;
      announcer.announceSecondHalf(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score);
    } else if (match.half === 'second_half') {
      nextHalf = 'extra_time';
      nextSeconds = 5 * 60;
    }

    const updated = {
      ...match,
      half: nextHalf,
      timeRemainingSeconds: nextSeconds,
      isTimerRunning: false,
      raidClockSeconds: 30,
      isRaidClockRunning: false,
      announcementsTriggered: {
        ...match.announcementsTriggered,
        secondHalfStart: nextHalf === 'second_half' ? true : match.announcementsTriggered?.secondHalfStart,
      },
    };
    setMatch(updated);
    await syncMatchState({
      half: nextHalf,
      timeRemainingSeconds: nextSeconds,
      isTimerRunning: false,
      raidClockSeconds: 30,
      isRaidClockRunning: false,
      announcementsTriggered: updated.announcementsTriggered,
    });
  };

  // 30s Raid Clock Controls
  const handleToggleRaidClock = async () => {
    const nextRunning = !match.isRaidClockRunning;
    if (nextRunning) {
      soundFX.playWhistle(true);
    }
    setMatch((prev) => ({ ...prev, isRaidClockRunning: nextRunning }));
    await syncMatchState({ isRaidClockRunning: nextRunning });
  };

  const handleResetRaidClock = async () => {
    setMatch((prev) => ({ ...prev, raidClockSeconds: 30, isRaidClockRunning: false }));
    await syncMatchState({ raidClockSeconds: 30, isRaidClockRunning: false });
  };

  const handleToggleDoOrDie = async () => {
    const nextDoOrDie = !match.isDoOrDieRaid;
    if (nextDoOrDie) {
      soundFX.playBeep(true);
      const raidingTeamName = match.currentRaidingTeam === 'teamA' ? match.teamA.name : match.teamB.name;
      announcer.speakGeminiMaleVoice(`${raidingTeamName} அணிக்கு டூ-ஆர்-டை ரெய்டு! புள்ளி பெற வேண்டும்!`);
    }
    setMatch((prev) => ({ ...prev, isDoOrDieRaid: nextDoOrDie }));
    await syncMatchState({ isDoOrDieRaid: nextDoOrDie });
  };

  // Score Action
  const handleScoreAction = async (payload: {
    type: ScoreEventType;
    points: number;
    description: string;
    announcementText: string;
    tamilAnnouncementText: string;
    playerId?: string;
  }) => {
    if (!match) return;

    const scoringTeamId = selectedTeamId;
    const res = await postMatchAction({
      action: 'score',
      teamId: scoringTeamId,
      points: payload.points,
      type: payload.type,
      description: payload.description,
      announcementText: payload.announcementText,
      playerId: payload.playerId,
    });

    if (res) {
      setMatch(res);
      if (res.currentRaidingTeam) {
        setSelectedTeamId(res.currentRaidingTeam);
      }
    }
  };

  // Undo Last Action
  const handleUndoLast = async () => {
    if (!match) return;
    soundFX.playWhistle();
    announcer.speakGeminiMaleVoice('புள்ளி திருத்தம் செய்யப்பட்டது.');
    const res = await postMatchAction({ action: 'undo' });
    if (res) {
      setMatch(res);
    }
  };

  // Finish & Archive Match
  const handleFinishMatch = async () => {
    if (!match) return;

    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    const res = await finishAndSaveMatch();
    if (res) {
      setMatch(res.match);
      setHistory((prev) => [res.summary, ...prev]);

      const winnerText =
        res.match.teamA.score > res.match.teamB.score
          ? res.match.teamA.name
          : res.match.teamB.score > res.match.teamA.score
          ? res.match.teamB.name
          : 'Match Tied';

      setPreviousWinnerName(winnerText);

      announcer.announceMatchResult(
        winnerText,
        res.match.teamA.score,
        res.match.teamB.score,
        res.match.teamA.name,
        res.match.teamB.name
      );
      setActiveTab('history');
    }
  };

  // Open New Match Modal
  const handleOpenNewMatch = () => {
    setIsNextMatchMode(false);
    setIsTossModalOpen(true);
  };

  // Open Next Match with Previous Winner Carrying Forward
  const handleOpenNextMatch = (winnerName?: string) => {
    const winner =
      winnerName ||
      (match.teamA.score > match.teamB.score
        ? match.teamA.name
        : match.teamB.score > match.teamA.score
        ? match.teamB.name
        : 'Match Tied');
    setPreviousWinnerName(winner);
    setIsNextMatchMode(true);
    setIsTossModalOpen(true);
  };

  // New Match Submit
  const handleCreateNewMatch = async (params: CreateMatchParams) => {
    const created = await createNewMatch(params);
    if (created) {
      setMatch(created);
      setSelectedTeamId(created.currentRaidingTeam);
      setIsNextMatchMode(false);
      setActiveTab('controller');
    }
  };

  // Lineup Update
  const handleUpdateTeamPlayers = async (teamId: 'teamA' | 'teamB', players: Player[]) => {
    if (!match) return;
    const updated = {
      ...match,
      [teamId]: {
        ...match[teamId],
        players,
      },
    };
    setMatch(updated);
    await postMatchAction({
      action: 'full_update',
      replaceState: updated,
    });
  };

  const currentRaidingTeamName =
    match.currentRaidingTeam === 'teamA' ? match.teamA.name : match.teamB.name;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMatch={handleOpenNewMatch}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        matchStatus={match.status}
        onSpeakTotalPoints={() => announcer.speakTamilTotalPoints(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Stadium Welcome Banner: Vanakkam! Welcome to Agni Boys Ground! */}
        <WelcomeBanner />

        {/* Tab 1: Primary Scoreboard & Match Controller */}
        {activeTab === 'controller' && (
          <div className="space-y-4">
            <ScoreboardMain
              match={match}
              onToggleMatchTimer={handleToggleMatchTimer}
              onAdjustTimer={handleAdjustTimer}
              onSwitchHalf={handleSwitchHalf}
              onFinishMatch={handleFinishMatch}
              onCreateNextMatch={() => handleOpenNextMatch()}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
            />

            {/* 30-Second Raid Clock with Visal Sound & Buzzer on Expiry */}
            <RaidTimer
              seconds={match.raidClockSeconds}
              isRunning={match.isRaidClockRunning}
              onToggle={handleToggleRaidClock}
              onReset={handleResetRaidClock}
              currentRaidingTeamName={currentRaidingTeamName}
              isDoOrDie={match.isDoOrDieRaid}
              onToggleDoOrDie={handleToggleDoOrDie}
            />

            {/* Manual Scorepad (Voice commands removed as requested) */}
            <ScoreControls
              match={match}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
              onScoreAction={handleScoreAction}
              onUndoLast={handleUndoLast}
            />
          </div>
        )}

        {/* Tab 2: Two-Team Raid Point History & Excel Export */}
        {activeTab === 'raid_history' && (
          <RaidPointHistory
            match={match}
            onUndoLast={handleUndoLast}
          />
        )}

        {/* Tab 3: Umpire Microphone Controller & Ground Speaker */}
        {activeTab === 'microphone' && (
          <MicrophoneController match={match} />
        )}

        {/* Tab 4: Public Viewer (Big Screen Stadium View) */}
        {activeTab === 'viewer' && <PublicViewer match={match} />}

        {/* Tab 5: Lineups & Player Tracking */}
        {activeTab === 'lineups' && (
          <LineupManager
            teamA={match.teamA}
            teamB={match.teamB}
            onUpdateTeamPlayers={handleUpdateTeamPlayers}
          />
        )}

        {/* Tab 6: Archived Matches */}
        {activeTab === 'history' && (
          <MatchHistory
            history={history}
            onCreateNextMatch={handleOpenNextMatch}
            onRefresh={async () => {
              const past = await fetchMatchHistory();
              setHistory(past);
            }}
          />
        )}
      </main>

      {/* Toss Setup & New / Next Match Modal */}
      <TossSetupModal
        isOpen={isTossModalOpen}
        onClose={() => {
          setIsTossModalOpen(false);
          setIsNextMatchMode(false);
        }}
        onSubmit={handleCreateNewMatch}
        initialTeamA={isNextMatchMode && previousWinnerName && previousWinnerName !== 'Match Tied' ? previousWinnerName : match.teamA.name}
        initialCaptainA={match.captainA || match.teamA.players[0]?.name}
        initialTeamB={isNextMatchMode ? 'KONGU WARRIORS' : match.teamB.name}
        initialCaptainB={match.captainB || match.teamB.players[0]?.name}
        isNextMatch={isNextMatchMode}
        previousWinner={previousWinnerName}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">
          THAMIYANUR AGNI BOYS SPORTS CLUB • AGNI BOYS GROUND LIVE KABADDI SCOREBOARD
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Natural Human Male Sports Announcer • Fast Reaction Sound Effects • Excel Data Export
        </p>
      </footer>
    </div>
  );
}

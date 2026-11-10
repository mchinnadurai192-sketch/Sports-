import React, { useState, useEffect } from 'react';
import { X, Trophy, Calendar, Clock, Volume2, Sparkles, User, Shield, Flame } from 'lucide-react';
import { announcer, soundFX } from '../services/audioService';
import { CreateMatchParams } from '../services/api';

interface TossSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: CreateMatchParams) => Promise<void>;
  initialTeamA?: string;
  initialCaptainA?: string;
  initialTeamB?: string;
  initialCaptainB?: string;
  isNextMatch?: boolean;
  previousWinner?: string;
}

export const TossSetupModal: React.FC<TossSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTeamA = 'THAMIYANUR AGNI BOYS',
  initialCaptainA = 'K. Sakthivel',
  initialTeamB = 'KONGU WARRIORS',
  initialCaptainB = 'M. Dinesh',
  isNextMatch = false,
  previousWinner,
}) => {
  const getDetectedDate = () => {
    try {
      return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
    } catch {
      return '10/11/2026';
    }
  };

  const [teamAName, setTeamAName] = useState(initialTeamA);
  const [captainA, setCaptainA] = useState(initialCaptainA);
  const [teamBName, setTeamBName] = useState(initialTeamB);
  const [captainB, setCaptainB] = useState(initialCaptainB);
  const [matchDate, setMatchDate] = useState(getDetectedDate());
  const [matchDuration, setMatchDuration] = useState<number>(20);
  const [halfDuration, setHalfDuration] = useState<number>(10);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const [tossWinner, setTossWinner] = useState<'teamA' | 'teamB'>('teamA');
  const [tossChoice, setTossChoice] = useState<'Raid' | 'Court'>('Raid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isNextMatch && previousWinner && previousWinner !== 'Match Tied') {
        setTeamAName(previousWinner);
        setCaptainA(initialCaptainA || 'Champion Captain');
        setTeamBName(initialTeamB !== previousWinner ? initialTeamB : 'NEW CHALLENGERS');
        setCaptainB(initialCaptainB || 'Challenger Captain');
      } else {
        setTeamAName(initialTeamA);
        setCaptainA(initialCaptainA);
        setTeamBName(initialTeamB);
        setCaptainB(initialCaptainB);
      }
      setMatchDate(getDetectedDate());
    }
  }, [isOpen, isNextMatch, previousWinner, initialTeamA, initialCaptainA, initialTeamB, initialCaptainB]);

  if (!isOpen) return null;

  const winnerName = tossWinner === 'teamA' ? (teamAName.trim() || 'Team A') : (teamBName.trim() || 'Team B');
  const choiceText = tossChoice === 'Raid' ? 'Raid' : 'Court';

  // Dynamic Toss Announcement text
  const englishAnnouncement = `${winnerName} won the toss and elected to ${choiceText === 'Raid' ? 'raid first' : 'choose court side'}!`;
  const tamilAnnouncement = `${winnerName} டாஸ் வென்று ${choiceText === 'Raid' ? 'ரெய்டு செய்ய' : 'கோர்ட் பக்கத்தை'} தேர்வு செய்தனர்!`;

  const handleDurationSelect = (total: number, half: number) => {
    setIsCustomDuration(false);
    setMatchDuration(total);
    setHalfDuration(half);
  };

  const handleCustomDurationChange = (val: string) => {
    setCustomDuration(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setMatchDuration(num);
      setHalfDuration(Math.floor(num / 2));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAName.trim() || !teamBName.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const detectedStartTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      await onSubmit({
        teamAName: teamAName.trim(),
        captainA: captainA.trim() || 'Captain A',
        teamBName: teamBName.trim(),
        captainB: captainB.trim() || 'Captain B',
        startTime: detectedStartTime,
        matchDate: matchDate || getDetectedDate(),
        matchDuration,
        halfDuration,
        tossWinner,
        tossChoice,
      });

      // Announce the toss result in Gemini Human Male Voice
      soundFX.playWhistle();
      setTimeout(() => {
        announcer.speakGeminiMaleVoice(
          `கவனத்திற்கு! ${tamilAnnouncement} கபடி போட்டி தொடங்குகிறது!`,
          `Attention! ${englishAnnouncement} Match starts now!`
        );
      }, 500);

      onClose();
    } catch (err) {
      console.error('Failed to create match:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-200" />
            <h2 className="text-lg sm:text-xl font-black font-['Teko'] uppercase tracking-wider">
              {isNextMatch ? '🏆 Create Next Match (அடுத்த போட்டி)' : 'Create New Kabaddi Match (புதிய போட்டி)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 text-slate-200 overflow-y-auto">
          {/* Previous Winner Notice for Next Match */}
          {isNextMatch && previousWinner && previousWinner !== 'Match Tied' && (
            <div className="bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/60 rounded-xl p-3 flex items-center gap-2.5">
              <span className="text-xl">👑</span>
              <div className="text-xs">
                <span className="text-amber-300 font-bold uppercase tracking-wider block">
                  Defending Champion: {previousWinner}
                </span>
                <span className="text-slate-300">
                  The previous match winner is automatically carried forward. Enter the new challenger for Team B!
                </span>
              </div>
            </div>
          )}

          {/* Team A Details (Team Name + Separate Captain Column) */}
          <div className="bg-slate-950/70 border border-orange-500/30 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-1.5 text-orange-400 font-black text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Team A Details</span>
              {isNextMatch && previousWinner === teamAName && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded ml-auto">
                  CHAMPION
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Team A Name
                </label>
                <input
                  type="text"
                  required
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  placeholder="e.g. THAMIYANUR AGNI BOYS"
                  className="w-full bg-slate-900 border border-orange-500/40 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Captain Name (Team A)
                </label>
                <input
                  type="text"
                  required
                  value={captainA}
                  onChange={(e) => setCaptainA(e.target.value)}
                  placeholder="e.g. K. Sakthivel"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Team B Details (Team Name + Separate Captain Column) */}
          <div className="bg-slate-950/70 border border-blue-500/30 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-1.5 text-blue-400 font-black text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Team B Details (Challenger)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Team B Name
                </label>
                <input
                  type="text"
                  required
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  placeholder="e.g. KONGU WARRIORS"
                  className="w-full bg-slate-900 border border-blue-500/40 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Captain Name (Team B)
                </label>
                <input
                  type="text"
                  required
                  value={captainB}
                  onChange={(e) => setCaptainB(e.target.value)}
                  placeholder="e.g. M. Dinesh"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Match Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Automatic Match Date
              </label>
              <input
                type="text"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                title="Current detected date automatically saved"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-[10px] text-slate-500 block">Auto-detected current match date</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Match Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDurationSelect(20, 10)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    !isCustomDuration && matchDuration === 20
                      ? 'bg-orange-600 border-orange-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  20 Min (10+10)
                </button>
                <button
                  type="button"
                  onClick={() => handleDurationSelect(40, 20)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    !isCustomDuration && matchDuration === 40
                      ? 'bg-orange-600 border-orange-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  40 Min (20+20)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    isCustomDuration
                      ? 'bg-orange-600 border-orange-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomDuration && (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="90"
                    placeholder="Total mins"
                    value={customDuration}
                    onChange={(e) => handleCustomDurationChange(e.target.value)}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">
                    Half: {halfDuration} mins
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Toss Setup Section */}
          <div className="bg-slate-950/70 border border-amber-500/40 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Toss Result & Choice
              </h3>
              <span className="text-[10px] text-slate-400">Voice Announce Live</span>
            </div>

            {/* Toss Won By */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Toss Won By</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTossWinner('teamA')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition truncate ${
                    tossWinner === 'teamA'
                      ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {teamAName || 'TEAM A'}
                </button>
                <button
                  type="button"
                  onClick={() => setTossWinner('teamB')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition truncate ${
                    tossWinner === 'teamB'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {teamBName || 'TEAM B'}
                </button>
              </div>
            </div>

            {/* Toss Winner's Choice */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Toss Winner's Decision</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTossChoice('Raid')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition ${
                    tossChoice === 'Raid'
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  ⚡ Raid First (ரெய்டு)
                </button>
                <button
                  type="button"
                  onClick={() => setTossChoice('Court')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition ${
                    tossChoice === 'Court'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  🛡️ Choose Court (கோர்ட் தேர்வு)
                </button>
              </div>
            </div>

            {/* Dynamic Announcement Preview */}
            <div className="bg-black/60 border border-slate-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-amber-400" />
                Live Toss Announcement
              </span>
              <p className="text-xs font-medium text-amber-300">
                "{tamilAnnouncement}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Starting Match...' : (isNextMatch ? 'Start Next Match' : 'Create & Start Match')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

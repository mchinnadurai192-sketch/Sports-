import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Megaphone, Clock, Shield, Flag, Award, AlertTriangle, Sparkles, Check, UserCheck } from 'lucide-react';
import { announcer, soundFX } from '../services/audioService';
import { MatchState } from '../types/kabaddi';

interface MicrophoneControllerProps {
  match: MatchState;
}

export const MicrophoneController: React.FC<MicrophoneControllerProps> = ({ match }) => {
  const [isMicOn, setIsMicOn] = useState<boolean>(() => announcer.getMicActive());
  const [speakerVolume, setSpeakerVolume] = useState<number>(() => Math.round(soundFX.getVolume() * 100));
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('Ready for ground announcements');
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const toggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    announcer.setMicActive(next);
    setLastAnnouncement(next ? 'Male Announcer Microphone LIVE' : 'Microphone Muted');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSpeakerVolume(val);
    soundFX.setVolume(val / 100);
  };

  const executeAnnouncement = async (label: string, action: () => void, durationMs: number = 4000) => {
    setIsAnnouncing(true);
    setLastAnnouncement(label);
    action();
    setTimeout(() => {
      setIsAnnouncing(false);
    }, durationMs);
  };

  const captainA = match.teamA.players.find((p) => p.isCaptain)?.name || match.teamA.players[0]?.name || 'Captain A';
  const captainB = match.teamB.players.find((p) => p.isCaptain)?.name || match.teamB.players[0]?.name || 'Captain B';

  return (
    <div className="bg-slate-900 border-2 border-orange-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Header: Umpire Mic Console & Speaker Position */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Control Room System
            </span>
            <span className="bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              Male Voice Only • No Female AI Voice
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Teko'] uppercase text-white tracking-wide mt-1">
            🎙️ MICROPHONE CONTROLLER & GROUND SPEAKER
          </h2>
          <p className="text-xs text-slate-400">
            Natural human male sports announcer • Gemini AI male stadium voice & instant reaction sounds
          </p>
        </div>

        {/* Integrated Microphone & Small Speaker Unit */}
        <div className="flex flex-wrap items-center gap-3 bg-black/60 p-3 rounded-xl border border-orange-500/30 backdrop-blur-md">
          {/* 1. Microphone Toggle */}
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
              isMicOn
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 ring-2 ring-red-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicOn ? '🔴 MIC ON AIR' : 'MIC MUTED'}</span>
          </button>

          {/* 2. Small Speaker near Microphone Position */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/80 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400" title="Small Speaker Unit near Mic Position">
              {speakerVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                Ground Speaker:
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={speakerVolume}
              onChange={handleVolumeChange}
              className="w-20 sm:w-24 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              title={`Speaker Volume: ${speakerVolume}%`}
            />
            <span className="text-xs font-mono font-bold text-amber-300 w-8 text-right">
              {speakerVolume}%
            </span>
          </div>
        </div>
      </div>

      {/* Broadcast Notice & Voice Guarantee */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold text-slate-200">
            Current Status: <span className="text-amber-300">{lastAnnouncement}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
            Voice: Gemini Human Male (Pure Tamil)
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Female Voice Filtered Out
          </span>
        </div>
      </div>

      {/* Official Match Announcements Dispatch Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Megaphone className="w-4 h-4" />
            Official Ground Announcements (Male Voice Only):
          </span>
          {isAnnouncing && (
            <span className="text-xs font-bold text-red-400 flex items-center gap-1 animate-pulse">
              <Radio className="w-3.5 h-3.5" /> MALE ANNOUNCER BROADCASTING...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Official Ground Welcome */}
          <button
            onClick={() =>
              executeAnnouncement('Ground Welcome Announcement', () => {
                announcer.playWelcomeAgniBoysGround();
              })
            }
            className="p-3 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 hover:brightness-110 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition flex flex-col items-start gap-1 text-left border border-amber-300/60"
          >
            <div className="flex items-center gap-1.5">
              <span>🎙️</span>
              <span className="font-extrabold">மைதான வரவேற்பு (ஆண் குரல்)</span>
            </div>
            <span className="text-[11px] font-normal text-slate-950 leading-tight">
              "வணக்கம்! அக்னி பாய்ஸ் மைதானத்திற்கு வரவேற்கிறோம்!"
            </span>
          </button>

          {/* 2. Announce Match Start Time & Captains */}
          <button
            onClick={() =>
              executeAnnouncement('Match Starting Time & Captains Announcement', () => {
                announcer.announceCaptains(
                  match.teamA.name,
                  captainA,
                  match.teamB.name,
                  captainB,
                  match.startTime || 'Live'
                );
              }, 7000)
            }
            className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow active:scale-95 transition flex flex-col items-start gap-1 text-left border border-slate-700 hover:border-orange-500"
          >
            <div className="flex items-center gap-1.5 text-orange-400">
              <Clock className="w-4 h-4" />
              <span>கேப்டன்கள் & தொடக்க நேரம்</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400 leading-tight">
              {captainA} & {captainB} (ஆண் குரல்)
            </span>
          </button>

          {/* 3. Dedicated TOTAL POINTS SPEAK Button (Tamil Male Voice) */}
          <button
            onClick={() =>
              executeAnnouncement('Total Points Voice Announcement', () => {
                announcer.speakTamilTotalPoints(
                  match.teamA.name,
                  match.teamA.score,
                  match.teamB.name,
                  match.teamB.score
                );
              }, 6000)
            }
            className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition flex flex-col items-start gap-1 text-left border border-amber-300"
          >
            <div className="flex items-center gap-1.5">
              <span>🎙️</span>
              <span className="font-extrabold">TOTAL POINTS SPEAK</span>
            </div>
            <span className="text-[11px] font-normal text-slate-950 leading-tight">
              "{match.teamA.name} {match.teamA.score} - {match.teamB.name} {match.teamB.score}" (தமிழ்)
            </span>
          </button>

          {/* 4. Second Half Start & Court Swap */}
          <button
            onClick={() =>
              executeAnnouncement('Second Half Court Swap Announcement', () => {
                announcer.announceSecondHalf(
                  match.teamA.name,
                  match.teamA.score,
                  match.teamB.name,
                  match.teamB.score
                );
              }, 6000)
            }
            className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow active:scale-95 transition flex flex-col items-start gap-1 text-left border border-slate-700 hover:border-blue-500"
          >
            <div className="flex items-center gap-1.5 text-blue-400">
              <Flag className="w-4 h-4" />
              <span>இரண்டாம் பாதி தொடக்கம்</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400 leading-tight">
              "இரண்டாம் பாதி தொடங்குகிறது! கோர்ட் மாற்றம்!"
            </span>
          </button>

          {/* 5. 5 Minutes Remaining Warning */}
          <button
            onClick={() =>
              executeAnnouncement('5 Minutes Remaining Warning', () => {
                announcer.announceFiveMinutesRemaining(
                  match.teamA.name,
                  match.teamA.score,
                  match.teamB.name,
                  match.teamB.score
                );
              }, 6000)
            }
            className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow active:scale-95 transition flex flex-col items-start gap-1 text-left border border-slate-700 hover:border-amber-500"
          >
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>கடைசி 5 நிமிடங்கள் எச்சரிக்கை</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400 leading-tight">
              "கவனத்திற்கு! கடைசி 5 நிமிடங்கள் மட்டுமே உள்ளன!"
            </span>
          </button>

          {/* 5b. 4, 3, 2 Minutes Quick Alerts */}
          <div className="grid grid-cols-3 gap-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
            <button
              onClick={() =>
                executeAnnouncement('4 Minutes Remaining Alert', () => {
                  announcer.announceFourMinutesRemaining(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score);
                }, 4000)
              }
              className="p-2 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold border border-slate-700 text-center"
              title="Announce 4 Minutes Remaining"
            >
              4 நிமிடம்
            </button>
            <button
              onClick={() =>
                executeAnnouncement('3 Minutes Remaining Alert', () => {
                  announcer.announceThreeMinutesRemaining(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score);
                }, 4000)
              }
              className="p-2 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold border border-slate-700 text-center"
              title="Announce 3 Minutes Remaining"
            >
              3 நிமிடம்
            </button>
            <button
              onClick={() =>
                executeAnnouncement('2 Minutes Remaining Alert', () => {
                  announcer.announceTwoMinutesRemaining(match.teamA.name, match.teamA.score, match.teamB.name, match.teamB.score);
                }, 4000)
              }
              className="p-2 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold border border-slate-700 text-center"
              title="Announce 2 Minutes Remaining"
            >
              2 நிமிடம்
            </button>
          </div>

          {/* 6. 1 Minute Remaining Final Alert */}
          <button
            onClick={() =>
              executeAnnouncement('1 Minute Remaining Final Alert', () => {
                announcer.announceOneMinuteRemaining(
                  match.teamA.name,
                  match.teamA.score,
                  match.teamB.name,
                  match.teamB.score
                );
              }, 5000)
            }
            className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow active:scale-95 transition flex flex-col items-start gap-1 text-left border border-red-500/50 hover:border-red-400"
          >
            <div className="flex items-center gap-1.5 text-red-400">
              <Clock className="w-4 h-4" />
              <span>இறுதி 1 நிமிடம் அறிவிப்பு</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400 leading-tight">
              "கடைசி ஒரு நிமிடம்! ஆட்டத்தின் இறுதி நிமிடம்!"
            </span>
          </button>

          {/* 7. Final Whistle & Match Result */}
          <button
            onClick={() => {
              const winnerText =
                match.teamA.score > match.teamB.score
                  ? match.teamA.name
                  : match.teamB.score > match.teamA.score
                  ? match.teamB.name
                  : 'Match Tied';
              executeAnnouncement('Final Whistle & Result Announcement', () => {
                announcer.announceMatchResult(
                  winnerText,
                  match.teamA.score,
                  match.teamB.score,
                  match.teamA.name,
                  match.teamB.name
                );
              }, 7000);
            }}
            className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 hover:brightness-110 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition flex flex-col items-start gap-1 text-left border border-emerald-400/50"
          >
            <div className="flex items-center gap-1.5 text-yellow-300">
              <Award className="w-4 h-4" />
              <span>இறுதி விசில் & வெற்றி அறிவிப்பு</span>
            </div>
            <span className="text-[11px] font-normal text-emerald-100 leading-tight">
              ஆண் குரலில் சாம்பியன் வெற்றி அறிவிப்பு
            </span>
          </button>

          {/* 8. Referee Whistle (Visal) Blast */}
          <button
            onClick={() => {
              executeAnnouncement('Official Referee Visal Blown', () => {
                soundFX.playVisal();
              }, 1500);
            }}
            className="p-3 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow active:scale-95 transition flex flex-col items-start gap-1 text-left border border-amber-500/50"
          >
            <div className="flex items-center gap-1.5">
              <span>📢</span>
              <span>Referee Visal (Tweet-Tweet)</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400 leading-tight">
              Instant double blast whistle
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

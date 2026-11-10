import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle2, Radio, UserCheck } from 'lucide-react';
import { announcer } from '../services/audioService';

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const officialWelcomeAnnouncement = "வணக்கம்! அக்னி பாய்ஸ் மைதானத்திற்கு உங்கள் அனைவரையும் அன்புடன் வரவேற்கிறோம்!";

  const handlePlayWelcome = () => {
    setIsPlaying(true);
    announcer.playWelcomeAgniBoysGround();
    setTimeout(() => {
      setIsPlaying(false);
    }, 4500);
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-orange-950/90 to-slate-900 border-2 border-orange-500/60 shadow-2xl p-4 sm:p-5 my-2">
      {/* Decorative stadium lighting */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Stadium Title & Exact Ground Welcome Script */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500 text-black font-extrabold text-[10px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              Agni Boys Ground
            </span>
            <span className="bg-amber-950 border border-amber-500/60 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-amber-400" />
              Gemini Human Male Voice (Tamil) • No Female Voice
            </span>
            <span className="text-orange-300 text-xs font-bold tracking-wide hidden sm:inline">
              THAMIYANUR AGNI BOYS SPORTS
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 bg-red-950/90 border border-red-500 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                <Radio className="w-3 h-3 animate-ping" />
                MALE VOICE BROADCASTING
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Teko'] uppercase text-white tracking-wide leading-none">
            வணக்கம்! வெல்கம் டு அக்னி பாய்ஸ் கிரவுண்ட்!
          </h2>

          {/* Official Script Display Box */}
          <div className="bg-black/70 border border-orange-500/40 rounded-xl p-3 text-xs sm:text-sm backdrop-blur-md shadow-inner flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] px-2 py-1 rounded border border-amber-500/30 uppercase shrink-0">
              Gemini Male AI
            </span>
            <p className="text-amber-200 font-bold text-sm sm:text-base leading-snug">
              "{officialWelcomeAnnouncement}"
            </p>
          </div>
        </div>

        {/* Right: Instant Trigger Button */}
        <div className="flex flex-col items-stretch sm:items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0">
          <button
            onClick={handlePlayWelcome}
            disabled={isPlaying}
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/50 ring-4 ring-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/40 hover:scale-[1.02]'
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
            <span>
              {isPlaying ? 'ANNOUNCING WELCOME...' : '🎙️ PLAY WELCOME (MALE VOICE)'}
            </span>
          </button>

          <div className="flex items-center justify-between w-full text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Gemini Male Tamil Sports Announcer
            </span>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 underline ml-3 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

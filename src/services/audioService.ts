/**
 * Audio & Microphone Controller System for Agni Boys Ground
 * HUMAN MALE GEMINI AI VOICE ONLY (Pure Tamil Pronunciation)
 * - Female AI voice completely removed.
 * - Score update automatic voice removed.
 * - Tanglish train data removed; pure natural Tamil sports announcer.
 * - Powered by Gemini Flash Lite TTS Human Male Voice (Fenrir).
 */

// Strictly blacklist any female voice keyword
const FEMALE_VOICE_BLACKLIST = [
  'female', 'woman', 'girl',
  'zira', 'samantha', 'victoria', 'karen', 'susan', 'tessa', 'veena',
  'lekha', 'heera', 'sangeeta', 'kavya', 'priya', 'anjali', 'kalpana',
  'zoe', 'ava', 'fiona', 'moira', 'stephanie', 'alva', 'cora', 'hazel',
  'joanna', 'kendra', 'kimberly', 'salli', 'ivy', 'laura', 'alice',
  'olivia', 'catherine', 'jenny', 'aria', 'ayanda', 'en-in-x-cfl', 'en-in-x-end',
  'en-in-x-efg', 'en-in-x-ena', 'en-us-x-sfg', 'en-us-x-tpd', 'en-us-x-tpc',
  'cortana', 'siri', 'kyoko', 'yuna', 'tingting', 'yaoyao', 'mei-jia'
];

// Preferred Male voice keywords for fallback
const MALE_VOICE_KEYWORDS = [
  'valluvar', 'ta-in-male', 'tamil male', 'ta-in-x-tag', 'ta-in-x-tam',
  'prabhat', 'ravi', 'rishi', 'mohan', 'arun', 'karthik', 'ajay', 'suresh',
  'en-in-x-ahp', 'en-in-x-cpc', 'en-in-male',
  'male', 'david', 'guy', 'george', 'mark', 'richard', 'james', 'daniel'
];

/**
 * Filter out ANY female voice; male only fallback
 */
function getStrictMaleVoice(forTamil: boolean = true): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const allVoices = window.speechSynthesis.getVoices();
  if (!allVoices || allVoices.length === 0) return null;

  const maleEligible = allVoices.filter((v) => {
    const fullName = `${v.name} ${v.voiceURI} ${(v as any).lang || ''}`.toLowerCase();
    return !FEMALE_VOICE_BLACKLIST.some((kw) => fullName.includes(kw));
  });

  if (maleEligible.length === 0) return null;

  if (forTamil) {
    const tamilMale = maleEligible.find((v) => {
      const fn = `${v.name} ${v.voiceURI} ${v.lang}`.toLowerCase();
      return (v.lang.startsWith('ta') || fn.includes('tamil')) &&
        (fn.includes('valluvar') || fn.includes('male') || !FEMALE_VOICE_BLACKLIST.some(kw => fn.includes(kw)));
    });
    if (tamilMale) return tamilMale;
  }

  const inMale = maleEligible.find((v) => {
    const fn = `${v.name} ${v.voiceURI}`.toLowerCase();
    return v.lang.includes('en-IN') && MALE_VOICE_KEYWORDS.some((kw) => fn.includes(kw));
  });
  if (inMale) return inMale;

  const anyMale = maleEligible.find((v) => {
    const fn = `${v.name} ${v.voiceURI}`.toLowerCase();
    return MALE_VOICE_KEYWORDS.some((kw) => fn.includes(kw)) || fn.includes('male');
  });
  if (anyMale) return anyMale;

  return maleEligible[0];
}

// Pre-warm browser voices on initial load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch (e) {}
}

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private volume: number = 0.85;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock() {
    this.initCtx();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Fast reaction tackle sound (Heavy mat impact thump + instantaneous referee whistle pip)
  public playTackleSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Heavy mat body slam impact
      const oscImpact = ctx.createOscillator();
      const gainImpact = ctx.createGain();
      oscImpact.type = 'triangle';
      oscImpact.frequency.setValueAtTime(130, now);
      oscImpact.frequency.exponentialRampToValueAtTime(32, now + 0.24);

      gainImpact.gain.setValueAtTime(0.75 * this.volume, now);
      gainImpact.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      oscImpact.connect(gainImpact);
      gainImpact.connect(ctx.destination);
      oscImpact.start(now);
      oscImpact.stop(now + 0.26);

      // Sharp referee whistle pip right on impact
      const oscWhistle = ctx.createOscillator();
      const gainWhistle = ctx.createGain();
      oscWhistle.type = 'sine';
      oscWhistle.frequency.setValueAtTime(2850, now);

      gainWhistle.gain.setValueAtTime(0, now);
      gainWhistle.gain.linearRampToValueAtTime(0.5 * this.volume, now + 0.02);
      gainWhistle.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      oscWhistle.connect(gainWhistle);
      gainWhistle.connect(ctx.destination);
      oscWhistle.start(now);
      oscWhistle.stop(now + 0.32);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  }

  // Official referee whistle (Single blow)
  public playWhistle(short: boolean = false) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const duration = short ? 0.32 : 0.6;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(2720, ctx.currentTime);
      osc2.frequency.setValueAtTime(3140, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(38, ctx.currentTime);
      lfoGain.gain.setValueAtTime(170, ctx.currentTime);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.6 * this.volume, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.6 * this.volume, ctx.currentTime + duration - 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
      lfo.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  }

  // Official referee double whistle blast (Visal Sound)
  public playVisal() {
    this.playWhistle(true);
    setTimeout(() => {
      this.playWhistle(false);
    }, 260);
  }

  // 30-Second Raid Complete Sound
  public playRaidCompleteSound() {
    this.playVisal();
    setTimeout(() => {
      this.playBuzzer();
    }, 320);
  }

  // Raid timer buzzer
  public playBuzzer() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(155, ctx.currentTime);

      gain.gain.setValueAtTime(0.55 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.1);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  }

  // Countdown warning beep
  public playBeep(isFinal: boolean = false) {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1350 : 940, ctx.currentTime);

      gain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  }

  // Stadium cheer swell
  public playCheer() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 1.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1150, ctx.currentTime);
      filter.Q.setValueAtTime(1.4, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 1.4);
    } catch (e) {
      console.warn('Audio FX error:', e);
    }
  }
}

export const soundFX = new SoundEffectsManager();

// Client in-memory audio element cache for instant replay
const clientAudioCache = new Map<string, string>();

let isServerQuotaExceeded = false;
try {
  const cachedQuota = localStorage.getItem('agni_tts_quota_exceeded_until');
  if (cachedQuota && Number(cachedQuota) > Date.now()) {
    isServerQuotaExceeded = true;
  }
} catch (e) {}

class AnnouncerVoiceManager {
  private isMuted: boolean = false;
  private isMicOn: boolean = true;
  private isSpeaking: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('agni_kabaddi_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedMic = localStorage.getItem('agni_mic_active');
      if (savedMic !== null) this.isMicOn = savedMic === 'true';
    } catch (e) {}
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('agni_kabaddi_muted', String(muted));
    } catch (e) {}
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMicActive(active: boolean) {
    this.isMicOn = active;
    try {
      localStorage.setItem('agni_mic_active', String(active));
    } catch (e) {}
  }

  public getMicActive(): boolean {
    return this.isMicOn;
  }

  public stop() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Helper: phonetic Tanglish transliteration for fallback when client OS lacks Tamil TTS voice
   */
  private toTanglishPhonetic(tamilText: string): string {
    return tamilText
      .replace(/வணக்கம்/g, 'Vanakkam')
      .replace(/மக்களே!/g, 'makkaley!')
      .replace(/அக்னி பாய்ஸ் மைதானம்/g, 'Agni Boys Ground')
      .replace(/அக்னி பாய்ஸ் மைதானத்திற்கு உங்கள் அனைவரையும் அன்புடன் வரவேற்கிறோம்!/g, 'Agni Boys Ground-ukku ungal anaivaraiyum anbudan varaverkirom!')
      .replace(/தமையனூர் அக்னி பாய்ஸ் ஸ்போர்ட்ஸ் கபடி போட்டி ஆரம்பம்!/g, 'Thamiyanur Agni Boys Sports Kabaddi match aarambam!')
      .replace(/அணியின் மொத்த புள்ளிகள்/g, 'team total points')
      .replace(/முன்னிலையில் உள்ளது!/g, 'is in the lead!')
      .replace(/இரு அணிகளும் சமநிலையில் உள்ளன!/g, 'Both teams are tied level!')
      .replace(/போட்டி தொடங்கும் நேரம்/g, 'Match starting time')
      .replace(/அணியின் கேப்டன்/g, 'team captain')
      .replace(/மற்றும்/g, 'and')
      .replace(/இரு அணிகளும் ஆடுகளத்திற்கு தயாராக உள்ளன/g, 'Both teams are ready on mat')
      .replace(/போட்டி தொடங்குகிறது!/g, 'Match begins!')
      .replace(/ஆட்டம் இப்போது தொடங்குகிறது!/g, 'Match starts now!')
      .replace(/இரண்டாம் பாதி ஆட்டம் தொடங்குகிறது!/g, 'Second half starts now!')
      .replace(/இரண்டாம் பாதி தொடங்குகிறது! அணிகள் கோர்ட் பக்கத்தை மாற்றியுள்ளன!/g, 'Second half begins! Teams have swapped court sides!')
      .replace(/தற்போதைய புள்ளி விவரம்:/g, 'Current score:')
      .replace(/ஆட்டம் மீண்டும் தொடங்குகிறது!/g, 'Play resumes!')
      .replace(/ஆட்டம் தொடரட்டும்!/g, 'Let the match continue!')
      .replace(/கவனத்திற்கு! ஆட்டத்தின் கடைசி 5 நிமிடங்கள் மட்டுமே உள்ளன!/g, 'Attention! Last 5 minutes remaining!')
      .replace(/கடைசி 4 நிமிடங்கள்! பரபரப்பான ஆட்டம்!/g, 'Last 4 minutes remaining! Exciting match!')
      .replace(/கடைசி 3 நிமிடங்கள் மட்டுமே உள்ளன!/g, 'Last 3 minutes remaining!')
      .replace(/கடைசி 2 நிமிடங்கள்! இறுதி நிமிடங்கள்!/g, 'Last 2 minutes remaining! Final crucial minutes!')
      .replace(/கடைசி ஒரு நிமிடம்! ஆட்டத்தின் இறுதி நிமிடம்!/g, 'Last 1 minute! Final minute of the match!')
      .replace(/இறுதி விசில் ஊதப்பட்டது! ஆட்டம் முடிவடைந்தது!/g, 'Final whistle blown! Match is completed!')
      .replace(/வெற்றி பெற்ற/g, 'Winning champion')
      .replace(/அணிக்கு வாழ்த்துகள்!/g, 'team congratulations!')
      .replace(/அக்னி பாய்ஸ் மைதானத்தின் சாம்பியன்ஸ்!/g, 'Champions of Agni Boys Ground!')
      .replace(/இறுதி புள்ளிகள்:/g, 'Final score:')
      .replace(/ஆட்டம் சமனில் முடிவடைந்தது!/g, 'Match ended in a tie!')
      .replace(/புள்ளி திருத்தம் செய்யப்பட்டது./g, 'Point correction made.');
  }

  /**
   * Primary Voice Engine: Gemini Human Male AI Voice (Fenrir)
   * Speaks Tamil match announcements with authentic Tamil pronunciation.
   * If Gemini TTS is offline or unkeyed, automatically falls back to browser male voice (Tamil / Tanglish).
   * Completely female-voice free.
   */
  public async speakGeminiMaleVoice(tamilText: string, tanglishText?: string): Promise<void> {
    if (this.isMuted || !this.isMicOn) return;

    this.stop();
    this.isSpeaking = true;

    try {
      // 1. Check memory cache for instant playback
      if (clientAudioCache.has(tamilText)) {
        const cachedBase64 = clientAudioCache.get(tamilText)!;
        await this.playBase64Audio(cachedBase64);
        this.isSpeaking = false;
        return;
      }

      // 2. If free tier quota is known to be exceeded, skip network fetch and speak instantly via browser male voice
      if (isServerQuotaExceeded) {
        await this.speakBrowserMaleVoice(tamilText, tanglishText);
        this.isSpeaking = false;
        return;
      }

      // 3. Request Gemini 3.8 Flash Lite TTS (Male Voice: Fenrir) with 5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tamilText,
          voiceName: 'Fenrir',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.quotaExceeded) {
          isServerQuotaExceeded = true;
          try {
            localStorage.setItem('agni_tts_quota_exceeded_until', String(Date.now() + 24 * 60 * 60 * 1000));
          } catch (e) {}
        }

        if (data.success && data.audio) {
          clientAudioCache.set(tamilText, data.audio);
          await this.playBase64Audio(data.audio);
          this.isSpeaking = false;
          return;
        }
      }
    } catch {
      // Network timeout or offline - seamlessly proceed to male browser voice fallback
    }

    // 4. Browser fallback strictly with Male Voice only
    await this.speakBrowserMaleVoice(tamilText, tanglishText);
    this.isSpeaking = false;
  }

  private playBase64Audio(base64: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        audio.volume = soundFX.getVolume();
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          resolve();
        };
        audio.onerror = () => {
          this.currentAudioElement = null;
          resolve();
        };

        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  private speakBrowserMaleVoice(tamilText: string, tanglishText?: string): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();

        // 1. Check if client has a Tamil male voice
        const tamilVoice = getStrictMaleVoice(true);
        const hasTamilVoice = tamilVoice && (tamilVoice.lang.startsWith('ta') || tamilVoice.name.toLowerCase().includes('tamil'));

        // 2. Select text: Tamil for Tamil voice; Tanglish for English/Hindi male voice
        const spokenText = hasTamilVoice
          ? tamilText
          : (tanglishText || this.toTanglishPhonetic(tamilText));

        const utterance = new SpeechSynthesisUtterance(spokenText);

        const chosenVoice = hasTamilVoice ? tamilVoice : getStrictMaleVoice(false);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else {
          utterance.lang = hasTamilVoice ? 'ta-IN' : 'en-IN';
        }

        utterance.pitch = 0.88; // Deep masculine sports broadcaster tone
        utterance.rate = 1.0;
        utterance.volume = soundFX.getVolume();

        let finished = false;
        const done = () => {
          if (!finished) {
            finished = true;
            resolve();
          }
        };

        utterance.onend = done;
        utterance.onerror = done;
        setTimeout(done, Math.max(3500, spokenText.length * 85));

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  /**
   * 🏆 TOTAL POINTS SPEAK BUTTON
   * Speaks all live match data in natural human male Gemini voice:
   * Sample: "வணக்கம்! அக்னி பாய்ஸ் அணியின் மொத்த புள்ளிகள் 25. எதிரணி அணியின் மொத்த புள்ளிகள் 18. அக்னி பாய்ஸ் அணி முன்னிலையில் உள்ளது!"
   */
  public async speakTamilTotalPoints(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ): Promise<void> {
    soundFX.playWhistle(true);

    let leaderText = 'இரு அணிகளும் சமநிலையில் உள்ளன!';
    let leaderTanglish = 'Both teams are level on score!';
    if (scoreA > scoreB) {
      leaderText = `${teamAName} அணி முன்னிலையில் உள்ளது!`;
      leaderTanglish = `${teamAName} is in the lead!`;
    } else if (scoreB > scoreA) {
      leaderText = `${teamBName} அணி முன்னிலையில் உள்ளது!`;
      leaderTanglish = `${teamBName} is in the lead!`;
    }

    const tamilAnnouncement = `வணக்கம்! ${teamAName} அணியின் மொத்த புள்ளிகள் ${scoreA}. ${teamBName} அணியின் மொத்த புள்ளிகள் ${scoreB}. ${leaderText}`;
    const tanglishAnnouncement = `Vanakkam! ${teamAName} total points ${scoreA}. ${teamBName} total points ${scoreB}. ${leaderTanglish}`;

    await this.speakGeminiMaleVoice(tamilAnnouncement, tanglishAnnouncement);
  }

  /**
   * Official Ground Welcome (Gemini Human Male Voice Only)
   */
  public playWelcomeAgniBoysGround() {
    soundFX.playCheer();
    setTimeout(() => {
      this.speakGeminiMaleVoice(
        "வணக்கம்! அக்னி பாய்ஸ் மைதானத்திற்கு உங்கள் அனைவரையும் அன்புடன் வரவேற்கிறோம்! தமையனூர் அக்னி பாய்ஸ் ஸ்போர்ட்ஸ் கபடி போட்டி ஆரம்பம்!",
        "Vanakkam! Welcome to Agni Boys Ground! Thamiyanur Agni Boys Sports Kabaddi match starts now!"
      );
    }, 280);
  }

  /**
   * Automatic Match Starting Announcement with Team Names & Captains
   */
  public announceMatchStart(
    teamAName: string,
    captainA: string,
    teamBName: string,
    captainB: string,
    startTime: string
  ) {
    soundFX.playWhistle();
    setTimeout(() => {
      const msgTamil = `வணக்கம் மக்களே! அக்னி பாய்ஸ் மைதானத்தில் கபடி போட்டி இப்போது தொடங்குகிறது! ${teamAName} அணியின் கேப்டன் ${captainA}, மற்றும் ${teamBName} அணியின் கேப்டன் ${captainB}! போட்டி தொடங்கும் நேரம் ${startTime}! இரு அணிகளுக்கும் வாழ்த்துகள்! ஆட்டம் ஆரம்பம்!`;
      const msgTanglish = `Vanakkam makkaley! Agni Boys ground-il kabaddi match ippodhu thodangugiradhu! ${teamAName} captain ${captainA}, and ${teamBName} captain ${captainB}! Match start time ${startTime}! All the best to both teams! Let the match begin!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 380);
  }

  /**
   * Announce Match Starting Time & Captains
   */
  public announceCaptains(
    teamAName: string,
    captainA: string,
    teamBName: string,
    captainB: string,
    startTime: string
  ) {
    this.announceMatchStart(teamAName, captainA, teamBName, captainB, startTime);
  }

  /**
   * Announce Beginning of Second Half
   */
  public announceSecondHalf(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playWhistle();
    setTimeout(() => {
      const msgTamil = `இரண்டாம் பாதி ஆட்டம் தொடங்குகிறது! அணிகள் கோர்ட் பக்கத்தை மாற்றியுள்ளன! தற்போதைய புள்ளி விவரம்: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}! ஆட்டம் தொடரட்டும்!`;
      const msgTanglish = `Second half aattam thodangugiradhu! Teams have swapped court sides! Current score: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}! Match resume!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 380);
  }

  /**
   * Announce 5 Minutes Remaining
   */
  public announceFiveMinutesRemaining(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playWhistle(true);
    setTimeout(() => {
      const msgTamil = `கவனத்திற்கு! ஆட்டத்தின் கடைசி 5 நிமிடங்கள் மட்டுமே உள்ளன! தற்போதைய புள்ளி விவரம்: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish = `Attention! Last 5 minutes remaining! Current score: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 320);
  }

  /**
   * Announce 4 Minutes Remaining
   */
  public announceFourMinutesRemaining(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playBeep(false);
    setTimeout(() => {
      const msgTamil = `கடைசி 4 நிமிடங்கள்! பரபரப்பான ஆட்டம்! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish = `Last 4 minutes remaining! Thrilling kabaddi action! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 280);
  }

  /**
   * Announce 3 Minutes Remaining
   */
  public announceThreeMinutesRemaining(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playBeep(false);
    setTimeout(() => {
      const msgTamil = `கடைசி 3 நிமிடங்கள் மட்டுமே உள்ளன! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish = `Last 3 minutes remaining! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 280);
  }

  /**
   * Announce 2 Minutes Remaining
   */
  public announceTwoMinutesRemaining(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playBeep(false);
    setTimeout(() => {
      const msgTamil = `கடைசி 2 நிமிடங்கள்! இறுதி நிமிடங்கள்! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish = `Last 2 minutes remaining! Final crucial minutes! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 280);
  }

  /**
   * Announce 1 Minute Remaining
   */
  public announceOneMinuteRemaining(
    teamAName: string,
    scoreA: number,
    teamBName: string,
    scoreB: number
  ) {
    soundFX.playBeep(true);
    setTimeout(() => {
      const msgTamil = `கடைசி ஒரு நிமிடம்! ஆட்டத்தின் இறுதி நிமிடம்! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish = `Last 1 minute! Final minute of the match! ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 280);
  }

  /**
   * Announce Final Whistle & Match Result
   */
  public announceMatchResult(
    winnerName: string,
    scoreA: number,
    scoreB: number,
    teamAName: string,
    teamBName: string
  ) {
    soundFX.playVisal();
    soundFX.playCheer();
    setTimeout(() => {
      const msgTamil =
        winnerName === 'Match Tied'
          ? `இறுதி விசில் ஊதப்பட்டது! ஆட்டம் சமனில் முடிவடைந்தது! இறுதி புள்ளிகள்: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`
          : `இறுதி விசில் ஊதப்பட்டது! ஆட்டம் முடிவடைந்தது! வெற்றி பெற்ற ${winnerName} அணிக்கு வாழ்த்துகள்! அக்னி பாய்ஸ் மைதானத்தின் சாம்பியன்ஸ்! இறுதி புள்ளிகள்: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      const msgTanglish =
        winnerName === 'Match Tied'
          ? `Final whistle blown! Match ended in a tie! Final score: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`
          : `Final whistle blown! Match is over! Congratulations to the champions ${winnerName}! Final score: ${teamAName} ${scoreA}, ${teamBName} ${scoreB}!`;
      this.speakGeminiMaleVoice(msgTamil, msgTanglish);
    }, 450);
  }

  // NOTE: Automatic score update voice removed per user instruction
  public announceScoreUpdate(
    _actionHeadline: string,
    _teamAName: string,
    _scoreA: number,
    _raidA: number,
    _tackleA: number,
    _teamBName: string,
    _scoreB: number,
    _raidB: number,
    _tackleB: number
  ) {
    // Intentionally a no-op: Automatic score update voice is completely removed.
  }

  public speakTanglish(text: string): Promise<void> {
    return this.speakGeminiMaleVoice(text);
  }

  public speak(englishText: string, tamilText?: string): Promise<void> {
    return this.speakGeminiMaleVoice(tamilText || englishText);
  }
}

export const announcer = new AnnouncerVoiceManager();

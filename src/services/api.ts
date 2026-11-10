import { MatchState, MatchSummary, ScoreEventType } from '../types/kabaddi';

const LOCAL_STORAGE_MATCH_KEY = 'agni_kabaddi_current_match';
const LOCAL_STORAGE_HISTORY_KEY = 'agni_kabaddi_history';

/**
 * Safely parse JSON responses only if Content-Type is application/json
 */
async function safeJsonParse(res: Response): Promise<any | null> {
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // Response was HTML (e.g. during server reload or proxy fallback), ignore safely
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCurrentMatch(): Promise<MatchState | null> {
  try {
    const res = await fetch('/api/match', {
      headers: { Accept: 'application/json' },
    });
    const data = await safeJsonParse(res);
    if (data && data.match) {
      try {
        localStorage.setItem(LOCAL_STORAGE_MATCH_KEY, JSON.stringify(data.match));
      } catch {}
      return data.match;
    }
  } catch {
    // Fail gracefully
  }

  // Fallback to locally cached match if available
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_MATCH_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return null;
}

export interface CreateMatchParams {
  teamAName: string;
  teamBName: string;
  captainA?: string;
  captainB?: string;
  startTime?: string;
  matchDate: string;
  matchDuration: number;
  halfDuration: number;
  tossWinner: 'teamA' | 'teamB';
  tossChoice: 'Raid' | 'Court';
  playersA?: any[];
  playersB?: any[];
}

export async function createNewMatch(params: CreateMatchParams): Promise<MatchState | null> {
  try {
    const res = await fetch('/api/match/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await safeJsonParse(res);
    if (data && data.match) {
      try {
        localStorage.setItem(LOCAL_STORAGE_MATCH_KEY, JSON.stringify(data.match));
      } catch {}
      return data.match;
    }
  } catch {}
  return null;
}

export async function postMatchAction(payload: {
  action?: 'score' | 'undo' | 'full_update';
  teamId?: 'teamA' | 'teamB';
  points?: number;
  type?: ScoreEventType;
  description?: string;
  announcementText?: string;
  playerId?: string;
  replaceState?: MatchState;
}): Promise<MatchState | null> {
  try {
    const res = await fetch('/api/match/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(res);
    if (data && data.match) {
      try {
        localStorage.setItem(LOCAL_STORAGE_MATCH_KEY, JSON.stringify(data.match));
      } catch {}
      return data.match;
    }
  } catch {}
  return null;
}

export async function syncMatchState(updates: Partial<MatchState>): Promise<MatchState | null> {
  try {
    const res = await fetch('/api/match/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await safeJsonParse(res);
    if (data && data.match) {
      try {
        localStorage.setItem(LOCAL_STORAGE_MATCH_KEY, JSON.stringify(data.match));
      } catch {}
      return data.match;
    }
  } catch {}
  return null;
}

export async function finishAndSaveMatch(): Promise<{ match: MatchState; summary: MatchSummary } | null> {
  try {
    const res = await fetch('/api/match/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const data = await safeJsonParse(res);
    if (data && data.match && data.summary) {
      return data;
    }
  } catch {}
  return null;
}

export async function fetchMatchHistory(): Promise<MatchSummary[]> {
  try {
    const res = await fetch('/api/matches', {
      headers: { Accept: 'application/json' },
    });
    const data = await safeJsonParse(res);
    if (data && data.history) {
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(data.history));
      } catch {}
      return data.history;
    }
  } catch {}

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return [];
}

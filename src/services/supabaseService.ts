import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../config/supabaseDefault';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const CONFIG_STORAGE_KEY = 'gulbi_supabase_config';

// Load stored config, URL query link, environment variables, or universal default
export function getStoredSupabaseConfig(): SupabaseConfig {
  // Check URL parameters or hash for one-click setup link across devices
  if (typeof window !== 'undefined') {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const rawParams = (hash.includes('sb_url=') ? hash : search).replace(/^#\/?/, '').replace(/^\?/, '');
      const params = new URLSearchParams(rawParams);
      const linkUrl = params.get('sb_url');
      const linkKey = params.get('sb_key');

      if (linkUrl && linkKey) {
        const config = { url: decodeURIComponent(linkUrl).trim(), anonKey: decodeURIComponent(linkKey).trim() };
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        // Clean URL bar
        window.history.replaceState(null, '', window.location.pathname);
        return config;
      }
    } catch (e) {
      console.error('Failed to parse URL config link:', e);
    }
  }

  // 1. Check local storage
  try {
    const local = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse Supabase config from localStorage:', e);
  }

  // 2. Fallback to VITE env vars if available
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // 3. Fallback to universal default config file
  return {
    url: DEFAULT_SUPABASE_URL || '',
    anonKey: DEFAULT_SUPABASE_ANON_KEY || '',
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}___${config.anonKey}`;
  if (!cachedClient || cachedConfigKey !== currentKey) {
    try {
      cachedClient = createClient(config.url, config.anonKey);
      cachedConfigKey = currentKey;
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  cachedClient = null;
  cachedConfigKey = '';
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function generateQuickSyncLink(): string {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) return '';
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    sb_url: config.url,
    sb_key: config.anonKey,
  });
  return `${baseUrl}#${params.toString()}`;
}

export interface UserFinancialPayload {
  categories?: any[];
  assets?: any[];
  transactions?: any[];
  fixedExpenses?: any[];
  expectedIncomeItems?: any[];
  investmentItems?: any[];
  goal?: any;
  goals?: Record<string, any>;
  updatedAt?: string;
}


export interface SupabaseFetchResult {
  success: boolean;
  data: UserFinancialPayload | null;
  errorMsg?: string;
}

export interface SupabaseSaveResult {
  success: boolean;
  errorMsg?: string;
}

// Fetch user financial data payload from Supabase DB
export async function fetchUserDataFromSupabase(username: string): Promise<SupabaseFetchResult> {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: null, errorMsg: 'Supabase URL/Key가 설정되지 않았습니다.' };

  try {
    const safeUser = (username || 'guest').toLowerCase().trim();
    const { data, error } = await client
      .from('gulbi_user_data')
      .select('data, updated_at')
      .eq('username', safeUser)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return { success: false, data: null, errorMsg: error.message };
    }

    if (data && data.data) {
      return {
        success: true,
        data: {
          ...data.data,
          updatedAt: data.updated_at || data.data.updatedAt || new Date().toISOString(),
        },
      };
    }

    return { success: true, data: null };
  } catch (e: any) {
    console.error('Supabase fetch exception:', e);
    return { success: false, data: null, errorMsg: e?.message || 'DB 연결 네트워크 예외 발생' };
  }
}

// Save/Upsert user financial data payload to Supabase DB
export async function saveUserDataToSupabase(username: string, payload: Omit<UserFinancialPayload, 'updatedAt'>): Promise<SupabaseSaveResult> {
  const client = getSupabaseClient();
  if (!client) return { success: false, errorMsg: 'Supabase URL/Key가 설정되지 않았습니다.' };

  try {
    const safeUser = (username || 'guest').toLowerCase().trim();
    const nowIso = new Date().toISOString();
    const fullPayload = {
      ...payload,
      updatedAt: nowIso,
    };

    const { error } = await client
      .from('gulbi_user_data')
      .upsert(
        {
          username: safeUser,
          data: fullPayload,
          updated_at: nowIso,
        },
        { onConflict: 'username' }
      );

    if (error) {
      console.error('Supabase upsert error:', error.message);
      return { success: false, errorMsg: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error('Supabase upsert exception:', e);
    return { success: false, errorMsg: e?.message || 'DB 저장 예외 발생' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Gulbi AI Supabase 데이터베이스 테이블 자동 생성 SQL
-- Supabase Dashboard > SQL Editor에서 아래 쿼리를 실행하세요.

CREATE TABLE IF NOT EXISTS gulbi_user_data (
  username TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE gulbi_user_data ENABLE ROW LEVEL SECURITY;

-- 익명 클라이언트 접근 및 데이터 동기화 정책 설정
CREATE POLICY "Allow public select and upsert for gulbi_user_data"
  ON gulbi_user_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
`;

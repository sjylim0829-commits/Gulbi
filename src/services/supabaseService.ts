import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const CONFIG_STORAGE_KEY = 'gulbi_supabase_config';

// Load stored config or environment variables
export function getStoredSupabaseConfig(): SupabaseConfig {
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

  // Fallback to VITE env vars if available
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return {
    url: envUrl,
    anonKey: envKey,
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

export interface UserFinancialPayload {
  categories: any[];
  assets: any[];
  transactions: any[];
  fixedExpenses: any[];
  expectedIncomeItems: any[];
  investmentItems: any[];
  goal: any;
  updatedAt: string;
}

// Fetch user financial data payload from Supabase DB
export async function fetchUserDataFromSupabase(username: string): Promise<UserFinancialPayload | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const safeUser = (username || 'guest').toLowerCase().trim();
    const { data, error } = await client
      .from('gulbi_user_data')
      .select('data, updated_at')
      .eq('username', safeUser)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch notice:', error.message);
      return null;
    }

    if (data && data.data) {
      return {
        ...data.data,
        updatedAt: data.updated_at || data.data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error('Supabase fetch exception:', e);
  }
  return null;
}

// Save/Upsert user financial data payload to Supabase DB
export async function saveUserDataToSupabase(username: string, payload: Omit<UserFinancialPayload, 'updatedAt'>): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

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
      return false;
    }

    return true;
  } catch (e) {
    console.error('Supabase upsert exception:', e);
    return false;
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

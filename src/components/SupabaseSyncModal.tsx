import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../services/supabaseService';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'unconfigured' | 'error';
  lastSyncedAt: string | null;
  currentUsername: string;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncNow,
  syncStatus,
  lastSyncedAt,
  currentUsername,
}) => {
  const initialConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(initialConfig.url);
  const [anonKey, setAnonKey] = useState(initialConfig.anonKey);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showSql, setShowSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });

    await onSyncNow();
    setIsSaving(false);
    setSaveSuccessMsg('🎉 Supabase DB 연결 설정이 저장되었으며 데이터 동기화가 완료되었습니다!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Supabase DB 클라우드 연동</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 font-extrabold border border-indigo-200">
                  {currentUsername} 계정
                </span>
              </h2>
              <p className="text-xs text-slate-500">어디서든 내 계정으로 로그인하면 자산/가계부 데이터 자동 조회 & 동기화</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center space-x-1.5">
              <span>현재 DB 동기화 상태:</span>
            </span>
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200 font-extrabold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>🟢 Supabase 클라우드 동기화 완료</span>
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 border border-amber-200 font-extrabold animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>🟡 DB 동기화 진행 중...</span>
              </span>
            )}
            {syncStatus === 'unconfigured' && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-slate-200 px-3 py-1 text-slate-700 border border-slate-300 font-extrabold">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>⚙️ Supabase API 키 설정 필요 (로컬 전용)</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700 border border-rose-200 font-extrabold">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>🔴 DB 연결 오류 발생 (키 또는 테이블 확인)</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
            <span>마지막 동기화 시각: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString('ko-KR') : '동기화 기록 없음'}</span>
            <button
              onClick={() => onSyncNow()}
              disabled={syncStatus === 'syncing'}
              className="inline-flex items-center space-x-1 rounded-xl bg-indigo-50 px-3 py-1.5 font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all text-xs border border-indigo-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>지금 수동 동기화</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs font-bold text-emerald-800">
            {saveSuccessMsg}
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Supabase 프로젝트 연결 설정 (API Key & Project URL)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Project URL</label>
              <input
                type="url"
                required
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase anon Public Key</label>
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center space-x-1"
            >
              <span>{showSql ? '📐 SQL 쿼리 가이드 닫기' : '📐 Supabase 테이블 생성 SQL 스크립트 보기'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              <span>{isSaving ? '저장 및 연결 중...' : 'DB 연결 저장 및 동기화'}</span>
            </button>
          </div>
        </form>

        {/* SQL Schema Copy Box */}
        {showSql && (
          <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">💡 Supabase SQL Editor 실행 스크립트</span>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center space-x-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isCopied ? '복사 완료!' : 'SQL 복사'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
            <p className="text-[11px] text-slate-400">
              Supabase 웹 대시보드의 <strong>SQL Editor</strong> 메뉴에서 위 쿼리를 실행하시면 데이터베이스 테이블이 자동 작성됩니다.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

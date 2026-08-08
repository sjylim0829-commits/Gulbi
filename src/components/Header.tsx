import React, { useRef } from 'react';
import { LayoutDashboard, Target, Calendar, ReceiptText, Tags, Bot, Sparkles, Download, Upload, Trash2, LogOut, UserCheck, TrendingUp } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export type ActiveTab = 'dashboard' | 'goal' | 'fixed-expenses' | 'investments' | 'ledger' | 'categories';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openChat: () => void;
  onLogout: () => void;
  currentUsername: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openChat, onLogout, currentUsername }) => {
  const { netWorth, gulbiAdvice, clearAllData, exportBackupJSON, importBackupJSON } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJSON(content);
        if (ok) {
          alert('🎉 자산 데이터 백업 복원이 완료되었습니다!');
        } else {
          alert('⚠️ 올바른 굴비 백업 JSON 파일이 아닙니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Logo & Agent Identity */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-500 shadow-md shadow-indigo-500/20 animate-pulse-glow">
            <span className="text-xl">🐟</span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white">
              AI
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Gulbi</h1>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 border border-indigo-200">
                굴비 AI 멘토
              </span>
            </div>
            <p className="text-xs text-slate-500">스마트 자산 & 영구 저장 가계부</p>
          </div>
        </div>

        {/* Navigation Tabs - No Wrap */}
        <nav className="hidden md:flex items-center space-x-1 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">자산</span>
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'investments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="whitespace-nowrap">투자</span>
          </button>

          <button
            onClick={() => setActiveTab('goal')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'goal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">목표 자산 증액</span>
          </button>

          <button
            onClick={() => setActiveTab('fixed-expenses')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'fixed-expenses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">고정지출 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ReceiptText className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">가계부</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Tags className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">카테고리 설정</span>
          </button>
        </nav>

        {/* Status Pill & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden lg:flex items-center space-x-2 rounded-xl bg-slate-100 px-3 py-1.5 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">순자산</span>
            <span className="text-sm font-extrabold text-indigo-700">
              {(netWorth / 10000).toLocaleString('ko-KR')}만원
            </span>
          </div>

          <div
            className={`hidden xl:flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-xs font-bold border ${
              currentUsername === 'test'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{currentUsername}</span>
            {currentUsername === 'test' && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1 rounded">테스트</span>}
          </div>

          <button
            onClick={exportBackupJSON}
            title="자산 데이터 백업 파일 다운로드"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xl:inline">백업</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="자산 데이터 백업 파일 불러오기"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden xl:inline">복원</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={openChat}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20 transition-all shrink-0 whitespace-nowrap ml-1"
          >
            <Bot className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">굴비 AI 상담소</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          <button
            onClick={() => {
              if (confirm(`⚠️ 정말로 '${currentUsername}' 계정의 모든 데이터를 초기화하시겠습니까?`)) {
                clearAllData();
              }
            }}
            title="모든 데이터 초기화"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={onLogout}
            title="로그아웃"
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-200/80 bg-slate-50 space-x-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">자산</span>
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'investments' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">투자</span>
        </button>

        <button
          onClick={() => setActiveTab('goal')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'goal' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">목표 자산 증액</span>
        </button>

        <button
          onClick={() => setActiveTab('fixed-expenses')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'fixed-expenses' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">고정지출</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <ReceiptText className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">가계부</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-200/60'
          }`}
        >
          <Tags className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">카테고리</span>
        </button>
      </div>

      {/* Gulbi Quick Advice Marquee / Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border-t border-slate-200 px-4 py-1.5 text-xs flex items-center justify-between text-slate-700">
        <div className="flex items-center space-x-2 overflow-hidden truncate">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="font-bold text-amber-700 shrink-0">[Gulbi 멘토]</span>
          <span className="truncate text-slate-700">{gulbiAdvice.statusMessage}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 shrink-0 text-slate-500 text-[11px]">
          <span>8월 자산 증액: <strong className="text-emerald-600">{gulbiAdvice.projectedIncrease > 0 ? `+${gulbiAdvice.projectedIncrease.toLocaleString()}` : gulbiAdvice.projectedIncrease.toLocaleString()}원</strong></span>
        </div>
      </div>
    </header>
  );
};

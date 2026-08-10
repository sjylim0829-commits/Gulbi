import React, { useRef, useState } from 'react';
import { LayoutDashboard, Target, Calendar, ReceiptText, Tags, Bot, Sparkles, Download, Upload, Trash2, LogOut, UserCheck, TrendingUp, Lock, Unlock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export type ActiveTab = 'dashboard' | 'goal' | 'fixed-expenses' | 'investments' | 'ledger' | 'categories';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openChat: () => void;
  onLogout: () => void;
  currentUsername: string;
  isCategoryUnlocked?: boolean;
  onUnlockCategory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openChat,
  onLogout,
  currentUsername,
  isCategoryUnlocked = false,
  onUnlockCategory,
}) => {
  const { netWorth, gulbiAdvice, clearAllData, exportBackupJSON, importBackupJSON } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Password Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

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

  const handleCategoryTabClick = () => {
    if (isCategoryUnlocked) {
      setActiveTab('categories');
    } else {
      setAdminPasswordInput('');
      setAuthError('');
      setIsAuthModalOpen(true);
    }
  };

  const handleVerifyAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === '661227') {
      if (onUnlockCategory) onUnlockCategory();
      setIsAuthModalOpen(false);
      setActiveTab('categories');
    } else {
      setAuthError('⚠️ 관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Logo & Agent Identity */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-500 shadow-md shadow-indigo-500/30 animate-pulse-glow">
            <span className="text-xl">🐟</span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white">
              AI
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">Gulbi</h1>
              <span className="rounded-full bg-indigo-950 px-2 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-800/60">
                굴비 AI 멘토
              </span>
            </div>
            <p className="text-xs text-slate-400">스마트 자산 & 영구 저장 가계부</p>
          </div>
        </div>

        {/* Navigation Tabs - No Wrap */}
        <nav className="hidden md:flex items-center space-x-1 rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">자산</span>
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'investments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="whitespace-nowrap">투자</span>
          </button>

          <button
            onClick={() => setActiveTab('goal')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'goal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">목표 자산 증액</span>
          </button>

          <button
            onClick={() => setActiveTab('fixed-expenses')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'fixed-expenses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">고정지출 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ReceiptText className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">가계부</span>
          </button>

          <button
            onClick={handleCategoryTabClick}
            className={`flex items-center space-x-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isCategoryUnlocked
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Tags className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">템플릿 관리</span>
            {isCategoryUnlocked ? (
              <span title="관리자 인증 완료"><Unlock className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-0.5" /></span>
            ) : (
              <span title="관리자 잠금 설정됨"><Lock className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-0.5" /></span>
            )}
          </button>
        </nav>

        {/* Status Pill & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden lg:flex items-center space-x-2 rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">순자산</span>
            <span className="text-sm font-extrabold text-indigo-400">
              {(netWorth / 10000).toLocaleString('ko-KR')}만원
            </span>
          </div>

          <div
            className={`hidden xl:flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-xs font-bold border ${
              currentUsername === 'test'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{currentUsername}</span>
            {currentUsername === 'test' && <span className="text-[10px] bg-emerald-800 text-white px-1 rounded">테스트</span>}
          </div>

          <button
            onClick={exportBackupJSON}
            title="자산 데이터 백업 파일 다운로드"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xl:inline">백업</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="자산 데이터 백업 파일 불러오기"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
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
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={onLogout}
            title="로그아웃"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800 bg-slate-950 space-x-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">자산</span>
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'investments' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="whitespace-nowrap">투자</span>
        </button>

        <button
          onClick={() => setActiveTab('goal')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'goal' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">목표 자산 증액</span>
        </button>

        <button
          onClick={() => setActiveTab('fixed-expenses')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'fixed-expenses' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">고정지출</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900'
          }`}
        >
          <ReceiptText className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">가계부</span>
        </button>

        <button
          onClick={handleCategoryTabClick}
          className={`flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
            activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'text-amber-400 bg-slate-900'
          }`}
        >
          <Tags className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">템플릿 관리</span>
          {isCategoryUnlocked ? <Unlock className="h-3 w-3 text-emerald-400" /> : <Lock className="h-3 w-3 text-amber-400" />}
        </button>
      </div>

      {/* Gulbi Quick Advice Marquee / Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border-t border-slate-800 px-4 py-1.5 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2 overflow-hidden truncate">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-400 shrink-0">[Gulbi 멘토]</span>
          <span className="truncate text-slate-300">{gulbiAdvice.statusMessage}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 shrink-0 text-slate-400 text-[11px]">
          <span>8월 자산 증액: <strong className="text-emerald-400">{gulbiAdvice.projectedIncrease > 0 ? `+${gulbiAdvice.projectedIncrease.toLocaleString()}` : gulbiAdvice.projectedIncrease.toLocaleString()}원</strong></span>
        </div>
      </div>

      {/* Admin Password Authentication Modal Dialog */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                  <span>🔒 템플릿 관리자 인증</span>
                </h3>
                <p className="text-xs text-slate-400">템플릿 관리(카테고리) 메뉴는 관리자 승인이 필요합니다.</p>
              </div>
            </div>

            {authError && (
              <div className="rounded-2xl bg-rose-950/80 p-3 border border-rose-800 text-xs font-semibold text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">관리자 비밀번호 입력</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="비밀번호 6자리 입력"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-4 pr-11 py-3 text-sm font-bold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>인증 및 열기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

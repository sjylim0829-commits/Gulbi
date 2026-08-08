import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Account database
  const ACCOUNTS: Record<string, string> = {
    sjylim: 'whddbs01!',
    test: 'test1234!',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const inputId = username.trim();
    const expectedPw = ACCOUNTS[inputId];

    if (expectedPw && password === expectedPw) {
      const authObj = { username: inputId, loggedInAt: new Date().toISOString() };
      if (rememberMe) {
        localStorage.setItem('gulbi_auth_user', JSON.stringify(authObj));
      } else {
        sessionStorage.setItem('gulbi_auth_user', JSON.stringify(authObj));
      }
      onLoginSuccess(inputId);
    } else {
      setErrorMsg('⚠️ 아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const fillTestAccount = () => {
    setUsername('test');
    setPassword('test1234!');
  };

  const fillMainAccount = () => {
    setUsername('sjylim');
    setPassword('whddbs01!');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-8">
        
        {/* Branding Logo Card */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-500 shadow-xl shadow-indigo-500/25 animate-pulse-glow">
            <span className="text-3xl">🐟</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Gulbi</h1>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">스마트 AI 자산 관리 시스템</p>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            계정별 독립된 자산 가계부를 제공합니다. 접속할 계정을 선택하여 로그인해 주세요.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>계정 선택 & 인증</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={fillMainAccount}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all"
              >
                메인 (sjylim)
              </button>
              <button
                type="button"
                onClick={fillTestAccount}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                테스트 (test)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-xs font-semibold text-rose-700 animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">아이디 (ID)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="sjylim 또는 test"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">비밀번호 (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 pl-10 pr-11 py-3 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600 font-medium">로그인 상태 유지</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all mt-2"
            >
              <span>{username === 'test' ? '테스트 가계부 접속하기' : '굴비 가계부 접속하기'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Account Info Hint */}
        <div className="rounded-2xl bg-slate-100/80 p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <UserCheck className="h-4 w-4 text-indigo-600" />
            <span>등록된 접근 가능 계정</span>
          </div>
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between">
              <span>👤 <strong>메인 계정</strong> (sjylim):</span>
              <span className="font-mono text-indigo-700">whddbs01! (기존 자산 보존)</span>
            </div>
            <div className="flex justify-between">
              <span>🧪 <strong>테스트 계정</strong> (test):</span>
              <span className="font-mono text-emerald-700">test1234! (깨끗한 빈 가계부)</span>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Gulbi Personal Agent Security v1.1</span>
          </p>
          <p>계정별 모든 자산 데이터는 서로 완전히 격리되어 보존됩니다.</p>
        </div>

      </div>
    </div>
  );
};

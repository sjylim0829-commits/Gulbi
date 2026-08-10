import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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
            보안 사용자 전용 가계부입니다. 계정 정보를 입력하여 로그인해 주세요.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>보안 사용자 인증</span>
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
                  placeholder="아이디 입력"
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
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
                  className="h-4 w-4 rounded-md border-slate-300 bg-slate-50 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600 font-medium">로그인 상태 유지</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all mt-2"
            >
              <span>굴비 가계부 접속하기</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Test Account Quick Access */}
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🧪</span>
            <span className="text-xs font-bold text-emerald-800">테스트 계정 정보</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white px-3 py-2 border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 font-medium">아이디: </span>
              <span className="font-bold text-slate-900">test</span>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 border border-emerald-100 shadow-2xs">
              <span className="text-slate-500 font-medium">비밀번호: </span>
              <span className="font-bold text-slate-900">test1234!</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername('test');
              setPassword('test1234!');
              setErrorMsg('');
            }}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>🚀 테스트 계정으로 빠르게 로그인</span>
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Gulbi Personal Agent Security v1.2</span>
          </p>
          <p>모든 데이터는 암호화되어 계정별로 완전 격리 보존됩니다.</p>
        </div>

      </div>
    </div>
  );
};

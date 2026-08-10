import React, { useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { Header, type ActiveTab } from './components/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { InvestmentsView } from './components/Investments/InvestmentsView';
import { GoalTrackerView } from './components/GoalTracker/GoalTrackerView';
import { FixedExpensesView } from './components/FixedExpenses/FixedExpensesView';
import { LedgerView } from './components/Ledger/LedgerView';
import { CategoryManagerView } from './components/CategoryManager/CategoryManagerView';
import { GulbiChatDrawer } from './components/GulbiChat/GulbiChatDrawer';
import { LoginView } from './components/Auth/LoginView';

function getStoredUsername(): string | null {
  try {
    const local = localStorage.getItem('gulbi_auth_user');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.username) return parsed.username;
    }
    const session = sessionStorage.getItem('gulbi_auth_user');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.username) return parsed.username;
    }
  } catch (e) {
    console.error('Failed to parse auth user:', e);
  }
  return null;
}

export const AppContent: React.FC<{ currentUsername: string; onLogout: () => void }> = ({ currentUsername, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCategoryUnlocked, setIsCategoryUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(`gulbi_cat_unlocked_${currentUsername}`) === 'true';
  });

  const handleUnlockCategory = () => {
    sessionStorage.setItem(`gulbi_cat_unlocked_${currentUsername}`, 'true');
    setIsCategoryUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Sticky Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openChat={() => setIsChatOpen(true)}
        onLogout={onLogout}
        currentUsername={currentUsername}
        isCategoryUnlocked={isCategoryUnlocked}
        onUnlockCategory={handleUnlockCategory}
      />

      {/* Main Content Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'investments' && <InvestmentsView />}
        {activeTab === 'goal' && <GoalTrackerView />}
        {activeTab === 'fixed-expenses' && <FixedExpensesView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'categories' && (
          <CategoryManagerView
            isUnlocked={isCategoryUnlocked}
            onUnlock={handleUnlockCategory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Gulbi (굴비) AI</span>
            <span>· 계정별 데이터 격리 가계부 & 자산/투자 관리 에이전트</span>
          </div>
          <p className="text-slate-400">© 2026 Gulbi Financial Agent. All rights reserved.</p>
        </div>
      </footer>

      {/* Gulbi AI Mascot Chat Drawer */}
      <GulbiChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export function App() {
  const [authUsername, setAuthUsername] = useState<string | null>(getStoredUsername);

  const handleLoginSuccess = (username: string) => {
    setAuthUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('gulbi_auth_user');
    sessionStorage.removeItem('gulbi_auth_user');
    setAuthUsername(null);
  };

  if (!authUsername) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <FinancialProvider username={authUsername}>
      <AppContent currentUsername={authUsername} onLogout={handleLogout} />
    </FinancialProvider>
  );
}

export default App;

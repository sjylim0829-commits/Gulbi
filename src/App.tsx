import { useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { Header, type ActiveTab } from './components/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { GoalTrackerView } from './components/GoalTracker/GoalTrackerView';
import { FixedExpensesView } from './components/FixedExpenses/FixedExpensesView';
import { LedgerView } from './components/Ledger/LedgerView';
import { CategoryManagerView } from './components/CategoryManager/CategoryManagerView';
import { GulbiChatDrawer } from './components/GulbiChat/GulbiChatDrawer';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openChat={() => setIsChatOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'goal' && <GoalTrackerView />}
        {activeTab === 'fixed-expenses' && <FixedExpensesView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'categories' && <CategoryManagerView />}
      </main>

      {/* Gulbi AI Chat Assistant Drawer */}
      <GulbiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span>🐟 Gulbi (굴비) - 개인 맞춤형 AI 재무 설계 & 자산 관리 시스템</span>
          </div>
          <div>
            <span>Powered by Antigravity AI Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinancialProvider>
      <MainApp />
    </FinancialProvider>
  );
}

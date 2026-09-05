import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import {
  Target,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Flame,
  Sparkles,
  Edit3,
  Award,
  DollarSign,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  PiggyBank,
  History,
  Clock,
  XCircle,
} from 'lucide-react';
import type { ExpectedIncomeItem } from '../../types/financial';
import { formatYearMonth, getLocalYearMonthString } from '../../utils/dateUtils';

export const GoalTrackerView: React.FC = () => {
  const {
    goals,
    getGoalForMonth,
    updateGoalForMonth,
    getMonthStats,
    getYearMonthlyTrends,
    currentMonthIncome,
    expectedMonthlyIncome,
    expectedIncomeItems,
    addExpectedIncomeItem,
    updateExpectedIncomeItem,
    deleteExpectedIncomeItem,
    logExpectedIncomeToLedger,
    totalFixedExpenseAmount,
    pureVariableExpenseSpent,
    initialVariableBudget,
    remainingVariableBudget,
    gulbiAdvice,
    pastVariableExpenseSpent,
    todayVariableExpenseSpent,
    remainingVariableBudgetBeforeToday,
    todayAvailableBudget,
    categories,
    transactions,
  } = useFinancial();

  // Year / Month Selection State
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentYM = getLocalYearMonthString();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [showHistoryGrid, setShowHistoryGrid] = useState<boolean>(true);

  const selectedYM = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  // Selected Month Goal & Stats
  const activeMonthGoal = useMemo(() => {
    return getGoalForMonth(selectedYM);
  }, [selectedYM, getGoalForMonth, goals]);

  const activeMonthStats = useMemo(() => {
    return getMonthStats(selectedYM);
  }, [selectedYM, getMonthStats, transactions, goals]);

  // Year list for selector
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1, currentYear + 1]);
    Object.keys(goals).forEach(ym => {
      const y = parseInt(ym.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    transactions.forEach(t => {
      const y = parseInt(t.date.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [goals, transactions, currentYear]);

  // Goal Edit Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [targetAmountInput, setTargetAmountInput] = useState(activeMonthGoal.targetIncreaseAmount.toString());
  const [noteInput, setNoteInput] = useState(activeMonthGoal.note || '');

  // Expected Income Item Modal State
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncomeItem, setEditingIncomeItem] = useState<ExpectedIncomeItem | null>(null);
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [incomeMemo, setIncomeMemo] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(targetAmountInput);
    if (!isNaN(targetVal) && targetVal >= 0) {
      updateGoalForMonth(selectedYM, {
        targetIncreaseAmount: targetVal,
        note: noteInput,
      });
      setIsGoalModalOpen(false);
      setToastMsg(`🎯 ${formatYearMonth(selectedYM)} 목표 증액 금액이 ${targetVal.toLocaleString()}원으로 설정되었습니다!`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const openAddIncomeModal = () => {
    setEditingIncomeItem(null);
    setIncomeName('');
    setIncomeAmount('');
    const firstIncomeCat = categories.find(c => c.type === 'income');
    setIncomeCategoryId(firstIncomeCat ? firstIncomeCat.id : '');
    setIncomeMemo('');
    setIsIncomeModalOpen(true);
  };

  const openEditIncomeModal = (item: ExpectedIncomeItem) => {
    setEditingIncomeItem(item);
    setIncomeName(item.name);
    setIncomeAmount(item.amount.toString());
    setIncomeCategoryId(item.categoryId);
    setIncomeMemo(item.memo || '');
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncomeItem = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(incomeAmount) || 0;
    const cat = categories.find(c => c.id === incomeCategoryId);

    if (editingIncomeItem) {
      updateExpectedIncomeItem(editingIncomeItem.id, {
        name: incomeName,
        amount: numAmount,
        categoryId: incomeCategoryId,
        categoryName: cat ? cat.name : '수입',
        memo: incomeMemo,
      });
    } else {
      addExpectedIncomeItem({
        name: incomeName,
        amount: numAmount,
        categoryId: incomeCategoryId,
        categoryName: cat ? cat.name : '수입',
        memo: incomeMemo,
      });
    }
    setIsIncomeModalOpen(false);
  };

  const handleLogIncomeToLedger = (item: ExpectedIncomeItem) => {
    logExpectedIncomeToLedger(item.id);
    setToastMsg(`🎉 '${item.name}' (${item.amount.toLocaleString()}원) 실제 수입이 가계부 장부에 기록되었습니다!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');

  // Month Context & Metrics
  const isViewingCurrentMonth = selectedYM === currentYM;
  const isViewingPastMonth = selectedYM < currentYM;

  const targetAmount = activeMonthGoal.targetIncreaseAmount;
  const actualNetSaving = activeMonthStats.netSaving;
  const achievementRate = activeMonthStats.achievementRate;
  const goalStatus = activeMonthStats.status;

  const remainingToTarget = Math.max(targetAmount - actualNetSaving, 0);
  const excessTarget = Math.max(actualNetSaving - targetAmount, 0);
  const isGoalAchieved = goalStatus === 'achieved';

  // 12-month goals list for the selected year
  const yearlyGoals = useMemo(() => {
    return getYearMonthlyTrends(selectedYear);
  }, [selectedYear, getYearMonthlyTrends, goals, transactions]);


  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>목표 자산 증액</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {formatYearMonth(selectedYM)} 현황
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">매달 목표를 세우고 실제 자산 순증액과 달성 여부를 연/월별로 점검합니다.</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowHistoryGrid(prev => !prev)}
            className={`inline-flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              showHistoryGrid
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>{showHistoryGrid ? '연간 달성 현황 접기' : '연간 12개월 달성 현황'}</span>
          </button>
        </div>
      </div>

      {/* Year / Month Navigator Card */}
      <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Year Selector & Month Step Buttons */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-100 rounded-xl px-2.5 py-1 border border-slate-200 text-xs font-bold text-slate-800">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold focus:outline-none cursor-pointer pr-1"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                title="이전 달"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleSetCurrentMonth}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  isViewingCurrentMonth
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                이번 달 (현재)
              </button>
              <button
                onClick={handleNextMonth}
                title="다음 달"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Month Indicator & Context Label */}
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-bold px-2.5 py-1 rounded-xl border ${
              isViewingCurrentMonth
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : isViewingPastMonth
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              {isViewingCurrentMonth ? '📍 이번 달 진행 중' : isViewingPastMonth ? '📜 과거 월 결산 내역' : '🔮 미래 월 계획'}
            </span>
            <span className="text-slate-500 font-medium">
              조회: <strong className="text-slate-900 font-bold">{formatYearMonth(selectedYM)}</strong>
            </span>
          </div>
        </div>

        {/* 1 ~ 12 Month Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isThisMonth = selectedYear === currentYear && m === currentMonth;
            const isSelected = selectedMonth === m;
            const monthStat = yearlyGoals[m - 1];
            const isAchieved = monthStat?.status === 'achieved';

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border relative flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                    : isThisMonth
                    ? 'bg-indigo-50/80 text-indigo-700 border-indigo-300 font-extrabold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{m}월</span>
                {isAchieved && <span>🏆</span>}
                {isThisMonth && !isAchieved && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Goal Achievement Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl transition-all ${
        isGoalAchieved
          ? 'bg-gradient-to-br from-emerald-950 via-teal-900 to-indigo-950'
          : isViewingPastMonth && goalStatus === 'failed'
          ? 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900'
          : 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-sky-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md border border-white/10">
                <Target className="h-3.5 w-3.5" />
                <span>{formatYearMonth(selectedYM)} 목표 관리</span>
              </span>

              {/* Achievement Badge */}
              {goalStatus === 'achieved' ? (
                <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-xs font-black text-emerald-300 animate-pulse">
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  <span>🏆 목표 달성 완료!</span>
                </span>
              ) : goalStatus === 'failed' ? (
                <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-xs font-bold text-rose-300">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>⚠️ 목표 미달성 (결산)</span>
                </span>
              ) : goalStatus === 'in_progress' ? (
                <span className="inline-flex items-center space-x-1 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                  <Clock className="h-3.5 w-3.5" />
                  <span>⏳ 목표 달성 순항 중</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 rounded-full bg-slate-400/20 border border-slate-300/30 px-3 py-1 text-xs font-bold text-slate-300">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>📝 목표 미설정</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatYearMonth(selectedYM)} 자산{' '}
              <span className="text-amber-300">
                {targetAmount > 0 ? `+${targetAmount.toLocaleString()}원` : '0원'}
              </span>{' '}
              증액 {isGoalAchieved ? '달성 성공!' : '도전!'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100">
              {activeMonthGoal.note || (
                targetAmount > 0
                  ? '지출을 아끼고 저축을 모아 이번 달 자산 증액 목표를 성공적으로 완수하세요!'
                  : '이 달의 목표 자산 증액 금액을 설정하고 저축 습관을 시작해 보세요.'
              )}
            </p>
          </div>

          <button
            onClick={() => {
              setTargetAmountInput(activeMonthGoal.targetIncreaseAmount.toString());
              setNoteInput(activeMonthGoal.note || '');
              setIsGoalModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 rounded-2xl bg-white text-indigo-950 px-5 py-3 text-sm font-bold hover:bg-indigo-50 shadow-lg transition-all shrink-0"
          >
            <Edit3 className="h-4 w-4 text-indigo-600" />
            <span>이 달의 증액 목표 수정</span>
          </button>
        </div>

        {/* Progress Bar Gauge */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-indigo-100 flex items-center space-x-1.5">
              <span>실제 자산 순증액:</span>
              <strong className={`text-base ${actualNetSaving >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {actualNetSaving >= 0 ? `+${actualNetSaving.toLocaleString()}` : actualNetSaving.toLocaleString()}원
              </strong>
            </span>
            <span className="text-amber-300 text-base font-extrabold">
              {targetAmount > 0 ? `${achievementRate}% 달성` : '목표 미설정'}
            </span>
          </div>

          <div className="h-5 w-full rounded-full bg-indigo-950/60 p-1 border border-indigo-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 shadow-lg shadow-emerald-500/30'
                  : actualNetSaving < 0
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400'
              }`}
              style={{ width: `${Math.min(Math.max(achievementRate, 0), 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span>시작 (0원)</span>
            <span>
              {isGoalAchieved ? (
                <strong className="text-emerald-300 flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>목표보다 +{excessTarget.toLocaleString()}원 초과 달성! 👏</span>
                </strong>
              ) : targetAmount > 0 ? (
                isViewingPastMonth ? (
                  <span className="text-rose-300">목표 대비 -{remainingToTarget.toLocaleString()}원 부족으로 마감</span>
                ) : (
                  `목표까지 ${remainingToTarget.toLocaleString()}원 남음`
                )
              ) : (
                '증액 목표 금액을 설정해 주세요'
              )}
            </span>
            <span>목표: {targetAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Selected Month Financial Overview KPI Strip (매달의 소비/수입/투자 현황) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Month Income */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{selectedMonth}월 수입 현황</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
              +{activeMonthStats.totalIncome.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">총 {activeMonthStats.incomeCount}건의 수입 내역</div>
          </div>
        </div>

        {/* Month Expense (소비) */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{selectedMonth}월 소비(지출) 현황</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 tracking-tight">
              -{activeMonthStats.totalExpense.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">총 {activeMonthStats.expenseCount}건의 소비 및 결제</div>
          </div>
        </div>

        {/* Month Investment */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{selectedMonth}월 투자 투입 현황</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-600 tracking-tight">
              {activeMonthStats.totalInvestment.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">총 {activeMonthStats.investmentCount}건의 투자 매수</div>
          </div>
        </div>

        {/* Actual Net Increase vs Goal */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{selectedMonth}월 자산 순증액</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
              isGoalAchieved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              actualNetSaving >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}>
              {actualNetSaving >= 0 ? `+${actualNetSaving.toLocaleString()}` : actualNetSaving.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              목표 대비: <strong className={actualNetSaving >= targetAmount ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {targetAmount > 0
                  ? (actualNetSaving >= targetAmount ? `+${excessTarget.toLocaleString()}원 초과 달성` : `-${remainingToTarget.toLocaleString()}원 부족`)
                  : '목표 미설정'}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* 12-Month Goal Achievement Calendar Matrix (연간 12개월 목표 달성 현황) */}
      {showHistoryGrid && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>{selectedYear}년 1월 ~ 12월 매달 목표 달성 현황</span>
              </h2>
              <p className="text-xs text-slate-500">각 월별 카드를 클릭하면 해당 월로 이동하여 목표를 설정하거나 상세 내역을 확인할 수 있습니다.</p>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span><span>달성 완료</span></span>
              <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span><span>진행 중</span></span>
              <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span><span>미달성</span></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {yearlyGoals.map((stat, idx) => {
              const m = idx + 1;
              const isSelected = selectedMonth === m;
              const isCurrent = selectedYear === currentYear && m === currentMonth;
              const target = stat.goal.targetIncreaseAmount;
              const net = stat.netSaving;
              const rate = stat.achievementRate;
              const status = stat.status;

              return (
                <div
                  key={stat.yearMonth}
                  onClick={() => setSelectedMonth(m)}
                  className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:shadow-md ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                      : isCurrent
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center space-x-1">
                      <span>{m}월</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded">현재</span>
                      )}
                    </span>
                    <span className="text-xs">
                      {status === 'achieved' ? (
                        <span className="text-emerald-600 font-bold">🏆 달성</span>
                      ) : status === 'failed' ? (
                        <span className="text-rose-500 font-bold">⚠️ 미달</span>
                      ) : status === 'in_progress' ? (
                        <span className="text-amber-600 font-bold">⏳ 진행</span>
                      ) : (
                        <span className="text-slate-400">미설정</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500">목표: {target > 0 ? `${Math.round(target / 10000)}만` : '0원'}</div>
                    <div className={`text-xs font-extrabold ${net >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                      순증: {net >= 0 ? `+${Math.round(net / 10000)}만` : `${Math.round(net / 10000)}만`}
                    </div>
                  </div>

                  {target > 0 ? (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === 'achieved'
                              ? 'bg-emerald-500'
                              : net < 0
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(Math.max(rate, 0), 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-right font-bold text-slate-500">{rate}%</div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 py-1">목표 없음</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Itemized Expected Income Section */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">매달 예상 수입 세부 항목 관리</h2>
              <p className="text-xs text-slate-500">월급, 상여금, 투자수익, 부수입 등을 나눠서 예상 수입 등록</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-600">
              합계: <strong className="text-emerald-600 text-base">{expectedMonthlyIncome.toLocaleString()}원</strong>
            </span>
            <button
              onClick={openAddIncomeModal}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>예상 수입 항목 추가</span>
            </button>
          </div>
        </div>

        {expectedIncomeItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <DollarSign className="mx-auto h-8 w-8 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600 text-sm">등록된 예상 수입 항목이 없습니다.</p>
            <p className="text-xs text-slate-400">월급, 보너스, 투자 배당금, 부수입 항목을 구분하여 등록해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">수입 항목명</th>
                  <th className="px-4 py-3">구분 카테고리</th>
                  <th className="px-4 py-3 text-right">예상 금액</th>
                  <th className="px-4 py-3 text-center">실제 입금 시</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expectedIncomeItems.map((item) => {
                  const catObj = categories.find(c => c.id === item.categoryId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div>{item.name}</div>
                        {item.memo && <div className="text-xs text-slate-400 font-normal">{item.memo}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span
                          className="inline-flex items-center space-x-1 font-bold"
                          style={{ color: catObj ? catObj.color : '#10b981' }}
                        >
                          <span>●</span>
                          <span>{item.categoryName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-600 text-sm">
                        +{item.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleLogIncomeToLedger(item)}
                          className="inline-flex items-center space-x-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>실제 수입 장부 기록</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditIncomeModal(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${item.name}' 항목을 삭제하시겠습니까?`)) {
                                deleteExpectedIncomeItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2 Key Metric Cards: Daily Safe Spending Budget & Spending Pace */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Daily Safe Spending Budget */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">일일 권장 지출 예산</h3>
                <p className="text-xs text-slate-500">목표 달성을 위한 남은 일수 기준 하루 지출 한도</p>
              </div>
            </div>
            <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
              남은 {gulbiAdvice.currentDaysLeft}일
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 text-center space-y-1">
            <span className="text-xs font-medium text-slate-500">오늘부터 하루 평균 안전 가용 지출</span>
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {gulbiAdvice.dailyTargetBudget.toLocaleString()} <span className="text-base font-normal text-slate-600">원 / 일</span>
            </div>
          </div>

          {/* Today's Real-Time Available Budget Box */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                <span>오늘 실시간 당일 가용 잔여 예산</span>
              </span>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-200/60 px-2 py-0.5 rounded-md">
                오늘 지출: {todayVariableExpenseSpent.toLocaleString()}원
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl font-extrabold tracking-tight">
                {todayAvailableBudget >= 0 ? (
                  <span className="text-emerald-600">
                    +{todayAvailableBudget.toLocaleString()} <span className="text-sm font-normal text-slate-600">원 남음</span>
                  </span>
                ) : (
                  <span className="text-rose-600">
                    -{Math.abs(todayAvailableBudget).toLocaleString()} <span className="text-sm font-normal text-slate-600">원 초과!</span>
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                  todayAvailableBudget >= 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                }`}
              >
                {todayAvailableBudget >= 0 ? '오늘 소비 안전 🟢' : '오늘 예산 초과 🔴'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              일일 권장 지출({gulbiAdvice.dailyTargetBudget.toLocaleString()}원) - 오늘 실제 지출({todayVariableExpenseSpent.toLocaleString()}원) = 오늘 추가 사용 가능 금액
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span>매월 예상 수입 합계:</span>
              <span className="font-semibold text-slate-900">{expectedMonthlyIncome.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>장부 수입 (실제 입금):</span>
              <span className="font-semibold">+{currentMonthIncome.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-indigo-600">
              <span>차감: 목표 자산 증액분:</span>
              <span className="font-semibold">-{activeMonthGoal.targetIncreaseAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>차감: 매월 고정지출 보존분:</span>
              <span className="font-semibold">-{totalFixedExpenseAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-800">
              <span>= 초기 월 변동지출 예산:</span>
              <span className="text-slate-900 font-bold">{initialVariableBudget.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>차감: 어제까지 누적 변동지출:</span>
              <span className="font-semibold text-slate-700">-{pastVariableExpenseSpent.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800">
              <span>= 오늘 아침 시작 기준 가용 예산:</span>
              <span className="text-indigo-700 font-bold">{remainingVariableBudgetBeforeToday.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-amber-700 font-semibold">
              <span>➔ 오늘 하루 평균 권장 예산 ({gulbiAdvice.currentDaysLeft}일 분할):</span>
              <span className="font-bold">{gulbiAdvice.dailyTargetBudget.toLocaleString()}원 / 일</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>차감: 오늘 실제 지출한 금액:</span>
              <span className="font-semibold">-{todayVariableExpenseSpent.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
              <span>= 오늘 남은 당일 가용 잔여 예산:</span>
              <span className={todayAvailableBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {todayAvailableBudget >= 0 ? `+${todayAvailableBudget.toLocaleString()}원` : `${todayAvailableBudget.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200/80 pt-2 text-[11px] text-slate-500">
              <span>이번 달 누적 변동지출 총액: <strong className="text-slate-700">{pureVariableExpenseSpent.toLocaleString()}원</strong></span>
              <span>월말까지 총 남은 가용 예산: <strong className={remainingVariableBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{remainingVariableBudget.toLocaleString()}원</strong></span>
            </div>
          </div>
        </div>

        {/* Spending Pace Status */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    gulbiAdvice.spendingPace === 'safe'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : gulbiAdvice.spendingPace === 'caution'
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {gulbiAdvice.spendingPace === 'safe' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">소비 페이스 진단</h3>
                  <p className="text-xs text-slate-500">지출 속도 및 재무 건강도 점수</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">{gulbiAdvice.healthScore}</span>
                <span className="text-xs text-slate-400"> / 100점</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-center space-x-3">
              <span className="text-2xl">🐟</span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {gulbiAdvice.statusMessage}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-50/80 p-4 border border-indigo-100 space-y-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-indigo-900">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Gulbi 꿀팁</span>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              배달음식이나 커피 지출을 하루 10,000원씩만 아끼면, 한 달에 30만원이 추가로 저축되어 목표를 더 빠르게 달성할 수 있습니다!
            </p>
          </div>
        </div>

      </div>

      {/* Goal Edit Modal Dialog */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {formatYearMonth(selectedYM)} 자산 증액 목표 설정
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">목표 자산 증액 금액 (원)</label>
                <input
                  type="number"
                  required
                  placeholder="예: 2000000"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">다짐 / 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 불필요한 배달 음식 줄이기!"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  목표 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expected Income Item Edit/Create Modal Dialog */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingIncomeItem ? '예상 수입 항목 수정' : '새 예상 수입 항목 추가'}
            </h3>

            <form onSubmit={handleSaveIncomeItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">수입 카테고리</label>
                <select
                  value={incomeCategoryId}
                  onChange={(e) => setIncomeCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">수입 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 8월 기본급, 분기 성과급, 중고거래 판매"
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">예상 수입 금액 (원)</label>
                <input
                  type="number"
                  required
                  placeholder="예: 3500000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 25일 급여일 입금 예정"
                  value={incomeMemo}
                  onChange={(e) => setIncomeMemo(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

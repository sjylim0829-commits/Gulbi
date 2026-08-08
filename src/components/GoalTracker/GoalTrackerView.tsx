import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Target, AlertTriangle, ShieldCheck, Calendar, Flame, Sparkles, Edit3, Award, DollarSign, Plus, CheckCircle2, Trash2, Edit2, Wallet } from 'lucide-react';
import type { ExpectedIncomeItem } from '../../types/financial';

export const GoalTrackerView: React.FC = () => {
  const {
    goal,
    updateGoal,
    currentMonthIncome,
    expectedMonthlyIncome,
    expectedIncomeItems,
    addExpectedIncomeItem,
    updateExpectedIncomeItem,
    deleteExpectedIncomeItem,
    logExpectedIncomeToLedger,
    currentMonthNetSaving,
    totalFixedExpenseAmount,
    pureVariableExpenseSpent,
    initialVariableBudget,
    remainingVariableBudget,
    monthlyGoalProgress,
    gulbiAdvice,
    todayVariableExpenseSpent,
    todayAvailableBudget,
    categories,
    transactions,
  } = useFinancial();

  // Goal Edit Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [targetAmountInput, setTargetAmountInput] = useState(goal.targetIncreaseAmount.toString());
  const [noteInput, setNoteInput] = useState(goal.note || '');

  // Expected Income Item Modal State
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncomeItem, setEditingIncomeItem] = useState<ExpectedIncomeItem | null>(null);
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [incomeMemo, setIncomeMemo] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(targetAmountInput);
    if (!isNaN(targetVal) && targetVal >= 0) {
      updateGoal({
        targetIncreaseAmount: targetVal,
        note: noteInput,
      });
      setIsGoalModalOpen(false);
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
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const currentMonthYM = goal.yearMonth || '2026-08';
  const monthExpenseTxList = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthYM));

  const remainingToTarget = Math.max(goal.targetIncreaseAmount - currentMonthNetSaving, 0);
  const isGoalAchieved = goal.targetIncreaseAmount > 0 && currentMonthNetSaving >= goal.targetIncreaseAmount;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Goal Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-sky-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur-md">
                <Target className="h-3.5 w-3.5" />
                <span>{goal.yearMonth} 목표 관리</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 px-3 py-1 text-xs font-bold text-emerald-200">
                <DollarSign className="h-3.5 w-3.5" />
                <span>총 예상 수입: {expectedMonthlyIncome > 0 ? `${expectedMonthlyIncome.toLocaleString()}원` : '미설정'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              이번 달 자산 <span className="text-amber-300">+{goal.targetIncreaseAmount.toLocaleString()}원</span> 증액 도전!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              {goal.note || '지출을 아끼고 수입을 모아 이번 달 자산을 단단하게 불려나가세요.'}
            </p>
          </div>

          <button
            onClick={() => {
              setTargetAmountInput(goal.targetIncreaseAmount.toString());
              setNoteInput(goal.note || '');
              setIsGoalModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 rounded-2xl bg-white text-indigo-900 px-5 py-3 text-sm font-bold hover:bg-indigo-50 shadow-lg shadow-black/10 transition-all shrink-0"
          >
            <Edit3 className="h-4 w-4 text-indigo-600" />
            <span>증액 목표 금액 수정</span>
          </button>
        </div>

        {/* Progress Bar Gauge */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-indigo-100">
              현재 자산 순증액: <strong className="text-emerald-300 text-base">{currentMonthNetSaving.toLocaleString()}원</strong>
            </span>
            <span className="text-amber-300 text-base font-extrabold">{monthlyGoalProgress}% 달성</span>
          </div>

          <div className="h-5 w-full rounded-full bg-indigo-950/60 p-1 border border-indigo-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400'
              }`}
              style={{ width: `${Math.min(monthlyGoalProgress, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-indigo-200">
            <span>시작 (0원)</span>
            <span>
              {isGoalAchieved ? (
                <strong className="text-emerald-300 flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>목표 달성 완료!</span>
                </strong>
              ) : goal.targetIncreaseAmount > 0 ? (
                `목표까지 ${remainingToTarget.toLocaleString()}원 남아있음`
              ) : (
                '목표 금액을 설정해 주세요'
              )}
            </span>
            <span>목표: {goal.targetIncreaseAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      </div>

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
              <span className="font-semibold">-{goal.targetIncreaseAmount.toLocaleString()}원</span>
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
              <span>차감: 이번 달 누적 변동지출:</span>
              <span className="font-semibold text-rose-600">-{pureVariableExpenseSpent.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
              <span>남은 변동지출 가용 예산:</span>
              <span className={`font-bold ${remainingVariableBudget >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {remainingVariableBudget.toLocaleString()}원
              </span>
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

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-center space-x-3">
              <span className="text-2xl">🐟</span>
              <p className="text-sm font-semibold text-slate-800">{gulbiAdvice.statusMessage}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-50 p-3.5 border border-indigo-100 space-y-1">
            <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Gulbi 꿀팁</span>
            </span>
            <p className="text-xs text-slate-700">
              배달음식이나 커피 지출을 하루 10,000원씩만 아끼면, 한 달에 30만원이 추가로 저축되어 목표를 더 빠르게 달성할 수 있습니다!
            </p>
          </div>
        </div>

      </div>

      {/* Gulbi AI Financial Recommendations Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Gulbi AI 맞춤형 분석 & 피드백</h2>
            <p className="text-xs text-slate-500">이번 달 수입, 지출, 증액 추이 종합 평가</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gulbiAdvice.adviceList.map((adv, idx) => (
            <div key={idx} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start space-x-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-extrabold text-indigo-700 text-xs">
                {idx + 1}
              </span>
              <span className="font-medium text-slate-800">{adv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Budget Usage Monitor */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">카테고리별 예산 한도 대비 소비 현황</h2>
            <p className="text-xs text-slate-500">지출 카테고리별 예산 준수 여부 점검</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategories.map((cat) => {
            const spent = monthExpenseTxList
              .filter(t => t.categoryId === cat.id)
              .reduce((sum, t) => sum + t.amount, 0);
            
            const budget = cat.monthlyBudget || 0;
            const pct = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
            const isOver = budget > 0 && spent > budget;

            return (
              <div key={cat.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-bold text-slate-900">{cat.name}</span>
                  </div>
                  <div className="text-slate-500">
                    <strong className={isOver ? 'text-rose-600' : 'text-slate-900'}>{spent.toLocaleString()}원</strong>
                    {budget > 0 ? <span> / {budget.toLocaleString()}원</span> : <span> (예산 미설정)</span>}
                  </div>
                </div>

                {budget > 0 && (
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>사용률 {pct}%</span>
                      {isOver ? (
                        <span className="text-rose-600 font-bold">{(spent - budget).toLocaleString()}원 초과!</span>
                      ) : (
                        <span>{(budget - spent).toLocaleString()}원 남음</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Edit Modal Dialog */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">목표 자산 증액 설정</h3>
                <p className="text-xs text-slate-500">{goal.yearMonth} 달성 플랜 수정</p>
              </div>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">목표 자산 증액분 (원)</label>
                <input
                  type="number"
                  required
                  placeholder="예: 1500000"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 수입 중 이번 달에 순자산으로 저축/불리고 싶은 목표 금액을 입력하세요.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">목표 각오 / 메모</label>
                <textarea
                  rows={3}
                  placeholder="예: 이번 달은 외식 줄이고 적금에 집중하기!"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
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
                  목표 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expected Income Item Modal Dialog */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingIncomeItem ? '예상 수입 항목 수정' : '새 예상 수입 항목 추가'}
            </h3>

            <form onSubmit={handleSaveIncomeItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">예상 수입 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 기본 월급, 분기 상여금, 주식 배당금, 부업 수입"
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">수입 카테고리</label>
                  <select
                    value={incomeCategoryId}
                    onChange={(e) => setIncomeCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {incomeCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">예상 금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 3500000"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 매월 25일 지급"
                  value={incomeMemo}
                  onChange={(e) => setIncomeMemo(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
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

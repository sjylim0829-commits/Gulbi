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
    pastVariableExpenseSpent,
    todayVariableExpenseSpent,
    remainingVariableBudgetBeforeToday,
    todayAvailableBudget,
    categories,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-sky-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md border border-white/10">
                <Target className="h-3.5 w-3.5" />
                <span>{goal.yearMonth} 목표 관리</span>
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                <DollarSign className="h-3.5 w-3.5" />
                <span>총 예상 수입: {expectedMonthlyIncome > 0 ? `${expectedMonthlyIncome.toLocaleString()}원` : '미설정'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              이번 달 자산 <span className="text-amber-400">+{goal.targetIncreaseAmount.toLocaleString()}원</span> 증액 도전!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200">
              {goal.note || '지출을 아끼고 수입을 모아 이번 달 자산을 단단하게 불려나가세요.'}
            </p>
          </div>

          <button
            onClick={() => {
              setTargetAmountInput(goal.targetIncreaseAmount.toString());
              setNoteInput(goal.note || '');
              setIsGoalModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 rounded-2xl bg-white text-indigo-950 px-5 py-3 text-sm font-bold hover:bg-indigo-50 shadow-lg transition-all shrink-0"
          >
            <Edit3 className="h-4 w-4 text-indigo-600" />
            <span>증액 목표 금액 수정</span>
          </button>
        </div>

        {/* Progress Bar Gauge */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-indigo-200">
              현재 자산 순증액: <strong className="text-emerald-300 text-base">{currentMonthNetSaving.toLocaleString()}원</strong>
            </span>
            <span className="text-amber-400 text-base font-extrabold">{monthlyGoalProgress}% 달성</span>
          </div>

          <div className="h-5 w-full rounded-full bg-slate-950/80 p-1 border border-indigo-900/60">
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
      <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">매달 예상 수입 세부 항목 관리</h2>
              <p className="text-xs text-slate-400">월급, 상여금, 투자수익, 부수입 등을 나눠서 예상 수입 등록</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-300">
              합계: <strong className="text-emerald-400 text-base">{expectedMonthlyIncome.toLocaleString()}원</strong>
            </span>
            <button
              onClick={openAddIncomeModal}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>예상 수입 항목 추가</span>
            </button>
          </div>
        </div>

        {expectedIncomeItems.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <DollarSign className="mx-auto h-8 w-8 text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300 text-sm">등록된 예상 수입 항목이 없습니다.</p>
            <p className="text-xs text-slate-500">월급, 보너스, 투자 배당금, 부수입 항목을 구분하여 등록해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">수입 항목명</th>
                  <th className="px-4 py-3">구분 카테고리</th>
                  <th className="px-4 py-3 text-right">예상 금액</th>
                  <th className="px-4 py-3 text-center">실제 입금 시</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {expectedIncomeItems.map((item) => {
                  const catObj = categories.find(c => c.id === item.categoryId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
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
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-400 text-sm">
                        +{item.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleLogIncomeToLedger(item)}
                          className="inline-flex items-center space-x-1 rounded-xl bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>실제 수입 장부 기록</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditIncomeModal(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${item.name}' 항목을 삭제하시겠습니까?`)) {
                                deleteExpectedIncomeItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
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
        <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">일일 권장 지출 예산</h3>
                <p className="text-xs text-slate-400">목표 달성을 위한 남은 일수 기준 하루 지출 한도</p>
              </div>
            </div>
            <span className="rounded-xl bg-amber-950 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-800">
              남은 {gulbiAdvice.currentDaysLeft}일
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 text-center space-y-1">
            <span className="text-xs font-medium text-slate-400">오늘부터 하루 평균 안전 가용 지출</span>
            <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {gulbiAdvice.dailyTargetBudget.toLocaleString()} <span className="text-base font-normal text-slate-400">원 / 일</span>
            </div>
          </div>

          {/* Today's Real-Time Available Budget Box */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 to-orange-950/70 p-4 border border-amber-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>오늘 실시간 당일 가용 잔여 예산</span>
              </span>
              <span className="text-[11px] text-amber-200 font-bold bg-amber-900/80 px-2 py-0.5 rounded-md border border-amber-700/60">
                오늘 지출: {todayVariableExpenseSpent.toLocaleString()}원
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl font-extrabold tracking-tight">
                {todayAvailableBudget >= 0 ? (
                  <span className="text-emerald-400">
                    +{todayAvailableBudget.toLocaleString()} <span className="text-sm font-normal text-slate-400">원 남음</span>
                  </span>
                ) : (
                  <span className="text-rose-400">
                    -{Math.abs(todayAvailableBudget).toLocaleString()} <span className="text-sm font-normal text-slate-400">원 초과!</span>
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                  todayAvailableBudget >= 0
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                }`}
              >
                {todayAvailableBudget >= 0 ? '오늘 소비 안전 🟢' : '오늘 예산 초과 🔴'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              일일 권장 지출({gulbiAdvice.dailyTargetBudget.toLocaleString()}원) - 오늘 실제 지출({todayVariableExpenseSpent.toLocaleString()}원) = 오늘 추가 사용 가능 금액
            </p>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">매월 예상 수입 합계:</span>
              <span className="font-semibold text-white">{expectedMonthlyIncome.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>장부 수입 (실제 입금):</span>
              <span className="font-semibold">+{currentMonthIncome.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-indigo-400">
              <span>차감: 목표 자산 증액분:</span>
              <span className="font-semibold">-{goal.targetIncreaseAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>차감: 매월 고정지출 보존분:</span>
              <span className="font-semibold">-{totalFixedExpenseAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold text-slate-300">
              <span>= 초기 월 변동지출 예산:</span>
              <span className="text-white font-bold">{initialVariableBudget.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>차감: 어제까지 누적 변동지출:</span>
              <span className="font-semibold text-slate-300">-{pastVariableExpenseSpent.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-200">
              <span>= 오늘 아침 시작 기준 가용 예산:</span>
              <span className="text-indigo-400 font-bold">{remainingVariableBudgetBeforeToday.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-amber-400 font-semibold">
              <span>➔ 오늘 하루 평균 권장 예산 ({gulbiAdvice.currentDaysLeft}일 분할):</span>
              <span className="font-bold">{gulbiAdvice.dailyTargetBudget.toLocaleString()}원 / 일</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>차감: 오늘 실제 지출한 금액:</span>
              <span className="font-semibold">-{todayVariableExpenseSpent.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold text-white text-sm">
              <span>= 오늘 남은 당일 가용 잔여 예산:</span>
              <span className={todayAvailableBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {todayAvailableBudget >= 0 ? `+${todayAvailableBudget.toLocaleString()}원` : `${todayAvailableBudget.toLocaleString()}원`}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
              <span>이번 달 누적 변동지출 총액: <strong className="text-slate-200">{pureVariableExpenseSpent.toLocaleString()}원</strong></span>
              <span>월말까지 총 남은 가용 예산: <strong className={remainingVariableBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{remainingVariableBudget.toLocaleString()}원</strong></span>
            </div>
          </div>
        </div>

        {/* Spending Pace Status */}
        <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    gulbiAdvice.spendingPace === 'safe'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : gulbiAdvice.spendingPace === 'caution'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  }`}
                >
                  {gulbiAdvice.spendingPace === 'safe' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">소비 페이스 진단</h3>
                  <p className="text-xs text-slate-400">지출 속도 및 재무 건강도 점수</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">{gulbiAdvice.healthScore}</span>
                <span className="text-xs text-slate-500"> / 100점</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center space-x-3">
              <span className="text-2xl">🐟</span>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                {gulbiAdvice.statusMessage}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-950/50 p-4 border border-indigo-800/50 space-y-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-indigo-300">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Gulbi 꿀팁</span>
            </div>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              배달음식이나 커피 지출을 하루 10,000원씩만 아끼면, 한 달에 30만원이 추가로 저축되어 목표를 더 빠르게 달성할 수 있습니다!
            </p>
          </div>
        </div>

      </div>

      {/* Goal Edit Modal Dialog */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">이번 달 자산 증액 목표 수정</h3>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">목표 자산 증액 금액 (원)</label>
                <input
                  type="number"
                  required
                  placeholder="예: 2000000"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">다짐 / 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 불필요한 배달 음식 줄이기!"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingIncomeItem ? '예상 수입 항목 수정' : '새 예상 수입 항목 추가'}
            </h3>

            <form onSubmit={handleSaveIncomeItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">수입 카테고리</label>
                <select
                  value={incomeCategoryId}
                  onChange={(e) => setIncomeCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">수입 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 8월 기본급, 분기 성과급, 중고거래 판매"
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">예상 수입 금액 (원)</label>
                <input
                  type="number"
                  required
                  placeholder="예: 3500000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 25일 급여일 입금 예정"
                  value={incomeMemo}
                  onChange={(e) => setIncomeMemo(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
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

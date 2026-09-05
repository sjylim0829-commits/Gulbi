import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import {
  Search,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Trash2,
  Edit2,
  FolderPlus,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { Transaction, TransactionType } from '../../types/financial';
import { getLocalDateString } from '../../utils/dateUtils';

export const LedgerView: React.FC = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, getYearMonthlyTrends } = useFinancial();

  // Year / Month Filter State
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [showYearlyTrend, setShowYearlyTrend] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [ledgerSortBy, setLedgerSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'name_asc' | 'category'>('date_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form State
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState('12:00');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('신한카드');
  const [memo, setMemo] = useState('');

  // Available categories for selected transaction type
  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  // Year list for selector
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1, currentYear + 1]);
    transactions.forEach(t => {
      const y = parseInt(t.date.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => (prev as number) - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => (prev as number) + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };


  const currentYearMonthPrefix = useMemo(() => {
    if (selectedMonth === 'all') return `${selectedYear}-`;
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  const openAddModal = () => {
    setEditingTx(null);
    let defaultDate = getLocalDateString();
    if (selectedMonth !== 'all') {
      const ymPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      if (!defaultDate.startsWith(ymPrefix)) {
        defaultDate = `${ymPrefix}-01`;
      }
    } else {
      if (!defaultDate.startsWith(`${selectedYear}-`)) {
        defaultDate = `${selectedYear}-01-01`;
      }
    }
    setDate(defaultDate);
    setTime('12:00');
    setType('expense');
    const firstCat = categories.find(c => c.type === 'expense');
    setCategoryId(firstCat ? firstCat.id : '');
    setAmount('');
    setMerchant('');
    setPaymentMethod('신한카드');
    setMemo('');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setDate(tx.date);
    setTime(tx.time || '12:00');
    setType(tx.type);
    setCategoryId(tx.categoryId);
    setAmount(tx.amount.toString());
    setMerchant(tx.merchant);
    setPaymentMethod(tx.paymentMethod);
    setMemo(tx.memo || '');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const catObj = categories.find(c => c.id === categoryId);

    if (editingTx) {
      updateTransaction(editingTx.id, {
        date,
        time,
        type,
        categoryId,
        categoryName: catObj ? catObj.name : '미지정',
        amount: numAmount,
        merchant,
        paymentMethod,
        memo,
      });
    } else {
      addTransaction({
        date,
        time,
        type,
        categoryId,
        categoryName: catObj ? catObj.name : '미지정',
        amount: numAmount,
        merchant,
        paymentMethod,
        memo,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date.startsWith(currentYearMonthPrefix)) return false;
      if (activeTab !== 'all' && t.type !== activeTab) return false;
      if (selectedCategoryId !== 'all' && t.categoryId !== selectedCategoryId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMerchant = t.merchant.toLowerCase().includes(q);
        const matchMemo = (t.memo || '').toLowerCase().includes(q);
        const matchMethod = t.paymentMethod.toLowerCase().includes(q);
        const matchCategory = t.categoryName.toLowerCase().includes(q);
        if (!matchMerchant && !matchMemo && !matchMethod && !matchCategory) return false;
      }
      return true;
    });
  }, [transactions, currentYearMonthPrefix, activeTab, selectedCategoryId, searchQuery]);

  // Sorted filtered list
  const sortedFilteredTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (ledgerSortBy === 'date_desc') {
        const dateComp = (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''));
        return dateComp !== 0 ? dateComp : 0;
      }
      if (ledgerSortBy === 'date_asc') {
        const dateComp = (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
        return dateComp !== 0 ? dateComp : 0;
      }
      if (ledgerSortBy === 'amount_desc') return b.amount - a.amount;
      if (ledgerSortBy === 'amount_asc') return a.amount - b.amount;
      if (ledgerSortBy === 'name_asc') return a.merchant.localeCompare(b.merchant, 'ko-KR');
      if (ledgerSortBy === 'category') return a.categoryName.localeCompare(b.categoryName, 'ko-KR');
      return 0;
    });
  }, [filteredTransactions, ledgerSortBy]);

  // Totals for filtered list
  const totalFilteredIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalFilteredExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalFilteredInvestment = filteredTransactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
  const filteredIncomeCount = filteredTransactions.filter(t => t.type === 'income').length;
  const filteredExpenseCount = filteredTransactions.filter(t => t.type === 'expense').length;
  const filteredInvestmentCount = filteredTransactions.filter(t => t.type === 'investment').length;
  const filteredNetSaving = totalFilteredIncome - totalFilteredExpense;
  const filteredSavingRate = totalFilteredIncome > 0 ? Math.round((filteredNetSaving / totalFilteredIncome) * 100) : null;

  // Top expense categories breakdown
  const topExpenseCategories = useMemo(() => {
    const expenseTxs = filteredTransactions.filter(t => t.type === 'expense');
    const catMap = new Map<string, { name: string; amount: number; color?: string }>();
    expenseTxs.forEach(t => {
      const existing = catMap.get(t.categoryId) || {
        name: t.categoryName,
        amount: 0,
        color: categories.find(c => c.id === t.categoryId)?.color || '#f43f5e',
      };
      existing.amount += t.amount;
      catMap.set(t.categoryId, existing);
    });
    const list = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);
    return list.slice(0, 4).map(item => ({
      ...item,
      percentage: totalFilteredExpense > 0 ? Math.round((item.amount / totalFilteredExpense) * 100) : 0,
    }));
  }, [filteredTransactions, categories, totalFilteredExpense]);

  // Yearly 12-Month Trends for Recharts
  const yearlyTrendData = useMemo(() => {
    const trends = getYearMonthlyTrends(selectedYear);
    return trends.map((stat, idx) => ({
      monthName: `${idx + 1}월`,
      monthNum: idx + 1,
      yearMonth: stat.yearMonth,
      수입: stat.totalIncome,
      지출: stat.totalExpense,
      투자: stat.totalInvestment,
      순저축: stat.netSaving,
    }));
  }, [selectedYear, getYearMonthlyTrends]);


  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>가계부</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {selectedMonth === 'all' ? `${selectedYear}년 연간 전체` : `${selectedYear}년 ${selectedMonth}월`}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">매달의 소비, 수입, 투자 내역을 연/월별로 조회하고 비교 분석합니다.</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowYearlyTrend(prev => !prev)}
            className={`inline-flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              showYearlyTrend
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{showYearlyTrend ? '월별 추이 차트 접기' : '연간 월별 추이 차트'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>수기 거래내역 추가</span>
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
                  selectedYear === currentYear && selectedMonth === currentMonth
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                이번 달 (오늘)
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

          {/* Month Indicator Label */}
          <div className="text-xs text-slate-500 font-medium">
            조회 기간: <strong className="text-slate-900 font-bold">{selectedMonth === 'all' ? `${selectedYear}년 전체 (1~12월)` : `${selectedYear}년 ${selectedMonth}월 (1일 ~ 말일)`}</strong>
            <span className="ml-2 text-slate-400">· 거래 건수: <strong className="text-indigo-600">{filteredTransactions.length}건</strong></span>
          </div>
        </div>

        {/* 1 ~ 12 Month Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedMonth === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            연간 전체
          </button>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isCurrentMonth = selectedYear === currentYear && m === currentMonth;
            const isSelected = selectedMonth === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                    : isCurrentMonth
                    ? 'bg-indigo-50/80 text-indigo-700 border-indigo-300 font-extrabold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{m}월</span>
                {isCurrentMonth && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Financial Status KPI Strip (소비/수입/투자/순저축 현황) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Income Card */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedMonth === 'all' ? '연간 총 수입' : `${selectedMonth}월 수입 현황`}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
              +{totalFilteredIncome.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              총 {filteredIncomeCount}건의 수입 내역
            </div>
          </div>
        </div>

        {/* Expense Card (소비) */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedMonth === 'all' ? '연간 총 소비(지출)' : `${selectedMonth}월 소비(지출) 현황`}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 tracking-tight">
              -{totalFilteredExpense.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              총 {filteredExpenseCount}건의 결제 및 소비
            </div>
          </div>
        </div>

        {/* Investment Card */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedMonth === 'all' ? '연간 총 투자금' : `${selectedMonth}월 투자 투입금`}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-600 tracking-tight">
              {totalFilteredInvestment.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              총 {filteredInvestmentCount}건의 주식/코인/예적금 투자
            </div>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {selectedMonth === 'all' ? '연간 순저축(수입-소비)' : `${selectedMonth}월 순저축액`}
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
              filteredNetSaving >= 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              filteredNetSaving >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}>
              {filteredNetSaving >= 0 ? `+${filteredNetSaving.toLocaleString()}` : filteredNetSaving.toLocaleString()} <span className="text-xs font-normal text-slate-500">원</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] mt-0.5">
              <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                filteredNetSaving >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {filteredNetSaving >= 0 ? '흑자 🟢' : '적자 🔴'}
              </span>
              {filteredSavingRate !== null && (
                <span className="text-slate-500">저축률: <strong className="text-slate-700">{filteredSavingRate}%</strong></span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Top Expense Categories Breakdown Bar (지출 상위 분석) */}
      {topExpenseCategories.length > 0 && (
        <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{selectedMonth === 'all' ? `${selectedYear}년` : `${selectedMonth}월`} 소비 카테고리 TOP 비중</span>
            </span>
            <span className="text-slate-400 font-normal">총 소비 {totalFilteredExpense.toLocaleString()}원 기준</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topExpenseCategories.map((cat, idx) => (
              <div key={cat.name} className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">{idx + 1}. {cat.name}</span>
                  <span className="font-extrabold text-slate-900">{cat.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color || '#f43f5e' }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {cat.amount.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12-Month Trend Chart (Recharts Bar Chart) */}
      {showYearlyTrend && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span>{selectedYear}년 1월 ~ 12월 월별 소비 / 수입 / 투자 비교 추이</span>
              </h2>
              <p className="text-xs text-slate-500">막대를 클릭하면 해당 월로 바로 전환하여 상세 거래 내역을 볼 수 있습니다.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">단위: 원</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyTrendData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const clickedData = e.activePayload[0].payload;
                    if (clickedData && clickedData.monthNum) {
                      setSelectedMonth(clickedData.monthNum);
                    }
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => {
                    if (val >= 100000000) return `${(val / 100000000).toFixed(1)}억`;
                    if (val >= 10000) return `${Math.round(val / 10000)}만`;
                    return `${val}`;
                  }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()}원`]}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="수입" fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="지출" fill="#f43f5e" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="투자" fill="#8b5cf6" radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Type Tabs */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({filteredTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              수입만 ({filteredIncomeCount})
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              지출만 ({filteredExpenseCount})
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'investment' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              투자만 ({filteredInvestmentCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="가맹점, 메모, 결제수단, 카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-48 shrink-0">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            >
              <option value="all">모든 카테고리</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.type === 'income' ? '수입' : c.type === 'investment' ? '투자' : '지출'}] {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3 py-1.5 border border-slate-200 text-xs shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">정렬:</span>
            <select
              value={ledgerSortBy}
              onChange={(e) => setLedgerSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="date_desc">최신 날짜순 🔻</option>
              <option value="date_asc">오래된 날짜순 🔺</option>
              <option value="amount_desc">금액 높은순 🔻</option>
              <option value="amount_asc">금액 낮은순 🔺</option>
              <option value="name_asc">가맹점명 오름차순 (가-나-다)</option>
              <option value="category">카테고리별 정렬</option>
            </select>
          </div>

        </div>
      </div>


      {/* Transaction Table */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <FolderPlus className="mx-auto h-10 w-10 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600">등록된 수입/지출 거래 내역이 없습니다.</p>
            <p className="text-xs text-slate-400">우측 상단의 [+ 수기 거래내역 추가] 버튼을 눌러 거래를 추가해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">날짜/시간</th>
                  <th className="px-4 py-3">구분</th>
                  <th className="px-4 py-3">카테고리</th>
                  <th className="px-4 py-3">내역/가맹점</th>
                  <th className="px-4 py-3">결제수단</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFilteredTransactions.map((tx) => {
                  const catObj = categories.find(c => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                        {tx.date} <span className="text-slate-400">{tx.time}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {tx.type === 'income' ? (
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            수입
                          </span>
                        ) : tx.type === 'investment' ? (
                          <span className="inline-flex items-center rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                            투자
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            지출
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold">
                        <span style={{ color: catObj ? catObj.color : '#64748b' }}>
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div>{tx.merchant}</div>
                        {tx.memo && <div className="text-xs text-slate-400 font-normal">{tx.memo}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-extrabold text-sm ${
                          tx.type === 'income'
                            ? 'text-emerald-600'
                            : tx.type === 'investment'
                            ? 'text-purple-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? `+${tx.amount.toLocaleString()}원` : `-${tx.amount.toLocaleString()}원`}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${tx.merchant}' 거래 내역을 삭제하시겠습니까?`)) {
                                deleteTransaction(tx.id);
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

      {/* Manual Transaction Add/Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingTx ? '수기 거래 내역 수정' : '새 수기 거래 내역 추가'}
            </h3>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">구분</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as TransactionType;
                      setType(newType);
                      const cat = categories.find(c => c.type === newType);
                      setCategoryId(cat ? cat.id : '');
                    }}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  >
                    <option value="expense">지출</option>
                    <option value="income">수입</option>
                    <option value="investment">투자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">가맹점 / 내역 이름</label>
                <input
                  type="text"
                  required
                  placeholder="예: 스타벅스, 쿠팡, 월급입금, 삼성전자주식"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">거래 금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">결제 수단</label>
                  <input
                    type="text"
                    placeholder="예: 신한카드, 카카오페이, 계좌이체"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">날짜</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">시간</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 점심 식대, 온라인 쇼핑"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
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

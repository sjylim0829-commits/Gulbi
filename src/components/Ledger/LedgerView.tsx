import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Search, Plus, ArrowUpCircle, ArrowDownCircle, TrendingUp, Trash2, Edit2, FolderPlus, ArrowUpDown } from 'lucide-react';
import type { Transaction, TransactionType } from '../../types/financial';
import { getLocalDateString } from '../../utils/dateUtils';

export const LedgerView: React.FC = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useFinancial();

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

  const openAddModal = () => {
    setEditingTx(null);
    setDate(getLocalDateString());
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
  }, [transactions, activeTab, selectedCategoryId, searchQuery]);

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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Filter Controls */}
      <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">가계부</h1>
            <p className="text-xs text-slate-400">수입, 지출, 투자 내역 통합 관리 및 검색</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>수기 거래내역 추가</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2">
          
          {/* Type Tabs */}
          <div className="flex items-center space-x-1 rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              수입만
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              지출만
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'investment' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              투자만
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="가맹점, 메모, 결제수단, 카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-48 shrink-0">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all" className="bg-slate-900 text-white">모든 카테고리</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  [{c.type === 'income' ? '수입' : c.type === 'investment' ? '투자' : '지출'}] {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1.5 rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800 text-xs shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden sm:inline">정렬:</span>
            <select
              value={ledgerSortBy}
              onChange={(e) => setLedgerSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date_desc" className="bg-slate-900 text-white">최신 날짜순 🔻</option>
              <option value="date_asc" className="bg-slate-900 text-white">오래된 날짜순 🔺</option>
              <option value="amount_desc" className="bg-slate-900 text-white">금액 높은순 🔻</option>
              <option value="amount_asc" className="bg-slate-900 text-white">금액 낮은순 🔺</option>
              <option value="name_asc" className="bg-slate-900 text-white">가맹점명 오름차순 (가-나-다)</option>
              <option value="category" className="bg-slate-900 text-white">카테고리별 정렬</option>
            </select>
          </div>

        </div>
      </div>

      {/* Summary KPI Strip for Filtered Results */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">조회 수입 합계</span>
          </div>
          <span className="font-extrabold text-emerald-400 text-base">+{totalFilteredIncome.toLocaleString()}원</span>
        </div>

        <div className="rounded-2xl bg-rose-950/60 p-4 border border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="h-5 w-5 text-rose-400" />
            <span className="text-xs text-slate-300 font-medium">조회 지출 합계</span>
          </div>
          <span className="font-extrabold text-rose-400 text-base">-{totalFilteredExpense.toLocaleString()}원</span>
        </div>

        <div className="rounded-2xl bg-purple-950/60 p-4 border border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-xs text-slate-300 font-medium">조회 투자 합계</span>
          </div>
          <span className="font-extrabold text-purple-400 text-base">➔ {totalFilteredInvestment.toLocaleString()}원</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm space-y-2">
            <FolderPlus className="mx-auto h-10 w-10 text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300">등록된 수입/지출 거래 내역이 없습니다.</p>
            <p className="text-xs text-slate-500">우측 상단의 [+ 수기 거래내역 추가] 버튼을 눌러 거래를 추가해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/80">
                {sortedFilteredTransactions.map((tx) => {
                  const catObj = categories.find(c => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                        {tx.date} <span className="text-slate-500">{tx.time}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {tx.type === 'income' ? (
                          <span className="inline-flex items-center rounded-lg bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-800/60">
                            수입
                          </span>
                        ) : tx.type === 'investment' ? (
                          <span className="inline-flex items-center rounded-lg bg-purple-950 px-2 py-0.5 text-xs font-bold text-purple-400 border border-purple-800/60">
                            투자
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-rose-950 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-800/60">
                            지출
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold">
                        <span style={{ color: catObj ? catObj.color : '#94a3b8' }}>
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        <div>{tx.merchant}</div>
                        {tx.memo && <div className="text-xs text-slate-400 font-normal">{tx.memo}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-extrabold text-sm ${
                          tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'investment'
                            ? 'text-purple-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? `+${tx.amount.toLocaleString()}원` : `-${tx.amount.toLocaleString()}원`}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${tx.merchant}' 거래 내역을 삭제하시겠습니까?`)) {
                                deleteTransaction(tx.id);
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

      {/* Manual Transaction Add/Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingTx ? '수기 거래 내역 수정' : '새 수기 거래 내역 추가'}
            </h3>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">구분</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as TransactionType;
                      setType(newType);
                      const cat = categories.find(c => c.type === newType);
                      setCategoryId(cat ? cat.id : '');
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="expense">지출</option>
                    <option value="income">수입</option>
                    <option value="investment">투자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">카테고리</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">가맹점 / 내역 이름</label>
                <input
                  type="text"
                  required
                  placeholder="예: 스타벅스, 쿠팡, 월급입금, 삼성전자주식"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">거래 금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">결제 수단</label>
                  <input
                    type="text"
                    placeholder="예: 신한카드, 카카오페이, 계좌이체"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">날짜</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">시간</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 점심 식대, 온라인 쇼핑"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
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

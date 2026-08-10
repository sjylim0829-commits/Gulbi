import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, Clock, DollarSign, Wallet, ShieldCheck, ArrowUpDown } from 'lucide-react';
import type { FixedExpense } from '../../types/financial';

export const FixedExpensesView: React.FC = () => {
  const { fixedExpenses, categories, addFixedExpense, updateFixedExpense, deleteFixedExpense, logFixedExpenseToLedger, totalFixedExpenseAmount } = useFinancial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedExpense | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [fixedSortBy, setFixedSortBy] = useState<'day_asc' | 'day_desc' | 'amount_desc' | 'amount_asc' | 'name_asc'>('day_asc');

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('자동이체');
  const [memo, setMemo] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setAmount('');
    setDayOfMonth('10');
    const firstCat = categories.find(c => c.type === 'expense');
    setCategoryId(firstCat ? firstCat.id : '');
    setPaymentMethod('자동이체');
    setMemo('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FixedExpense) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(item.amount.toString());
    setDayOfMonth(item.dayOfMonth.toString());
    setCategoryId(item.categoryId);
    setPaymentMethod(item.paymentMethod);
    setMemo(item.memo || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const numDay = Math.min(Math.max(parseInt(dayOfMonth, 10) || 1, 1), 31);
    const cat = categories.find(c => c.id === categoryId);

    if (editingItem) {
      updateFixedExpense(editingItem.id, {
        name,
        amount: numAmount,
        dayOfMonth: numDay,
        categoryId,
        categoryName: cat ? cat.name : '기타지출',
        paymentMethod,
        memo,
      });
    } else {
      addFixedExpense({
        name,
        amount: numAmount,
        dayOfMonth: numDay,
        categoryId,
        categoryName: cat ? cat.name : '기타지출',
        paymentMethod,
        memo,
      });
    }
    setIsModalOpen(false);
  };

  const handleLogToLedger = (item: FixedExpense) => {
    logFixedExpenseToLedger(item.id);
    setSuccessToast(`🎉 '${item.name}' (${item.amount.toLocaleString()}원) 결제가 이번 달 가계부 장부에 기록되었습니다!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const sortedFixedExpenses = [...fixedExpenses].sort((a, b) => {
    if (fixedSortBy === 'day_asc') return a.dayOfMonth - b.dayOfMonth;
    if (fixedSortBy === 'day_desc') return b.dayOfMonth - a.dayOfMonth;
    if (fixedSortBy === 'amount_desc') return b.amount - a.amount;
    if (fixedSortBy === 'amount_asc') return a.amount - b.amount;
    if (fixedSortBy === 'name_asc') return a.name.localeCompare(b.name, 'ko-KR');
    return 0;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Description & Action */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">매월 고정지출 관리</h1>
              <p className="text-xs text-slate-500">월세, 아파트 관리비, 공과금, 통신비, 보험료, 구독료 등 정기 지출 관리</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3 py-1.5 border border-slate-200 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="text-slate-500 font-medium hidden sm:inline">정렬:</span>
              <select
                value={fixedSortBy}
                onChange={(e) => setFixedSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="day_asc">결제일 빠른순 🔺</option>
                <option value="day_desc">결제일 늦은순 🔻</option>
                <option value="amount_desc">금액 높은순 🔻</option>
                <option value="amount_asc">금액 낮은순 🔺</option>
                <option value="name_asc">항목명 오름차순 (가-나-다)</option>
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>고정지출 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">매월 총 고정지출</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {totalFixedExpenseAmount.toLocaleString()} <span className="text-sm font-normal text-slate-500">원 / 월</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">등록된 고정지출 항목</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {fixedExpenses.length} <span className="text-sm font-normal text-slate-500">개 항목</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">스마트 관리 팁</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            고정지출을 미리 빼두면 이번 달 진짜 쓸 수 있는 변동 지출 한도가 명확해집니다!
          </p>
        </div>
      </div>

      {/* Fixed Expenses Table */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        {sortedFixedExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <Clock className="mx-auto h-10 w-10 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600">등록된 고정지출 내역이 없습니다.</p>
            <p className="text-xs text-slate-400">월세, 관리비, 통신비, 보험료 등 매월 정기적으로 나가는 지출을 등록해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">결제 희망일</th>
                  <th className="px-4 py-3">고정 지출 항목명</th>
                  <th className="px-4 py-3">카테고리</th>
                  <th className="px-4 py-3">결제/이체 수단</th>
                  <th className="px-4 py-3 text-right">월 결제 금액</th>
                  <th className="px-4 py-3 text-center">당월 장부 기록</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFixedExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-indigo-600">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs border border-indigo-100">
                        매월 {item.dayOfMonth}일
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div>{item.name}</div>
                      {item.memo && <div className="text-xs text-slate-400 font-normal">{item.memo}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                      {item.categoryName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                      {item.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-rose-600 text-sm">
                      -{item.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleLogToLedger(item)}
                        className="inline-flex items-center space-x-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>장부 결제 기록</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`'${item.name}' 항목을 삭제하시겠습니까?`)) {
                              deleteFixedExpense(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingItem ? '고정지출 수정' : '새 고정지출 등록'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">고정 지출 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 월세, 아파트 관리비, 인터넷 통신비, 실손보험"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">월 결제 금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 500000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">매월 결제 희망일 (1~31일)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    placeholder="10"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">결제/이체 수단</label>
                  <input
                    type="text"
                    placeholder="예: 신한 자동이체, 롯데카드"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 매월 10일 자동이체 예정"
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

import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Tags, Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, Lock, Eye, EyeOff, ShieldCheck, Unlock } from 'lucide-react';
import type { Category, TransactionType } from '../../types/financial';

const PALETTE_COLORS = [
  '#f97316', '#f59e0b', '#ec4899', '#eab308', '#3b82f6', '#6366f1',
  '#ef4444', '#a855f7', '#10b981', '#06b6d4', '#8b5cf6', '#64748b'
];

interface CategoryManagerViewProps {
  isUnlocked?: boolean;
  onUnlock?: () => void;
}

export const CategoryManagerView: React.FC<CategoryManagerViewProps> = ({ isUnlocked = false, onUnlock }) => {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useFinancial();

  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#3b82f6');
  const [monthlyBudget, setMonthlyBudget] = useState('');

  // Lock Screen Inline Password State
  const [inputPw, setInputPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [lockError, setLockError] = useState('');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPw === '661227') {
      if (onUnlock) onUnlock();
    } else {
      setLockError('⚠️ 관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setColor(PALETTE_COLORS[0]);
    setMonthlyBudget('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setMonthlyBudget(cat.monthlyBudget ? cat.monthlyBudget.toString() : '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = monthlyBudget ? parseFloat(monthlyBudget) : undefined;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        type,
        color,
        monthlyBudget: budgetVal,
      });
    } else {
      addCategory({
        name,
        type,
        icon: 'Tag',
        color,
        monthlyBudget: budgetVal,
      });
    }
    setIsModalOpen(false);
  };

  // If locked, render the Admin Lock Screen
  if (!isUnlocked) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4 space-y-6">
        <div className="rounded-3xl bg-slate-900 p-8 border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-950/80 text-amber-400 border border-amber-800/60 shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">🔒 템플릿 관리자 잠금</h2>
            <p className="text-xs text-slate-400 mt-1">
              템플릿 관리(카테고리 설정) 메뉴는 관리자 권한이 필요합니다.
            </p>
          </div>

          {lockError && (
            <div className="rounded-2xl bg-rose-950/80 p-3 border border-rose-800 text-xs font-semibold text-rose-300">
              {lockError}
            </div>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">관리자 비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="비밀번호 6자리 입력"
                  value={inputPw}
                  onChange={(e) => setInputPw(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-4 pr-11 py-3 text-sm font-bold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>관리자 권한 잠금 해제</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabCategories = categories.filter(c => c.type === activeTab);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Description */}
      <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">템플릿 & 카테고리 관리</h1>
                <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-800">
                  <Unlock className="h-3 w-3" />
                  <span>관리자 인증됨</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">수입, 지출, 투자 템플릿 카테고리 및 예산 한도 커스텀</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>새 템플릿 카테고리 추가</span>
          </button>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>지출 템플릿 ({categories.filter(c => c.type === 'expense').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>수입 템플릿 ({categories.filter(c => c.type === 'income').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('investment')}
            className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'investment'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>투자 템플릿 ({categories.filter(c => c.type === 'investment').length})</span>
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tabCategories.map((cat) => {
          const usageCount = transactions.filter(t => t.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="rounded-3xl bg-slate-900 p-5 border border-slate-800/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    ●
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-base">{cat.name}</h3>
                    <span className="text-xs text-slate-400">등록 거래건수: {usageCount}건</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {!cat.isDefault ? (
                    <button
                      onClick={() => {
                        if (confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="p-1.5 text-slate-600" title="기본 제공 카테고리">
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>

              {cat.type === 'expense' && (
                <div className="rounded-2xl bg-slate-950 p-3 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>월 목표 예산 한도</span>
                    <strong className="text-slate-100">
                      {cat.monthlyBudget ? `${cat.monthlyBudget.toLocaleString()}원` : '설정 없음'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingCategory ? '템플릿 카테고리 수정' : '새 템플릿 카테고리 생성'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">카테고리 구분</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="expense">지출</option>
                  <option value="income">수입</option>
                  <option value="investment">투자</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">카테고리 이름</label>
                <input
                  type="text"
                  required
                  placeholder="예: 배달식비, 구독서비스, 주식적립"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">테마 색상 선택</label>
                <div className="grid grid-cols-6 gap-2">
                  {PALETTE_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-8 w-full rounded-xl transition-all ${
                        color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">월 권장 예산 한도 (선택, 원)</label>
                  <input
                    type="number"
                    placeholder="예: 300000"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

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

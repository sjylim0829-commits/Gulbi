import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import type { InvestmentItem } from '../../types/financial';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  CheckCircle2,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  ArrowUpDown,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { COMMON_FINANCIAL_INSTITUTIONS } from '../Dashboard/DashboardView';

export const InvestmentsView: React.FC = () => {
  const {
    investmentItems,
    addInvestmentItem,
    updateInvestmentItem,
    deleteInvestmentItem,
    logInvestmentToLedger,
    totalInvestmentPrincipal,
    totalInvestmentCurrentValue,
    totalInvestmentReturn,
    totalInvestmentReturnPct,
    categories,
  } = useFinancial();

  // Investment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvestmentItem | null>(null);

  // Sorting State
  const [invSortBy, setInvSortBy] = useState<
    'value_desc' | 'value_asc' | 'return_desc' | 'return_asc' | 'principal_desc' | 'name_asc' | 'category'
  >('value_desc');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [institution, setInstitution] = useState('');
  const [quantity, setQuantity] = useState('');
  const [memo, setMemo] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const investmentCategories = categories.filter(c => c.type === 'investment');

  // Sorted Investment Items
  const sortedInvestmentItems = useMemo(() => {
    return [...investmentItems].sort((a, b) => {
      if (invSortBy === 'value_desc') return b.currentValue - a.currentValue;
      if (invSortBy === 'value_asc') return a.currentValue - b.currentValue;
      if (invSortBy === 'principal_desc') return b.principalAmount - a.principalAmount;
      if (invSortBy === 'name_asc') return a.name.localeCompare(b.name, 'ko-KR');
      if (invSortBy === 'category') return a.categoryName.localeCompare(b.categoryName, 'ko-KR');

      const retA = a.principalAmount > 0 ? (a.currentValue - a.principalAmount) / a.principalAmount : 0;
      const retB = b.principalAmount > 0 ? (b.currentValue - b.principalAmount) / b.principalAmount : 0;

      if (invSortBy === 'return_desc') return retB - retA;
      if (invSortBy === 'return_asc') return retA - retB;
      return 0;
    });
  }, [investmentItems, invSortBy]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    const firstCat = investmentCategories[0];
    setCategoryId(firstCat ? firstCat.id : '');
    setPrincipalAmount('');
    setCurrentValue('');
    setInstitution('');
    setQuantity('');
    setMemo('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: InvestmentItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setPrincipalAmount(item.principalAmount.toString());
    setCurrentValue(item.currentValue.toString());
    setInstitution(item.institution || '');
    setQuantity(item.quantity ? item.quantity.toString() : '');
    setMemo(item.memo || '');
    setIsModalOpen(true);
  };

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrincipal = parseFloat(principalAmount) || 0;
    const numValue = parseFloat(currentValue) || 0;
    const numQuantity = parseFloat(quantity) || undefined;
    const catObj = categories.find(c => c.id === categoryId);

    if (editingItem) {
      updateInvestmentItem(editingItem.id, {
        name,
        categoryId,
        categoryName: catObj ? catObj.name : '투자',
        principalAmount: numPrincipal,
        currentValue: numValue,
        institution,
        quantity: numQuantity,
        memo,
      });
    } else {
      addInvestmentItem({
        name,
        categoryId,
        categoryName: catObj ? catObj.name : '투자',
        principalAmount: numPrincipal,
        currentValue: numValue,
        institution,
        quantity: numQuantity,
        memo,
      });
    }
    setIsModalOpen(false);
  };

  const handleLogToLedger = (item: InvestmentItem) => {
    logInvestmentToLedger(item.id);
    setToastMsg(`🎉 '${item.name}' (${item.principalAmount.toLocaleString()}원) 투자 자금이 가계부 장부에 기재되었습니다!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Recharts Data Prep: Allocation by Category
  const pieDataMap: Record<string, { name: string; value: number; color: string }> = {};

  investmentItems.forEach((item) => {
    const catObj = categories.find(c => c.id === item.categoryId);
    const catName = item.categoryName || '기타';
    const catColor = catObj ? catObj.color : '#8b5cf6';

    if (!pieDataMap[catName]) {
      pieDataMap[catName] = { name: catName, value: 0, color: catColor };
    }
    pieDataMap[catName].value += item.currentValue;
  });

  const pieData = Object.values(pieDataMap).filter(d => d.value > 0);

  const barData = [
    { name: '총 투자 원금', amount: totalInvestmentPrincipal, fill: '#6366f1' },
    { name: '현재 평가금액', amount: totalInvestmentCurrentValue, fill: totalInvestmentReturn >= 0 ? '#10b981' : '#f43f5e' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-200 backdrop-blur-md">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>투자 자산 포트폴리오</span>
              </span>
              <span className="text-xs text-purple-200">실시간 평가손익 추적</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {totalInvestmentCurrentValue.toLocaleString('ko-KR')} <span className="text-xl font-normal text-purple-200">원</span>
              </h1>
              {totalInvestmentPrincipal > 0 && (
                <div
                  className={`inline-flex items-center space-x-1 rounded-xl px-3 py-1 text-sm font-extrabold border ${
                    totalInvestmentReturn >= 0
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  }`}
                >
                  {totalInvestmentReturn >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>
                    {totalInvestmentReturn >= 0 ? `+${totalInvestmentReturn.toLocaleString()}` : totalInvestmentReturn.toLocaleString()}원 (
                    {totalInvestmentReturnPct >= 0 ? `+${totalInvestmentReturnPct.toFixed(2)}` : totalInvestmentReturnPct.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-purple-200">
              총 투자 원금 <strong className="text-white">{totalInvestmentPrincipal.toLocaleString()}원</strong> 대비 평가 손익을 실시간 계산합니다.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/30 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>새 투자 종목 추가</span>
          </button>
        </div>

        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      {/* Analytics & Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Pie Chart: Investment Allocation by Category */}
        <div className="lg:col-span-7 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">투자 카테고리별 비중</h2>
              <p className="text-xs text-slate-500">주식, 펀드, 코인, 예적금 등 투자 분포</p>
            </div>
            <PieIcon className="h-5 w-5 text-purple-500" />
          </div>

          <div className="h-64 w-full my-2">
            {pieData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 text-xs">
                <LineChart className="h-8 w-8 text-slate-300 mb-2" />
                <span>등록된 투자 종목이 없습니다. [새 투자 종목 추가]를 눌러보세요!</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '평가금액']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend Grid */}
          {pieData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-slate-100">
              {pieData.map((item, idx) => {
                const pct = totalInvestmentCurrentValue > 0 ? ((item.value / totalInvestmentCurrentValue) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="flex items-center space-x-2 text-xs">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                    <span className="text-slate-400 text-[11px] ml-auto font-bold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bar Chart: Investment Principal vs Valuation */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">원금 대비 평가금액 비교</h2>
            <p className="text-xs text-slate-500">총 투자금 vs 현재 자산 가치</p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 10000}만`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '금액']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl bg-purple-50 p-3.5 border border-purple-100 flex items-center justify-between text-xs">
            <span className="text-purple-900 font-medium">💡 총 투자 수익률</span>
            <span className={`font-extrabold ${totalInvestmentReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalInvestmentReturn >= 0 ? `+${totalInvestmentReturnPct.toFixed(2)}` : totalInvestmentReturnPct.toFixed(2)}%
            </span>
          </div>
        </div>

      </div>

      {/* Itemized Investment Table Section */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">상세 투자 종목 관리</h2>
            <p className="text-xs text-slate-500">카테고리별 개별 주식, 코인, 펀드 현황 관리</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sorting Dropdown Control */}
            <div className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3 py-1.5 border border-slate-200 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="text-slate-500 font-medium hidden sm:inline">정렬:</span>
              <select
                value={invSortBy}
                onChange={(e) => setInvSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="value_desc">평가금액 높은순 🔻</option>
                <option value="value_asc">평가금액 낮은순 🔺</option>
                <option value="return_desc">수익률 높은순 (%🔻)</option>
                <option value="return_asc">수익률 낮은순 (%🔺)</option>
                <option value="principal_desc">투자 원금 높은순</option>
                <option value="name_asc">종목명 오름차순 (가-나-다)</option>
                <option value="category">카테고리별 정렬</option>
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md shadow-purple-600/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>새 투자 종목 추가</span>
            </button>
          </div>
        </div>

        {sortedInvestmentItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <TrendingUp className="mx-auto h-10 w-10 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600 text-sm">등록된 투자 종목이 없습니다.</p>
            <p className="text-xs text-slate-400">주식, 코인, ETF, 펀드 등 보유 중인 투자 자산을 추가해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">종목/투자명</th>
                  <th className="px-4 py-3">카테고리</th>
                  <th className="px-4 py-3">증권사/거래소</th>
                  <th className="px-4 py-3 text-right">투자 원금</th>
                  <th className="px-4 py-3 text-right">현재 평가금액</th>
                  <th className="px-4 py-3 text-right">평가손익 (수익률)</th>
                  <th className="px-4 py-3 text-center">가계부 기록</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedInvestmentItems.map((item) => {
                  const retVal = item.currentValue - item.principalAmount;
                  const retPct = item.principalAmount > 0 ? (retVal / item.principalAmount) * 100 : 0;
                  const catObj = categories.find(c => c.id === item.categoryId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div>{item.name}</div>
                        {item.quantity && <div className="text-xs text-slate-400 font-normal">수량: {item.quantity.toLocaleString()}</div>}
                        {item.memo && <div className="text-xs text-slate-400 font-normal">{item.memo}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span
                          className="inline-flex items-center space-x-1 font-bold"
                          style={{ color: catObj ? catObj.color : '#8b5cf6' }}
                        >
                          <span>●</span>
                          <span>{item.categoryName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                        {item.institution ? (
                          <span className="inline-flex items-center space-x-1">
                            <Landmark className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.institution}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-700 text-sm">
                        {item.principalAmount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 text-sm">
                        {item.currentValue.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-xs">
                        <span className={retVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {retVal >= 0 ? `+${retVal.toLocaleString()}` : retVal.toLocaleString()}원
                        </span>
                        <div className={`text-[11px] font-bold ${retVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ({retPct >= 0 ? `+${retPct.toFixed(2)}` : retPct.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleLogToLedger(item)}
                          className="inline-flex items-center space-x-1 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>가계부 기록</span>
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
                              if (confirm(`'${item.name}' 투자 종목을 삭제하시겠습니까?`)) {
                                deleteInvestmentItem(item.id);
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

      {/* Investment Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingItem ? '투자 종목 수정' : '새 투자 종목 추가'}
            </h3>

            <form onSubmit={handleSaveInvestment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">투자 종목/항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 삼성전자 주식, S&P 500 ETF, 비트코인"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">투자 카테고리</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                  >
                    {investmentCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">증권사/거래소 (선택)</label>
                  <div className="space-y-1.5">
                    <select
                      value={COMMON_FINANCIAL_INSTITUTIONS.includes(institution) ? institution : institution ? 'CUSTOM' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setInstitution('');
                        } else {
                          setInstitution(val);
                        }
                      }}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                    >
                      <option value="">🏛️ 증권사/거래소 선택</option>
                      {COMMON_FINANCIAL_INSTITUTIONS.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                      <option value="CUSTOM">✏️ 직접 입력하기</option>
                    </select>

                    <input
                      type="text"
                      placeholder="증권사 수기 입력 (예: 키움증권, 업비트)"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">투자 원금 (매수금액)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 3000000"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">현재 평가금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 3500000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">보유 수량 (선택)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="예: 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 장기 적립식 매수"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
                  />
                </div>
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
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 shadow-md shadow-purple-600/20"
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

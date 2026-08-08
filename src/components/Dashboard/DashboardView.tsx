import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight, Plus, Edit2, Trash2, Landmark, Coins, Building, Banknote, DollarSign, FolderPlus } from 'lucide-react';
import type { AssetItem, AssetCategoryType } from '../../types/financial';

const ASSET_CATEGORY_NAMES: Record<AssetCategoryType, { name: string; color: string; icon: any }> = {
  bank: { name: '예적금/은행', color: '#10b981', icon: Landmark },
  stock: { name: '주식/펀드', color: '#8b5cf6', icon: TrendingUp },
  crypto: { name: '가상자산', color: '#f59e0b', icon: Coins },
  real_estate: { name: '부동산/보증금', color: '#0284c7', icon: Building },
  cash: { name: '현금', color: '#06b6d4', icon: Banknote },
  liability: { name: '대출/부채', color: '#ef4444', icon: ShieldAlert },
  other: { name: '기타자산', color: '#64748b', icon: DollarSign },
};

export const DashboardView: React.FC = () => {
  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    currentMonthIncome,
    expectedMonthlyIncome,
    currentMonthExpense,
    currentMonthInvestment,
    assets,
    transactions,
    addAsset,
    updateAsset,
    deleteAsset,
  } = useFinancial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategoryType>('bank');
  const [amount, setAmount] = useState('');
  const [institution, setInstitution] = useState('');
  const [note, setNote] = useState('');

  const openAddModal = () => {
    setEditingAsset(null);
    setName('');
    setCategory('bank');
    setAmount('');
    setInstitution('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (asset: AssetItem) => {
    setEditingAsset(asset);
    setName(asset.name);
    setCategory(asset.category);
    setAmount(Math.abs(asset.amount).toString());
    setInstitution(asset.institution || '');
    setNote(asset.note || '');
    setIsModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    const finalAmount = category === 'liability' ? -Math.abs(numAmount) : Math.abs(numAmount);

    if (editingAsset) {
      updateAsset(editingAsset.id, {
        name,
        category,
        amount: finalAmount,
        institution,
        note,
      });
    } else {
      addAsset({
        name,
        category,
        amount: finalAmount,
        institution,
        note,
      });
    }
    setIsModalOpen(false);
  };

  // Prepare Pie Chart Data
  const pieData = Object.keys(ASSET_CATEGORY_NAMES).map((catKey) => {
    const key = catKey as AssetCategoryType;
    const categoryAssets = assets.filter(a => a.category === key);
    const sum = categoryAssets.reduce((acc, a) => acc + Math.abs(a.amount), 0);
    return {
      name: ASSET_CATEGORY_NAMES[key].name,
      value: sum,
      color: ASSET_CATEGORY_NAMES[key].color,
    };
  }).filter(d => d.value > 0);

  // Cashflow Bar Chart Data
  const cashflowData = [
    { name: '이번달 수입', amount: currentMonthIncome, fill: '#10b981' },
    { name: '이번달 지출', amount: currentMonthExpense, fill: '#f43f5e' },
    { name: '이번달 투자', amount: currentMonthInvestment, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Net Worth Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-sky-600 p-6 text-white shadow-xl shadow-indigo-600/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">총 순자산 (Net Worth)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {netWorth.toLocaleString('ko-KR')} <span className="text-base font-normal text-indigo-100">원</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-indigo-100 font-medium">
              <span>보유 자산 - 총 부채 통합액</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        </div>

        {/* Total Assets Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">총 보유 자산</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalAssets.toLocaleString('ko-KR')} <span className="text-sm font-normal text-slate-500">원</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">예적금, 주식, 부동산 등 {assets.filter(a => a.amount > 0).length}개 항목</p>
          </div>
        </div>

        {/* Total Liabilities Card */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">총 부채/대출</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalLiabilities.toLocaleString('ko-KR')} <span className="text-sm font-normal text-slate-500">원</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">마이너스 통장 및 대출 {assets.filter(a => a.amount < 0).length}개 항목</p>
          </div>
        </div>

        {/* Monthly Net Saving Flow */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">8월 순저축 (수입 - 지출)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {(() => {
              const saving = currentMonthIncome - currentMonthExpense;
              const formatted = saving > 0 ? `+${saving.toLocaleString('ko-KR')}` : saving.toLocaleString('ko-KR');
              const textColor = saving >= 0 ? 'text-emerald-600' : 'text-rose-600';
              return (
                <div className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
                  {formatted} <span className="text-sm font-normal text-slate-500">원</span>
                </div>
              );
            })()}
            <p className="mt-2 text-xs text-slate-500">수입 {currentMonthIncome.toLocaleString()}원 / 지출 {currentMonthExpense.toLocaleString()}원</p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Pie Chart: Asset Breakdown */}
        <div className="lg:col-span-7 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">자산 포트폴리오 비중</h2>
              <p className="text-xs text-slate-500">카테고리별 자산 분산 현황</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-12 space-y-2">
                <FolderPlus className="mx-auto h-8 w-8 text-slate-300" />
                <p>등록된 자산이 없습니다. 하단의 [새 자산/대출 추가] 버튼으로 계좌를 입력해 보세요.</p>
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
                    formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '금액']}
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
                const totalSum = totalAssets + totalLiabilities;
                const pct = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : '0';
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

        {/* Bar Chart: Monthly Flow */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs glass-panel flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">8월 현금 흐름 요약</h2>
            <p className="text-xs text-slate-500">수입 vs 지출 vs 투자금 비교</p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 10000}만`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '금액']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {cashflowData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">💵 매월 예상 수입 설정</span>
              <span className="font-extrabold text-slate-900">
                {expectedMonthlyIncome > 0 ? `${expectedMonthlyIncome.toLocaleString()}원` : '미설정'}
              </span>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 border border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-indigo-800 font-medium">💡 이번 달 투자 비중</span>
              <span className="font-extrabold text-indigo-900">
                {currentMonthIncome > 0 ? ((currentMonthInvestment / currentMonthIncome) * 100).toFixed(1) : 0}% (수입 대비)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Asset Items Table & Management Section */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs glass-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">자산 & 부채 세부 목록</h2>
            <p className="text-xs text-slate-500">보유 계좌, 예적금, 주식, 대출 항목 관리</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>새 자산/대출 추가</span>
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <FolderPlus className="mx-auto h-10 w-10 text-slate-300 mb-1" />
            <p className="font-semibold text-slate-600">등록된 자산이 없습니다.</p>
            <p className="text-xs text-slate-400">위의 [+ 새 자산/대출 추가] 버튼을 눌러 통장이나 보유 자산을 등록해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">자산명</th>
                  <th className="px-4 py-3">구분</th>
                  <th className="px-4 py-3">금융기관</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((ast) => {
                  const catMeta = ASSET_CATEGORY_NAMES[ast.category];
                  const IconComponent = catMeta.icon;
                  const isLiability = ast.amount < 0;

                  return (
                    <tr key={ast.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                            style={{ backgroundColor: `${catMeta.color}15`, color: catMeta.color }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div>{ast.name}</div>
                            {ast.note && <div className="text-xs text-slate-400 font-normal">{ast.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold"
                          style={{ backgroundColor: `${catMeta.color}15`, color: catMeta.color }}
                        >
                          {catMeta.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{ast.institution || '-'}</td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                        <span className={isLiability ? 'text-rose-600' : 'text-emerald-600'}>
                          {isLiability ? '' : '+'}{ast.amount.toLocaleString()}원
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(ast)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${ast.name}' 자산을 삭제하시겠습니까?`)) {
                                deleteAsset(ast.id);
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

      {/* Recent Transactions Quick Snapshot */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs glass-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">최근 거래 내역</h2>
          <span className="text-xs text-slate-500">가계부 장부 메뉴에서 등록 가능</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            등록된 수입/지출 내역이 없습니다. [가계부 장부] 메뉴에서 거래를 입력해 보세요.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200/60 hover:bg-slate-100 transition-all">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                      t.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700'
                        : t.type === 'investment'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {t.type === 'income' ? '수입' : t.type === 'investment' ? '투자' : '지출'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.merchant}</div>
                    <div className="text-xs text-slate-500">
                      {t.date} | {t.categoryName} {t.paymentMethod && `(${t.paymentMethod})`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-sm ${
                      t.type === 'income'
                        ? 'text-emerald-600'
                        : t.type === 'investment'
                        ? 'text-purple-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : t.type === 'investment' ? '➔ ' : '-'}{t.amount.toLocaleString()}원
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingAsset ? '자산/대출 정보 수정' : '새 자산/대출 추가'}
            </h3>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">자산/대출 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 신한 주거래 통장, 삼성전자 주식"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategoryType)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  >
                    <option value="bank">예적금/은행</option>
                    <option value="stock">주식/펀드</option>
                    <option value="crypto">가상자산(코인)</option>
                    <option value="real_estate">부동산/보증금</option>
                    <option value="cash">현금</option>
                    <option value="liability">대출/부채(-)</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="예: 5000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">금융기관/기관명 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 신한은행, 키움증권, 업비트"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 금리 4.5%, 만기 2027년"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
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

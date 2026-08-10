import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import type { AssetItem, AssetCategoryType } from '../../types/financial';
import {
  Wallet,
  Building2,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  HelpCircle,
  Landmark,
  ArrowUpDown,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const COMMON_FINANCIAL_INSTITUTIONS = [
  'KB국민은행',
  '신한은행',
  '하나은행',
  '우리은행',
  'NH농협은행',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  'IBK기업은행',
  'SC제일은행',
  '한국씨티은행',
  '새마을금고',
  '신협',
  '우체국',
  'DGB대구은행(iM뱅크)',
  'BNK부산은행',
  'BNK경남은행',
  '광주은행',
  '전북은행',
  '미래에셋증권',
  '한국투자증권',
  'NH투자증권',
  '삼성증권',
  'KB증권',
  '신한투자증권',
  '키움증권',
  '토스증권',
  '하나증권',
  '현대카드',
  '신한카드',
  'KB국민카드',
  '삼성카드',
  '롯데카드',
  '업비트(Upbit)',
  '빗썸(Bithumb)',
  '코인원(Coinone)',
];

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
    addAsset,
    updateAsset,
    deleteAsset,
  } = useFinancial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // Sorting State
  const [assetSortBy, setAssetSortBy] = useState<'amount_desc' | 'amount_asc' | 'name_asc' | 'category' | 'date_desc'>('amount_desc');

  // Modal Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategoryType>('bank');
  const [amount, setAmount] = useState('');
  const [institution, setInstitution] = useState('');
  const [note, setNote] = useState('');

  // Sorted Assets List
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      if (assetSortBy === 'amount_desc') return b.amount - a.amount;
      if (assetSortBy === 'amount_asc') return a.amount - b.amount;
      if (assetSortBy === 'name_asc') return a.name.localeCompare(b.name, 'ko-KR');
      if (assetSortBy === 'category') return a.category.localeCompare(b.category);
      if (assetSortBy === 'date_desc') return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      return 0;
    });
  }, [assets, assetSortBy]);

  const openAddModal = () => {
    setEditingAsset(null);
    setName('');
    setCategory('bank');
    setAmount('');
    setInstitution('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (ast: AssetItem) => {
    setEditingAsset(ast);
    setName(ast.name);
    setCategory(ast.category);
    setAmount(Math.abs(ast.amount).toString());
    setInstitution(ast.institution || '');
    setNote(ast.note || '');
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

  // Recharts Data Prep: Pie Chart Asset Breakdown
  const categoryLabels: Record<AssetCategoryType, { label: string; color: string }> = {
    cash: { label: '현금', color: '#10b981' },
    bank: { label: '예적금/은행', color: '#3b82f6' },
    stock: { label: '주식/펀드', color: '#8b5cf6' },
    crypto: { label: '가상자산', color: '#f59e0b' },
    real_estate: { label: '부동산/보증금', color: '#06b6d4' },
    liability: { label: '대출/부채', color: '#f43f5e' },
    other: { label: '기타 자산', color: '#64748b' },
  };

  const pieDataRaw: Record<AssetCategoryType, number> = {
    cash: 0,
    bank: 0,
    stock: 0,
    crypto: 0,
    real_estate: 0,
    liability: 0,
    other: 0,
  };

  assets.forEach((ast) => {
    pieDataRaw[ast.category] += Math.abs(ast.amount);
  });

  const pieData = Object.entries(pieDataRaw)
    .filter(([_, val]) => val > 0)
    .map(([cat, val]) => ({
      name: categoryLabels[cat as AssetCategoryType].label,
      value: val,
      color: categoryLabels[cat as AssetCategoryType].color,
    }));

  const cashflowData = [
    { name: '수입', amount: currentMonthIncome, fill: '#10b981' },
    { name: '지출', amount: currentMonthExpense, fill: '#f43f5e' },
    { name: '투자금', amount: currentMonthInvestment, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Net Worth Hero Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
                <Building2 className="h-3.5 w-3.5" />
                <span>총 순자산 현황</span>
              </span>
              <span className="text-xs text-slate-400">실시간 데이터 자동 집계</span>
            </div>
            <div className="flex items-baseline space-x-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {netWorth.toLocaleString('ko-KR')} <span className="text-xl font-medium text-slate-300">원</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              총 보유자산 <strong className="text-emerald-400">{totalAssets.toLocaleString('ko-KR')}원</strong>에서 대출/부채 <strong className="text-rose-400">{totalLiabilities.toLocaleString('ko-KR')}원</strong>을 제외한 순수 자산입니다.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>새 자산/대출 추가</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Total Assets Card */}
        <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">총 보유 자산</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {totalAssets.toLocaleString('ko-KR')} <span className="text-sm font-normal text-slate-400">원</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">예적금, 주식, 부동산 등 {assets.filter(a => a.amount > 0).length}개 항목</p>
          </div>
        </div>

        {/* Total Liabilities Card */}
        <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">총 부채/대출</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {totalLiabilities.toLocaleString('ko-KR')} <span className="text-sm font-normal text-slate-400">원</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">마이너스 통장 및 대출 {assets.filter(a => a.amount < 0).length}개 항목</p>
          </div>
        </div>

        {/* Monthly Net Saving Flow */}
        <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">8월 순저축 (수입 - 지출)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {(() => {
              const saving = currentMonthIncome - currentMonthExpense;
              const formatted = saving > 0 ? `+${saving.toLocaleString('ko-KR')}` : saving.toLocaleString('ko-KR');
              const textColor = saving >= 0 ? 'text-emerald-400' : 'text-rose-400';
              return (
                <div className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
                  {formatted} <span className="text-sm font-normal text-slate-400">원</span>
                </div>
              );
            })()}
            <p className="mt-2 text-xs text-slate-400">
              이번 달 수입 (+{currentMonthIncome.toLocaleString()}원) - 지출 (-{currentMonthExpense.toLocaleString()}원)
            </p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Donut Chart: Asset Allocation */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">카테고리별 자산 포트폴리오</h2>
              <p className="text-xs text-slate-400">자산 유형별 비중 분포</p>
            </div>
            <PieIcon className="h-5 w-5 text-indigo-400" />
          </div>

          <div className="h-64 w-full my-2">
            {pieData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs">
                <HelpCircle className="h-8 w-8 text-slate-600 mb-2" />
                <span>등록된 자산이 없습니다. [새 자산/대출 추가]를 눌러보세요!</span>
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
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend Grid */}
          {pieData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-slate-800">
              {pieData.map((item, idx) => {
                const totalSum = totalAssets + totalLiabilities;
                const pct = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="flex items-center space-x-2 text-xs">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-300 font-medium truncate">{item.name}</span>
                    <span className="text-slate-500 text-[11px] ml-auto font-bold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bar Chart: Monthly Flow */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white">8월 현금 흐름 요약</h2>
            <p className="text-xs text-slate-400">수입 vs 지출 vs 투자금 비교</p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 10000}만`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '금액']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
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
            <div className="rounded-2xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">💵 매월 예상 수입 설정</span>
              <span className="font-extrabold text-white">
                {expectedMonthlyIncome > 0 ? `${expectedMonthlyIncome.toLocaleString()}원` : '미설정'}
              </span>
            </div>
            <div className="rounded-2xl bg-indigo-950/60 p-3 border border-indigo-800/60 flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-medium">💡 이번 달 투자 비중</span>
              <span className="font-extrabold text-indigo-200">
                {currentMonthIncome > 0 ? ((currentMonthInvestment / currentMonthIncome) * 100).toFixed(1) : 0}% (수입 대비)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Asset Items Table & Management Section */}
      <div className="rounded-3xl bg-slate-900 p-6 border border-slate-800/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">상세 자산 & 대출 목록</h2>
            <p className="text-xs text-slate-400">등록된 개별 자산 및 대출 관리</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sorting Dropdown Control */}
            <div className="flex items-center space-x-1.5 rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 font-medium hidden sm:inline">정렬:</span>
              <select
                value={assetSortBy}
                onChange={(e) => setAssetSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="amount_desc" className="bg-slate-900 text-white">금액 높은순 🔻</option>
                <option value="amount_asc" className="bg-slate-900 text-white">금액 낮은순 🔺</option>
                <option value="name_asc" className="bg-slate-900 text-white">자산명 오름차순 (가-나-다)</option>
                <option value="category" className="bg-slate-900 text-white">카테고리별 정렬</option>
                <option value="date_desc" className="bg-slate-900 text-white">최근 수정순</option>
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>추가</span>
            </button>
          </div>
        </div>

        {sortedAssets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <Wallet className="mx-auto h-10 w-10 text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300 text-sm">등록된 자산이 없습니다.</p>
            <p className="text-xs text-slate-500">상단의 [새 자산/대출 추가] 버튼을 눌러 예적금, 대출, 주식을 등록해 보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">자산/대출명</th>
                  <th className="px-4 py-3">구분</th>
                  <th className="px-4 py-3">금융기관</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sortedAssets.map((asset) => {
                  const isLiability = asset.amount < 0;
                  const catConfig = categoryLabels[asset.category];

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <span>{asset.name}</span>
                          {asset.isLinkedFromInvestment && (
                            <span className="inline-flex items-center space-x-1 rounded-lg bg-purple-950 border border-purple-800 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                              <TrendingUp className="h-3 w-3 text-purple-400" />
                              <span>투자 탭 연동</span>
                            </span>
                          )}
                        </div>
                        {asset.note && <div className="text-xs text-slate-400 font-normal mt-0.5">{asset.note}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span
                          className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${catConfig.color}25`, color: catConfig.color }}
                        >
                          <span>●</span>
                          <span>{catConfig.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                        {asset.institution ? (
                          <span className="inline-flex items-center space-x-1">
                            <Landmark className="h-3.5 w-3.5 text-slate-500" />
                            <span>{asset.institution}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className={`px-4 py-3.5 text-right font-extrabold text-sm ${isLiability ? 'text-rose-400' : 'text-white'}`}>
                        {isLiability ? `-${Math.abs(asset.amount).toLocaleString()}원` : `+${asset.amount.toLocaleString()}원`}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(asset)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${asset.name}' 자산 항목을 삭제하시겠습니까?`)) {
                                deleteAsset(asset.id);
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

      {/* Asset Edit/Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingAsset ? '자산/대출 정보 수정' : '새 자산 또는 대출 등록'}
            </h3>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">카테고리 구분</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssetCategoryType)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="bank">예적금 / 정기예금 / 은행</option>
                  <option value="stock">주식 / 펀드 / ETF</option>
                  <option value="crypto">가상자산 / 코인</option>
                  <option value="real_estate">부동산 / 주택 보증금</option>
                  <option value="cash">현금 / 지갑</option>
                  <option value="liability">대출 / 마이너스 통장 (부채)</option>
                  <option value="other">기타 자산</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">자산 또는 대출 항목명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 국민 청약통장, 아파트 전세보증금, 마이너스 통장"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">금융기관 / 거래소 선택 및 수기 입력</label>
                <div className="space-y-2">
                  <select
                    value={COMMON_FINANCIAL_INSTITUTIONS.includes(institution) ? institution : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setInstitution(e.target.value);
                      } else {
                        setInstitution('');
                      }
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- 금융기관/은행 목록 선택 --</option>
                    {COMMON_FINANCIAL_INSTITUTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                    <option value="custom">✏️ 직접 입력 (기타 금융기관)</option>
                  </select>

                  {(!COMMON_FINANCIAL_INSTITUTIONS.includes(institution) || institution === '') && (
                    <input
                      type="text"
                      placeholder="금융기관/증권사/카드사 이름을 직접 입력"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {category === 'liability' ? '대출 / 부채 금액 (원)' : '평가 금액 (원)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder="예: 5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 연 3.8% 금리, 만기 2027년"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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

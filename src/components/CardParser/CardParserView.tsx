import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { CreditCard, FileText, CheckCircle2, AlertCircle, Sparkles, Upload, Trash2, Check, RefreshCw } from 'lucide-react';
import { parseCSVStatement, parseSMSOrNotificationText } from '../../utils/cardParser';
import { INITIAL_SMS_SAMPLES } from '../../utils/mockData';
import type { ParsedCardTransaction } from '../../types/financial';

export const CardParserView: React.FC = () => {
  const { categories, addTransactionsBatch } = useFinancial();

  const [activeMode, setActiveMode] = useState<'text' | 'csv'>('text');
  const [rawInputText, setRawInputText] = useState(INITIAL_SMS_SAMPLES);
  const [parsedItems, setParsedItems] = useState<ParsedCardTransaction[]>(() => {
    return parseSMSOrNotificationText(INITIAL_SMS_SAMPLES, categories);
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleParseText = () => {
    const items = parseSMSOrNotificationText(rawInputText, categories);
    setParsedItems(items);
  };

  const handleLoadSample = () => {
    setRawInputText(INITIAL_SMS_SAMPLES);
    const items = parseSMSOrNotificationText(INITIAL_SMS_SAMPLES, categories);
    setParsedItems(items);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInputText(content);
        const csvParsed = parseCSVStatement(content, categories);
        setParsedItems(csvParsed);
      }
    };
    reader.readAsText(file);
  };

  const toggleSelectItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    setParsedItems(prev => prev.map(item => ({ ...item, selected })));
  };

  const updateItemCategory = (id: string, catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setParsedItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, suggestedCategoryId: cat.id, suggestedCategoryName: cat.name }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setParsedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleRegisterToLedger = () => {
    const selectedItems = parsedItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('장부에 등록할 내역을 선택해 주세요.');
      return;
    }

    const txBatch = selectedItems.map(item => ({
      date: item.date,
      time: item.time,
      type: 'expense' as const,
      categoryId: item.suggestedCategoryId,
      categoryName: item.suggestedCategoryName,
      amount: item.amount,
      merchant: item.merchant,
      paymentMethod: item.paymentMethod,
      memo: `카드 승인문자 자동등록 (${item.merchant})`,
      isAutoParsed: true,
      rawText: item.rawText,
    }));

    addTransactionsBatch(txBatch);

    setSuccessToast(`🎉 ${selectedItems.length}건의 카드 결제 내역이 가계부 장부에 성공적으로 등록되었습니다!`);
    setTimeout(() => setSuccessToast(null), 4000);

    // Remove registered items from queue
    setParsedItems(prev => prev.filter(item => !item.selected));
  };

  const totalSelectedAmount = parsedItems
    .filter(i => i.selected)
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-white font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Description */}
      <div className="rounded-3xl bg-slate-800/70 p-6 border border-slate-700/60 glass-panel space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">신용/체크카드 승인내역 스마트 자동 등록</h1>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                Auto Parser Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              신한, 현대, KB국민, 삼성, 롯데, 하나, 우리, 카카오뱅크 등 카드 승인 문자/앱 알림을 붙여넣으면 가맹점, 금액, 카테고리를 자동 분류합니다.
            </p>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => setActiveMode('text')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeMode === 'text'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>카드 승인 문자/알림 붙여넣기</span>
          </button>

          <button
            onClick={() => setActiveMode('csv')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeMode === 'csv'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>명세서 CSV 파일 업로드</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-3xl bg-slate-800/60 p-6 border border-slate-700/50 glass-panel space-y-4">
        {activeMode === 'text' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                카드 승인 SMS / 카카오톡 알림톡 텍스트 붙여넣기
              </label>
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>샘플 카드 SMS 문자 채우기</span>
              </button>
            </div>

            <textarea
              rows={5}
              placeholder="예: [Web발신] 신한카드 승인 김*진 08/08 14:30 15,000원 (일시불) 스타벅스 강남점..."
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              className="w-full rounded-2xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-xs sm:text-sm text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleParseText}
                className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              >
                <RefreshCw className="h-4 w-4" />
                <span>텍스트 분석 & 내역 추출하기</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              카드사 웹사이트 명세서 CSV / Excel 파일 선택
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 p-8 bg-slate-900/40 hover:bg-slate-900/80 transition-all">
              <Upload className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">CSV 파일을 이곳에 끌어다 놓거나 선택하세요</p>
              <p className="text-xs text-slate-400 mt-1">지원 format: .csv, .txt (일자, 가맹점명, 금액 포함)</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="mt-4 text-xs text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Extracted Transactions Review Table */}
      <div className="rounded-3xl bg-slate-800/60 p-6 border border-slate-700/50 glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">
              분석된 카드 내역 검토 ({parsedItems.length}건)
            </h2>
            <p className="text-xs text-slate-400">카테고리를 확인 및 수정한 후 일괄 등록할 수 있습니다.</p>
          </div>

          {parsedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-300">
                선택한 {parsedItems.filter(i => i.selected).length}건 합계: <strong className="text-emerald-400 text-sm">{totalSelectedAmount.toLocaleString()}원</strong>
              </span>
              <button
                onClick={handleRegisterToLedger}
                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>장부에 일괄 자동 입력</span>
              </button>
            </div>
          )}
        </div>

        {parsedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <span>추출된 카드 결제 내역이 없습니다. 위 박스에 카드 문자를 입력하거나 CSV를 업로드해 보세요.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={parsedItems.every(i => i.selected)}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                    />
                  </th>
                  <th className="px-4 py-3">날짜/시간</th>
                  <th className="px-4 py-3">카드사/수단</th>
                  <th className="px-4 py-3">가맹점명</th>
                  <th className="px-4 py-3">자동 추천 카테고리</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {parsedItems.map((item) => {
                  const expenseCategories = categories.filter(c => c.type === 'expense');

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-700/30 transition-colors ${
                        item.selected ? 'bg-indigo-950/20' : 'opacity-60'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {item.date} <span className="text-slate-500">{item.time}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-200">
                        <span className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{item.merchant}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <select
                            value={item.suggestedCategoryId}
                            onChange={(e) => updateItemCategory(item.id, e.target.value)}
                            className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          >
                            {expenseCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          {item.confidence === 'high' && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              매칭완료
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-400 text-sm">
                        -{item.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

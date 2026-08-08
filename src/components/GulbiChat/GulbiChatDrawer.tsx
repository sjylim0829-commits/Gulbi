import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { X, Send, Bot } from 'lucide-react';
import type { GulbiChatMessage } from '../../types/financial';

interface GulbiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GulbiChatDrawer: React.FC<GulbiChatDrawerProps> = ({ isOpen, onClose }) => {
  const { gulbiAdvice, netWorth, currentMonthIncome, currentMonthExpense, goal } = useFinancial();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<GulbiChatMessage[]>([
    {
      id: 'm-1',
      sender: 'gulbi',
      text: `안녕하세요! 당신의 전담 자산 관리 에이전트 **Gulbi(굴비)** 입니다. 🐟\n\n현재 순자산은 ${(netWorth / 10000).toFixed(0)}만원이며, 8월 증액 목표(+${(goal.targetIncreaseAmount / 10000).toFixed(0)}만원) 달성을 위해 일일 안전 가용 지출액은 ${gulbiAdvice.dailyTargetBudget.toLocaleString()}원 입니다. 무엇이든 물어보세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: GulbiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Generate smart Gulbi AI Response based on query
    setTimeout(() => {
      let replyText = '';
      const q = query.toLowerCase();

      if (q.includes('목표') || q.includes('증액') || q.includes('달성')) {
        const targetVal = goal.targetIncreaseAmount || 0;
        if (targetVal <= 0) {
          replyText = `🎯 상단의 [목표 자산 증액] 메뉴에서 이번 달 목표 증액 금액을 설정해 보세요! 지출 제어 및 저축 플랜을 함께 세워드립니다.`;
        } else {
          const remaining = Math.max(targetVal - (currentMonthIncome - currentMonthExpense), 0);
          if (remaining <= 0) {
            replyText = `🎉 이번 달 자산 증액 목표를 이미 완전 달성했습니다! 잉여 자금은 주식 ETF나 적금에 추가 투자해보세요.`;
          } else {
            replyText = `🎯 8월 증액 목표까지 ${remaining.toLocaleString()}원 남았습니다. 남은 ${gulbiAdvice.currentDaysLeft}일 동안 하루 ${gulbiAdvice.dailyTargetBudget.toLocaleString()}원 이하로 지출하시면 무난히 달성 가능합니다!`;
          }
        }
      } else if (q.includes('지출') || q.includes('소비') || q.includes('돈')) {
        replyText = `📊 8월 누적 지출은 ${currentMonthExpense.toLocaleString()}원 입니다.\n\n지출을 줄이려면 외식이나 불필요한 구독 서비스를 점검해 보세요. 하루 1만원만 절약해도 한 달 30만원이 모입니다!`;
      } else if (q.includes('자산') || q.includes('순자산') || q.includes('현황')) {
        replyText = `💰 현재 총 순자산은 ${netWorth.toLocaleString()}원 입니다.\n\n자산 대시보드에서 계좌나 보유 주식을 등록하면 항목별 비중과 현금 흐름을 자세히 보실 수 있습니다.`;
      } else {
        replyText = `굴비가 분석해보니, 현재 재무 건강 점수는 ${gulbiAdvice.healthScore}점입니다! 목표 자산 증액을 위해 매일 작은 절약 습관을 시작해 보세요. 🐟✨`;
      }

      const gulbiMsg: GulbiChatMessage = {
        id: `glb-${Date.now()}`,
        sender: 'gulbi',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, gulbiMsg]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-slate-900 text-base">Gulbi AI 멘토 1:1 상담소</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500">자산 증액 가이드 & 소비 진단</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Diagnostic Strip */}
        <div className="bg-indigo-50 p-4 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-600">8월 재무 건강도: </span>
            <strong className="text-indigo-900 text-sm">{gulbiAdvice.healthScore}점</strong>
          </div>
          <div className="text-slate-600">
            일일 안전 지출: <strong className="text-amber-600 font-extrabold">{gulbiAdvice.dailyTargetBudget.toLocaleString()}원</strong>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-bl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-1 text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t border-slate-200 bg-white overflow-x-auto flex space-x-2">
          <button
            onClick={() => handleSendMessage('이번 달 목표 달성 가능할까?')}
            className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-indigo-700 font-semibold hover:bg-indigo-600 hover:text-white border border-slate-200 transition-all"
          >
            🎯 목표 달성 가능성?
          </button>
          <button
            onClick={() => handleSendMessage('지출 아끼는 팁 알려줘')}
            className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-rose-700 font-semibold hover:bg-rose-600 hover:text-white border border-slate-200 transition-all"
          >
            📊 지출 절약 팁?
          </button>
          <button
            onClick={() => handleSendMessage('순자산 현황 알려줘')}
            className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-emerald-700 font-semibold hover:bg-emerald-600 hover:text-white border border-slate-200 transition-all"
          >
            💰 전체 순자산 요약
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Gulbi 멘토에게 금융 질의 입력..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 text-slate-950 font-bold hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

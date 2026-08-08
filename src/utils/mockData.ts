import type { AssetItem, Category, MonthlyGoal, Transaction } from '../types/financial';

export const INITIAL_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'inc_salary', name: '급여', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { id: 'inc_bonus', name: '상여/보너스', type: 'income', icon: 'Gift', color: '#059669', isDefault: true },
  { id: 'inc_side', name: '부수입', type: 'income', icon: 'Sparkles', color: '#14b8a6', isDefault: true },
  { id: 'inc_invest', name: '투자수익', type: 'income', icon: 'TrendingUp', color: '#06b6d4', isDefault: true },

  // Expense Categories
  { id: 'exp_food', name: '식비/배달', type: 'expense', icon: 'Utensils', color: '#f97316', monthlyBudget: 0, isDefault: true },
  { id: 'exp_cafe', name: '카페/간식', type: 'expense', icon: 'Coffee', color: '#f59e0b', monthlyBudget: 0, isDefault: true },
  { id: 'exp_shopping', name: '쇼핑/의류', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', monthlyBudget: 0, isDefault: true },
  { id: 'exp_mart', name: '마트/생필품', type: 'expense', icon: 'ShoppingCart', color: '#eab308', monthlyBudget: 0, isDefault: true },
  { id: 'exp_transport', name: '교통/차량', type: 'expense', icon: 'Car', color: '#3b82f6', monthlyBudget: 0, isDefault: true },
  { id: 'exp_utility', name: '주거/통신/세금', type: 'expense', icon: 'Home', color: '#6366f1', monthlyBudget: 0, isDefault: true },
  { id: 'exp_medical', name: '의료/건강', type: 'expense', icon: 'Activity', color: '#ef4444', monthlyBudget: 0, isDefault: true },
  { id: 'exp_culture', name: '문화/여가', type: 'expense', icon: 'Film', color: '#a855f7', monthlyBudget: 0, isDefault: true },
  { id: 'exp_etc', name: '기타지출', type: 'expense', icon: 'MoreHorizontal', color: '#6b7280', monthlyBudget: 0, isDefault: true },

  // Investment Categories
  { id: 'inv_stock', name: '국내/해외주식', type: 'investment', icon: 'LineChart', color: '#8b5cf6', isDefault: true },
  { id: 'inv_fund', name: 'ETF/펀드', type: 'investment', icon: 'PieChart', color: '#0284c7', isDefault: true },
  { id: 'inv_crypto', name: '가상자산(코인)', type: 'investment', icon: 'Coins', color: '#eab308', isDefault: true },
  { id: 'inv_savings', name: '예적금/저축', type: 'investment', icon: 'Vault', color: '#10b981', isDefault: true },
];

// Empty Initial Assets
export const INITIAL_ASSETS: AssetItem[] = [];

// Empty Initial Transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Empty Initial Goal
export const INITIAL_GOAL: MonthlyGoal = {
  yearMonth: '2026-08',
  targetIncreaseAmount: 0,
  startNetWorth: 0,
  note: '',
};

export const INITIAL_SMS_SAMPLES = ``;

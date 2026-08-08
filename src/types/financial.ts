export type TransactionType = 'income' | 'expense' | 'investment';

export type AssetCategoryType = 'cash' | 'bank' | 'stock' | 'crypto' | 'real_estate' | 'liability' | 'other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // Lucide icon name
  color: string;
  monthlyBudget?: number; // Optional monthly limit for expense categories
  isDefault?: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategoryType;
  amount: number; // positive for asset, negative for liabilities
  institution?: string;
  note?: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number; // 1 ~ 31
  categoryId: string;
  categoryName: string;
  paymentMethod: string; // e.g., '신한카드', '자동이체', 'KB국민'
  memo?: string;
  autoLogEnabled?: boolean;
}

export interface ExpectedIncomeItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  memo?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number;
  merchant: string;
  paymentMethod: string; // e.g., '신한카드', '현대카드', 'KB국민카드', '카카오뱅크', '현금'
  memo?: string;
  isAutoParsed?: boolean;
  rawText?: string;
}

export interface MonthlyGoal {
  yearMonth: string; // YYYY-MM
  targetIncreaseAmount: number; // Target net worth increase in KRW
  expectedIncome?: number; // Expected monthly income in KRW
  startNetWorth?: number;
  note?: string;
}

export interface ParsedCardTransaction {
  id: string;
  date: string;
  time: string;
  merchant: string;
  amount: number;
  paymentMethod: string;
  suggestedCategoryId: string;
  suggestedCategoryName: string;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
  selected: boolean;
}

export interface GulbiAdvice {
  healthScore: number; // 0 to 100
  statusMessage: string;
  spendingPace: 'safe' | 'caution' | 'danger';
  dailyTargetBudget: number; // Daily remaining safe budget
  currentDaysLeft: number;
  projectedIncrease: number;
  adviceList: string[];
}

export interface GulbiChatMessage {
  id: string;
  sender: 'user' | 'gulbi';
  text: string;
  timestamp: string;
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { AssetItem, Category, ExpectedIncomeItem, FixedExpense, GulbiAdvice, MonthlyGoal, Transaction } from '../types/financial';
import { INITIAL_ASSETS, INITIAL_CATEGORIES, INITIAL_GOAL, INITIAL_TRANSACTIONS } from '../utils/mockData';

interface FinancialContextType {
  currentUsername: string;
  categories: Category[];
  assets: AssetItem[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  expectedIncomeItems: ExpectedIncomeItem[];
  goal: MonthlyGoal;
  
  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Asset Actions
  addAsset: (asset: Omit<AssetItem, 'id' | 'updatedAt'>) => void;
  updateAsset: (id: string, asset: Partial<AssetItem>) => void;
  deleteAsset: (id: string) => void;

  // Fixed Expense Actions
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  logFixedExpenseToLedger: (id: string) => void;

  // Expected Income Actions
  addExpectedIncomeItem: (item: Omit<ExpectedIncomeItem, 'id'>) => void;
  updateExpectedIncomeItem: (id: string, item: Partial<ExpectedIncomeItem>) => void;
  deleteExpectedIncomeItem: (id: string) => void;
  logExpectedIncomeToLedger: (id: string) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addTransactionsBatch: (txs: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Goal Actions
  updateGoal: (newGoal: Partial<MonthlyGoal>) => void;

  // Derived Computed Analytics
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currentMonthIncome: number;
  expectedMonthlyIncome: number;
  currentMonthExpense: number;
  currentMonthInvestment: number;
  currentMonthNetSaving: number;
  totalFixedExpenseAmount: number;
  pureVariableExpenseSpent: number;
  initialVariableBudget: number;
  remainingVariableBudget: number;
  monthlyGoalProgress: number; // % progress
  gulbiAdvice: GulbiAdvice;

  // Utility
  resetToMockData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
}

const LEGACY_STORAGE_KEY = 'gulbi_user_persistent_data';
const LEGACY_KEYS = ['gulbi_financial_data_v3', 'gulbi_financial_data_v2', 'gulbi_financial_data_v1'];

function getUserStorageKey(username: string, subKey: string): string {
  const safeUser = (username || 'guest').toLowerCase().trim();
  return `gulbi_account_${safeUser}_${subKey}`;
}

function loadUserStorageItem<T>(username: string, subKey: string, fallback: T): T {
  try {
    const userKey = getUserStorageKey(username, subKey);
    const existing = localStorage.getItem(userKey);
    if (existing) {
      return JSON.parse(existing) as T;
    }

    // Migration for main account 'sjylim'
    if (username.toLowerCase().trim() === 'sjylim') {
      const primaryLegacy = localStorage.getItem(`${LEGACY_STORAGE_KEY}_${subKey}`);
      if (primaryLegacy) {
        const parsed = JSON.parse(primaryLegacy) as T;
        localStorage.setItem(userKey, JSON.stringify(parsed));
        return parsed;
      }

      for (const legacyKey of LEGACY_KEYS) {
        const legacyItem = localStorage.getItem(`${legacyKey}_${subKey}`);
        if (legacyItem) {
          const parsed = JSON.parse(legacyItem) as T;
          localStorage.setItem(userKey, JSON.stringify(parsed));
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error(`Failed to load storage item for ${username} (${subKey}):`, e);
  }
  return fallback;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ username: string; children: React.ReactNode }> = ({ username, children }) => {
  const currentUsername = (username || 'sjylim').toLowerCase().trim();

  const [categories, setCategories] = useState<Category[]>(() => {
    return loadUserStorageItem<Category[]>(currentUsername, 'categories', INITIAL_CATEGORIES);
  });

  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const fallback = currentUsername === 'sjylim' ? INITIAL_ASSETS : [];
    return loadUserStorageItem<AssetItem[]>(currentUsername, 'assets', fallback);
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const fallback = currentUsername === 'sjylim' ? INITIAL_TRANSACTIONS : [];
    return loadUserStorageItem<Transaction[]>(currentUsername, 'transactions', fallback);
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    return loadUserStorageItem<FixedExpense[]>(currentUsername, 'fixed_expenses', []);
  });

  const [expectedIncomeItems, setExpectedIncomeItems] = useState<ExpectedIncomeItem[]>(() => {
    return loadUserStorageItem<ExpectedIncomeItem[]>(currentUsername, 'expected_income_items', []);
  });

  const [goal, setGoal] = useState<MonthlyGoal>(() => {
    const fallback = currentUsername === 'sjylim' ? INITIAL_GOAL : { yearMonth: '2026-08', targetIncreaseAmount: 0, expectedIncome: 0, note: '' };
    return loadUserStorageItem<MonthlyGoal>(currentUsername, 'goal', fallback);
  });

  // Re-load data whenever currentUsername changes
  useEffect(() => {
    setCategories(loadUserStorageItem<Category[]>(currentUsername, 'categories', INITIAL_CATEGORIES));
    setAssets(loadUserStorageItem<AssetItem[]>(currentUsername, 'assets', currentUsername === 'sjylim' ? INITIAL_ASSETS : []));
    setTransactions(loadUserStorageItem<Transaction[]>(currentUsername, 'transactions', currentUsername === 'sjylim' ? INITIAL_TRANSACTIONS : []));
    setFixedExpenses(loadUserStorageItem<FixedExpense[]>(currentUsername, 'fixed_expenses', []));
    setExpectedIncomeItems(loadUserStorageItem<ExpectedIncomeItem[]>(currentUsername, 'expected_income_items', []));
    setGoal(loadUserStorageItem<MonthlyGoal>(currentUsername, 'goal', currentUsername === 'sjylim' ? INITIAL_GOAL : { yearMonth: '2026-08', targetIncreaseAmount: 0, expectedIncome: 0, note: '' }));
  }, [currentUsername]);

  // Sync state to LocalStorage reliably for currentUsername
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'categories'), JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'assets'), JSON.stringify(assets));
    } catch (e) {
      console.error('Error saving assets:', e);
    }
  }, [assets, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'transactions'), JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }, [transactions, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'fixed_expenses'), JSON.stringify(fixedExpenses));
    } catch (e) {
      console.error('Error saving fixed expenses:', e);
    }
  }, [fixedExpenses, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'expected_income_items'), JSON.stringify(expectedIncomeItems));
    } catch (e) {
      console.error('Error saving expected income items:', e);
    }
  }, [expectedIncomeItems, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'goal'), JSON.stringify(goal));
    } catch (e) {
      console.error('Error saving goal:', e);
    }
  }, [goal, currentUsername]);

  // Asset totals
  const totalAssets = useMemo(() => {
    return assets.filter(a => a.amount > 0).reduce((sum, a) => sum + a.amount, 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return Math.abs(assets.filter(a => a.amount < 0).reduce((sum, a) => sum + a.amount, 0));
  }, [assets]);

  const netWorth = useMemo(() => {
    return totalAssets - totalLiabilities;
  }, [totalAssets, totalLiabilities]);

  // Fixed Expense Total
  const totalFixedExpenseAmount = useMemo(() => {
    return fixedExpenses.reduce((sum, fe) => sum + fe.amount, 0);
  }, [fixedExpenses]);

  // Expected Monthly Income Total
  const expectedMonthlyIncome = useMemo(() => {
    const itemizedSum = expectedIncomeItems.reduce((sum, item) => sum + item.amount, 0);
    return itemizedSum > 0 ? itemizedSum : (goal.expectedIncome || 0);
  }, [expectedIncomeItems, goal.expectedIncome]);

  // Current Month Calculations (August 2026 default)
  const currentMonthTransactions = useMemo(() => {
    const currentYM = goal.yearMonth || '2026-08';
    return transactions.filter(t => t.date.startsWith(currentYM));
  }, [transactions, goal.yearMonth]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const currentMonthExpense = useMemo(() => {
    return currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const currentMonthInvestment = useMemo(() => {
    return currentMonthTransactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const currentMonthNetSaving = useMemo(() => {
    return currentMonthIncome - currentMonthExpense;
  }, [currentMonthIncome, currentMonthExpense]);

  // Pure Variable Expense Spent (Excluding Fixed Expenses logged)
  const pureVariableExpenseSpent = useMemo(() => {
    const fixedExpenseNames = fixedExpenses.map(fe => fe.name.toLowerCase());
    return currentMonthTransactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        if (t.memo?.includes('고정지출')) return false;
        const merchantLower = t.merchant.toLowerCase();
        if (fixedExpenseNames.some(name => merchantLower.includes(name) || name.includes(merchantLower))) return false;
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions, fixedExpenses]);

  // Initial & Remaining Variable Spending Budget
  const initialVariableBudget = useMemo(() => {
    const effectiveIncome = Math.max(currentMonthIncome, expectedMonthlyIncome);
    const targetVal = goal.targetIncreaseAmount || 0;
    return Math.max(effectiveIncome - targetVal - totalFixedExpenseAmount, 0);
  }, [currentMonthIncome, expectedMonthlyIncome, goal.targetIncreaseAmount, totalFixedExpenseAmount]);

  const remainingVariableBudget = useMemo(() => {
    return initialVariableBudget - pureVariableExpenseSpent;
  }, [initialVariableBudget, pureVariableExpenseSpent]);

  const monthlyGoalProgress = useMemo(() => {
    if (!goal.targetIncreaseAmount || goal.targetIncreaseAmount <= 0) return 0;
    const pct = (currentMonthNetSaving / goal.targetIncreaseAmount) * 100;
    return Math.min(Math.max(Math.round(pct), 0), 100);
  }, [currentMonthNetSaving, goal.targetIncreaseAmount]);

  // Gulbi Advice Engine
  const gulbiAdvice = useMemo<GulbiAdvice>(() => {
    const now = new Date();
    const totalDays = 31;
    const currentDay = Math.min(now.getDate(), totalDays);
    const daysLeft = Math.max(totalDays - currentDay + 1, 1);

    const targetVal = goal.targetIncreaseAmount || 0;
    const remainingToGoal = Math.max(targetVal - currentMonthNetSaving, 0);

    const dailyTargetBudget = daysLeft > 0 ? Math.round(Math.max(remainingVariableBudget, 0) / daysLeft) : 0;

    let spendingPace: 'safe' | 'caution' | 'danger' = 'safe';
    let healthScore = 80;

    if (targetVal <= 0) {
      healthScore = 80;
      spendingPace = 'safe';
    } else if (monthlyGoalProgress >= 90) {
      spendingPace = 'safe';
      healthScore = 95;
    } else if (remainingVariableBudget <= 0 || dailyTargetBudget < 15000) {
      spendingPace = 'danger';
      healthScore = 58;
    } else if (monthlyGoalProgress < (currentDay / totalDays) * 100 - 15) {
      spendingPace = 'caution';
      healthScore = 72;
    }

    const adviceList: string[] = [];

    if (targetVal <= 0) {
      adviceList.push(`🎯 안녕하세요, ${currentUsername}님! 상단의 [목표 자산 증액] 메뉴에서 이번 달 목표 및 예상 수입을 설정해 보세요!`);
      if (totalFixedExpenseAmount > 0) {
        adviceList.push(`💳 매월 고정지출(${totalFixedExpenseAmount.toLocaleString()}원)을 미리 차감하여 순수 변동지출 일일 한도를 산출합니다.`);
      }
    } else if (currentMonthNetSaving >= targetVal) {
      adviceList.push('🎉 축하합니다! 이번 달 자산 증액 목표를 달성하셨습니다!');
      adviceList.push('💡 여유 자금은 예적금이나 투자 자산에 배분해 보세요.');
    } else {
      adviceList.push(`🎯 목표 증액분까지 ${remainingToGoal.toLocaleString()}원 남았습니다.`);
      adviceList.push(`📅 매월 고정지출(${totalFixedExpenseAmount.toLocaleString()}원)을 보존하고 남은 ${daysLeft}일 동안 하루 평균 ${dailyTargetBudget.toLocaleString()}원 이하로 변동지출(식비/쇼핑)을 관리해 보세요.`);
    }

    let statusMessage = `${currentUsername}님 전용 자산 가계부입니다. 굴비가 스마트하게 예산을 관리합니다! 🐟`;
    if (targetVal <= 0) statusMessage = '이번 달 목표 자산 증액분 및 예상 수입을 설정해 보세요! 🎯';
    else if (spendingPace === 'safe') statusMessage = '고정지출을 차감한 후에도 안전한 소비 페이스를 유지하고 있습니다. 🐟✨';
    else if (spendingPace === 'caution') statusMessage = '고정지출 차감 후 가용 예산이 다소 부족합니다. 변동 지출을 점검하세요! ⚠️';
    else if (spendingPace === 'danger') statusMessage = '변동지출 예산이 초과되었거나 긴축이 시급합니다! 🚨';

    return {
      healthScore,
      statusMessage,
      spendingPace,
      dailyTargetBudget,
      currentDaysLeft: daysLeft,
      projectedIncrease: currentMonthNetSaving,
      adviceList,
    };
  }, [currentUsername, goal.targetIncreaseAmount, remainingVariableBudget, currentMonthNetSaving, monthlyGoalProgress, totalFixedExpenseAmount]);

  // Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat_${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addAsset = (asset: Omit<AssetItem, 'id' | 'updatedAt'>) => {
    const newAsset: AssetItem = {
      ...asset,
      id: `ast_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, updated: Partial<AssetItem>) => {
    setAssets(prev => prev.map(a => (a.id === id ? { ...a, ...updated, updatedAt: new Date().toISOString().split('T')[0] } : a)));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Fixed Expense Actions
  const addFixedExpense = (expense: Omit<FixedExpense, 'id'>) => {
    const newExpense: FixedExpense = {
      ...expense,
      id: `fe_${Date.now()}`,
    };
    setFixedExpenses(prev => [...prev, newExpense]);
  };

  const updateFixedExpense = (id: string, updated: Partial<FixedExpense>) => {
    setFixedExpenses(prev => prev.map(fe => (fe.id === id ? { ...fe, ...updated } : fe)));
  };

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(fe => fe.id !== id));
  };

  const logFixedExpenseToLedger = (id: string) => {
    const fe = fixedExpenses.find(item => item.id === id);
    if (!fe) return;

    const today = new Date();
    const ym = goal.yearMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const dateStr = `${ym}-${String(fe.dayOfMonth).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx_fe_${Date.now()}`,
      date: dateStr,
      time: '09:00',
      type: 'expense',
      categoryId: fe.categoryId,
      categoryName: fe.categoryName,
      amount: fe.amount,
      merchant: fe.name,
      paymentMethod: fe.paymentMethod,
      memo: `월 고정지출 결제 (${fe.name})`,
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Expected Income Actions
  const addExpectedIncomeItem = (item: Omit<ExpectedIncomeItem, 'id'>) => {
    const newItem: ExpectedIncomeItem = {
      ...item,
      id: `ei_${Date.now()}`,
    };
    setExpectedIncomeItems(prev => [...prev, newItem]);
  };

  const updateExpectedIncomeItem = (id: string, updated: Partial<ExpectedIncomeItem>) => {
    setExpectedIncomeItems(prev => prev.map(ei => (ei.id === id ? { ...ei, ...updated } : ei)));
  };

  const deleteExpectedIncomeItem = (id: string) => {
    setExpectedIncomeItems(prev => prev.filter(ei => ei.id !== id));
  };

  const logExpectedIncomeToLedger = (id: string) => {
    const item = expectedIncomeItems.find(i => i.id === id);
    if (!item) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const newTx: Transaction = {
      id: `tx_ei_${Date.now()}`,
      date: dateStr,
      time: '09:00',
      type: 'income',
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.amount,
      merchant: item.name,
      paymentMethod: '급여/통장입금',
      memo: `예상 수입 실제 입금 기록 (${item.name})`,
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: `tx_${Date.now()}` };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addTransactionsBatch = (txs: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = txs.map((tx, idx) => ({ ...tx, id: `tx_${Date.now()}_${idx}` }));
    setTransactions(prev => [...newTxs, ...prev]);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateGoal = (newGoal: Partial<MonthlyGoal>) => {
    setGoal(prev => ({ ...prev, ...newGoal }));
  };

  const resetToMockData = () => {
    setCategories(INITIAL_CATEGORIES);
    setAssets([]);
    setTransactions([]);
    setFixedExpenses([]);
    setExpectedIncomeItems([]);
    setGoal(INITIAL_GOAL);
  };

  const clearAllData = () => {
    setAssets([]);
    setTransactions([]);
    setFixedExpenses([]);
    setExpectedIncomeItems([]);
    setGoal({ yearMonth: '2026-08', targetIncreaseAmount: 0, expectedIncome: 0, note: '' });
  };

  // Export Complete Backup JSON
  const exportBackupJSON = () => {
    const backupData = {
      version: 1,
      username: currentUsername,
      exportedAt: new Date().toISOString(),
      categories,
      assets,
      transactions,
      fixedExpenses,
      expectedIncomeItems,
      goal,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gulbi_${currentUsername}_asset_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Backup JSON
  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.assets)) setAssets(data.assets);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.fixedExpenses)) setFixedExpenses(data.fixedExpenses);
      if (Array.isArray(data.expectedIncomeItems)) setExpectedIncomeItems(data.expectedIncomeItems);
      if (data.goal) setGoal(data.goal);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        currentUsername,
        categories,
        assets,
        transactions,
        fixedExpenses,
        expectedIncomeItems,
        goal,
        addCategory,
        updateCategory,
        deleteCategory,
        addAsset,
        updateAsset,
        deleteAsset,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        logFixedExpenseToLedger,
        addExpectedIncomeItem,
        updateExpectedIncomeItem,
        deleteExpectedIncomeItem,
        logExpectedIncomeToLedger,
        addTransaction,
        addTransactionsBatch,
        updateTransaction,
        deleteTransaction,
        updateGoal,
        netWorth,
        totalAssets,
        totalLiabilities,
        currentMonthIncome,
        expectedMonthlyIncome,
        currentMonthExpense,
        currentMonthInvestment,
        currentMonthNetSaving,
        totalFixedExpenseAmount,
        pureVariableExpenseSpent,
        initialVariableBudget,
        remainingVariableBudget,
        monthlyGoalProgress,
        gulbiAdvice,
        resetToMockData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import type { AssetItem, AssetCategoryType, Category, ExpectedIncomeItem, FixedExpense, GulbiAdvice, InvestmentItem, MonthlyGoal, Transaction } from '../types/financial';
import { INITIAL_ASSETS, INITIAL_CATEGORIES, INITIAL_GOAL, INITIAL_TRANSACTIONS } from '../utils/mockData';
import { getLocalDateString, getLocalYearMonthString, getDaysInMonth } from '../utils/dateUtils';
import {
  fetchUserDataFromSupabase,
  saveUserDataToSupabase,
  isSupabaseConfigured,
} from '../services/supabaseService';

export type SupabaseSyncStatus = 'idle' | 'syncing' | 'synced' | 'unconfigured' | 'error';

interface FinancialContextType {
  currentUsername: string;
  categories: Category[];
  assets: AssetItem[];
  rawManualAssets: AssetItem[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  expectedIncomeItems: ExpectedIncomeItem[];
  investmentItems: InvestmentItem[];
  goal: MonthlyGoal;
  todayDateStr: string;

  // Supabase DB Sync State & Actions
  supabaseSyncStatus: SupabaseSyncStatus;
  supabaseErrorMsg: string | null;
  supabaseLastSyncedAt: string | null;
  isSupabaseModalOpen: boolean;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;
  syncNowWithSupabase: () => Promise<void>;
  uploadLocalToSupabase: () => Promise<boolean>;
  downloadRemoteFromSupabase: () => Promise<boolean>;
  
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

  // Investment Actions
  addInvestmentItem: (item: Omit<InvestmentItem, 'id' | 'updatedAt'>) => void;
  updateInvestmentItem: (id: string, item: Partial<InvestmentItem>) => void;
  deleteInvestmentItem: (id: string) => void;
  logInvestmentToLedger: (id: string) => void;

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
  initialVariableBudget: number;

  // Daily Budget & Past/Today Real-Time Tracking
  pastVariableExpenseSpent: number; // 어제까지 누적 변동지출
  todayVariableExpenseSpent: number; // 오늘 당일 변동지출
  pureVariableExpenseSpent: number; // 이번 달 총 누적 변동지출
  remainingVariableBudgetBeforeToday: number; // 오늘 아침 시작 시점 남은 가용 예산
  remainingVariableBudget: number; // 이번 달 총 남은 가용 예산
  todayAvailableBudget: number; // 오늘 남아있는 당일 가용 예산

  // Investment Analytics
  totalInvestmentPrincipal: number;
  totalInvestmentCurrentValue: number;
  totalInvestmentReturn: number;
  totalInvestmentReturnPct: number;

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

function mapInvestmentCategoryToAssetCategory(catName: string): AssetCategoryType {
  const name = (catName || '').toLowerCase();
  if (name.includes('주식') || name.includes('펀드') || name.includes('etf') || name.includes('stock')) return 'stock';
  if (name.includes('코인') || name.includes('가상') || name.includes('crypto')) return 'crypto';
  if (name.includes('예적금') || name.includes('저축') || name.includes('은행') || name.includes('bank')) return 'bank';
  if (name.includes('부동산') || name.includes('보증금')) return 'real_estate';
  return 'stock';
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ username: string; children: React.ReactNode }> = ({ username, children }) => {
  const currentUsername = (username || 'sjylim').toLowerCase().trim();

  // Automatic Real-Time Local Date State (updates at midnight or on tab focus)
  const [todayDateStr, setTodayDateStr] = useState<string>(() => getLocalDateString());

  // Supabase DB Sync States
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<SupabaseSyncStatus>(() => {
    return isSupabaseConfigured() ? 'idle' : 'unconfigured';
  });
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [supabaseLastSyncedAt, setSupabaseLastSyncedAt] = useState<string | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  const isSyncingRemote = useRef(false);
  const isDataLoadedFromRemote = useRef(false);

  useEffect(() => {
    const checkDate = () => {
      const currentLocal = getLocalDateString();
      setTodayDateStr(prev => (prev !== currentLocal ? currentLocal : prev));
    };

    const interval = setInterval(checkDate, 15000); // Check every 15 sec
    window.addEventListener('focus', checkDate);
    window.addEventListener('visibilitychange', checkDate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDate);
      window.removeEventListener('visibilitychange', checkDate);
    };
  }, []);

  const [categories, setCategories] = useState<Category[]>(() => {
    return loadUserStorageItem<Category[]>(currentUsername, 'categories', INITIAL_CATEGORIES);
  });

  const [manualAssets, setManualAssets] = useState<AssetItem[]>(() => {
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

  const [investmentItems, setInvestmentItems] = useState<InvestmentItem[]>(() => {
    return loadUserStorageItem<InvestmentItem[]>(currentUsername, 'investment_items', []);
  });

  const [goal, setGoal] = useState<MonthlyGoal>(() => {
    const defaultYM = getLocalYearMonthString();
    const fallback = currentUsername === 'sjylim' ? INITIAL_GOAL : { yearMonth: defaultYM, targetIncreaseAmount: 0, expectedIncome: 0, note: '' };
    return loadUserStorageItem<MonthlyGoal>(currentUsername, 'goal', fallback);
  });

  // Re-load data whenever currentUsername changes
  useEffect(() => {
    const defaultYM = getLocalYearMonthString();
    isDataLoadedFromRemote.current = false;
    setCategories(loadUserStorageItem<Category[]>(currentUsername, 'categories', INITIAL_CATEGORIES));
    setManualAssets(loadUserStorageItem<AssetItem[]>(currentUsername, 'assets', currentUsername === 'sjylim' ? INITIAL_ASSETS : []));
    setTransactions(loadUserStorageItem<Transaction[]>(currentUsername, 'transactions', currentUsername === 'sjylim' ? INITIAL_TRANSACTIONS : []));
    setFixedExpenses(loadUserStorageItem<FixedExpense[]>(currentUsername, 'fixed_expenses', []));
    setExpectedIncomeItems(loadUserStorageItem<ExpectedIncomeItem[]>(currentUsername, 'expected_income_items', []));
    setInvestmentItems(loadUserStorageItem<InvestmentItem[]>(currentUsername, 'investment_items', []));
    setGoal(loadUserStorageItem<MonthlyGoal>(currentUsername, 'goal', currentUsername === 'sjylim' ? INITIAL_GOAL : { yearMonth: defaultYM, targetIncreaseAmount: 0, expectedIncome: 0, note: '' }));
  }, [currentUsername]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'categories'), JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'assets'), JSON.stringify(manualAssets));
    } catch (e) {
      console.error('Error saving assets:', e);
    }
  }, [manualAssets, currentUsername]);

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
      localStorage.setItem(getUserStorageKey(currentUsername, 'investment_items'), JSON.stringify(investmentItems));
    } catch (e) {
      console.error('Error saving investment items:', e);
    }
  }, [investmentItems, currentUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey(currentUsername, 'goal'), JSON.stringify(goal));
    } catch (e) {
      console.error('Error saving goal:', e);
    }
  }, [goal, currentUsername]);

  // Supabase Cloud DB Synchronizers
  const downloadRemoteFromSupabase = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setSupabaseSyncStatus('unconfigured');
      setSupabaseErrorMsg(null);
      return false;
    }

    setSupabaseSyncStatus('syncing');
    setSupabaseErrorMsg(null);
    isSyncingRemote.current = true;

    try {
      const res = await fetchUserDataFromSupabase(currentUsername);

      if (!res.success) {
        setSupabaseSyncStatus('error');
        setSupabaseErrorMsg(res.errorMsg || 'Supabase 데이터를 불러오는 중 오류가 발생했습니다.');
        return false;
      }

      if (res.data) {
        const remote = res.data;
        if (Array.isArray(remote.categories) && remote.categories.length > 0) setCategories(remote.categories);
        if (Array.isArray(remote.assets)) setManualAssets(remote.assets);
        if (Array.isArray(remote.transactions)) setTransactions(remote.transactions);
        if (Array.isArray(remote.fixedExpenses)) setFixedExpenses(remote.fixedExpenses);
        if (Array.isArray(remote.expectedIncomeItems)) setExpectedIncomeItems(remote.expectedIncomeItems);
        if (Array.isArray(remote.investmentItems)) setInvestmentItems(remote.investmentItems);
        if (remote.goal) setGoal(remote.goal);

        setSupabaseSyncStatus('synced');
        setSupabaseLastSyncedAt(remote.updatedAt || new Date().toISOString());
        return true;
      } else {
        // Remote data empty, upload local data to initialize DB
        const saveRes = await saveUserDataToSupabase(currentUsername, {
          categories,
          assets: manualAssets,
          transactions,
          fixedExpenses,
          expectedIncomeItems,
          investmentItems,
          goal,
        });

        if (saveRes.success) {
          setSupabaseSyncStatus('synced');
          setSupabaseLastSyncedAt(new Date().toISOString());
          return true;
        } else {
          setSupabaseSyncStatus('error');
          setSupabaseErrorMsg(saveRes.errorMsg || 'Supabase 초기 데이터 저장에 실패했습니다.');
          return false;
        }
      }
    } catch (e: any) {
      console.error('Supabase sync error:', e);
      setSupabaseSyncStatus('error');
      setSupabaseErrorMsg(e?.message || '동기화 중 예외 발생');
      return false;
    } finally {
      isSyncingRemote.current = false;
      isDataLoadedFromRemote.current = true;
    }
  };

  const uploadLocalToSupabase = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      setSupabaseSyncStatus('unconfigured');
      setSupabaseErrorMsg(null);
      return false;
    }

    setSupabaseSyncStatus('syncing');
    setSupabaseErrorMsg(null);

    const saveRes = await saveUserDataToSupabase(currentUsername, {
      categories,
      assets: manualAssets,
      transactions,
      fixedExpenses,
      expectedIncomeItems,
      investmentItems,
      goal,
    });

    if (saveRes.success) {
      setSupabaseSyncStatus('synced');
      setSupabaseLastSyncedAt(new Date().toISOString());
      return true;
    } else {
      setSupabaseSyncStatus('error');
      setSupabaseErrorMsg(saveRes.errorMsg || 'Supabase 업로드 실패');
      return false;
    }
  };

  const syncNowWithSupabase = async () => {
    await downloadRemoteFromSupabase();
  };

  // Initial Supabase Sync on load/login
  useEffect(() => {
    if (isSupabaseConfigured()) {
      downloadRemoteFromSupabase();
    } else {
      setSupabaseSyncStatus('unconfigured');
      setSupabaseErrorMsg(null);
    }
  }, [currentUsername]);

  // Debounced Auto-push updates to Supabase DB asynchronously when state mutates
  useEffect(() => {
    if (!isSupabaseConfigured() || isSyncingRemote.current || !isDataLoadedFromRemote.current) {
      return;
    }

    const timer = setTimeout(async () => {
      const res = await saveUserDataToSupabase(currentUsername, {
        categories,
        assets: manualAssets,
        transactions,
        fixedExpenses,
        expectedIncomeItems,
        investmentItems,
        goal,
      });

      if (res.success) {
        setSupabaseSyncStatus('synced');
        setSupabaseLastSyncedAt(new Date().toISOString());
        setSupabaseErrorMsg(null);
      } else {
        setSupabaseSyncStatus('error');
        setSupabaseErrorMsg(res.errorMsg || '자동 저장 실패');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [categories, manualAssets, transactions, fixedExpenses, expectedIncomeItems, investmentItems, goal, currentUsername]);

  // Effective Combined Assets
  const assets = useMemo<AssetItem[]>(() => {
    const invItemNames = new Set(investmentItems.map(i => i.name.toLowerCase().trim()));
    const filteredManual = manualAssets.filter(ma => !invItemNames.has(ma.name.toLowerCase().trim()));

    const linkedAssets: AssetItem[] = investmentItems.map(inv => {
      const astCat = mapInvestmentCategoryToAssetCategory(inv.categoryName);
      return {
        id: `linked_inv_${inv.id}`,
        name: inv.name,
        category: astCat,
        amount: inv.currentValue,
        institution: inv.institution,
        note: inv.memo ? `${inv.memo} (📈 투자 탭 실시간 연동)` : '📈 투자 탭 실시간 연동 (수익률 추적 중)',
        updatedAt: inv.updatedAt || getLocalDateString(),
        isLinkedFromInvestment: true,
        investmentId: inv.id,
      };
    });

    return [...linkedAssets, ...filteredManual];
  }, [manualAssets, investmentItems]);

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

  // Income totals for current month
  const currentMonthYM = goal.yearMonth || getLocalYearMonthString();

  const currentMonthIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonthYM))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthYM]);

  const expectedMonthlyIncome = useMemo(() => {
    return expectedIncomeItems.reduce((sum, item) => sum + item.amount, 0);
  }, [expectedIncomeItems]);

  const currentMonthExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthYM))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthYM]);

  const currentMonthInvestment = useMemo(() => {
    return transactions
      .filter(t => t.type === 'investment' && t.date.startsWith(currentMonthYM))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthYM]);

  const totalFixedExpenseAmount = useMemo(() => {
    return fixedExpenses.reduce((sum, fe) => sum + fe.amount, 0);
  }, [fixedExpenses]);

  // Net Savings for current month
  const currentMonthNetSaving = useMemo(() => {
    return currentMonthIncome - currentMonthExpense;
  }, [currentMonthIncome, currentMonthExpense]);

  // Budget calculations
  const baselineIncome = useMemo(() => {
    return currentMonthIncome > 0 ? currentMonthIncome : expectedMonthlyIncome;
  }, [currentMonthIncome, expectedMonthlyIncome]);

  const initialVariableBudget = useMemo(() => {
    return Math.max(baselineIncome - goal.targetIncreaseAmount - totalFixedExpenseAmount, 0);
  }, [baselineIncome, goal.targetIncreaseAmount, totalFixedExpenseAmount]);

  const pastVariableExpenseSpent = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthYM) && t.date < todayDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthYM, todayDateStr]);

  const todayVariableExpenseSpent = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date === todayDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayDateStr]);

  const pureVariableExpenseSpent = useMemo(() => {
    return pastVariableExpenseSpent + todayVariableExpenseSpent;
  }, [pastVariableExpenseSpent, todayVariableExpenseSpent]);

  const remainingVariableBudgetBeforeToday = useMemo(() => {
    return initialVariableBudget - pastVariableExpenseSpent;
  }, [initialVariableBudget, pastVariableExpenseSpent]);

  const remainingVariableBudget = useMemo(() => {
    return initialVariableBudget - pureVariableExpenseSpent;
  }, [initialVariableBudget, pureVariableExpenseSpent]);

  const todayAvailableBudget = useMemo(() => {
    return remainingVariableBudgetBeforeToday - todayVariableExpenseSpent;
  }, [remainingVariableBudgetBeforeToday, todayVariableExpenseSpent]);

  const investmentMetrics = useMemo(() => {
    const totalPrincipal = investmentItems.reduce((s, i) => s + i.principalAmount, 0);
    const totalValuation = investmentItems.reduce((s, i) => s + i.currentValue, 0);
    const totalReturn = totalValuation - totalPrincipal;
    const totalReturnPct = totalPrincipal > 0 ? (totalReturn / totalPrincipal) * 100 : 0;
    return {
      totalPrincipal,
      totalValuation,
      totalReturn,
      totalReturnPct,
    };
  }, [investmentItems]);

  const monthlyGoalProgress = useMemo(() => {
    if (goal.targetIncreaseAmount <= 0) return 100;
    const pct = (currentMonthNetSaving / goal.targetIncreaseAmount) * 100;
    return Math.max(Math.round(pct), 0);
  }, [currentMonthNetSaving, goal.targetIncreaseAmount]);

  const gulbiAdvice = useMemo<GulbiAdvice>(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth() + 1);
    const currentDaysLeft = Math.max(daysInMonth - currentDay + 1, 1);

    const safeBudgetRemBeforeToday = Math.max(remainingVariableBudgetBeforeToday, 0);
    const dailyTargetBudget = Math.floor(safeBudgetRemBeforeToday / currentDaysLeft);

    let pace: 'safe' | 'caution' | 'danger' = 'safe';
    let healthScore = 95;
    let statusMessage = '훌륭합니다! 계획된 지출 범위 안에서 순항하고 있어요. 🏆';
    const adviceList: string[] = [];

    if (remainingVariableBudget < 0) {
      pace = 'danger';
      healthScore = 40;
      statusMessage = '⚠️ 이번 달 변동 지출 예산을 초과했습니다! 지출 점검이 필요합니다.';
      adviceList.push('고정 지출 외 불필요한 결제를 일시 중단하세요.');
    } else if (todayVariableExpenseSpent > dailyTargetBudget && dailyTargetBudget > 0) {
      pace = 'caution';
      healthScore = 75;
      statusMessage = '💡 오늘 권장 지출액을 조금 초과했습니다. 남은 기간 일일 지출 조절을 추천합니다.';
      adviceList.push('내일 지출을 5,000원씩 절약해 가용 예산을 복구해 보세요.');
    } else if (dailyTargetBudget < 10000 && remainingVariableBudget > 0) {
      pace = 'caution';
      healthScore = 65;
      statusMessage = '🚨 남아있는 하루 안전 지출 한도가 매우 적습니다. 불필요한 소비를 자제해 주세요!';
      adviceList.push('외식 및 배달 소비를 지양하고 집밥을 이용하세요.');
    } else {
      adviceList.push('지금처럼 안전한 지출 습관을 유지해 보세요!');
    }

    const projectedIncrease = currentMonthNetSaving;

    return {
      dailyTargetBudget,
      spendingPace: pace,
      statusMessage,
      healthScore,
      projectedIncrease,
      currentDaysLeft,
      adviceList,
    };
  }, [remainingVariableBudgetBeforeToday, remainingVariableBudget, todayVariableExpenseSpent, currentMonthNetSaving]);

  // Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat_${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addAsset = (asset: Omit<AssetItem, 'id' | 'updatedAt'>) => {
    const newAsset: AssetItem = {
      ...asset,
      id: `ast_${Date.now()}`,
      updatedAt: getLocalDateString(),
    };
    setManualAssets(prev => [newAsset, ...prev]);
  };

  const updateAsset = (id: string, updatedFields: Partial<AssetItem>) => {
    setManualAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updatedFields, updatedAt: getLocalDateString() } : a))
    );
  };

  const deleteAsset = (id: string) => {
    setManualAssets(prev => prev.filter(a => a.id !== id));
  };

  const addFixedExpense = (expense: Omit<FixedExpense, 'id'>) => {
    const newExpense: FixedExpense = { ...expense, id: `fe_${Date.now()}` };
    setFixedExpenses(prev => [newExpense, ...prev]);
  };

  const updateFixedExpense = (id: string, updatedFields: Partial<FixedExpense>) => {
    setFixedExpenses(prev => prev.map(fe => (fe.id === id ? { ...fe, ...updatedFields } : fe)));
  };

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(fe => fe.id !== id));
  };

  const logFixedExpenseToLedger = (id: string) => {
    const target = fixedExpenses.find(fe => fe.id === id);
    if (!target) return;

    const newTx: Transaction = {
      id: `tx_fe_${Date.now()}`,
      date: getLocalDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'expense',
      categoryId: target.categoryId,
      categoryName: target.categoryName,
      amount: target.amount,
      merchant: `[고정지출] ${target.name}`,
      paymentMethod: target.paymentMethod,
      memo: target.memo || '자동이체/정기결제 기록',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addExpectedIncomeItem = (item: Omit<ExpectedIncomeItem, 'id'>) => {
    const newItem: ExpectedIncomeItem = { ...item, id: `exp_inc_${Date.now()}` };
    setExpectedIncomeItems(prev => [newItem, ...prev]);
  };

  const updateExpectedIncomeItem = (id: string, updatedFields: Partial<ExpectedIncomeItem>) => {
    setExpectedIncomeItems(prev => prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item)));
  };

  const deleteExpectedIncomeItem = (id: string) => {
    setExpectedIncomeItems(prev => prev.filter(item => item.id !== id));
  };

  const logExpectedIncomeToLedger = (id: string) => {
    const target = expectedIncomeItems.find(item => item.id === id);
    if (!target) return;

    const newTx: Transaction = {
      id: `tx_inc_${Date.now()}`,
      date: getLocalDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'income',
      categoryId: target.categoryId,
      categoryName: target.categoryName,
      amount: target.amount,
      merchant: `[예상수입] ${target.name}`,
      paymentMethod: '계좌입금',
      memo: target.memo || '실제 수입 장부 기록',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addInvestmentItem = (item: Omit<InvestmentItem, 'id' | 'updatedAt'>) => {
    const newItem: InvestmentItem = {
      ...item,
      id: `inv_${Date.now()}`,
      updatedAt: getLocalDateString(),
    };
    setInvestmentItems(prev => [newItem, ...prev]);
  };

  const updateInvestmentItem = (id: string, updatedFields: Partial<InvestmentItem>) => {
    setInvestmentItems(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updatedFields, updatedAt: getLocalDateString() } : i))
    );
  };

  const deleteInvestmentItem = (id: string) => {
    setInvestmentItems(prev => prev.filter(i => i.id !== id));
  };

  const logInvestmentToLedger = (id: string) => {
    const item = investmentItems.find(i => i.id === id);
    if (!item) return;

    const newTx: Transaction = {
      id: `tx_inv_${Date.now()}`,
      date: getLocalDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'investment',
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      amount: item.principalAmount,
      merchant: `[투자매수] ${item.name}`,
      paymentMethod: item.institution || '증권/거래소',
      memo: item.memo || '투자 탭 연동 기록',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: `tx_${Date.now()}` };
    setTransactions(prev => [newTx, ...prev]);
  };

  const addTransactionsBatch = (txs: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = txs.map((t, idx) => ({ ...t, id: `tx_${Date.now()}_${idx}` }));
    setTransactions(prev => [...newTxs, ...prev]);
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateGoal = (newGoalFields: Partial<MonthlyGoal>) => {
    setGoal(prev => ({ ...prev, ...newGoalFields }));
  };

  const resetToMockData = () => {
    setCategories(INITIAL_CATEGORIES);
    setManualAssets(INITIAL_ASSETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setFixedExpenses([]);
    setExpectedIncomeItems([]);
    setInvestmentItems([]);
    setGoal(INITIAL_GOAL);
  };

  const clearAllData = () => {
    const defaultYM = getLocalYearMonthString();
    setCategories(INITIAL_CATEGORIES);
    setManualAssets([]);
    setTransactions([]);
    setFixedExpenses([]);
    setExpectedIncomeItems([]);
    setInvestmentItems([]);
    setGoal({ yearMonth: defaultYM, targetIncreaseAmount: 0, expectedIncome: 0, note: '' });
  };

  const exportBackupJSON = () => {
    const dataObj = {
      username: currentUsername,
      categories,
      assets: manualAssets,
      transactions,
      fixedExpenses,
      expectedIncomeItems,
      investmentItems,
      goal,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gulbi_${currentUsername}_Backup_${getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
        if (Array.isArray(parsed.assets)) setManualAssets(parsed.assets);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (Array.isArray(parsed.fixedExpenses)) setFixedExpenses(parsed.fixedExpenses);
        if (Array.isArray(parsed.expectedIncomeItems)) setExpectedIncomeItems(parsed.expectedIncomeItems);
        if (Array.isArray(parsed.investmentItems)) setInvestmentItems(parsed.investmentItems);
        if (parsed.goal && typeof parsed.goal === 'object') setGoal(parsed.goal);
        return true;
      }
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
    }
    return false;
  };

  return (
    <FinancialContext.Provider
      value={{
        currentUsername,
        categories,
        assets,
        rawManualAssets: manualAssets,
        transactions,
        fixedExpenses,
        expectedIncomeItems,
        investmentItems,
        goal,
        todayDateStr,
        supabaseSyncStatus,
        supabaseErrorMsg,
        supabaseLastSyncedAt,
        isSupabaseModalOpen,
        openSupabaseModal: () => setIsSupabaseModalOpen(true),
        closeSupabaseModal: () => setIsSupabaseModalOpen(false),
        syncNowWithSupabase,
        uploadLocalToSupabase,
        downloadRemoteFromSupabase,
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
        addInvestmentItem,
        updateInvestmentItem,
        deleteInvestmentItem,
        logInvestmentToLedger,
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
        initialVariableBudget,
        pastVariableExpenseSpent,
        todayVariableExpenseSpent,
        pureVariableExpenseSpent,
        remainingVariableBudgetBeforeToday,
        remainingVariableBudget,
        todayAvailableBudget,
        totalInvestmentPrincipal: investmentMetrics.totalPrincipal,
        totalInvestmentCurrentValue: investmentMetrics.totalValuation,
        totalInvestmentReturn: investmentMetrics.totalReturn,
        totalInvestmentReturnPct: investmentMetrics.totalReturnPct,
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

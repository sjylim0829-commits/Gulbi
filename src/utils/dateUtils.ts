/**
 * Date utility functions for Gulbi Financial Agent.
 * Ensures exact Local Time (KST / User Local Timezone) handling without UTC offset bugs.
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalYearMonthString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const parts = ym.split('-');
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const month = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
  return { year, month };
}

export function formatYearMonth(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  return `${year}년 ${month}월`;
}

export function getPrevYearMonth(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  const prevM = String(month - 1).padStart(2, '0');
  return `${year}-${prevM}`;
}

export function getNextYearMonth(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  const nextM = String(month + 1).padStart(2, '0');
  return `${year}-${nextM}`;
}

export function getMonthListForYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    return `${year}-${m}`;
  });
}


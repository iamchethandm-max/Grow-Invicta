/**
 * Formats a date string (like 'YYYY-MM-DD', ISO string) or a Date object to the standard Indian format: DD/MM/YYYY.
 * Ensures no timezone-shifting occurs on raw 'YYYY-MM-DD' dates.
 */
export const formatIndianDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Match standard YYYY-MM-DD (with optional trailing time/timezone info)
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    
    // Fallback parsing for general ISO strings or datetime strings
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date;
  }
  
  if (date instanceof Date) {
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  
  return String(date);
};

/**
 * Normalizes any date string (such as DD/MM/YYYY, YYYY-MM-DD, or general ISO strings)
 * into standard YYYY-MM-DD format for use by HTML date input fields.
 */
export const normalizeToYYYYMMDD = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '2026-06-25'; // Default fallback
  const trimmed = dateStr.trim();

  // 1. Check if it matches YYYY-MM-DD or YYYY/MM/DD with 1 or 2 digit months/days
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. Check if it matches DD/MM/YYYY or DD-MM-YYYY with 1 or 2 digit days/months
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 3. Native JS parsing fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
};

/**
 * Subtracts a number of days from a given date string (YYYY-MM-DD)
 * and returns the resulting date string in YYYY-MM-DD format.
 */
export const subtractDays = (dateStr: string, days: number): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
};

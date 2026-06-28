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

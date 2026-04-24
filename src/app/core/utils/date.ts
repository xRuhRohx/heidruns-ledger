export function parseDate(date: any): Date {
    if (!date) return new Date();
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    const str = String(date);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(str);
  }

  export function formatDateTime(date: any): string {
    const d = parseDate(date);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  export function formatDateOnly(date: any): string {
    const d = parseDate(date);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  export function toDateTimeLocalString(date: Date = new Date()): string {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
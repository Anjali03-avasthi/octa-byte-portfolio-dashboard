export function formatCurrency(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
}

export function formatNumber(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(val);
}

export function formatPercentage(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

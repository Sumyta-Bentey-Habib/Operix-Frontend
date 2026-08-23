/**
 * Formats a number into a currency string (e.g. 78989.09 -> "৳78,989.09")
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = "৳",
  includeDecimals: boolean = true,
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `${currencySymbol}${formatted}`;
}

/**
 * Formats a transaction amount with sign (e.g., -1345.10 -> "-৳1,345.10 BDT")
 */
export function formatTransactionAmount(
  amount: number,
  currency: string = "BDT",
  isNegative: boolean = true,
): string {
  const sign = isNegative ? "-" : "+";
  const absAmount = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}৳${absAmount} ${currency}`;
}

/**
 * Masks a credit card number to show last digits (e.g. "**** 9090")
 */
export function formatMaskedCardNumber(
  lastFourDigits: string,
  maskPrefix: string = "****",
): string {
  return `${maskPrefix} ${lastFourDigits}`;
}

/**
 * Formats a percentage change with optional sign (e.g., 12.8 -> "+12.8%")
 */
export function formatPercentage(value: number, includePlus: boolean = true): string {
  const sign = value > 0 && includePlus ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

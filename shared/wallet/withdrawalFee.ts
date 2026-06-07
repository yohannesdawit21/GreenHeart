/** Platform cut on advisor withdrawals — keep in sync with PLATFORM_WITHDRAWAL_FEE_PERCENT env on backend */

export const DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT = 10;

export interface WithdrawalSplit {
  grossCoins: number;
  platformFeeCoins: number;
  netPayoutCoins: number;
  feePercent: number;
}

export function calculateWithdrawalSplit(
  grossCoins: number,
  feePercent = DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT,
): WithdrawalSplit {
  const platformFeeCoins = Math.floor((grossCoins * feePercent) / 100);
  const netPayoutCoins = grossCoins - platformFeeCoins;
  return { grossCoins, platformFeeCoins, netPayoutCoins, feePercent };
}

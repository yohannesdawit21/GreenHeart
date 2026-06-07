/** Platform cut on advisor withdrawals — keep in sync with PLATFORM_WITHDRAWAL_FEE_PERCENT env on backend */
export declare const DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT = 10;
export interface WithdrawalSplit {
    grossCoins: number;
    platformFeeCoins: number;
    netPayoutCoins: number;
    feePercent: number;
}
export declare function calculateWithdrawalSplit(grossCoins: number, feePercent?: number): WithdrawalSplit;

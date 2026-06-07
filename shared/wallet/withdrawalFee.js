"use strict";
/** Platform cut on advisor withdrawals — keep in sync with PLATFORM_WITHDRAWAL_FEE_PERCENT env on backend */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT = void 0;
exports.calculateWithdrawalSplit = calculateWithdrawalSplit;
exports.DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT = 10;
function calculateWithdrawalSplit(grossCoins, feePercent = exports.DEFAULT_PLATFORM_WITHDRAWAL_FEE_PERCENT) {
    const platformFeeCoins = Math.floor((grossCoins * feePercent) / 100);
    const netPayoutCoins = grossCoins - platformFeeCoins;
    return { grossCoins, platformFeeCoins, netPayoutCoins, feePercent };
}

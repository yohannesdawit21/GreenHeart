import { apiClient } from './client';
import type { 
  WalletBalanceResponse, 
  TransactionListResponse, 
  PurchaseInitiateRequest, 
  PurchaseInitiateResponse 
} from '@shared/contracts/wallet.api';

export const walletService = {
  getBalance: async (): Promise<WalletBalanceResponse> => {
    const response = await apiClient.get<WalletBalanceResponse>('/wallet/balance');
    return response.data;
  },

  getTransactions: async (): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>('/wallet/transactions');
    return response.data;
  },

  initiatePurchase: async (data: PurchaseInitiateRequest): Promise<PurchaseInitiateResponse> => {
    const response = await apiClient.post<PurchaseInitiateResponse>('/wallet/purchase', data);
    return response.data;
  },
};

import { apiClient } from './client';
import type {
  WalletBalanceResponse,
  TransactionListResponse,
  PurchaseInitiateRequest,
  PurchaseInitiateResponse,
  CompleteMockPurchaseRequest,
  CompleteMockPurchaseResponse,
  WithdrawRequest,
  WithdrawResponse,
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
    const response = await apiClient.post<PurchaseInitiateResponse>('/wallet/purchase/initiate', data);
    return response.data;
  },

  completeMockPurchase: async (
    data: CompleteMockPurchaseRequest,
  ): Promise<CompleteMockPurchaseResponse> => {
    const response = await apiClient.post<CompleteMockPurchaseResponse>(
      '/wallet/purchase/complete-mock',
      data,
    );
    return response.data;
  },

  withdraw: async (data: WithdrawRequest): Promise<WithdrawResponse> => {
    const response = await apiClient.post<WithdrawResponse>('/wallet/withdraw', data);
    return response.data;
  },
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, extractErrorMessage } from '@/lib/api';
import type {
  ApiEnvelope,
  Commission,
  Deposit,
  DepositInstructions,
  Investment,
  InvestmentDetail,
  InvestmentSummary,
  NotificationsResponse,
  Paginated,
  ProfileResponse,
  Project,
  Referral,
  ReferralSummary,
  WalletResponse,
  WalletTransaction,
  Withdrawal,
  WithdrawalAccount,
  WithdrawalRules,
} from '@/lib/types';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<WalletResponse>>('/wallet');
      return data.data;
    },
  });
}

export function useWalletTransactions(perPage = 15) {
  return useQuery({
    queryKey: ['wallet-transactions', perPage],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<WalletTransaction>>>('/wallet/transactions', {
        params: { per_page: perPage },
      });
      return data.data;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Project>>>('/projects', {
        params: { per_page: 50 },
      });
      return data.data;
    },
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Project>>(`/projects/${id}`);
      return data.data;
    },
  });
}

export function useInvestmentSummary() {
  return useQuery({
    queryKey: ['investment-summary'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<InvestmentSummary>>('/investments/summary');
      return data.data;
    },
  });
}

export function useInvestments(status?: string) {
  return useQuery({
    queryKey: ['investments', status],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Investment>>>('/investments', {
        params: { per_page: 50, status },
      });
      return data.data;
    },
  });
}

export function useInvestment(id: number) {
  return useQuery({
    queryKey: ['investment', id],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<InvestmentDetail>>(`/investments/${id}`);
      return data.data;
    },
  });
}

export function useDepositInstructions() {
  return useQuery({
    queryKey: ['deposit-instructions'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<DepositInstructions>>('/deposits/instructions');
      return data.data;
    },
  });
}

export function useDeposits() {
  return useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Deposit>>>('/deposits', { params: { per_page: 30 } });
      return data.data;
    },
  });
}

export function useWithdrawalRules() {
  return useQuery({
    queryKey: ['withdrawal-rules'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<WithdrawalRules>>('/withdrawals/rules');
      return data.data;
    },
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Withdrawal>>>('/withdrawals', { params: { per_page: 30 } });
      return data.data;
    },
  });
}

export function useReferral() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<ReferralSummary>>('/referral');
      return data.data;
    },
  });
}

export function useReferralUsers() {
  return useQuery({
    queryKey: ['referral-users'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Referral>>>('/referral/users', { params: { per_page: 50 } });
      return data.data;
    },
  });
}

export function useReferralCommissions() {
  return useQuery({
    queryKey: ['referral-commissions'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<Commission>>>('/referral/commissions', {
        params: { per_page: 50 },
      });
      return data.data;
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<NotificationsResponse>>('/notifications');
      return data.data;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<ProfileResponse>>('/profile');
      return data.data;
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<WalletTransaction>>>('/transactions', {
        params: { per_page: 50 },
      });
      return data.data;
    },
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<WalletTransaction>>(`/transactions/${id}`);
      return data.data;
    },
  });
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return (keys: string[]) => {
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };
}

export function useCreateDeposit() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { amount: number; idempotency_key: string }) => {
      const { data } = await api.post<ApiEnvelope<Deposit>>('/deposits', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['deposits', 'wallet', 'transactions']),
    onError: () => undefined,
  });
}

export function useUploadDepositProof() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async ({ id, uri, fileName, mimeType }: { id: number; uri: string; fileName: string; mimeType: string }) => {
      const formData = new FormData();
      formData.append('proof', {
        uri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob);
      const { data } = await api.post<ApiEnvelope<Deposit>>(`/deposits/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => invalidate(['deposits', 'wallet']),
    onError: () => undefined,
  });
}

export function useCreateInvestment() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { project_id: number; amount: number; pin: string; idempotency_key: string }) => {
      const { data } = await api.post<ApiEnvelope<Investment>>('/investments', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['investments', 'wallet', 'transactions', 'projects', 'investment-summary']),
    onError: () => undefined,
  });
}

export function useCreateWithdrawal() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { amount: number; account_id: number; pin: string; idempotency_key: string }) => {
      const { data } = await api.post<ApiEnvelope<Withdrawal>>('/withdrawals', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['withdrawals', 'wallet', 'transactions']),
    onError: () => undefined,
  });
}

export function useCreateWithdrawalAccount() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { account_type: 'bank' | 'ewallet'; provider: string; account_name: string; account_number: string; is_default?: boolean }) => {
      const { data } = await api.post<ApiEnvelope<WithdrawalAccount>>('/profile/withdrawal-accounts', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['profile']),
    onError: () => undefined,
  });
}

export function useDeleteWithdrawalAccount() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/profile/withdrawal-accounts/${id}`);
    },
    onSuccess: () => invalidate(['profile']),
    onError: () => undefined,
  });
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => invalidate(['notifications']),
    onError: () => undefined,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => invalidate(['notifications']),
    onError: () => undefined,
  });
}

export function useUpdateProfile() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { name?: string; email?: string }) => {
      const { data } = await api.put<ApiEnvelope<ProfileResponse['user']>>('/profile', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['profile', 'auth']),
    onError: () => undefined,
  });
}

export function useUpdatePassword() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { current_password: string; password: string; password_confirmation: string }) => {
      const { data } = await api.put<ApiEnvelope<null>>('/profile/password', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['profile']),
    onError: () => undefined,
  });
}

export function useUpdatePin() {
  const invalidate = useInvalidateQueries();
  return useMutation({
    mutationFn: async (payload: { current_password: string; pin: string }) => {
      const { data } = await api.put<ApiEnvelope<null>>('/profile/pin', payload);
      return data.data;
    },
    onSuccess: () => invalidate(['profile']),
    onError: () => undefined,
  });
}

export { extractErrorMessage };

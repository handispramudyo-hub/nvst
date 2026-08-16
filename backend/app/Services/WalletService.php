<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WalletService
{
    public function credit(
        User $user,
        float|string $amount,
        string $type,
        string $description,
        ?string $refType = null,
        ?int $refId = null,
        array $meta = [],
        ?Wallet $wallet = null,
    ): WalletTransaction {
        return $this->record($user, (float) $amount, $type, $description, $refType, $refId, $meta, $wallet);
    }

    public function debit(
        User $user,
        float|string $amount,
        string $type,
        string $description,
        ?string $refType = null,
        ?int $refId = null,
        array $meta = [],
        ?Wallet $wallet = null,
    ): WalletTransaction {
        return $this->record($user, -1 * (float) $amount, $type, $description, $refType, $refId, $meta, $wallet);
    }

    /**
     * Core ledger writer. Must run inside a database transaction.
     * Locks the wallet row (FOR UPDATE) to prevent race conditions
     * and records every balance change with before/after values.
     */
    protected function record(
        User $user,
        float $signedAmount,
        string $type,
        string $description,
        ?string $refType,
        ?int $refId,
        array $meta,
        ?Wallet $wallet,
    ): WalletTransaction {
        if (DB::transactionLevel() === 0) {
            return DB::transaction(function () use ($user, $signedAmount, $type, $description, $refType, $refId, $meta, $wallet) {
                return $this->record($user, $signedAmount, $type, $description, $refType, $refId, $meta, $wallet);
            });
        }

        $wallet = $wallet ?: $user->wallet()->lockForUpdate()->first();

        if (!$wallet) {
            throw new RuntimeException('Wallet tidak ditemukan.');
        }

        $balanceBefore = (float) $wallet->balance;
        $balanceAfter = round($balanceBefore + $signedAmount, 2);

        if ($balanceAfter < 0) {
            throw new RuntimeException('Saldo tidak mencukupi.');
        }

        $transaction = new WalletTransaction([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'tx_id' => (string) str()->uuid(),
            'type' => $type,
            'amount' => $signedAmount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description,
            'ref_type' => $refType,
            'ref_id' => $refId,
            'meta' => $meta,
        ]);

        $transaction->save();

        $wallet->balance = $balanceAfter;
        $wallet->version = $wallet->version + 1;

        $totals = [
            WalletTransaction::TYPE_DEPOSIT => 'total_deposited',
            WalletTransaction::TYPE_INVESTMENT => 'total_invested',
            WalletTransaction::TYPE_WITHDRAWAL => 'total_withdrawn',
            WalletTransaction::TYPE_PROFIT => 'total_profit',
            WalletTransaction::TYPE_COMMISSION => 'total_commission',
        ];

        if (isset($totals[$type])) {
            $column = $totals[$type];
            $wallet->{$column} = round((float) $wallet->{$column} + abs($signedAmount), 2);
        }

        $wallet->save();

        return $transaction;
    }
}

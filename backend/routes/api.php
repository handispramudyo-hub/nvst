<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminDepositController;
use App\Http\Controllers\Api\V1\Admin\AdminInvestmentController;
use App\Http\Controllers\Api\V1\Admin\AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\AdminProjectController;
use App\Http\Controllers\Api\V1\Admin\AdminReferralController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\AdminTransactionController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminWithdrawalController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepositController;
use App\Http\Controllers\Api\V1\InvestmentController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ReferralController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public
    Route::get('settings/payment', [SettingController::class, 'paymentInstructions'])->name('settings.payment');

    // Auth
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
    });

    // Deposit instructions (requires auth to discourage abuse)
    Route::get('deposits/instructions', [DepositController::class, 'instructions'])
        ->middleware('auth:sanctum');

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('me', [AuthController::class, 'me'])->name('auth.me');
        });

        Route::get('wallet', [WalletController::class, 'show'])->name('wallet.show');
        Route::get('wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');

        Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

        Route::get('investments/summary', [InvestmentController::class, 'summary'])->name('investments.summary');
        Route::get('investments', [InvestmentController::class, 'index'])->name('investments.index');
        Route::post('investments', [InvestmentController::class, 'store'])->name('investments.store');
        Route::get('investments/{investment}', [InvestmentController::class, 'show'])->name('investments.show');

        Route::get('deposits', [DepositController::class, 'index'])->name('deposits.index');
        Route::post('deposits', [DepositController::class, 'store'])->name('deposits.store');
        Route::post('deposits/{deposit}/proof', [DepositController::class, 'uploadProof'])->name('deposits.proof');
        Route::get('deposits/{deposit}', [DepositController::class, 'show'])->name('deposits.show');

        Route::get('withdrawals/rules', [WithdrawalController::class, 'rules'])->name('withdrawals.rules');
        Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
        Route::get('withdrawals/{withdrawal}', [WithdrawalController::class, 'show'])->name('withdrawals.show');

        Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');

        Route::get('referral', [ReferralController::class, 'show'])->name('referral.show');
        Route::get('referral/users', [ReferralController::class, 'users'])->name('referral.users');
        Route::get('referral/commissions', [ReferralController::class, 'commissions'])->name('referral.commissions');

        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

        Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
        Route::put('profile/pin', [ProfileController::class, 'updatePin'])->name('profile.pin');

        Route::get('profile/withdrawal-accounts', [ProfileController::class, 'withdrawalAccounts'])->name('profile.accounts.index');
        Route::post('profile/withdrawal-accounts', [ProfileController::class, 'storeWithdrawalAccount'])->name('profile.accounts.store');
        Route::put('profile/withdrawal-accounts/{account}', [ProfileController::class, 'updateWithdrawalAccount'])->name('profile.accounts.update');
        Route::delete('profile/withdrawal-accounts/{account}', [ProfileController::class, 'destroyWithdrawalAccount'])->name('profile.accounts.destroy');
    });

    // Admin routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'role_or_permission:super_admin|admin'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index')->middleware('permission:users.view');
        Route::get('users/{user}', [AdminUserController::class, 'show'])->name('admin.users.show')->middleware('permission:users.view');
        Route::get('users/{user}/wallet', [AdminUserController::class, 'wallet'])->name('admin.users.wallet')->middleware('permission:users.view');
        Route::put('users/{user}/status', [AdminUserController::class, 'updateStatus'])->name('admin.users.status')->middleware('permission:users.manage');
        Route::post('users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('admin.users.reset-password')->middleware('permission:users.manage');

        Route::get('projects', [AdminProjectController::class, 'index'])->name('admin.projects.index')->middleware('permission:projects.view');
        Route::post('projects', [AdminProjectController::class, 'store'])->name('admin.projects.store')->middleware('permission:projects.manage');
        Route::get('projects/{project}', [AdminProjectController::class, 'show'])->name('admin.projects.show')->middleware('permission:projects.view');
        Route::put('projects/{project}', [AdminProjectController::class, 'update'])->name('admin.projects.update')->middleware('permission:projects.manage');
        Route::delete('projects/{project}', [AdminProjectController::class, 'destroy'])->name('admin.projects.destroy')->middleware('permission:projects.manage');

        Route::get('deposits', [AdminDepositController::class, 'index'])->name('admin.deposits.index')->middleware('permission:deposits.view');
        Route::get('deposits/{deposit}', [AdminDepositController::class, 'show'])->name('admin.deposits.show')->middleware('permission:deposits.view');
        Route::post('deposits/{deposit}/approve', [AdminDepositController::class, 'approve'])->name('admin.deposits.approve')->middleware('permission:deposits.manage');
        Route::post('deposits/{deposit}/reject', [AdminDepositController::class, 'reject'])->name('admin.deposits.reject')->middleware('permission:deposits.manage');

        Route::get('withdrawals', [AdminWithdrawalController::class, 'index'])->name('admin.withdrawals.index')->middleware('permission:withdrawals.view');
        Route::get('withdrawals/{withdrawal}', [AdminWithdrawalController::class, 'show'])->name('admin.withdrawals.show')->middleware('permission:withdrawals.view');
        Route::post('withdrawals/{withdrawal}/process', [AdminWithdrawalController::class, 'process'])->name('admin.withdrawals.process')->middleware('permission:withdrawals.manage');
        Route::post('withdrawals/{withdrawal}/approve', [AdminWithdrawalController::class, 'approve'])->name('admin.withdrawals.approve')->middleware('permission:withdrawals.manage');
        Route::post('withdrawals/{withdrawal}/complete', [AdminWithdrawalController::class, 'complete'])->name('admin.withdrawals.complete')->middleware('permission:withdrawals.manage');
        Route::post('withdrawals/{withdrawal}/reject', [AdminWithdrawalController::class, 'reject'])->name('admin.withdrawals.reject')->middleware('permission:withdrawals.manage');

        Route::get('investments', [AdminInvestmentController::class, 'index'])->name('admin.investments.index')->middleware('permission:investments.view');
        Route::get('investments/{investment}', [AdminInvestmentController::class, 'show'])->name('admin.investments.show')->middleware('permission:investments.view');

        Route::get('transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index')->middleware('permission:transactions.view');

        Route::get('referrals', [AdminReferralController::class, 'index'])->name('admin.referrals.index')->middleware('permission:referrals.view');
        Route::get('referrals/commissions', [AdminReferralController::class, 'commissions'])->name('admin.referrals.commissions')->middleware('permission:referrals.view');

        Route::get('reports', [AdminReportController::class, 'index'])->name('admin.reports.index')->middleware('permission:reports.view');

        Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('admin.audit-logs.index')->middleware('permission:audit.view');

        Route::get('notifications', [AdminNotificationController::class, 'index'])->name('admin.notifications.index')->middleware('permission:notifications.manage');
        Route::post('notifications', [AdminNotificationController::class, 'send'])->name('admin.notifications.send')->middleware('permission:notifications.manage');

        Route::get('settings', [AdminSettingController::class, 'index'])->name('admin.settings.index')->middleware('permission:settings.manage');
        Route::put('settings', [AdminSettingController::class, 'update'])->name('admin.settings.update')->middleware('permission:settings.manage');
    });
});

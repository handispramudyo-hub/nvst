<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('withdrawal_no', 20)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->decimal('fee', 18, 2)->default(0);
            $table->decimal('final_amount', 18, 2);
            $table->string('account_type', 10);
            $table->string('provider', 40);
            $table->string('account_name');
            $table->string('account_number');
            $table->string('status', 20)->default('pending');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('admin_note')->nullable();
            $table->string('idempotency_key', 64)->unique()->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->string('deposit_no', 20)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('payment_method', 20)->default('qris');
            $table->string('proof_path')->nullable();
            $table->string('status', 20)->default('pending');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('admin_note')->nullable();
            $table->string('idempotency_key', 64)->unique()->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};

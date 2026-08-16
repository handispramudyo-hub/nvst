<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('tx_id', 36)->unique();
            $table->string('type', 30);
            $table->decimal('amount', 18, 2);
            $table->decimal('balance_before', 18, 2);
            $table->decimal('balance_after', 18, 2);
            $table->string('description')->nullable();
            $table->string('ref_type')->nullable();
            $table->unsignedBigInteger('ref_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('type');
            $table->index(['ref_type', 'ref_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};

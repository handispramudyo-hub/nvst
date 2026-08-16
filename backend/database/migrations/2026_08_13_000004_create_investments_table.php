<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->string('investment_no', 20)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->decimal('expected_return', 6, 2);
            $table->decimal('expected_return_amount', 18, 2);
            $table->decimal('daily_return_amount', 18, 6);
            $table->unsignedInteger('duration_days');
            $table->date('start_date');
            $table->date('maturity_date');
            $table->decimal('current_earnings', 18, 2)->default(0);
            $table->string('status', 20)->default('active');
            $table->string('idempotency_key', 64)->unique()->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['project_id', 'status']);
            $table->index(['maturity_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};

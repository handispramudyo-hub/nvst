<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('referral_id')->constrained()->cascadeOnDelete();
            $table->foreignId('investment_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('status', 20)->default('credited');
            $table->timestamp('credited_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};

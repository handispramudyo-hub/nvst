<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->date('earning_date');
            $table->string('status', 20)->default('credited');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['investment_id', 'earning_date']);
            $table->index(['user_id', 'earning_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investment_earnings');
    }
};

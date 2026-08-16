<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('balance', 18, 2)->default(0);
            $table->decimal('total_deposited', 18, 2)->default(0);
            $table->decimal('total_invested', 18, 2)->default(0);
            $table->decimal('total_withdrawn', 18, 2)->default(0);
            $table->decimal('total_profit', 18, 2)->default(0);
            $table->decimal('total_commission', 18, 2)->default(0);
            $table->unsignedBigInteger('version')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};

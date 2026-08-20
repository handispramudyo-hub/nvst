<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('check_in_date');
            $table->unsignedInteger('streak')->default(1);
            $table->decimal('reward_amount', 18, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'check_in_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};

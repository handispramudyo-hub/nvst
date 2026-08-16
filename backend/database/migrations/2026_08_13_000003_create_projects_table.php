<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('image')->nullable();
            $table->string('category', 60);
            $table->decimal('min_investment', 18, 2);
            $table->decimal('max_investment', 18, 2);
            $table->decimal('estimated_return', 6, 2);
            $table->unsignedInteger('duration_days');
            $table->string('risk_level', 10)->default('medium');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('funding_target', 18, 2);
            $table->decimal('current_funding', 18, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->text('terms')->nullable();
            $table->text('risk_disclosure')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'category']);
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

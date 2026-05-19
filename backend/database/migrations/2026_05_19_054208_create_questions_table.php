<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $col) {
            $col->string('id')->primary();
            $col->text('question');
            $col->string('status')->default('pending');
            $col->timestamp('createdAt')->useCurrent();
            $col->timestamp('answeredAt')->nullable();

            $col->index('status');
            $col->index('createdAt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};

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
        Schema::create('designs', function (Blueprint $col) {
            $col->string('id')->primary();
            $col->string('questionId')->nullable();
            $col->text('questionText')->nullable();
            $col->text('answerText')->nullable();
            $col->text('text');
            $col->json('style');
            $col->longText('imageDataUrl');
            $col->timestamp('createdAt')->useCurrent();
            $col->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $col->json('stats');

            $col->index('questionId');
            $col->index('updatedAt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('designs');
    }
};

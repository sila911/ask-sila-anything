<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public API Routes (Anyone can see questions, designs, and events)
Route::get('/questions', [ApiController::class, 'getQuestions']);
Route::post('/questions', [ApiController::class, 'addQuestion']);
Route::post('/telegram/send', [ApiController::class, 'sendTelegram']);
Route::get('/designs', [ApiController::class, 'getDesigns']);
Route::get('/events', [ApiController::class, 'getEvents']);

// Protected API Routes (Only admin can change data)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::put('/questions/replace', [ApiController::class, 'replaceQuestions']);
    Route::put('/designs/replace', [ApiController::class, 'replaceDesigns']);
    Route::post('/events', [ApiController::class, 'addEvent']);
});

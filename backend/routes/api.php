<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

Route::get('/questions', [ApiController::class, 'getQuestions']);
Route::post('/questions', [ApiController::class, 'addQuestion']);
Route::put('/questions/replace', [ApiController::class, 'replaceQuestions']);

Route::get('/designs', [ApiController::class, 'getDesigns']);
Route::put('/designs/replace', [ApiController::class, 'replaceDesigns']);

Route::get('/events', [ApiController::class, 'getEvents']);
Route::post('/events', [ApiController::class, 'addEvent']);

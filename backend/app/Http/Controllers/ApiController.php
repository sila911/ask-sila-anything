<?php

namespace App\Http\Controllers;

use App\Models\Design;
use App\Models\Event;
use App\Models\Question;
use App\Models\QuestionLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiController extends Controller
{
    public function getQuestions(Request $request)
    {
        $ip = $request->ip();
        $questions = Question::orderBy('createdAt', 'desc')->get();

        $likedIds = QuestionLike::where('ip_address', $ip)
            ->pluck('question_id')
            ->toArray();

        foreach ($questions as $question) {
            $question->is_liked = in_array($question->id, $likedIds);
        }

        return response()->json($questions);
    }

    public function likeQuestion(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        $ip = $request->ip();

        // Check if already liked by this IP
        $existingLike = QuestionLike::where('question_id', $id)
            ->where('ip_address', $ip)
            ->exists();

        if ($existingLike) {
            return response()->json([
                'message' => 'Already liked',
                'likes_count' => $question->likes_count
            ], 200);
        }

        DB::transaction(function () use ($question, $id, $ip) {
            QuestionLike::create([
                'question_id' => $id,
                'ip_address' => $ip,
            ]);

            $question->increment('likes_count');
        });

        $question->refresh();

        return response()->json([
            'message' => 'Liked successfully',
            'likes_count' => $question->likes_count
        ], 200);
    }

    public function unlikeQuestion(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        $ip = $request->ip();

        $existingLike = QuestionLike::where('question_id', $id)
            ->where('ip_address', $ip)
            ->first();

        if (!$existingLike) {
            return response()->json([
                'message' => 'Not liked yet',
                'likes_count' => $question->likes_count
            ], 200);
        }

        // Ignore quick double-click unlike (less than 1 second after liking)
        if ($existingLike->created_at && $existingLike->created_at->gt(now()->subSecond())) {
            return response()->json([
                'message' => 'Ignoring quick double-click unlike request',
                'likes_count' => $question->likes_count
            ], 200);
        }

        DB::transaction(function () use ($question, $existingLike) {
            $existingLike->delete();

            if ($question->likes_count > 0) {
                $question->decrement('likes_count');
            }
        });

        $question->refresh();

        return response()->json([
            'message' => 'Unliked successfully',
            'likes_count' => $question->likes_count
        ], 200);
    }

    public function addQuestion(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
        ]);

        $questionText = $request->input('question');

        // 1. Save to Database
        Question::create([
            'question' => $questionText,
            'status' => 'pending',
        ]);

        // 2. Optional Telegram Notification
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if ($botToken && $chatId) {
            try {
                Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => "📬 *New Question Received!*\n\n\"{$questionText}\"",
                    'parse_mode' => 'Markdown',
                ]);
            } catch (\Exception $e) {
                Log::error("Telegram notification failed: " . $e->getMessage());
            }
        }

        // 3. Return updated list
        return response()->json(Question::orderBy('createdAt', 'desc')->get(), 201);
    }

    public function replaceQuestions(Request $request)
    {
        $questions = $request->input('questions');
        if (!is_array($questions)) {
            return response()->json(['message' => 'questions must be an array.'], 400);
        }

        DB::transaction(function () use ($questions) {
            Question::query()->delete();
            foreach ($questions as $item) {
                Question::create([
                    'id' => $item['id'],
                    'question' => $item['question'],
                    'status' => $item['status'] ?? 'pending',
                    'createdAt' => $item['createdAt'] ?? now(),
                    'answeredAt' => $item['answeredAt'] ?? null,
                ]);
            }
        });

        return response()->json(Question::orderBy('createdAt', 'desc')->get());
    }

    public function getDesigns()
    {
        return response()->json(Design::orderBy('updatedAt', 'desc')->get());
    }

    public function replaceDesigns(Request $request)
    {
        $designs = $request->input('designs');
        if (!is_array($designs)) {
            return response()->json(['message' => 'designs must be an array.'], 400);
        }

        DB::transaction(function () use ($designs) {
            Design::query()->delete();
            foreach ($designs as $item) {
                Design::create([
                    'id' => $item['id'],
                    'questionId' => $item['questionId'] ?? null,
                    'questionText' => $item['questionText'] ?? null,
                    'answerText' => $item['answerText'] ?? null,
                    'text' => $item['text'],
                    'style' => $item['style'],
                    'imageDataUrl' => $item['imageDataUrl'],
                    'createdAt' => $item['createdAt'] ?? now(),
                    'updatedAt' => $item['updatedAt'] ?? now(),
                    'stats' => $item['stats'] ?? ['copies' => 0, 'downloads' => 0, 'shares' => 0],
                ]);
            }
        });

        return response()->json(Design::orderBy('updatedAt', 'desc')->get());
    }

    public function getEvents()
    {
        return response()->json(Event::orderBy('createdAt', 'desc')->get());
    }

    public function addEvent(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
        ]);

        Event::create([
            'type' => $request->input('type'),
            'meta' => $request->input('meta', []),
        ]);

        return response()->json(Event::orderBy('createdAt', 'desc')->get(), 201);
    }

    public function sendTelegram(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
        ]);

        $text = $request->input('question');

        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if ($botToken && $chatId) {
            try {
                Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $text,
                ]);
            } catch (\Exception $e) {
                Log::error("Telegram notification failed: " . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Processed'], 200);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\QuestionLike;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionLikeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_like_question()
    {
        $question = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);

        $response = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");

        $response->assertStatus(200);
        $response->assertJsonPath('likes_count', 1);

        $this->assertDatabaseHas('question_likes', [
            'question_id' => $question->id,
            'ip_address' => '1.2.3.4',
        ]);

        $this->assertEquals(1, $question->fresh()->likes_count);
    }

    public function test_user_cannot_like_question_multiple_times()
    {
        $question = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);

        // First like
        $response1 = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");
        $response1->assertStatus(200);

        // Second like from same IP
        $response2 = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");
        
        $response2->assertStatus(200);
        $response2->assertJsonPath('likes_count', 1); // Should still be 1

        $this->assertEquals(1, $question->fresh()->likes_count);
        $this->assertEquals(1, QuestionLike::count());
    }

    public function test_user_can_unlike_question()
    {
        $question = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);

        // Like first
        $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");

        $this->assertEquals(1, $question->fresh()->likes_count);

        // Travel 2 seconds in time to bypass double-click prevention
        $this->travel(2)->seconds();

        // Unlike
        $response = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/unlike");

        $response->assertStatus(200);
        $response->assertJsonPath('likes_count', 0);

        $this->assertDatabaseMissing('question_likes', [
            'question_id' => $question->id,
            'ip_address' => '1.2.3.4',
        ]);

        $this->assertEquals(0, $question->fresh()->likes_count);
    }

    public function test_different_users_can_like_same_question()
    {
        $question = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);

        // First user likes
        $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");

        // Second user likes
        $this->withServerVariables(['REMOTE_ADDR' => '5.6.7.8'])
            ->postJson("/api/questions/{$question->id}/like");

        $this->assertEquals(2, $question->fresh()->likes_count);
        $this->assertEquals(2, QuestionLike::count());
    }

    public function test_quick_unlike_request_is_ignored()
    {
        $question = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);

        // Like first
        $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/like");

        // Immediately unlike (no time travel)
        $response = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question->id}/unlike");

        $response->assertStatus(200);
        $response->assertJsonPath('likes_count', 1); // Should still be 1 (ignored unlike)
        $this->assertEquals(1, $question->fresh()->likes_count);
    }

    public function test_get_questions_returns_liked_status()
    {
        $question1 = Question::create([
            'id' => 'test-question-1',
            'question' => 'What is the meaning of life?',
            'status' => 'pending',
        ]);
        $question2 = Question::create([
            'id' => 'test-question-2',
            'question' => 'Is this a test?',
            'status' => 'pending',
        ]);

        // Like the first question
        $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->postJson("/api/questions/{$question1->id}/like");

        $response = $this->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->getJson("/api/questions");

        $response->assertStatus(200);
        
        // Assert question 1 is liked
        $this->assertTrue(collect($response->json())->firstWhere('id', $question1->id)['is_liked']);
        // Assert question 2 is not liked
        $this->assertFalse(collect($response->json())->firstWhere('id', $question2->id)['is_liked']);
    }
}

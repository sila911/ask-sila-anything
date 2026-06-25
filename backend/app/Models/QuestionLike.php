<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionLike extends Model
{
    protected $fillable = ['question_id', 'ip_address'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}

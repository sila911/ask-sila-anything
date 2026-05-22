<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Question extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;

    protected $fillable = ['id', 'question', 'status', 'createdAt', 'answeredAt', 'likes_count'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::ulid();
            }
            if (!isset($model->likes_count)) {
                $model->likes_count = 0;
            }
        });
    }

    protected $casts = [
        'createdAt' => 'datetime',
        'answeredAt' => 'datetime',
        'likes_count' => 'integer',
    ];
}

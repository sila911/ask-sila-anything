<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Design extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'id', 'questionId', 'questionText', 'answerText', 
        'text', 'style', 'imageDataUrl', 'createdAt', 'updatedAt', 'stats'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::ulid();
            }
        });
    }

    protected $casts = [
        'style' => 'array',
        'stats' => 'array',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'price',
        'earning_rate',
        'daily_profit',
        'daily_roi_percent',
        'duration',
        'hashrate',
        'badge_text',
        'image_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:8',
        'earning_rate' => 'decimal:8',
        'daily_profit' => 'decimal:8',
        'daily_roi_percent' => 'decimal:2',
        'duration' => 'integer',
    ];

    /**
     * Get only active/published plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

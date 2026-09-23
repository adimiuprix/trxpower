<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiningHistory extends Model
{
    use HasFactory;

    protected $table = 'mining_histories';

    protected $fillable = ['user_id', 'plan_id', 'status', 'last_sum', 'expire_date'];

    protected $casts = ['expire_date' => 'integer', 'last_sum' => 'integer'];
}

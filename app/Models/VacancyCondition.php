<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VacancyCondition extends Model
{
    protected $fillable = ['vacancy_id', 'title', 'description'];
}

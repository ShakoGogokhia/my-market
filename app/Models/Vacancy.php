<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\VacancyRequirement;
use App\Models\VacancyCondition;

class Vacancy extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description'];

    public function requirements()
    {
        return $this->hasMany(VacancyRequirement::class);
    }

    public function workCondition()
    {
        return $this->hasOne(VacancyCondition::class);
    }
}

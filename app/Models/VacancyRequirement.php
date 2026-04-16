<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VacancyRequirement extends Model
{
    protected $fillable = ['title', 'description'];

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class);
    }
}

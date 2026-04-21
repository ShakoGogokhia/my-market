<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'name_en', 'name_ru', 'name_ka', 'icon_path'];

    protected $appends = ['icon_url'];

    public function getIconUrlAttribute(): ?string
    {
        return $this->icon_path ? asset('storage/' . ltrim($this->icon_path, '/')) : null;
    }
}

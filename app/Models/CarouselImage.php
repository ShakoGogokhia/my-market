<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarouselImage extends Model
{
    protected $fillable = [
        'title',
        'image_path',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        $path = ltrim($this->image_path, '/');

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, 'storage/')) {
            return asset($path);
        }

        if (str_starts_with($path, 'carousel-images/')) {
            return asset('storage/' . $path);
        }

        return asset($path);
    }
}

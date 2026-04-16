<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = ['url', 'is_primary'];

    // ───── Relationships ─────
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ───── Accessors ─────
    // Gives you $image->src instead of $image->url
    protected function src(): Attribute
    {
        return Attribute::get(fn () => $this->url);
    }
}

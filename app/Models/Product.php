<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'name',
        'code',
        'price',
        'new_price',
        'in_stock',
        'brand',
        'image',
        'visible',
        'created_at',
        'updated_at',
        'category',
        'warranty',
        'description',
        'cost_price',
        'markup_percent',
        'source',
        'source_system',
        'source_external_id',
    ];

    public function specifications()
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function coverUrl(): ?string
    {
        return $this->images->first()->url
            ?? $this->image
            ?? null;
    }

    public function setCostPriceAttribute($value): void
    {
        $this->attributes['cost_price'] = $value;

        if (!is_null($value)) {
            $markup = $this->attributes['markup_percent'] ?? 18;
            $this->attributes['price'] = round($value * (1 + $markup / 100), 2);
        }
    }

    public function setMarkupPercentAttribute($value): void
    {
        $this->attributes['markup_percent'] = $value;

        if (!is_null($this->attributes['cost_price'])) {
            $this->attributes['price'] = round(
                $this->attributes['cost_price'] * (1 + $value / 100),
                2
            );
        }
    }
    public function categoryRelation()
    {
        return $this->belongsTo(Category::class, 'category', 'name');
    }
}

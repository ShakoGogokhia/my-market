<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreOrder extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'customer_name',
        'customer_email',
        'quantity',
        'customer_phone',
        'note',
        'discount_percent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PromoOwnerCredit extends Model
{
    use HasFactory;

    protected $fillable = [
        'promocode_id',
        'order_id',
        'credited_user_id',
        'credited_amount',
    ];


    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class, 'promocode_id');
    }
    public function index()
    {
        return PromoCode::with(['owner', 'claims', 'credits'])->get();
    }
    public function order()
    {
        return $this->belongsTo(Order::class);
    }


    public function creditedUser()
    {
        return $this->belongsTo(User::class, 'credited_user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'owner_user_id',
        'discount_percent',
        'owner_credit_percent',
    ];
    public function index()
    {
        $promocodes = PromoCode::with(['owner', 'claims', 'credits'])->get();
        
        $promocodes->map(function ($promo) {
            $promo->total_credit = $promo->credits->sum('credited_amount');
            return $promo;
        });
    
        return response()->json($promocodes);
    }
   
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function claims()
    {
        return $this->hasMany(PromoCodeClaim::class);
    }
    public function credits()
    {
        return $this->hasMany(PromoOwnerCredit::class, 'promocode_id');
    }
    public function getTotalCreditAttribute()
{
    return $this->credits->sum('credited_amount');
}
}

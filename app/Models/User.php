<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'admin',
        'mobile_number',
        'registration_type',
        'organization_identification_code',
        'contact_person',
        'organization_location',
        'address',
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'admin' => 'boolean',
        ];
    }

    public function getIsAdminAttribute(): bool
    {
        return (bool) $this->admin;
    }

    public function ownedPromoCodes()
    {
        return $this->hasMany(\App\Models\PromoCode::class, 'owner_user_id');
    }

    public function claimedPromoCodes()
    {
        return $this->belongsToMany(\App\Models\PromoCode::class, 'promo_code_claims', 'user_id', 'promo_code_id')
            ->withTimestamps()
            ->orderByDesc('promo_code_claims.created_at');
    }
    protected $appends = ['applied_promocode'];

    public function getAppliedPromocodeAttribute()
    {
        return $this->claimedPromoCodes()
            ->where('used', 0)
            ->latest('promo_code_claims.created_at')
            ->first();
    }
    public function getAppliedPromocodeCodeAttribute()
    {
        return $this->claimedPromoCodes()->first();
    }
    public function promoCodeClaims()
    {
        return $this->hasMany(\App\Models\PromoCodeClaim::class, 'user_id');
    }
    public function promoCode()
    {
        return $this->hasOne(\App\Models\PromoCode::class, 'owner_user_id');
    }
}

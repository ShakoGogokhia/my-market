<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\PromoCodeClaim;
use Illuminate\Http\Request;

class PromoCodeClaimController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'promo_code_id' => 'required|exists:promo_codes,id',
        ]);

        $existingClaim = PromoCodeClaim::where('user_id', $validated['user_id'])
            ->where('promo_code_id', $validated['promo_code_id'])
            ->first();

        if ($existingClaim) {
            return response()->json(['message' => 'You already claimed this promocode.'], 409);
        }

        $claim = PromoCodeClaim::create($validated);

        return response()->json([
            'message' => 'Promo code claimed successfully',
            'claim' => $claim
        ]);
    }
    public function totalCredits()
    {
        $totalCredits = \App\Models\PromoOwnerCredit::sum('credited_amount');
        return response()->json($totalCredits);
    }
}

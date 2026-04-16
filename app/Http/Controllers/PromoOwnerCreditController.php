<?php

namespace App\Http\Controllers;

use App\Models\PromoOwnerCredit;
use Illuminate\Http\Request;

class PromoOwnerCreditController extends Controller
{
    public function index()
    {
        return PromoOwnerCredit::with(['promoCode', 'order', 'creditedUser'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'promocode_id' => 'required|exists:promo_codes,id',
            'order_id' => 'required|exists:orders,id',
            'credited_user_id' => 'required|exists:users,id',
            'credited_amount' => 'required|numeric',
        ]);

        return PromoOwnerCredit::create($validated);
    }

    public function destroy($id)
    {
        $credit = PromoOwnerCredit::findOrFail($id);
        $credit->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}

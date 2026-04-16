<?php

namespace App\Http\Controllers;


use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\PromoCodeClaim;
use Inertia\Inertia;
use App\Models\PromoOwnerCredit;
use Carbon\Carbon;


class PromoCodeController extends Controller
{

    public function index()
    {
        $oneMonthAgo = Carbon::now()->subMonth();
        $promocodes = PromoCode::with(['owner', 'credits'])->get();

        $promocodes->map(function ($promo) use ($oneMonthAgo) {
            $recentCredits = $promo->credits->filter(function ($credit) use ($oneMonthAgo) {
                return $credit->created_at >= $oneMonthAgo;
            });
            $promo->total_credit = $recentCredits->sum('amount');
            $promo->setRelation('credits', $recentCredits);

            return $promo;
        });

        return response()->json($promocodes);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promo_codes,code',
            'owner_user_id' => 'required|exists:users,id',
            'discount_percent' => 'required|numeric|min:0|max:50',
            'owner_credit_percent' => 'required|numeric|min:0|max:50',
        ]);

        $promoCode = PromoCode::create($validated);

        return redirect()->route('admin.promocodes.index')->with('success', 'Promocode created successfully');
    }

    public function destroy($id)
    {
        $promoCode = PromoCode::findOrFail($id);
        PromoOwnerCredit::where('promocode_id', $id)->delete();
        $promoCode->delete();

        return response()->json(['message' => 'Promocode deleted successfully']);
    }

    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'მომხმარებელი არ არის ავტორიზებული'], 401);
        }

        $promo = PromoCode::where('code', $request->code)->first();
        if (!$promo) {
            return response()->json(['message' => 'პრომოკოდი არ მოიძებნა'], 404);
        }

        $alreadyUsed = PromoCodeClaim::where('user_id', $user->id)
            ->where('promo_code_id', $promo->id)
            ->exists();

        if ($alreadyUsed) {
            return response()->json(['message' => 'პრომოკოდი უკვე გამოყენებულია'], 409);
        }


        $cartTotal = 100;
        $discountAmount = round($cartTotal * ($promo->discount_percent / 100), 2);
        $ownerCreditAmount = round($cartTotal * ($promo->owner_credit_percent / 100), 2);


        PromoCodeClaim::create([
            'promo_code_id' => $promo->id,
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'owner_credit_amount' => $ownerCreditAmount,
            'user_discount_amount' => $discountAmount,
        ]);

        return response()->json([
            'message' => 'პრომოკოდი წარმატებით გამოყენებულია',
            'discount_percent' => $promo->discount_percent,
            'discounted_amount' => $discountAmount,
            'owner_credit_amount' => $ownerCreditAmount,
        ]);
    }


    public function adminPage()
    {
        return Inertia::render('admin/promocodes', [
            'promocodes' => PromoCode::with(['owner', 'claims'])->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'codes' => 'required|array|min:1',
            'codes.*.code' => 'required|string|distinct|unique:promo_codes,code',
            'codes.*.owner_user_id' => 'required|exists:users,id',
            'codes.*.discount_percent' => 'required|numeric|min:0|max:50',
            'codes.*.owner_credit_percent' => 'required|numeric|min:0|max:50',
        ]);

        foreach ($validated['codes'] as $codeData) {
            PromoCode::create($codeData);
        }

        return response()->json([
            'message' => 'Bulk promocodes created.',
            'count' => count($validated['codes']),
        ], 201);
    }
    public function getPromoCredits()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Calculate the total owner credits for the authenticated user
        $totalCredits = PromoOwnerCredit::where('credited_user_id', $user->id)
            ->sum('credited_amount');


        return response()->json([
            'promo_credits' => $totalCredits,
        ]);
    }


}

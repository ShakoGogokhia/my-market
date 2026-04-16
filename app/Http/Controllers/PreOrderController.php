<?php

namespace App\Http\Controllers;

use App\Models\PreOrder;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;

class PreOrderController extends Controller
{
    /**
     * Store a new pre-order request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'note' => 'nullable|string|max:1000',
            'quantity' => 'required|integer|min:1',

        ]);
        $discountPercent = 5;

        $product = Product::findOrFail($validated['product_id']);

        if ((int) $product->in_stock > 0) {
            return response()->json([
                'message' => 'პროდუქტი საწყობშია და წინასწარი შეკვეთა საჭირო არ არის.'
            ], 400);
        }

        $existingPreOrder = PreOrder::where('user_id', Auth::id())
            ->where('product_id', $validated['product_id'])
            ->latest()
            ->first();

        if ($existingPreOrder) {
            return response()->json([
                'message' => 'თქვენ ამ პროდუქტზე უკვე გააკეთეთ წინასწარი შეკვეთა.'
            ], 409);
        }

        $preOrder = \App\Models\PreOrder::create([
            'user_id' => Auth::id(),
            'product_id' => $validated['product_id'],
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'note' => $validated['note'],
            'quantity' => $validated['quantity'],
            'discount_percent' => $discountPercent,
        ]);

        return response()->json([
            'message' => 'წინასწარი შეკვეთა მიღებულია!',
            'pre_order' => $preOrder,
        ], 201);
    }

    /**
     * Admin view of all pre-orders (optional)
     */
    public function index()
    {
        $preOrders = PreOrder::with('product', 'user')->latest()->get();

        return Inertia::render('admin/preOrders', [
            'preOrders' => $preOrders
        ]);
    }

    /**
     * Optional: Show a single preorder
     */
    public function show($id)
    {
        $preOrder = PreOrder::with('product', 'user')->find($id);

        if (!$preOrder) {
            return response()->json(['message' => 'Pre‑order not found'], 404);
        }

        return response()->json($preOrder);
    }

    /**
     * Optional: Delete a preorder (admin use)
     */
    public function destroy($id)
    {
        $preOrder = PreOrder::find($id);

        if (!$preOrder) {
            return response()->json(['message' => 'Pre‑order not found'], 404);
        }

        $preOrder->delete();

        return response()->json(['message' => 'წინასწარი შეკვეთა წაიშალა წარმატებით']);
    }
}

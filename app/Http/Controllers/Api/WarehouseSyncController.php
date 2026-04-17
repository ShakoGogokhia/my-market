<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseSyncController extends Controller
{
    public function upsert(Request $request): JsonResponse
    {
        $expectedToken = (string) config('services.warehouse_sync.token', '');

        if ($expectedToken === '') {
            return response()->json([
                'success' => false,
                'message' => 'Warehouse sync token is not configured.',
            ], 500);
        }

        $incomingToken = (string) $request->header('X-Warehouse-Sync-Token', $request->bearerToken());

        if ($incomingToken === '' || !hash_equals($expectedToken, $incomingToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $validated = $request->validate([
            'source_system' => ['nullable', 'string', 'max:64'],
            'source_external_id' => ['required', 'string', 'max:128'],
            'unique_number' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:1024'],
            'unit' => ['nullable', 'string', 'max:255'],
            'incomming_quantity' => ['nullable', 'numeric', 'min:0'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'warehouse_name' => ['nullable', 'string', 'max:255'],
            'warehouse_id' => ['nullable'],
            'image_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $sourceSystem = $validated['source_system'] ?? 'billing';
        $sourceExternalId = (string) $validated['source_external_id'];
        $quantity = (float) ($validated['incomming_quantity'] ?? 0);
        $amount = (float) ($validated['amount'] ?? 0);
        $price = $quantity > 0 ? round($amount / max($quantity, 1), 2) : round($amount, 2);
        $categoryName = 'Warehouse';

        Category::firstOrCreate(['name' => $categoryName]);

        $product = Product::firstOrNew([
            'source_system' => $sourceSystem,
            'source_external_id' => $sourceExternalId,
        ]);

        $isNew = !$product->exists;

        $product->name = $validated['name'];
        $product->code = 'WH-' . preg_replace('/\s+/', '-', trim((string) $validated['unique_number']));
        $product->price = $price;
        $product->new_price = null;
        $product->in_stock = (int) round($quantity);
        $product->source = 'warehouse';
        $product->source_system = $sourceSystem;
        $product->source_external_id = $sourceExternalId;
        $product->visible = false;

        if ($isNew || blank($product->category)) {
            $product->category = $categoryName;
        }

        if (!blank($validated['image_url'] ?? null)) {
            $product->image = $validated['image_url'];
        }

        $product->save();

        return response()->json([
            'success' => true,
            'message' => $isNew ? 'Warehouse product created.' : 'Warehouse product updated.',
            'data' => $product->fresh()->load('images'),
        ]);
    }
}

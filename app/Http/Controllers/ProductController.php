<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\PromoCodeClaim;
use App\Models\PreOrder;
use App\Models\Category;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\ProductBackInStock;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private function syncImages(Request $request, Product $product): void
    {
        $keepImages = collect(json_decode($request->input('keep_images', '[]'), true))
            ->flatten()
            ->filter(fn($url) => is_string($url) && trim($url) !== '')
            ->values()
            ->all();

        $newFileUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("products/{$product->id}", 'public');
                $url = asset("storage/{$path}");
                $newFileUrls[] = $url;

                $product->images()->create([
                    'url' => $url,
                    'is_primary' => false,
                ]);
            }
        }

        $externalUrls = collect(json_decode($request->input('externalImages', '[]'), true))
            ->flatten()
            ->filter(fn($url) => is_string($url) && trim($url) !== '')
            ->each(function ($url) use ($product) {
                $product->images()->create([
                    'url' => $url,
                    'is_primary' => false,
                ]);
            })
            ->values()
            ->all();

        $finalUrls = collect($keepImages)
            ->merge($newFileUrls)
            ->merge($externalUrls)
            ->flatten()
            ->unique()
            ->values()
            ->all();
        $product->images()
            ->whereNotIn('url', $finalUrls)
            ->delete();

        if (!empty($finalUrls)) {
            $product->images()->update(['is_primary' => false]);
            $product->images()
                ->where('url', $finalUrls[0])
                ->update(['is_primary' => true]);
        }
    }



    public function index(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user && $user->admin;

        $promo = $user
            ? PromoCodeClaim::where('user_id', $user->id)->latest()->first()
            : null;

        $userDiscountPercent = ($promo && !$promo->promoCode->used)
            ? ($promo->user_discount_amount ?? 0)
            : 0;


        $query = Product::with(['images', 'specifications']);

        if (!$isAdmin) {
            $query->where('visible', true);
        }


        if ($request->has('category') && !empty($request->get('category'))) {
            $query->where('category', $request->get('category'));
        }


        $allProducts = $query->get()->map(function ($product) use ($user, $userDiscountPercent) {
            $discount = 0;
            $appliedPromoCode = false;
            $appliedPreOrderDiscount = false;
            $alreadyPreOrdered = false;

            $preOrder = null;
            if ($user) {
                $preOrder = PreOrder::where('user_id', $user->id)
                    ->where('product_id', $product->id)
                    ->latest()
                    ->first();
            }
            if ($preOrder) {
                $alreadyPreOrdered = true;
            }

            if ($userDiscountPercent > 0 && $product->price >= 20) {
                $discount = $userDiscountPercent;
                $appliedPromoCode = true;
            } elseif ($preOrder && $preOrder->discount_percent > 0) {
                $discount = $preOrder->discount_percent;
                $appliedPreOrderDiscount = true;
            } elseif ($product->in_stock <= 0) {
                $discount = 5;
                $appliedPreOrderDiscount = true;
            } else {
                $discount = $product->discount_percent ?? 0;
            }

            $product->discounted_price = round($product->price * (1 - $discount / 100), 2);
            $product->applied_promocode = $appliedPromoCode;
            $product->pre_order_discount_applied = $appliedPreOrderDiscount;
            $product->already_preordered = $alreadyPreOrdered;

            return $product;
        });


        $grouped = $allProducts->groupBy('name')->map(function ($group) {
            return $group->first()->toArray() + ['total_in_stock' => $group->sum('in_stock')];
        })->values();

        if ($request->expectsJson()) {
            return response()->json([
                'products' => $allProducts,
                'grouped' => $grouped,
            ]);
        }

        abort(403, 'Access denied.');
    }





    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100|unique:products,code',
            'cost_price' => 'nullable|numeric|min:0',
            'markup_percent' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'new_price' => 'nullable|numeric',
            'in_stock' => 'integer',
            'brand' => 'string|max:255',
            'visible' => 'nullable|boolean',
            'warranty' => 'required|string|max:100',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'images' => 'array',
            'images.*' => 'file|image|max:10240',
        ]);

        if (blank($validated['new_price'] ?? null)) {
            $validated['new_price'] = null;
        }
        $categoryName = trim($validated['category']);
        if (!Category::where('name', $categoryName)->exists()) {
            Category::create(['name' => $categoryName]);
        }

        if (!isset($validated['markup_percent'])) {
            $validated['markup_percent'] = 18;
        }

        $product = Product::create($validated);
        $this->syncImages($request, $product);

        foreach ((array) json_decode($request->input('specifications', '[]'), true) as $spec) {
            if (!empty($spec['key']) && !empty($spec['value'])) {
                $product->specifications()->create($spec);
            }
        }

        return response()->json($product->load('images'), 201);
    }


    public function adminUpdate(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|string|max:100',
            'cost_price' => 'nullable|numeric|min:0',
            'markup_percent' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'new_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'in_stock' => 'nullable|integer',
            'brand' => 'string',
            'visible' => 'sometimes|required|boolean',
            'warranty' => 'nullable|string',
            'category' => 'nullable|string',

            'images' => 'array',
            'images.*' => 'file|image|max:10240',
        ]);

        if (!empty($validated['category'])) {
            $categoryName = trim($validated['category']);
            if (!Category::where('name', $categoryName)->exists()) {
                Category::create(['name' => $categoryName]);
            }
        }
        if (blank($validated['new_price'] ?? null)) {
            $validated['new_price'] = null;
        }

        if (!isset($validated['markup_percent'])) {
            $validated['markup_percent'] = 18;
        }

        $product->update($validated);
        $this->syncImages($request, $product);
        $product->specifications()->delete();

        $specs = (array) json_decode($request->input('specifications', '[]'), true);
        foreach ($specs as $spec) {
            if (!empty($spec['key']) && !empty($spec['value'])) {
                $product->specifications()->create([
                    'key' => $spec['key'],
                    'value' => $spec['value'],
                ]);
            }
        }
        if ($product->in_stock > 0) {
            $preOrders = PreOrder::where('product_id', $product->id)->get();

            foreach ($preOrders as $preOrder) {
                \Log::info('Sending email to: ' . $preOrder->customer_email);
                if ($preOrder->customer_email) {
                    Mail::to($preOrder->customer_email)->send(new ProductBackInStock($product));
                }

            }
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load('images'),
        ]);
    }
    public function updateVisibility(Request $request, Product $product)
    {
        $validated = $request->validate([
            'visible' => ['required', 'boolean'],
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Visibility updated successfully',
            'visible' => $product->visible,
        ]);
    }




    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'პროდუქტი წაიშალა წარმატებით']);
    }


    public function show($id)
    {
        $product = Product::with(['specifications', 'images'])->findOrFail($id);
        $user = Auth::user();

        $discount = 0;
        $appliedPromoCode = false;
        $appliedPreOrderDiscount = false;
        $alreadyPreOrdered = false;

        $promo = $user
            ? PromoCodeClaim::where('user_id', $user->id)->latest()->first()
            : null;

        $preOrder = null;
        if ($user) {
            $preOrder = PreOrder::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->latest()
                ->first();
        }
        if ($preOrder) {
            $alreadyPreOrdered = true;
        }


        if ($promo && !$promo->promoCode->used && $product->price >= 20) {
            $discount = $promo->user_discount_amount ?? 0;
            $appliedPromoCode = true;
        } elseif ($preOrder && $preOrder->discount_percent > 0) {
            $discount = $preOrder->discount_percent;
            $appliedPreOrderDiscount = true;
        } elseif ($product->in_stock <= 0) {
            $discount = 5;
            $appliedPreOrderDiscount = true;
        } else {
            $discount = $product->discount_percent ?? 0;
        }

        $product->discounted_price = round($product->price * (1 - $discount / 100), 2);
        $product->applied_promocode = $appliedPromoCode;
        $product->pre_order_discount_applied = $appliedPreOrderDiscount;
        $product->already_preordered = $alreadyPreOrdered;

        return Inertia::render('HeaderProducts/ProductDetails', [
            'product' => $product,
        ]);
    }
    public function updateCategory(Request $request, $productId)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
        ]);

        $product = Product::findOrFail($productId);
        $product->category = trim($validated['category']);
        $product->save();

        return response()->json([
            'message' => 'Product category updated successfully!',
            'product' => $product,
        ]);
    }
}

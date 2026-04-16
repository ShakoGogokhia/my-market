<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {

        return response()->json([
            'categories' => Category::orderBy('name', 'asc')->pluck('name')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create(['name' => trim($validated['name'])]);

        $categories = Category::orderBy('name', 'asc')->pluck('name');

        return response()->json([
            'message' => 'კატეგორია დაემატა წარმატებით',
            'category' => $category,
            'categories' => $categories
        ], 201);
    }

    public function update(Request $request, $category)
    {
        $decoded = urldecode($category);
        $existingCategory = Category::where('name', $decoded)->first();

        if (!$existingCategory) {
            return response()->json([
                'message' => "Category '{$decoded}' not found"
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $existingCategory->id,
        ]);

        $existingCategory->update(['name' => trim($validated['name'])]);

        $categories = Category::orderBy('name', 'asc')->pluck('name');

        return response()->json([
            'message' => 'კატეგორია განახლდა წარმატებით',
            'category' => $existingCategory,
            'categories' => $categories
        ]);
    }

    public function destroy($category)
    {
        $decoded = urldecode($category);
        $existingCategory = Category::where('name', $decoded)->first();

        if (!$existingCategory) {
            return response()->json([
                'message' => "Category '{$decoded}' not found"
            ], 404);
        }

        $existingCategory->delete();

        $categories = Category::orderBy('name', 'asc')->pluck('name');

        return response()->json([
            'message' => 'კატეგორია წაიშალა წარმატებით',
            'categories' => $categories
        ]);

    }
    public function categoriesWithCount()
    {
        $counts = \DB::table('products')
            ->select('category', \DB::raw('COUNT(*) as total'))
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $categories = Category::orderBy('name', 'asc')->get()->map(function ($cat) use ($counts) {
            return [
                'name' => $cat->name,
                'total' => $counts[$cat->name]->total ?? 0,
            ];
        });

        return response()->json([
            'categories' => $categories
        ]);
    }

}

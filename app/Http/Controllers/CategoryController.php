<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    private function normalizeTranslation(?string $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function categoryPayload(Category $category): array
    {
        return [
            'name' => $category->name,
            'name_en' => $category->name_en ?? $category->name,
            'name_ru' => $category->name_ru,
            'name_ka' => $category->name_ka,
            'icon_url' => $category->icon_url,
        ];
    }

    public function index()
    {
        return response()->json([
            'categories' => Category::orderBy('name', 'asc')->get()->map(fn (Category $category) => $this->categoryPayload($category))->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'name_en' => 'nullable|string|max:255',
            'name_ru' => 'nullable|string|max:255',
            'name_ka' => 'nullable|string|max:255',
            'icon' => 'nullable|image|max:4096',
        ]);

        $name = trim($validated['name']);
        $nameEn = $this->normalizeTranslation($validated['name_en'] ?? null) ?? $name;
        $nameRu = $this->normalizeTranslation($validated['name_ru'] ?? null);
        $nameKa = $this->normalizeTranslation($validated['name_ka'] ?? null);

        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('categories', 'public');
        }

        $category = Category::create([
            'name' => $name,
            'name_en' => $nameEn,
            'name_ru' => $nameRu,
            'name_ka' => $nameKa,
            'icon_path' => $iconPath,
        ]);

        return response()->json([
            'message' => 'áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ áƒ“áƒáƒ”áƒ›áƒáƒ¢áƒ áƒ¬áƒáƒ áƒ›áƒáƒ¢áƒ”áƒ‘áƒ˜áƒ—',
            'category' => $this->categoryPayload($category),
            'categories' => Category::orderBy('name', 'asc')->get()->map(fn (Category $item) => $this->categoryPayload($item))->values(),
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
            'name_en' => 'nullable|string|max:255',
            'name_ru' => 'nullable|string|max:255',
            'name_ka' => 'nullable|string|max:255',
            'icon' => 'nullable|image|max:4096',
        ]);

        $name = trim($validated['name']);
        $nameEn = $this->normalizeTranslation($validated['name_en'] ?? null) ?? $name;
        $nameRu = $this->normalizeTranslation($validated['name_ru'] ?? null);
        $nameKa = $this->normalizeTranslation($validated['name_ka'] ?? null);

        $iconPath = $existingCategory->icon_path;
        if ($request->hasFile('icon')) {
            if ($existingCategory->icon_path) {
                Storage::disk('public')->delete($existingCategory->icon_path);
            }

            $iconPath = $request->file('icon')->store('categories', 'public');
        }

        $existingCategory->update([
            'name' => $name,
            'name_en' => $nameEn,
            'name_ru' => $nameRu,
            'name_ka' => $nameKa,
            'icon_path' => $iconPath,
        ]);

        return response()->json([
            'message' => 'áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ áƒ’áƒáƒœáƒáƒ®áƒšáƒ“áƒ áƒ¬áƒáƒ áƒ›áƒáƒ¢áƒ”áƒ‘áƒ˜áƒ—',
            'category' => $this->categoryPayload($existingCategory->fresh()),
            'categories' => Category::orderBy('name', 'asc')->get()->map(fn (Category $item) => $this->categoryPayload($item))->values(),
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

        if ($existingCategory->icon_path) {
            Storage::disk('public')->delete($existingCategory->icon_path);
        }

        $existingCategory->delete();

        return response()->json([
            'message' => 'áƒ™áƒáƒ¢áƒ”áƒ’áƒáƒ áƒ˜áƒ áƒ¬áƒáƒ˜áƒ¨áƒáƒšáƒ áƒ¬áƒáƒ áƒ›áƒáƒ¢áƒ”áƒ‘áƒ˜áƒ—',
            'categories' => Category::orderBy('name', 'asc')->get()->map(fn (Category $item) => $this->categoryPayload($item))->values(),
        ]);
    }

    public function categoriesWithCount()
    {
        $counts = \DB::table('products')
            ->select('category', \DB::raw('COUNT(*) as total'))
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $categories = Category::orderBy('name', 'asc')->get()->map(function (Category $cat) use ($counts) {
            return [
                'name' => $cat->name,
                'name_en' => $cat->name_en ?? $cat->name,
                'name_ru' => $cat->name_ru,
                'name_ka' => $cat->name_ka,
                'total' => $counts[$cat->name]->total ?? 0,
                'icon_url' => $cat->icon_url,
            ];
        });

        return response()->json([
            'categories' => $categories
        ]);
    }
}

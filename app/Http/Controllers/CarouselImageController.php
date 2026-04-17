<?php

namespace App\Http\Controllers;

use App\Models\CarouselImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CarouselImageController extends Controller
{
    private function payload(CarouselImage $image): array
    {
        return [
            'id' => $image->id,
            'title' => $image->title,
            'image_url' => $image->image_url,
            'sort_order' => $image->sort_order,
            'active' => $image->active,
            'created_at' => $image->created_at?->toDateTimeString(),
            'updated_at' => $image->updated_at?->toDateTimeString(),
        ];
    }

    public function index()
    {
        return response()->json([
            'carousel_images' => CarouselImage::query()
                ->where('active', true)
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get()
                ->map(fn (CarouselImage $image) => $this->payload($image))
                ->values(),
        ]);
    }

    public function adminIndex()
    {
        return response()->json([
            'carousel_images' => CarouselImage::query()
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get()
                ->map(fn (CarouselImage $image) => $this->payload($image))
                ->values(),
        ]);
    }

    public function adminPage()
    {
        return Inertia::render('admin/CarouselManager');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|max:10240',
            'sort_order' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);

        $path = $request->file('image')->store('carousel-images', 'public');

        $image = CarouselImage::create([
            'title' => $validated['title'] ?? null,
            'image_path' => $path,
            'sort_order' => $validated['sort_order'] ?? 0,
            'active' => array_key_exists('active', $validated) ? (bool) $validated['active'] : true,
        ]);

        return response()->json([
            'message' => 'Carousel image created.',
            'carousel_image' => $this->payload($image),
            'carousel_images' => CarouselImage::orderBy('sort_order')->orderByDesc('id')->get()->map(fn (CarouselImage $item) => $this->payload($item))->values(),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $image = CarouselImage::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:10240',
            'sort_order' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($image->image_path) {
                if (str_starts_with(ltrim($image->image_path, '/'), 'carousel-images/')) {
                    Storage::disk('public')->delete($image->image_path);
                }
            }
            $image->image_path = $request->file('image')->store('carousel-images', 'public');
        }

        if (array_key_exists('title', $validated)) {
            $image->title = $validated['title'];
        }
        if (array_key_exists('sort_order', $validated)) {
            $image->sort_order = (int) $validated['sort_order'];
        }
        if (array_key_exists('active', $validated)) {
            $image->active = (bool) $validated['active'];
        }

        $image->save();

        return response()->json([
            'message' => 'Carousel image updated.',
            'carousel_image' => $this->payload($image),
            'carousel_images' => CarouselImage::orderBy('sort_order')->orderByDesc('id')->get()->map(fn (CarouselImage $item) => $this->payload($item))->values(),
        ]);
    }

    public function destroy($id)
    {
        $image = CarouselImage::findOrFail($id);

        if ($image->image_path) {
            if (str_starts_with(ltrim($image->image_path, '/'), 'carousel-images/')) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $image->delete();

        return response()->json([
            'message' => 'Carousel image deleted.',
            'carousel_images' => CarouselImage::orderBy('sort_order')->orderByDesc('id')->get()->map(fn (CarouselImage $item) => $this->payload($item))->values(),
        ]);
    }
}

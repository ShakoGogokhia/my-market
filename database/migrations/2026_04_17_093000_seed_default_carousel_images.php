<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $count = DB::table('carousel_images')->count();

        if ($count > 0) {
            return;
        }

        $defaults = [
            ['title' => 'Welcome Slide 1', 'image_path' => 'images/CarouselIMG/generalis-webiscover.jpg', 'sort_order' => 0],
            ['title' => 'Welcome Slide 2', 'image_path' => 'images/CarouselIMG/mymarketis-cover-1.jpg', 'sort_order' => 1],
            ['title' => 'Welcome Slide 3', 'image_path' => 'images/CarouselIMG/generalis-3-coveri-chasasmeli.jpg', 'sort_order' => 2],
            ['title' => 'Welcome Slide 4', 'image_path' => 'images/CarouselIMG/generalis-meore-coveri-chasasmeli.jpg', 'sort_order' => 3],
            ['title' => 'Welcome Slide 5', 'image_path' => 'images/CarouselIMG/coveri-magalixarisxit.jpg', 'sort_order' => 4],
        ];

        $now = now();

        DB::table('carousel_images')->insert(array_map(static function (array $row) use ($now) {
            return [
                'title' => $row['title'],
                'image_path' => $row['image_path'],
                'sort_order' => $row['sort_order'],
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $defaults));
    }

    public function down(): void
    {
        DB::table('carousel_images')
            ->whereIn('image_path', [
                'images/CarouselIMG/generalis-webiscover.jpg',
                'images/CarouselIMG/mymarketis-cover-1.jpg',
                'images/CarouselIMG/generalis-3-coveri-chasasmeli.jpg',
                'images/CarouselIMG/generalis-meore-coveri-chasasmeli.jpg',
                'images/CarouselIMG/coveri-magalixarisxit.jpg',
            ])
            ->delete();
    }
};

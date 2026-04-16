<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class FetchProductImages extends Command
{
    protected $signature = 'products:fetch-images';
    protected $description = 'Fetch and fill product images from an image API';

    public function handle()
    {
        $products = DB::table('products')->get();
        foreach ($products as $p) {
            $query = urlencode($p->name);
            $res = Http::withHeaders([
                'Ocp-Apim-Subscription-Key' => config('services.bing.key'),
            ])->get("https://api.bing.microsoft.com/v7.0/images/search?q={$query}&count=1");

            if (isset($res['value'][0]['contentUrl'])) {
                DB::table('products')
                  ->where('id', $p->id)
                  ->update(['image' => $res['value'][0]['contentUrl']]);
                $this->info("Updated {$p->code}");
            } else {
                $this->warn("No image for {$p->code}");
            }
        }
    }
}

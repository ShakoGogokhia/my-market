<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BillingWarehouseService
{
    public function items(): array
    {
        $baseUrl = rtrim((string) config('services.billing_warehouse.url', ''), '/');
        $token = (string) config('services.billing_warehouse.token', '');

        if ($baseUrl === '' || $token === '') {
            return [];
        }

        try {
            $response = Http::timeout((int) config('services.billing_warehouse.timeout', 10))
                ->withHeaders([
                    'X-Warehouse-Token' => $token,
                    'Accept' => 'application/json',
                ])
                ->get($baseUrl . '/api/warehouse/items');

            if (!$response->successful()) {
                Log::warning('Billing warehouse export request failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            }

            return (array) data_get($response->json(), 'data', []);
        } catch (\Throwable $e) {
            Log::warning('Billing warehouse export exception.', [
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }
}

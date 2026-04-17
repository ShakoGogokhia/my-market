<?php

namespace App\Http\Controllers;

use App\Services\BillingWarehouseService;
use Illuminate\Http\JsonResponse;

class WarehouseInventoryController extends Controller
{
    public function index(BillingWarehouseService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service->items(),
        ]);
    }
}

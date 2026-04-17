<?php

use App\Http\Controllers\Api\WarehouseSyncController;
use Illuminate\Support\Facades\Route;

Route::post('/warehouse/sync-item', [WarehouseSyncController::class, 'upsert']);

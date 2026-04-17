<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\VacancyController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\ProgramOrderController;
use App\Http\Controllers\PreOrderController;
use App\Http\Controllers\WarehouseInventoryController;
use Illuminate\Auth\Middleware\Authenticate;
use App\Http\Middleware\AdminMiddleware;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Mail;
use App\Mail\GmailTestMail;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CarouselImageController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/admin/warehouse-items', [WarehouseInventoryController::class, 'index'])->name('admin.warehouse-items.index');
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'adminUpdate']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
    Route::put('/admin/products/{product}/visibility', [ProductController::class, 'updateVisibility']);
    Route::get('/admin/CategoryManager', function () {
        return Inertia::render('admin/CategoryManager');
    });
    Route::get('/admin/carousel-images', [CarouselImageController::class, 'adminPage'])->name('admin.carousel-images.index');
    Route::get('/admin/carousel-images/list', [CarouselImageController::class, 'adminIndex'])->name('admin.carousel-images.list');
    Route::post('/admin/carousel-images', [CarouselImageController::class, 'store']);
    Route::put('/admin/carousel-images/{id}', [CarouselImageController::class, 'update']);
    Route::delete('/admin/carousel-images/{id}', [CarouselImageController::class, 'destroy']);
    Route::get('/admin/pre-orders', [PreOrderController::class, 'index'])->name('admin.preorders.index');
    Route::get('/admin/pre-orders/{id}', [PreOrderController::class, 'show'])->name('admin.preorders.show');
    Route::delete('/admin/pre-orders/{id}', [PreOrderController::class, 'destroy'])->name('admin.preorders.destroy');
    Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
    Route::get('admin/orders/{orderId}/items', [OrderController::class, 'getOrderItems']);
    Route::put('/admin/orders/{id}/accept', [OrderController::class, 'accept'])->name('admin.orders.accept');
    Route::put('/admin/orders/{id}/decline', [OrderController::class, 'decline'])->name('admin.orders.decline');
    Route::put('/admin/orders/{id}', [OrderController::class, 'update'])->name('admin.orders.update');
    Route::get('/admin/vacancies', [VacancyController::class, 'index']);
    Route::post('/admin/vacancies', [VacancyController::class, 'store']);
    Route::put('/admin/vacancies/{id}', [VacancyController::class, 'update']);
    Route::delete('/admin/vacancies/{id}', [VacancyController::class, 'destroy']);
    Route::get('/admin/promocodes', [PromoCodeController::class, 'adminPage'])->name('admin.promocodes.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/user/orders', [OrderController::class, 'index']);
    Route::delete('/user/orders/{id}', [OrderController::class, 'destroy']);
});

// Product Routes
Route::prefix('/admin/products')->group(function () {
    Route::get('/', function () {
        abort(404);
    });

    Route::get('/{any}', function () {
        abort(404);
    })->where('any', '.*');
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}/{name}', [ProductController::class, 'show'])
    ->name('products.show');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/categories-with-count', [CategoryController::class, 'categoriesWithCount']);
Route::get('/carousel-images', [CarouselImageController::class, 'index']);


Route::put('/products/{product}/category', [ProductController::class, 'updateCategory']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{category}', [CategoryController::class, 'update']);
Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);







//preOrder Route
Route::post('/pre-orders', [PreOrderController::class, 'store'])->name('preorders.store');


// Order Routes
Route::post('/place-order', [OrderController::class, 'placeOrder']);

// Cart Routes
Route::post('/cart/save', [CartController::class, 'save']);
Route::get('/cart/load', [CartController::class, 'load']);

// User Routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Vacancy Routes

// Promocodes
Route::get('/promo-codes', [PromoCodeController::class, 'index']);
Route::post('/promo-codes', [PromoCodeController::class, 'store']);
Route::delete('/promo-codes/{id}', [PromoCodeController::class, 'destroy']);
Route::post('/promo-code-claims', [PromoCodeClaimController::class, 'store']);
Route::post('/apply-promocode', [PromoCodeController::class, 'apply']);
Route::post('/promo-codes/bulk', [PromoCodeController::class, 'bulkStore']);
Route::get('/promo-credits', [PromoCodeController::class, 'getPromoCredits']);

//Warranty Check
Route::get('/products/code/{code}', function ($code) {
    $product = \App\Models\Product::where('code', $code)->first();
    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }
    return response()->json($product);
});

//proggrames
Route::post('/send-program-order', [ProgramOrderController::class, 'sendProgramOrder']);

//PAGES
Route::get('/product', function () {
    return Inertia::render('HeaderProducts/energyProduct');
});
Route::get('/company', function () {
    return Inertia::render('HeaderProducts/Company');
});
Route::get('/contact', function () {
    return Inertia::render('HeaderProducts/Contact');
});
Route::get('/payment', function () {
    return Inertia::render('HeaderProducts/PaymantTerm');
});
Route::get('/vacansy', function () {
    return Inertia::render('HeaderProducts/Vacansy');
});
Route::get('/warranty', function () {
    return Inertia::render('authComponents/warranty');
});
Route::get('/cart', function () {
    return Inertia::render('HeaderProducts/Cart');
});

Route::get('/login', function () {
    return Inertia::render('auth/login');
});

Route::get('/register', function () {
    return Inertia::render('auth/register');
});
Route::get('/currentorders', function () {
    return Inertia::render('authComponents/currentOrders');
});
Route::get('/complatedorders', function () {
    return Inertia::render('authComponents/completeOrders');
});

Route::get('/promocode', function () {
    return Inertia::render('authComponents/promoCode');
});
Route::get('/personalinformation', function () {
    return Inertia::render('authComponents/userProfile');
});
Route::get('/changepassword', function () {
    return Inertia::render('authComponents/userPassword');
});
Route::get('/ProductDetails', function () {
    return Inertia::render('HeaderProducts/ProductDetails');
});

Route::get('/Programs', function () {
    return Inertia::render('HeaderProducts/ProgramsPage');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

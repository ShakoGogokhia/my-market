
<?php


use App\Models\YourModel; 
use Illuminate\Http\Request;

Route::get('/your-endpoint', function () {
    $data = YourModel::all(); 
    return response()->json($data); 
});

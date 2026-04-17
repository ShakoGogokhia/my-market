<?php
namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use App\Models\Product;
use App\Mail\OrderAccepted;
use App\Mail\OrderAcceptedUser;
use Twilio\Rest\Client;
use App\Models\PromoCodeClaim;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;



class OrderController extends Controller
{
    public function placeOrder(Request $request)
    {

        // $apiToken = '296|zUqTlCF42MiJ7f2eT56xYmxvea76nyoyfAzL2ABDd6a5dda2';
        // $apiUrl = 'https://smsservice.inexphone.ge/api/v1/sms/one';

        // $number = '599362908';
        // $sender = 'AIRLINK';
        // $message = 'ახალი შეკვეთა';

        // $payload = [
        //     'phone' => $number,
        //     'subject' => $sender,
        //     'message' => $message,
        // ];

        // $ch = curl_init($apiUrl);
        // curl_setopt_array($ch, [
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_HTTPHEADER => [
        //         'Accept: application/json',
        //         'Content-Type: application/json',
        //         'Authorization: Bearer ' . $apiToken,
        //     ],
        //     CURLOPT_POST => true,
        //     CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        // ]);

        // $response = curl_exec($ch);
        // $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        // $curlError = curl_error($ch);
        // curl_close($ch);


        // if ($curlError) {
        //     \Log::error("SMS cURL error: " . $curlError);
        // }

        // \Log::info('SMS API Response', [
        //     'http_code' => $httpCode,
        //     'response' => $response,
        //     'request_payload' => $payload,
        // ]);

        // $result = json_decode($response, true);

        // if ($httpCode === 200 && isset($result['success']) && $result['success']) {
        //     \Log::info("SMS sent successfully to {$number}");
        // } else {
        //     \Log::error("SMS failed", [
        //         'http_code' => $httpCode,
        //         'response' => $result,
        //     ]);
        // }


        $userId = auth()->id();

        $promoCodeClaim = PromoCodeClaim::where('user_id', $userId)
            ->whereNull('order_id')
            ->first();


        if ($promoCodeClaim && $promoCodeClaim->promo_code_id) {
            \Log::info("Promo code applied: " . $promoCodeClaim->promo_code_id);
            $promoCodeId = $promoCodeClaim->promo_code_id;

            $promoCode = \App\Models\PromoCode::find($promoCodeId);
            if ($promoCode) {
                $promoCode->uses_count = (int) $promoCode->uses_count + 1;
                $promoCode->used = $promoCode->uses_count >= (int) $promoCode->max_uses;
                $promoCode->save();
                \Log::info("Promo code marked as used: " . $promoCodeId);
            }
        } else {
            \Log::info("No promo code found for user " . $userId);
        }


        $order = Order::create([
            'user_id' => $userId,
            'total_amount' => $request->totalAmount,
            'status' => 'pending',
            'promo_code_id' => $promoCodeId ?? null,
        ]);
        foreach ($request->cartItems as $item) {
            \App\Models\PreOrder::where('product_id', $item['id'])
                ->where('user_id', $userId)
                ->delete();
        }


        foreach ($request->cartItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_name' => $item['name'],
                'product_id' => $item['id'],
                'product_price' => $item['price'],
                'quantity' => $item['quantity'],
                'product_image' => $item['image'],
            ]);
        }
        if ($promoCodeClaim && is_null($promoCodeClaim->order_id)) {
            $promoCodeClaim->order_id = $order->id;
            $promoCodeClaim->save();
        }

        $order->load(['user', 'orderItems']);

        Mail::to('sgogokhia1@gmail.com')->send(new OrderPlaced($order));

        return response()->json(['message' => 'შეკვეთა წარმატებით გაკეთდა'], 200);
    }


    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,accepted,declined,shipped,completed,cancelled',
            'total_amount' => 'nullable|numeric',
        ]);

        $order->update($validated);

        return response()->json(['message' => 'შეკვეთა განახლდა წარმატებით.', 'order' => $order]);
    }

    public function index(Request $request)
    {
        $query = Order::with(['orderItems', 'user']);

        if (!auth()->user()->admin) {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('status')) {
            $status = $request->query('status');

            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        $orders = $query->get();

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        return Inertia::render('admin/orders', ['orders' => $orders]);
    }

    public function getOrderItems($orderId)
    {
        try {
            $order = Order::findOrFail($orderId);

            return response()->json($order->items);
        } catch (\Exception $e) {
            \Log::error('Error fetching order items for order ID ' . $orderId . ': ' . $e->getMessage());
            return response()->json(['message' => 'Server Error'], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with('orderItems')->find($id);
        if (!$order) {
            return response()->json(['message' => 'შეკვეთა არ მოიძებნა'], 404);
        }

        return response()->json($order);
    }




    public function accept($id)
    {
        \Log::info("Accepting order ID {$id}");

        $order = Order::with(['orderItems', 'user'])->findOrFail($id);

        foreach ($order->orderItems as $item) {
            \Log::info("Processing OrderItem ID {$item->id} for product ID {$item->product_id}");

            $product = Product::find($item->product_id);

            if (!$product) {
                \Log::error("Product not found for OrderItem ID {$item->id} with product_id {$item->product_id}");
                continue;
            }

            \Log::info("Product found. Current stock: {$product->in_stock}");

            $product->in_stock -= $item->quantity;
            $product->save();
            \Log::info("Decreased stock by {$item->quantity}. New stock: {$product->in_stock}");
            $costPrice = (float) $product->cost_price;
            $soldPrice = (float) $item->product_price;
            $quantity = (int) $item->quantity;

            $profit = ($soldPrice - $costPrice) * $quantity;

            \Log::info("Calculating profit: (soldPrice: {$soldPrice} - costPrice: {$costPrice}) * quantity: {$quantity} = profit: {$profit}");

            $item->profit = $profit;

            if (!$item->save()) {
                \Log::error("Failed to save profit for OrderItem ID {$item->id}");
            } else {
                \Log::info("Saved profit {$profit} for OrderItem ID {$item->id}");
            }
        }

        $order->status = 'accepted';
        $order->save();
        \Log::info("Order ID {$id} status updated to accepted");
        $promoCodeClaim = PromoCodeClaim::where('user_id', $order->user_id)
            ->where('order_id', $order->id)
            ->first();

        if ($promoCodeClaim && $promoCodeClaim->promo_code_id) {
            $promoCode = \App\Models\PromoCode::find($promoCodeClaim->promo_code_id);

            if ($promoCode) {
                $ownerId = $promoCode->owner_user_id;
                $percent = $promoCode->owner_credit_percent;

                $totalFromItems = $order->orderItems->sum(function ($item) {
                    return $item->product_price * $item->quantity;
                });

                $creditAmount = round(($totalFromItems * $percent) / 100, 2);

                \App\Models\PromoOwnerCredit::create([
                    'promocode_id' => $promoCode->id,
                    'order_id' => $order->id,
                    'credited_user_id' => $ownerId,
                    'credited_amount' => $creditAmount,
                ]);
                $totalProfitFromItems = $order->orderItems->sum('profit');

                $creditedAmount = isset($creditAmount) ? $creditAmount : 0;

                $finalCompanyProfit = $totalProfitFromItems - $creditedAmount;

                \Log::info("Promo owner (user ID {$ownerId}) credited {$creditAmount} ₾ for order ID {$order->id}");
            } else {
                \Log::error("Promo code with ID {$promoCodeClaim->promo_code_id} not found.");
            }
        } else {
            \Log::info("No promo code claim found for user ID {$order->user_id} on order ID {$order->id}");
        }

        Mail::to($order->user->email)->send(new OrderAcceptedUser($order));
        Mail::to('sgogokhia1@gmail.com')->send(new OrderAccepted($order));
        \Log::info("Sent order acceptance emails for order ID {$order->id}");

        // $apiToken = '296|zUqTlCF42MiJ7f2eT56xYmxvea76nyoyfAzL2ABDd6a5dda2';
        // $apiUrl = 'https://smsservice.inexphone.ge/api/v1/sms/one';

        // $number = '599362908';
        // $sender = 'AIRLINK';
        // $message = 'ახალი შეკვეთა დადასტურდა';

        // $payload = [
        //     'phone' => $number,
        //     'subject' => $sender,
        //     'message' => $message,
        // ];

        // $ch = curl_init($apiUrl);
        // curl_setopt_array($ch, [
        //     CURLOPT_RETURNTRANSFER => true,
        //     CURLOPT_HTTPHEADER => [
        //         'Accept: application/json',
        //         'Content-Type: application/json',
        //         'Authorization: Bearer ' . $apiToken,
        //     ],
        //     CURLOPT_POST => true,
        //     CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        // ]);

        // $response = curl_exec($ch);
        // $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        // $curlError = curl_error($ch);
        // curl_close($ch);

        // if ($curlError) {
        //     \Log::error("SMS cURL error: " . $curlError);
        // }

        // \Log::info('SMS API Response', [
        //     'http_code' => $httpCode,
        //     'response' => $response,
        //     'request_payload' => $payload,
        // ]);

        // $result = json_decode($response, true);

        // if ($httpCode === 200 && isset($result['success']) && $result['success']) {
        //     \Log::info("SMS sent successfully to {$number}");
        // } else {
        //     \Log::error("SMS failed", [
        //         'http_code' => $httpCode,
        //         'response' => $result,
        //     ]);
        // }

        return response()->json(['message' => 'შეკვეთა დადასტურდა გაიგზავნა ემაილი']);
    }




    public function decline($id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'declined';
        $order->save();

        return response()->json(['message' => 'შეკვეთა გაუქმდა წარმატებით']);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled.'], 403);
        }

        $order->delete();

        return response()->json(['message' => 'Order cancelled successfully.']);
    }
    public function placeProgramOrder(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => 'nullable|string|max:255',
            'budget' => 'nullable|string|max:255',
            'message' => 'required|string',
            'selectedProgram' => 'nullable|array',
            'selectedProgram.feature' => 'nullable|string',
            'selectedProgram.price' => 'nullable|string',
        ]);


        $data = $validated;


        Mail::send('emails.program_order', $data, function ($message) use ($data) {
            $message->to('sgogokhia1@gmail.com')
                ->subject('ახალი პროგრამის შეკვეთა: ' . ($data['category'] ?? 'კატეგორია არ არის მითითებული'))
                ->replyTo($data['email']);
        });

        return response()->json(['message' => 'პროგრამის შეკვეთა წარმატებით გაიგზავნა'], 200);
    }



}

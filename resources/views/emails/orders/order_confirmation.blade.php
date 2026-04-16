<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <title>ახალი შეკვეთა მიღებულია</title>
</head>
<body>
    <h1>ახალი შეკვეთის დეტალები</h1>

    <h3>კლიენტის ინფორმაცია</h3>
    <p>სახელი: {{ $order->user->name }}</p>
    <p>იმეილი: {{ $order->user->email }}</p>
    <p>ტელეფონის ნომერი: {{ $order->user->mobile_number }}</p>


    <h3>შეკვეთილი პროდუქტები</h3>
    <ul>
        @foreach($order->orderItems as $item)
            <li>
                <p>პროდუქტის სახელი: {{ $item->product_name }}</p>
                <p>ფასი: {{ $item->product_price }} ₾</p>
                <p>რაოდენობა: {{ $item->quantity }}</p>
                <img src="{{ $item->product_image }}" alt="{{ $item->product_name }}" style="width: 100px;">
            </li>
        @endforeach
    </ul>

    <h3>სულ: {{ $order->total_amount }} ₾</h3>
       <p>General Technology</p>
</body>
</html>

<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <title>შეკვეთა დადასტურდა</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <h2 style="color: green;">შეკვეთა #{{ $order->id }} დადასტურდა!</h2>

    <p><strong>მნიშვნელოვანი:</strong> ეს შეკვეთა დადასტურდა და მზად არის გადამუშავებისთვის.</p>
    <p><strong>სულ თანხა:</strong> {{ $order->total_amount }} ₾</p>

    <h3>👤 კლიენტის ინფორმაცია:</h3>
    <p>სახელი: {{ $order->user->name }}</p>
    <p>იმეილი: {{ $order->user->email }}</p>

    <h3>📦 შეკვეთილი ნივთები:</h3>
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th align="left">სურათი</th>
                <th align="left">პროდუქტი</th>
                <th align="left">ფასი</th>
                <th align="left">რაოდენობა</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $item)
            <tr>
                <td>
                    <img src="{{ asset($item->product_image) }}" alt="{{ $item->product_name }}" width="80" style="border-radius: 4px;">
                </td>
                <td>{{ $item->product_name }}</td>
                <td>{{ $item->product_price }} ₾</td>
                <td>{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p style="margin-top: 20px;">გთხოვთ დაიწყოთ შეკვეთის მომზადება და შეფუთვა. თუ რაიმე კითხვები ან პრობლემა გაჩნდება, გთხოვთ დაუკავშირდეთ HR: ანას.</p>

    <p>General Technology</p>
</body>
</html>

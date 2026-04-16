<!DOCTYPE html>
<html lang="ka">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>შეკვეთა მიღებულია</title>
</head>
<body>

    <p>მოხარულნი ვართ გაცნობოთ, რომ თქვენი შეკვეთა ნომრით #{{ $order->id }} მიღებულია.</p>
    <p>თქვენი შეკვეთა ახლა მუშავდება. შეგატყობინებთ, როდესაც თქვენი ნივთები გაიგზავნება.</p>

    <p><strong>სულ: {{ $order->total_amount }} ლარი</strong></p>
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
    <p>გთხოვთ, გამოიყენოთ ანგარიშის ნომერი <strong>ANGARISHIS NOMERI</strong> გადახდის შესასრულებლად.</p>
    <p>მადლობა, რომ ჩვენთან შეიძინეთ!</p>
    <p>General Technology</p>
</body>
</html>

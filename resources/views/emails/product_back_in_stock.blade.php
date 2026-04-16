<!DOCTYPE html>
<html lang="ka">

<head>
    <meta charset="UTF-8">
    <title>პროდუქტი საწყობშია</title>
</head>

<body>
    <h2>{{ $product->name }} დაბრუნდა საწყობში!</h2>
    <p>თქვენი მოთხოვნილი პროდუქტი კვლავ ხელმისაწვდომია ჩვენს მაღაზიაში.</p>
    <p>
        <a href="{{ route('products.show', ['product' => $product->id, 'name' => Str::slug($product->name)]) }}">
            ნახეთ პროდუქტი
        </a>

    </p>

</body>

</html>

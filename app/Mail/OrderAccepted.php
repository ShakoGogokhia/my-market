<?php
namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderAccepted extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('ახალი შეკვეთა დადასტურდა')
                    ->view('emails.orders.accepted')  
                    ->with([
                        'order' => $this->order,
                        'items' => $this->order->orderItems,
                    ]);
    }
}


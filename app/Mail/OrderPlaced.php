<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced extends Mailable
{
    public $order;

    public function __construct($order)
    {
        $this->order = $order->load(['user', 'orderItems']);
    }

   public function build()
{
    return $this->to('sgogokhia1@gmail.com')
                ->subject('ახალი შეკვეთა')
                ->view('emails.orders.order_confirmation')
                ->with([
                    'order' => $this->order,
                ]);
}
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ProgramOrderMail;

class ProgramOrderController extends Controller
{
    public function sendProgramOrder(Request $request)
    {
 
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'category' => 'required|string',
            'budget' => 'nullable|string',
            'program' => 'nullable|string',
            'price' => 'nullable|string',
            'message' => 'required|string',
            'file' => 'nullable|file|max:10240', 
        ]);

        Mail::to('sgogokhia1@gmail.com')->send(new ProgramOrderMail($validated));

        return response()->json(['message' => 'Program order sent successfully.']);
    }
}

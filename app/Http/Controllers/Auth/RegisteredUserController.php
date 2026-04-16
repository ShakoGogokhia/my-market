<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'mobile_number' => 'required|string|max:50',
            'registration_type' => 'required|in:personal,organization',
            'organization_identification_code' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'organization_location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mobile_number' => $request->mobile_number,
            'registration_type' => $request->registration_type,
            'organization_identification_code' => $request->organization_identification_code,
            'contact_person' => $request->contact_person,
            'organization_location' => $request->organization_location,
            'address' => $request->address,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect('/');
    }
}

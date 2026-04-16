<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::all();

        if ($request->wantsJson()) {
            return response()->json($users);
        }

        return Inertia::render('admin/users', ['users' => $users]);
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'admin' => 'required|boolean',
            'registration_type' => 'required|in:personal,organization',
            'mobile_number' => 'required|string|max:20|regex:/^\+?[0-9\s\-]{7,20}$/',
            'organization_identification_code' => Rule::requiredIf($request->registration_type === 'organization'),
            'organization_identification_code.*' => 'string|max:255',

            'contact_person' => Rule::requiredIf($request->registration_type === 'organization'),
            'contact_person.*' => 'string|max:255',

            'organization_location' => Rule::requiredIf($request->registration_type === 'organization'),
            'organization_location.*' => 'string|max:255',
        ]);

        $user->update($request->only([
            'name',
            'email',
            'admin',
            'registration_type',
            'mobile_number',
            'organization_identification_code',
            'contact_person',
            'organization_location',
            'address',
        ]));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
    
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@market.local'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'admin' => true,
            ]
        );
    }
}

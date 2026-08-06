<?php

use App\Enums\UserRole;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('database seeder creates login accounts for every application role', function () {
    $this->seed(DatabaseSeeder::class);

    $seededUsers = User::query()
        ->whereIn('email', [
            'test@example.com',
            'agent@example.com',
            'admin@example.com',
        ])
        ->get()
        ->keyBy('email');

    expect($seededUsers)
        ->toHaveCount(3)
        ->and($seededUsers['test@example.com']->role)->toBe(UserRole::User)
        ->and($seededUsers['agent@example.com']->role)->toBe(UserRole::Agent)
        ->and($seededUsers['admin@example.com']->role)->toBe(UserRole::Admin)
        ->and(Hash::check('password', $seededUsers['admin@example.com']->password))->toBeTrue()
        ->and(Hash::check('password', $seededUsers['agent@example.com']->password))->toBeTrue()
        ->and(Hash::check('password', $seededUsers['test@example.com']->password))->toBeTrue();

    expect(Agent::query()->whereBelongsTo($seededUsers['agent@example.com'], 'user')->exists())
        ->toBeTrue();

    $ticket = Ticket::query()->with(['creator', 'assignedAgent.user'])->find(1);

    expect($ticket)
        ->not->toBeNull()
        ->and($ticket->creator?->email)->toBe('test@example.com')
        ->and($ticket->assignedAgent?->user?->email)->toBe('agent@example.com');
});

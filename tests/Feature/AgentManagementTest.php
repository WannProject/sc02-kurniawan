<?php

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can view the agent management page', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $agentUser = User::factory()->create(['role' => UserRole::Agent]);
    $agent = Agent::factory()->for($agentUser)->create();
    $ticketCreator = User::factory()->create();

    Ticket::factory()->for($ticketCreator, 'creator')->assigned($agent)->create([
        'status' => TicketStatus::Assigned,
    ]);

    $response = $this
        ->actingAs($admin)
        ->get(route('agents.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('agents/index')
            ->has('agents', 1)
            ->where('agents.0.id', $agent->id)
            ->where('agents.0.user.email', $agentUser->email)
            ->where('agents.0.active_tickets_count', 1)
        );
});

test('users cannot view the agent management page', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('agents.index'));

    $response->assertForbidden();
});

test('admins can create a new agent account directly', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this
        ->actingAs($admin)
        ->post(route('agents.store'), [
            'name' => 'Agent Baru',
            'email' => 'agent-baru@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('agents.index'));

    $user = User::query()->where('email', 'agent-baru@example.com')->firstOrFail();
    $agent = Agent::query()->whereBelongsTo($user)->firstOrFail();

    expect($user->role)->toBe(UserRole::Agent)
        ->and($user->current_team_id)->not->toBeNull()
        ->and($agent->is_active)->toBeTrue();
});

test('new agent accounts require unique email addresses', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    User::factory()->create(['email' => 'agent-baru@example.com']);

    $response = $this
        ->actingAs($admin)
        ->post(route('agents.store'), [
            'name' => 'Agent Baru',
            'email' => 'agent-baru@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_active' => true,
        ]);

    $response->assertSessionHasErrors('email');
});

test('admins can activate and deactivate agents', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $agent = Agent::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->patch(route('agents.update', $agent), [
            'is_active' => false,
        ]);

    $response->assertRedirect(route('agents.index'));

    expect($agent->fresh()->is_active)->toBeFalse();
});

test('inactive agents are skipped when assigning new tickets', function () {
    Queue::fake();

    $user = User::factory()->create();
    $inactiveAgent = Agent::factory()->inactive()->create();
    $activeAgent = Agent::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('tickets.store'), [
            'title' => 'Printer kasir tidak menyala',
            'description' => 'Printer tidak merespons saat dinyalakan.',
            'priority' => TicketPriority::Medium->value,
        ]);

    $response->assertRedirect();

    $ticket = Ticket::query()->where('title', 'Printer kasir tidak menyala')->firstOrFail();

    expect($ticket->assigned_agent_id)->toBe($activeAgent->id)
        ->and($ticket->assigned_agent_id)->not->toBe($inactiveAgent->id);
});

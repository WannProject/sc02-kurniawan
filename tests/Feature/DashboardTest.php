<?php

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $agentUser = User::factory()->create(['name' => 'Agent One']);
    $agent = Agent::factory()->for($agentUser)->create();

    Ticket::factory()->assigned($agent)->create([
        'created_by_id' => $user->id,
        'title' => 'Printer jam',
        'priority' => TicketPriority::High,
        'status' => TicketStatus::Assigned,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('ticketStats', 5)
        ->has('recentTickets', 1)
        ->where('ticketStats.0.label', TicketStatus::Open->label())
        ->where('ticketStats.0.count', 0)
        ->where('ticketStats.1.label', TicketStatus::Assigned->label())
        ->where('ticketStats.1.count', 1)
        ->where('recentTickets.0.title', 'Printer jam')
        ->where('recentTickets.0.created_by.name', $user->name)
        ->where('recentTickets.0.assigned_agent.user.name', 'Agent One'),
    );
});

test('dashboard exposes recent ticket creator and assignee data', function () {
    $user = User::factory()->create(['name' => 'Taylor']);
    $agentUser = User::factory()->create(['name' => 'Agent One']);
    $agent = Agent::factory()->for($agentUser)->create();

    Ticket::factory()->assigned($agent)->create([
        'created_by_id' => $user->id,
        'title' => 'Printer jam',
        'status' => TicketStatus::Assigned,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('recentTickets.0.title', 'Printer jam')
        ->where('recentTickets.0.created_by.name', 'Taylor')
        ->where('recentTickets.0.assigned_agent.user.name', 'Agent One'),
    );
});

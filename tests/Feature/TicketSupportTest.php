<?php

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Jobs\SendTicketAssignedNotificationJob;
use App\Mail\TicketAssignedMail;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketAssignmentService;
use App\Services\TicketStatusService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

test('tickets index page can be rendered', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('tickets.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/index')
            ->has('tickets.data')
        );
});

test('users only see their own tickets in the index', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $ownTicket = Ticket::factory()->for($user, 'creator')->create();
    Ticket::factory()->for($otherUser, 'creator')->create();

    $response = $this
        ->actingAs($user)
        ->get(route('tickets.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/index')
            ->has('tickets.data', 1)
            ->where('tickets.data.0.id', $ownTicket->id)
        );
});

test('tickets create page can be rendered', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('tickets.create'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/create')
            ->has('priorities', 3)
        );
});

test('ticket show page can be rendered with transitions', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->for($user, 'creator')->create([
        'status' => TicketStatus::Open,
    ]);

    app(TicketStatusService::class)->transition(
        ticket: $ticket,
        toStatus: TicketStatus::Assigned,
        changedBy: $user,
        note: 'Ready for handling.',
    );

    $response = $this
        ->actingAs($user)
        ->get(route('tickets.show', $ticket));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/show')
            ->has('ticket')
            ->where('availableStatuses.0.value', TicketStatus::InProgress->value)
            ->has('history.data', 1)
        );
});

test('users cannot view tickets created by someone else', function () {
    $owner = User::factory()->create();
    $visitor = User::factory()->create();
    $ticket = Ticket::factory()->for($owner, 'creator')->create();

    $response = $this
        ->actingAs($visitor)
        ->get(route('tickets.show', $ticket));

    $response->assertForbidden();
});

test('valid status transitions are accepted', function () {
    $agentUser = User::factory()->create(['role' => UserRole::Agent]);
    $agent = Agent::factory()->for($agentUser)->create();
    $ticket = Ticket::factory()->assigned($agent)->create();

    $response = $this
        ->actingAs($agentUser)
        ->patch(route('tickets.status.update', $ticket), [
            'status' => TicketStatus::InProgress->value,
            'note' => 'Starting work.',
        ]);

    $response->assertRedirect();

    expect($ticket->fresh()->status)->toBe(TicketStatus::InProgress);

    $this->assertDatabaseHas('ticket_status_histories', [
        'ticket_id' => $ticket->id,
        'from_status' => TicketStatus::Assigned->value,
        'to_status' => TicketStatus::InProgress->value,
        'changed_by_id' => $agentUser->id,
        'note' => 'Starting work.',
    ]);
});

test('admins can update ticket status even when not assigned', function () {
    $adminUser = User::factory()->create(['role' => UserRole::Admin]);
    $agentUser = User::factory()->create();
    $agent = Agent::factory()->for($agentUser)->create();
    $ticket = Ticket::factory()->assigned($agent)->create();

    $response = $this
        ->actingAs($adminUser)
        ->patch(route('tickets.status.update', $ticket), [
            'status' => TicketStatus::InProgress->value,
            'note' => 'Admin override.',
        ]);

    $response->assertRedirect();

    expect($ticket->fresh()->status)->toBe(TicketStatus::InProgress);
});

test('invalid status transitions are rejected with validation errors', function () {
    $agentUser = User::factory()->create(['role' => UserRole::Agent]);
    $agent = Agent::factory()->for($agentUser)->create();
    $ticket = Ticket::factory()->assigned($agent)->create();

    $response = $this
        ->actingAs($agentUser)
        ->patchJson(route('tickets.status.update', $ticket), [
            'status' => TicketStatus::Resolved->value,
        ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');

    expect($ticket->fresh()->status)->toBe(TicketStatus::Assigned);
});

test('users who are not assigned to the ticket cannot update its status', function () {
    $agentUser = User::factory()->create(['role' => UserRole::Agent]);
    $agent = Agent::factory()->for($agentUser)->create();
    $ticket = Ticket::factory()->assigned($agent)->create();
    $visitor = User::factory()->create();

    $response = $this
        ->actingAs($visitor)
        ->patch(route('tickets.status.update', $ticket), [
            'status' => TicketStatus::InProgress->value,
        ]);

    $response->assertForbidden();

    expect($ticket->fresh()->status)->toBe(TicketStatus::Assigned);
});

test('agents cannot access the ticket creation page', function () {
    $agentUser = User::factory()->create(['role' => UserRole::Agent]);

    $response = $this
        ->actingAs($agentUser)
        ->get(route('tickets.create'));

    $response->assertForbidden();
});

test('least busy assignment stays consistent for tickets created together', function () {
    Queue::fake();

    $firstAgent = Agent::factory()->create(['last_assigned_at' => now()->subHour()]);
    $secondAgent = Agent::factory()->create(['last_assigned_at' => now()->subMinutes(30)]);

    Ticket::factory()->assigned($firstAgent)->create();

    $firstTicket = Ticket::factory()->create(['status' => TicketStatus::Open]);
    $secondTicket = Ticket::factory()->create(['status' => TicketStatus::Open]);

    $service = app(TicketAssignmentService::class);

    $service->assignLeastBusyAgent($firstTicket);
    $service->assignLeastBusyAgent($secondTicket);

    expect($firstTicket->fresh()->assigned_agent_id)->toBe($secondAgent->id)
        ->and($secondTicket->fresh()->assigned_agent_id)->toBe($firstAgent->id);
});

test('ticket creation queues assignment notification without sending mail synchronously', function () {
    Queue::fake();
    Mail::fake();

    $user = User::factory()->create();
    $agent = Agent::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('tickets.store'), [
            'title' => 'Cannot print invoice',
            'description' => 'The invoice printer fails every time.',
            'priority' => TicketPriority::High->value,
        ]);

    $response->assertRedirect();

    $ticket = Ticket::query()->where('title', 'Cannot print invoice')->firstOrFail();

    expect($ticket->assigned_agent_id)->toBe($agent->id)
        ->and($ticket->status)->toBe(TicketStatus::Assigned);

    Queue::assertPushed(SendTicketAssignedNotificationJob::class, fn (SendTicketAssignedNotificationJob $job) => $job->ticketId === $ticket->id
        && $job->agentId === $agent->id);
    Mail::assertNothingSent();
    Mail::assertNotQueued(TicketAssignedMail::class);
});

test('audit trail returns newest history including system auto assignment', function () {
    Queue::fake();

    $user = User::factory()->create();
    $agent = Agent::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('tickets.store'), [
            'title' => 'Login issue',
            'description' => 'I cannot sign in.',
            'priority' => TicketPriority::Medium->value,
        ]);

    $ticket = Ticket::query()->where('title', 'Login issue')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->getJson(route('api.tickets.history', $ticket));

    $response
        ->assertOk()
        ->assertJsonPath('data.0.to_status.value', TicketStatus::Assigned->value)
        ->assertJsonPath('data.0.changed_by', null)
        ->assertJsonPath('data.1.to_status.value', TicketStatus::Open->value)
        ->assertJsonPath('data.1.changed_by.id', $user->id);

    expect($ticket->fresh()->assigned_agent_id)->toBe($agent->id);
});

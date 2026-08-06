<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\TeamInvitation;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        $ticketStats = collect(TicketStatus::cases())
            ->map(fn (TicketStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
                'count' => Ticket::query()
                    ->where('status', $status)
                    ->count(),
            ])
            ->values();

        $recentTickets = Ticket::query()
            ->with(['creator', 'assignedAgent.user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'priority' => [
                    'value' => $ticket->priority->value,
                    'label' => $ticket->priority->label(),
                ],
                'status' => [
                    'value' => $ticket->status->value,
                    'label' => $ticket->status->label(),
                ],
                'created_by' => $ticket->creator ? [
                    'id' => $ticket->creator->id,
                    'name' => $ticket->creator->name,
                    'email' => $ticket->creator->email,
                ] : null,
                'assigned_agent' => $ticket->assignedAgent ? [
                    'id' => $ticket->assignedAgent->id,
                    'user' => $ticket->assignedAgent->user ? [
                        'id' => $ticket->assignedAgent->user->id,
                        'name' => $ticket->assignedAgent->user->name,
                        'email' => $ticket->assignedAgent->user->email,
                    ] : null,
                ] : null,
                'created_at' => $ticket->created_at?->toISOString(),
                'updated_at' => $ticket->updated_at?->toISOString(),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'ticketStats' => $ticketStats,
            'recentTickets' => $recentTickets,
        ]);
    }
}

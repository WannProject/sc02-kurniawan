<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Jobs\SendTicketAssignedNotificationJob;
use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketAssignmentService
{
    public function __construct(private TicketStatusService $statusService) {}

    public function assignLeastBusyAgent(Ticket $ticket): Ticket
    {
        $assigned = false;
        $assignedAgentId = null;

        $ticket = DB::transaction(function () use ($ticket, &$assigned, &$assignedAgentId) {
            $lockedTicket = Ticket::whereKey($ticket->id)->lockForUpdate()->firstOrFail();

            if ($lockedTicket->status !== TicketStatus::Open) {
                return $lockedTicket;
            }

            $agents = Agent::query()
                ->where('is_active', true)
                ->with('user')
                ->withCount([
                    'tickets as active_tickets_count' => fn ($query) => $query->whereIn(
                        'status',
                        TicketStatus::activeAssignmentValues(),
                    ),
                ])
                ->orderBy('active_tickets_count')
                ->oldest('last_assigned_at')
                ->oldest('id')
                ->lockForUpdate()
                ->get();

            $agent = $agents->first();

            if (! $agent) {
                Log::warning('Ticket left open because no active support agents are available.', [
                    'ticket_id' => $lockedTicket->id,
                ]);

                return $lockedTicket;
            }

            $lockedTicket->assigned_agent_id = $agent->id;

            $lockedTicket = $this->statusService->transitionLocked(
                ticket: $lockedTicket,
                toStatus: TicketStatus::Assigned,
                changedBy: null,
                note: "Auto-assigned to {$agent->user()->value('name')}.",
            );

            $agent->update(['last_assigned_at' => now()]);

            $assigned = true;
            $assignedAgentId = $agent->id;

            Log::info('Ticket assigned to support agent.', [
                'ticket_id' => $lockedTicket->id,
                'agent_id' => $agent->id,
                'agent_user_id' => $agent->user?->id,
            ]);

            return $lockedTicket;
        }, attempts: 5);

        if ($assigned && $assignedAgentId !== null) {
            SendTicketAssignedNotificationJob::dispatch($ticket->id, $assignedAgentId)->afterCommit();
        }

        return $ticket->refresh();
    }
}

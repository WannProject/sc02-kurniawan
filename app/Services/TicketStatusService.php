<?php

namespace App\Services;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketStatusService
{
    /**
     * @var array<string, array<TicketStatus>>
     */
    private const TRANSITIONS = [
        TicketStatus::Open->value => [TicketStatus::Assigned],
        TicketStatus::Assigned->value => [TicketStatus::InProgress],
        TicketStatus::InProgress->value => [TicketStatus::Resolved],
        TicketStatus::Resolved->value => [TicketStatus::Closed],
        TicketStatus::Closed->value => [],
    ];

    /**
     * @param  array{title: string, description: string, priority: TicketPriority|string}  $data
     */
    public function createTicket(array $data, ?User $createdBy): Ticket
    {
        return DB::transaction(function () use ($data, $createdBy) {
            $ticket = Ticket::create([
                'created_by_id' => $createdBy?->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'priority' => $data['priority'],
                'status' => TicketStatus::Open,
            ]);

            $ticket->statusHistories()->create([
                'from_status' => null,
                'to_status' => TicketStatus::Open,
                'changed_by_id' => $createdBy?->id,
                'note' => 'Ticket created.',
            ]);

            Log::info('Ticket created.', [
                'ticket_id' => $ticket->id,
                'created_by_id' => $createdBy?->id,
                'priority' => $ticket->priority->value,
            ]);

            return $ticket;
        }, attempts: 5);
    }

    public function transition(Ticket $ticket, TicketStatus $toStatus, ?User $changedBy, ?string $note = null): Ticket
    {
        return DB::transaction(function () use ($ticket, $toStatus, $changedBy, $note) {
            $lockedTicket = Ticket::whereKey($ticket->id)->lockForUpdate()->firstOrFail();

            return $this->transitionLocked($lockedTicket, $toStatus, $changedBy, $note);
        }, attempts: 5);
    }

    public function transitionLocked(Ticket $ticket, TicketStatus $toStatus, ?User $changedBy, ?string $note = null): Ticket
    {
        $fromStatus = $ticket->status;

        if (! $this->canTransition($fromStatus, $toStatus)) {
            throw new InvalidStatusTransitionException($fromStatus, $toStatus);
        }

        $ticket->status = $toStatus;
        $ticket->save();

        $ticket->statusHistories()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by_id' => $changedBy?->id,
            'note' => $note,
        ]);

        Log::info('Ticket status updated.', [
            'ticket_id' => $ticket->id,
            'from_status' => $fromStatus->value,
            'to_status' => $toStatus->value,
            'changed_by_id' => $changedBy?->id,
        ]);

        return $ticket->refresh();
    }

    public function canTransition(TicketStatus $fromStatus, TicketStatus $toStatus): bool
    {
        return in_array($toStatus, self::TRANSITIONS[$fromStatus->value] ?? [], true);
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    public function availableTransitions(TicketStatus $fromStatus): array
    {
        return collect(self::TRANSITIONS[$fromStatus->value] ?? [])
            ->map(fn (TicketStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->values()
            ->toArray();
    }
}

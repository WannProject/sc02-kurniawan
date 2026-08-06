<?php

namespace App\Jobs;

use App\Mail\TicketAssignedMail;
use App\Models\Agent;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendTicketAssignedNotificationJob implements ShouldQueue, ShouldBeUnique
{
    use Queueable;

    public int $tries = 3;

    /**
     * @var array<int>
     */
    public array $backoff = [1, 5, 15];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly int $ticketId,
        public readonly int $agentId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::transaction(function () {
            $ticket = Ticket::query()
                ->with('assignedAgent.user')
                ->whereKey($this->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($ticket->assigned_agent_id !== $this->agentId || $ticket->assigned_notification_sent_at !== null) {
                return;
            }

            $agent = Agent::query()
                ->with('user')
                ->whereKey($this->agentId)
                ->firstOrFail();

            Mail::to($agent->user)->send(new TicketAssignedMail($ticket));

            $ticket->update(['assigned_notification_sent_at' => now()]);
        }, attempts: 5);
    }

    public function uniqueId(): string
    {
        return "{$this->ticketId}:{$this->agentId}";
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Ticket assigned notification failed permanently.', [
            'ticket_id' => $this->ticketId,
            'agent_id' => $this->agentId,
            'error' => $exception?->getMessage(),
        ]);
    }
}

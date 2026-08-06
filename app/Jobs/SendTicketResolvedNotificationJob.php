<?php

namespace App\Jobs;

use App\Mail\TicketResolvedMail;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendTicketResolvedNotificationJob implements ShouldQueue
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
    public function __construct(public readonly int $ticketId) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $ticket = Ticket::query()
            ->with('creator')
            ->findOrFail($this->ticketId);

        if ($ticket->creator === null) {
            return;
        }

        Mail::to($ticket->creator)->send(new TicketResolvedMail($ticket));
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Ticket resolved notification failed permanently.', [
            'ticket_id' => $this->ticketId,
            'error' => $exception?->getMessage(),
        ]);
    }
}

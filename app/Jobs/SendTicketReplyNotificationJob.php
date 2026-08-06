<?php

namespace App\Jobs;

use App\Mail\TicketReplyCreatedMail;
use App\Models\TicketReply;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendTicketReplyNotificationJob implements ShouldQueue
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
    public function __construct(public readonly int $replyId) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $reply = TicketReply::query()
            ->with(['ticket.creator', 'ticket.assignedAgent.user', 'user'])
            ->findOrFail($this->replyId);

        $recipient = $reply->user->isUser()
            ? $reply->ticket->assignedAgent?->user
            : $reply->ticket->creator;

        if ($recipient === null || $recipient->is($reply->user)) {
            return;
        }

        Mail::to($recipient)->send(new TicketReplyCreatedMail($reply));
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Ticket reply notification failed permanently.', [
            'reply_id' => $this->replyId,
            'error' => $exception?->getMessage(),
        ]);
    }
}

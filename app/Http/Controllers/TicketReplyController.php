<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketReplyRequest;
use App\Jobs\SendTicketReplyNotificationJob;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class TicketReplyController extends Controller
{
    public function store(StoreTicketReplyRequest $request, Ticket $ticket): RedirectResponse
    {
        $reply = $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        SendTicketReplyNotificationJob::dispatch($reply->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Reply sent.')]);

        return back();
    }
}

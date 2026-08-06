<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Jobs\SendTicketResolvedNotificationJob;
use App\Models\Ticket;
use App\Services\TicketStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TicketStatusController extends Controller
{
    public function update(
        UpdateTicketStatusRequest $request,
        Ticket $ticket,
        TicketStatusService $statusService,
    ): RedirectResponse {
        $toStatus = TicketStatus::from($request->validated('status'));

        try {
            $updatedTicket = $statusService->transition(
                ticket: $ticket,
                toStatus: $toStatus,
                changedBy: $request->user(),
                note: $request->validated('note'),
            );
        } catch (InvalidStatusTransitionException $exception) {
            Log::warning('Rejected invalid ticket status transition.', [
                'ticket_id' => $ticket->id,
                'user_id' => $request->user()?->id,
                'from_status' => $exception->from->value,
                'to_status' => $exception->to->value,
            ]);

            throw ValidationException::withMessages([
                'status' => $exception->getMessage(),
            ]);
        }

        if ($toStatus === TicketStatus::Resolved) {
            SendTicketResolvedNotificationJob::dispatch($updatedTicket->id);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ticket status updated.')]);

        return back();
    }
}

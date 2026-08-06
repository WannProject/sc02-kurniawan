<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Http\Resources\TicketStatusHistoryResource;
use App\Models\Ticket;
use App\Services\TicketAssignmentService;
use App\Services\TicketStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Ticket::query()
            ->with(['creator', 'assignedAgent.user'])
            ->latest();

        if ($request->user()?->isUser()) {
            $query->whereBelongsTo($request->user(), 'creator');
        }

        $tickets = $query->paginate(15);

        return Inertia::render('tickets/index', [
            'tickets' => TicketResource::collection($tickets),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Ticket::class);

        return Inertia::render('tickets/create', [
            'priorities' => collect(TicketPriority::cases())
                ->map(fn (TicketPriority $priority) => [
                    'value' => $priority->value,
                    'label' => $priority->label(),
                ])
                ->values(),
        ]);
    }

    public function store(
        StoreTicketRequest $request,
        TicketStatusService $statusService,
        TicketAssignmentService $assignmentService,
    ): RedirectResponse {
        $ticket = $statusService->createTicket($request->validated(), $request->user());
        $ticket = $assignmentService->assignLeastBusyAgent($ticket);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ticket created.')]);

        return to_route('tickets.show', $ticket);
    }

    public function show(Ticket $ticket, TicketStatusService $statusService): Response
    {
        Gate::authorize('view', $ticket);

        $ticket->load(['creator', 'assignedAgent.user']);

        return Inertia::render('tickets/show', [
            'ticket' => new TicketResource($ticket),
            'availableStatuses' => $statusService->availableTransitions($ticket->status),
            'history' => TicketStatusHistoryResource::collection(
                $ticket->statusHistories()
                    ->with('changedBy')
                    ->latest()
                    ->latest('id')
                    ->limit(20)
                    ->get()
            ),
        ]);
    }
}

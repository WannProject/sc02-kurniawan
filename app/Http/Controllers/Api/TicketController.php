<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Services\TicketAssignmentService;
use App\Services\TicketStatusService;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function store(
        StoreTicketRequest $request,
        TicketStatusService $statusService,
        TicketAssignmentService $assignmentService,
    ): JsonResponse {
        $ticket = $statusService->createTicket($request->validated(), $request->user());
        $ticket = $assignmentService->assignLeastBusyAgent($ticket);

        $ticket->load(['creator', 'assignedAgent.user']);

        return (new TicketResource($ticket))
            ->response()
            ->setStatusCode(201);
    }
}

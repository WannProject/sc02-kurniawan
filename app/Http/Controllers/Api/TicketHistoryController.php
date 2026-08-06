<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TicketStatusHistoryResource;
use App\Models\Ticket;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketHistoryController extends Controller
{
    public function __invoke(Ticket $ticket): AnonymousResourceCollection
    {
        return TicketStatusHistoryResource::collection(
            $ticket->statusHistories()
                ->with('changedBy')
                ->latest()
                ->latest('id')
                ->paginate(15)
        );
    }
}

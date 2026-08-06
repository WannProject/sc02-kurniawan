<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Determine whether the user can update the ticket status.
     */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->agent?->is($ticket->assignedAgent) ?? false;
    }
}

<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Determine whether the user can view any tickets.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the ticket.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin()
            || $user->isAgent()
            || $ticket->creator?->is($user) === true;
    }

    /**
     * Determine whether the user can create tickets.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::User;
    }

    /**
     * Determine whether the user can update the ticket status.
     */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin()
            || ($user->isAgent() && ($user->agent?->is($ticket->assignedAgent) ?? false));
    }

    /**
     * Determine whether the user can reply to the ticket.
     */
    public function reply(User $user, Ticket $ticket): bool
    {
        return $this->view($user, $ticket);
    }
}

<?php

namespace App\Exceptions;

use App\Enums\TicketStatus;
use Exception;

class InvalidStatusTransitionException extends Exception
{
    public function __construct(
        public readonly TicketStatus $from,
        public readonly TicketStatus $to,
    ) {
        parent::__construct("Invalid ticket status transition from {$from->value} to {$to->value}.");
    }
}

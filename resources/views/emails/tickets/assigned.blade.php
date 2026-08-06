<x-mail::message>
# New Ticket Assigned

You have been assigned ticket #{{ $ticket->id }}.

**Title:** {{ $ticket->title }}

**Priority:** {{ $ticket->priority->label() }}

<x-mail::button :url="route('tickets.show', $ticket)">
Open Ticket
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

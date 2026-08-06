<x-mail::message>
# Tiket baru ditugaskan

Anda ditugaskan untuk menangani tiket #{{ $ticket->id }}.

**Judul:** {{ $ticket->title }}

**Prioritas:** {{ $ticket->priority->label() }}

**Deskripsi:**

<x-mail::panel>
{{ $ticket->description }}
</x-mail::panel>

<x-mail::button :url="route('tickets.show', $ticket)">
Buka Tiket
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>

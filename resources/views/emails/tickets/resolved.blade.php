<x-mail::message>
# Tiket selesai

Tiket #{{ $ticket->id }} telah ditandai selesai.

**Judul:** {{ $ticket->title }}

**Prioritas:** {{ $ticket->priority->label() }}

Jika masih ada kendala, silakan balas tiket ini agar agent dapat membantu kembali.

<x-mail::button :url="route('tickets.show', $ticket)">
Buka Tiket
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>

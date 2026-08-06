<x-mail::message>
# Balasan baru pada tiket #{{ $ticket->id }}

{{ $reply->user->name }} mengirim balasan pada tiket **{{ $ticket->title }}**.

**Isi balasan:**

<x-mail::panel>
{{ $reply->body }}
</x-mail::panel>

<x-mail::button :url="route('tickets.show', $ticket)">
Buka Tiket
</x-mail::button>

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>

<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = $this->seedUser('Test User', 'test@example.com', UserRole::User);

        $agent = $this->seedUser('Agent User', 'agent@example.com', UserRole::Agent);
        $supportAgent = Agent::query()->updateOrCreate(
            ['user_id' => $agent->id],
            ['is_active' => true],
        );

        $this->seedUser('Admin User', 'admin@example.com', UserRole::Admin);
        $this->seedDemoTicket($user, $supportAgent);
    }

    private function seedUser(string $name, string $email, UserRole $role): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'name' => $name,
                'password' => 'password',
                'role' => $role,
            ])->save();

            return $user;
        }

        return User::factory()->create([
            'name' => $name,
            'email' => $email,
            'role' => $role,
        ]);
    }

    private function seedDemoTicket(User $user, Agent $agent): Ticket
    {
        $ticket = Ticket::query()->find(1) ?? new Ticket;

        if (! $ticket->exists) {
            $ticket->id = 1;
        }

        $ticket->forceFill([
            'created_by_id' => $user->id,
            'assigned_agent_id' => $agent->id,
            'title' => 'Perbaikan mode',
            'description' => 'Demo support ticket for validating the ticket detail page.',
            'priority' => TicketPriority::High,
            'status' => TicketStatus::Assigned,
        ])->save();

        return $ticket;
    }
}

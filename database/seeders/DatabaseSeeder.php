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
        $this->removeLegacyDemoUsers();

        $user = $this->seedUser('User', env('SEED_USER_EMAIL', 'user@example.com'), UserRole::User);

        $agent = $this->seedUser('Agent User', env('SEED_AGENT_EMAIL', 'agent@example.com'), UserRole::Agent);
        $supportAgent = Agent::query()->updateOrCreate(
            ['user_id' => $agent->id],
            ['is_active' => true],
        );

        $this->seedUser('Admin User', 'admin@example.com', UserRole::Admin);
        $this->removeAgentsForNonAgentUsers();
        $this->seedDemoTicket($user, $supportAgent);
    }

    private function removeLegacyDemoUsers(): void
    {
        User::query()
            ->where('email', 'test@example.com')
            ->delete();
    }

    private function removeAgentsForNonAgentUsers(): void
    {
        Agent::query()
            ->whereHas('user', fn ($query) => $query->where('role', '!=', UserRole::Agent->value))
            ->delete();
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

<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Agent;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'created_by_id' => User::factory(),
            'assigned_agent_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(TicketPriority::cases()),
            'status' => TicketStatus::Open,
            'assigned_notification_sent_at' => null,
        ];
    }

    /**
     * Indicate that the ticket is assigned to an agent.
     */
    public function assigned(?Agent $agent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_agent_id' => $agent?->id ?? Agent::factory(),
            'status' => TicketStatus::Assigned,
        ]);
    }

    /**
     * Indicate that the ticket is in progress.
     */
    public function inProgress(?Agent $agent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_agent_id' => $agent?->id ?? Agent::factory(),
            'status' => TicketStatus::InProgress,
        ]);
    }
}

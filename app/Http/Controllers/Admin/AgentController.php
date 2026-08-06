<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Teams\CreateTeam;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgentRequest;
use App\Http\Requests\UpdateAgentRequest;
use App\Http\Resources\AgentResource;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AgentController extends Controller
{
    public function index(Request $request): Response
    {
        $agents = Agent::query()
            ->with('user:id,name,email,role')
            ->withCount([
                'tickets',
                'tickets as active_tickets_count' => fn ($query) => $query->whereIn(
                    'status',
                    TicketStatus::activeAssignmentValues(),
                ),
            ])
            ->latest()
            ->get();

        return Inertia::render('agents/index', [
            'agents' => AgentResource::collection($agents)->resolve($request),
        ]);
    }

    public function store(StoreAgentRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        DB::transaction(function () use ($createTeam, $request): void {
            $user = User::query()->create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => $request->validated('password'),
                'role' => UserRole::Agent,
            ]);

            $createTeam->handle($user, $user->name."'s Team", isPersonal: true);

            Agent::query()->create([
                'user_id' => $user->id,
                'is_active' => $request->boolean('is_active', true),
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Agent added.')]);

        return to_route('agents.index');
    }

    public function update(UpdateAgentRequest $request, Agent $agent): RedirectResponse
    {
        $agent->update([
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Agent updated.')]);

        return to_route('agents.index');
    }
}

<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowedRoles = array_map(
            fn (UserRole $role): string => $role->value,
            UserRole::cases(),
        );

        if (! $user) {
            abort(403);
        }

        if ($roles !== [] && ! in_array($user->role->value, array_intersect($allowedRoles, $roles), true)) {
            abort(403);
        }

        return $next($request);
    }
}

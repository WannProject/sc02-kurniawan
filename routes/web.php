<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\TicketHistoryController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketStatusController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');

    Route::resource('tickets', TicketController::class)->only(['index', 'create', 'store', 'show']);
    Route::patch('tickets/{ticket}/status', [TicketStatusController::class, 'update'])->name('tickets.status.update');

    Route::get('api/tickets/{ticket}/history', TicketHistoryController::class)->name('api.tickets.history');
});

require __DIR__.'/settings.php';

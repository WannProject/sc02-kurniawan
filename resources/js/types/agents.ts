import type { TicketUser } from './tickets';

export type Agent = {
    id: number;
    is_active: boolean;
    last_assigned_at: string | null;
    active_tickets_count: number;
    total_tickets_count: number;
    user: (TicketUser & { role: string }) | null;
    created_at: string | null;
    updated_at: string | null;
};

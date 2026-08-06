export type TicketOption = {
    value: string;
    label: string;
};

export type TicketStatusStat = TicketOption & {
    count: number;
};

export type TicketUser = {
    id: number;
    name: string;
    email: string;
};

export type Ticket = {
    id: number;
    title: string;
    description: string;
    priority: TicketOption;
    status: TicketOption;
    created_by?: TicketUser | null;
    assigned_agent?: {
        id: number;
        user: TicketUser | null;
    } | null;
    created_at: string | null;
    updated_at: string | null;
};

export type TicketStatusHistory = {
    id: number;
    from_status: TicketOption | null;
    to_status: TicketOption;
    changed_by?: TicketUser | null;
    note: string | null;
    created_at: string | null;
};

export type TicketReply = {
    id: number;
    body: string;
    user?: (TicketUser & { role: string }) | null;
    created_at: string | null;
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

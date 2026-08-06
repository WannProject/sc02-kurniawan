import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, index, show } from '@/routes/tickets';
import type { Paginated, Ticket } from '@/types';

type Props = {
    tickets: Paginated<Ticket>;
};

export default function TicketsIndex({ tickets }: Props) {
    const { auth } = usePage().props;
    const canCreateTicket = auth.user.role === 'user';

    return (
        <>
            <Head title="Tickets" />

            <h1 className="sr-only">Tickets</h1>

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Tickets"
                        description="Review support tickets and assignment state"
                    />

                    {canCreateTicket ? (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> New ticket
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <div className="space-y-3">
                    {tickets.data.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={show(ticket.id)}
                            className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">
                                        {ticket.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Assigned to{' '}
                                        {ticket.assigned_agent?.user?.name ??
                                            'Unassigned'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Created by{' '}
                                        {ticket.created_by?.name ?? 'System'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        {ticket.priority.label}
                                    </Badge>
                                    <Badge>{ticket.status.label}</Badge>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {tickets.data.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            No tickets yet.
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    );
}

TicketsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tickets',
            href: index(),
        },
    ],
};

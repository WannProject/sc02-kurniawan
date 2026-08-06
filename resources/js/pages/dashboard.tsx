import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import {
    create as createTicket,
    index as ticketsIndex,
    show as showTicket,
} from '@/routes/tickets';
import type { DashboardInvitation, Ticket, TicketStatusStat } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
    ticketStats?: TicketStatusStat[];
    recentTickets?: Ticket[];
};

export default function Dashboard({
    pendingInvitations = [],
    ticketStats = [],
    recentTickets = [],
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    return (
        <>
            <Head title="Dashboard" />

            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="w-fit">
                            Operations
                        </Badge>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Monitor queue state and recent activity.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={ticketsIndex()}>
                                <ArrowRight />
                                View tickets
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={createTicket()}>
                                <Plus />
                                New ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {ticketStats.map((stat) => (
                        <Card key={stat.value} className="gap-2 py-4">
                            <CardContent className="space-y-2 px-4">
                                <div className="text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                                <div className="text-3xl font-semibold">
                                    {stat.count}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent tickets</CardTitle>
                            <CardDescription>
                                Latest items created in the queue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentTickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={showTicket(ticket.id)}
                                    className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <div className="truncate font-medium">
                                                {ticket.title}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {ticket.created_by?.name ??
                                                    'System'}
                                                {' '}
                                                created this ticket
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary">
                                                {ticket.priority.label}
                                            </Badge>
                                            <Badge>{ticket.status.label}</Badge>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            Assigned to{' '}
                                            {ticket.assigned_agent?.user?.name ??
                                                'Unassigned'}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            Updated{' '}
                                            {ticket.updated_at
                                                ? new Date(
                                                      ticket.updated_at,
                                                  ).toLocaleString()
                                                : 'just now'}
                                        </span>
                                    </div>
                                </Link>
                            ))}

                            {recentTickets.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    No tickets yet. Create the first ticket to
                                    start the queue.
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick actions</CardTitle>
                            <CardDescription>
                                Common tasks for this queue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-between" asChild>
                                <Link href={createTicket()}>
                                    Create ticket
                                    <Plus />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                asChild
                            >
                                <Link href={ticketsIndex()}>
                                    Open ticket queue
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Keep the queue visible, assign fast, and close
                                status changes with history.
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});

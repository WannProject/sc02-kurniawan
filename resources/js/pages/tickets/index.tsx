import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ChevronRight,
    Clock3,
    Plus,
    TicketIcon,
    TrendingUp,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { create, index, show } from '@/routes/tickets';
import type { Paginated, Ticket } from '@/types';

type Props = {
    tickets: Paginated<Ticket>;
};

type TicketMetric = {
    icon: LucideIcon;
    label: string;
    value: string;
    hint: string;
    accentClassName: string;
};

function statusTone(value: string): string {
    const tones: Record<string, string> = {
        open: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200',
        assigned:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
        in_progress:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200',
        resolved:
            'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-200',
        closed: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200',
    };

    return tones[value] ?? tones.open;
}

function priorityTone(value: string): string {
    const tones: Record<string, string> = {
        low: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200',
        medium: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200',
        high: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-200',
        urgent: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200',
    };

    return tones[value] ?? tones.medium;
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Unknown';
    }

    return new Date(value).toLocaleString();
}

function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    accentClassName,
}: TicketMetric) {
    return (
        <div className="border-r border-border/70 last:border-r-0">
            <div className="flex min-h-28 items-start gap-4 px-5 py-5">
                <span
                    className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-md border',
                        accentClassName,
                    )}
                >
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="truncate text-sm text-muted-foreground">
                        {label}
                    </div>
                    <div className="text-2xl font-semibold tracking-tight">
                        {value}
                    </div>
                    <div className="text-xs text-muted-foreground">{hint}</div>
                </div>
                <ChevronRight className="mt-1 size-4 text-muted-foreground" />
            </div>
        </div>
    );
}

export default function TicketsIndex({ tickets }: Props) {
    const { auth } = usePage().props;
    const canCreateTicket = auth.user.role === 'user';
    const totalTickets = tickets.meta.total;
    const openTickets = tickets.data.filter(
        (ticket) => ticket.status.value === 'open',
    ).length;
    const assignedTickets = tickets.data.filter(
        (ticket) => ticket.assigned_agent,
    ).length;
    const latestTicket = tickets.data[0];

    const metrics: TicketMetric[] = [
        {
            icon: TicketIcon,
            label: 'Total tickets',
            value: totalTickets.toLocaleString('en-US'),
            hint: 'All records across the queue',
            accentClassName:
                'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200',
        },
        {
            icon: TrendingUp,
            label: 'Open on page',
            value: openTickets.toLocaleString('en-US'),
            hint: 'Waiting for agent handling',
            accentClassName:
                'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-200',
        },
        {
            icon: UserRound,
            label: 'Assigned on page',
            value: assignedTickets.toLocaleString('en-US'),
            hint: 'Already routed to an agent',
            accentClassName:
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
        },
        {
            icon: Clock3,
            label: 'Latest update',
            value: latestTicket ? `#${latestTicket.id}` : '-',
            hint: latestTicket
                ? formatDate(latestTicket.updated_at)
                : 'No activity yet',
            accentClassName:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200',
        },
    ];

    return (
        <>
            <Head title="Tickets" />

            <h1 className="sr-only">Tickets</h1>

            <div className="min-h-[calc(100vh-5rem)] bg-[#f7f7fb] px-5 py-6 md:px-7">
                <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"></section>

                <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
                    <div className="grid md:grid-cols-2 xl:grid-cols-4">
                        {metrics.map((metric) => (
                            <StatCard key={metric.label} {...metric} />
                        ))}
                    </div>
                </section>

                <Card className="mt-6 gap-0 overflow-hidden rounded-lg py-0">
                    <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold tracking-normal">
                                Current tickets
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {tickets.meta.total.toLocaleString('en-US')}{' '}
                                tickets in the system.
                            </p>
                        </div>
                        {canCreateTicket ? (
                            <Button asChild className="h-10 rounded-lg">
                                <Link href={create()}>
                                    <Plus className="size-4" />
                                    New ticket
                                </Link>
                            </Button>
                        ) : null}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <thead className="border-b border-border/70 bg-muted/40 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">
                                        Ticket
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Created by
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Assigned
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Updated
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/70 bg-card">
                                {tickets.data.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                                                    <TicketIcon className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {ticket.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        #{ticket.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {ticket.created_by?.name ??
                                                'System'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <UserRound className="size-4" />
                                                {ticket.assigned_agent?.user
                                                    ?.name ?? 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'rounded-full px-2.5',
                                                    priorityTone(
                                                        ticket.priority.value,
                                                    ),
                                                )}
                                            >
                                                {ticket.priority.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'rounded-full px-2.5',
                                                    statusTone(
                                                        ticket.status.value,
                                                    ),
                                                )}
                                            >
                                                {ticket.status.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="size-4" />
                                                {formatDate(ticket.updated_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={show(ticket.id)}>
                                                    View
                                                    <ArrowUpRight className="size-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tickets.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                                <TicketIcon className="size-5 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold">
                                No tickets yet
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                New support requests will appear here after they
                                are created.
                            </p>
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between border-t border-border/70 px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                            Showing{' '}
                            {tickets.data.length.toLocaleString('en-US')} of{' '}
                            {tickets.meta.total.toLocaleString('en-US')}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                disabled={!tickets.links.prev}
                            >
                                <Link href={tickets.links.prev ?? '#'}>
                                    Previous
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                disabled={!tickets.links.next}
                            >
                                <Link href={tickets.links.next ?? '#'}>
                                    Next
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>
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

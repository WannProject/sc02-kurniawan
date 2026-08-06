import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ChevronRight,
    Clock3,
    Ticket as TicketIcon,
    TrendingUp,
    UserCog,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as createTicket,
    index as ticketsIndex,
    show as showTicket,
} from '@/routes/tickets';
import { index as agentsIndex } from '@/routes/agents';
import type { Ticket as TicketModel, TicketStatusStat } from '@/types';

type Props = {
    ticketStats?: TicketStatusStat[];
    recentTickets?: TicketModel[];
};

function formatRelativeTime(value: string | null): string {
    if (!value) {
        return 'just now';
    }

    const updatedAt = new Date(value);
    const diffInSeconds = Math.round((updatedAt.getTime() - Date.now()) / 1000);
    const absoluteSeconds = Math.abs(diffInSeconds);

    if (absoluteSeconds < 60) {
        return diffInSeconds < 0 ? 'just now' : 'in a moment';
    }

    const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
    ];

    for (const [unit, seconds] of divisions) {
        if (absoluteSeconds >= seconds) {
            return new Intl.RelativeTimeFormat('en', {
                numeric: 'auto',
            }).format(Math.round(diffInSeconds / seconds), unit);
        }
    }

    return 'just now';
}

function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    accentClassName,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    hint: string;
    accentClassName: string;
}) {
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

export default function Dashboard({
    ticketStats = [],
    recentTickets = [],
}: Props) {
    const { auth } = usePage().props;
    const canCreateTicket = auth.user.role === 'user';
    const canManageAgents = auth.user.role === 'admin';

    const totalTickets = ticketStats.reduce(
        (carry, stat) => carry + stat.count,
        0,
    );
    const peakStat = ticketStats.reduce<TicketStatusStat | null>(
        (carry, stat) =>
            carry === null || stat.count > carry.count ? stat : carry,
        null,
    );
    const series: TicketStatusStat[] =
        ticketStats.length > 0
            ? ticketStats
            : [{ value: 'none', label: 'No data', count: 0 }];
    const [activeStatus, setActiveStatus] = useState(
        series[0]?.value ?? 'none',
    );
    const maxCount = Math.max(...series.map((item) => item.count), 1);
    const activeStatusStat =
        series.find((stat) => stat.value === activeStatus) ?? series[0];
    const filteredTickets =
        activeStatusStat?.value === 'none'
            ? []
            : recentTickets.filter(
                  (ticket) => ticket.status.value === activeStatusStat?.value,
              );
    const visibleTickets = filteredTickets.slice(0, 10);

    return (
        <>
            <Head title="Dashboard" />

            <div className="bg-[#f7f7fb] px-5 py-6 md:px-7">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
                        <div className="grid md:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                icon={TicketIcon}
                                label="Total tickets"
                                value={totalTickets.toLocaleString('en-US')}
                                hint="All active records in the system"
                                accentClassName="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label={ticketStats[0]?.label ?? 'Open'}
                                value={(
                                    ticketStats[0]?.count ?? 0
                                ).toLocaleString('en-US')}
                                hint="Primary queue state"
                                accentClassName="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-200"
                            />
                            <StatCard
                                icon={Users}
                                label={ticketStats[1]?.label ?? 'Assigned'}
                                value={(
                                    ticketStats[1]?.count ?? 0
                                ).toLocaleString('en-US')}
                                hint="Handled by the current agent"
                                accentClassName="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200"
                            />
                            <StatCard
                                icon={Clock3}
                                label={ticketStats[2]?.label ?? 'In progress'}
                                value={(
                                    ticketStats[2]?.count ?? 0
                                ).toLocaleString('en-US')}
                                hint="Tickets that reached a terminal state"
                                accentClassName="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"
                            />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-base font-semibold">
                                    Ticket overview
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Queue entries with current status,
                                    assignment, and latest activity.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    Peak: {peakStat?.label ?? 'No data'}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {totalTickets.toLocaleString('en-US')} total
                                </Badge>
                            </div>
                        </div>

                        <div
                            className="flex flex-wrap items-center gap-6 border-b border-border/70 px-5"
                            role="tablist"
                            aria-label="Ticket status filter"
                        >
                            {series.map((stat) => (
                                <button
                                    key={stat.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={
                                        activeStatusStat?.value === stat.value
                                    }
                                    onClick={() => setActiveStatus(stat.value)}
                                    className={cn(
                                        'flex h-14 items-center gap-2 border-b-2 border-transparent text-sm text-muted-foreground transition-colors hover:text-foreground',
                                        activeStatusStat?.value ===
                                            stat.value &&
                                            'border-blue-600 text-foreground',
                                    )}
                                >
                                    <TicketIcon className="size-4" />
                                    <span>{stat.label}</span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                                        {stat.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="border-b border-border/70 bg-muted/30 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Ticket
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Created by
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Priority
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Assigned
                                        </th>
                                        <th className="px-5 py-3 text-left font-medium">
                                            Updated
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {visibleTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium">
                                                    {ticket.title}
                                                </div>
                                                <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                                    {ticket.description}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {ticket.created_by?.name ??
                                                    'System'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full"
                                                >
                                                    {ticket.priority.label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge className="rounded-full">
                                                    {ticket.status.label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {ticket.assigned_agent?.user
                                                    ?.name ?? 'Unassigned'}
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {formatRelativeTime(
                                                    ticket.updated_at,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full"
                                                    asChild
                                                >
                                                    <Link
                                                        href={showTicket(
                                                            ticket.id,
                                                        )}
                                                    >
                                                        View details
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {visibleTickets.length === 0 ? (
                            <div className="px-5 py-10 text-sm text-muted-foreground">
                                No {activeStatusStat?.label.toLowerCase()}{' '}
                                tickets found in recent activity.
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                Showing {visibleTickets.length} of{' '}
                                {filteredTickets.length} recent{' '}
                                {activeStatusStat?.label.toLowerCase()} tickets
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={ticketsIndex()}>
                                    Open full queue
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                        <Card className="rounded-lg border-border/70 bg-background shadow-sm">
                            <CardHeader className="border-b border-border/70">
                                <CardTitle className="text-base">
                                    Status mix
                                </CardTitle>
                                <CardDescription>
                                    Relative load across the current states.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                {series.map((item, index) => (
                                    <div
                                        key={item.value}
                                        className="space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="truncate text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="font-medium">
                                                {item.count.toLocaleString(
                                                    'en-US',
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    index % 3 === 0 &&
                                                        'bg-blue-500',
                                                    index % 3 === 1 &&
                                                        'bg-cyan-500',
                                                    index % 3 === 2 &&
                                                        'bg-emerald-500',
                                                )}
                                                style={{
                                                    width: `${Math.max(
                                                        10,
                                                        (item.count /
                                                            maxCount) *
                                                            100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border-border/70 bg-background shadow-sm">
                            <CardHeader className="border-b border-border/70">
                                <CardTitle className="text-base">
                                    Quick actions
                                </CardTitle>
                                <CardDescription>
                                    Common tasks for the current workflow.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 p-5">
                                {canCreateTicket ? (
                                    <Button
                                        className="h-11 w-full justify-between rounded-lg"
                                        asChild
                                    >
                                        <Link href={createTicket()}>
                                            Create ticket
                                            <ArrowUpRight className="size-4" />
                                        </Link>
                                    </Button>
                                ) : null}
                                {canManageAgents ? (
                                    <Button
                                        className="h-11 w-full justify-between rounded-lg"
                                        asChild
                                    >
                                        <Link href={agentsIndex()}>
                                            Manage agents
                                            <UserCog className="size-4" />
                                        </Link>
                                    </Button>
                                ) : null}
                                <Button
                                    variant="outline"
                                    className="h-11 w-full justify-between rounded-lg"
                                    asChild
                                >
                                    <Link href={ticketsIndex()}>
                                        Open ticket queue
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </Button>
                                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                    Keep the queue visible, assign fast, and
                                    close status changes with history.
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
});

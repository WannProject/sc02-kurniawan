import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    Clock3,
    MessageSquareText,
    Send,
    TicketIcon,
    UserRound,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { index } from '@/routes/tickets';
import { store as storeReply } from '@/routes/tickets/replies';
import { update as updateStatus } from '@/routes/tickets/status';
import type {
    Auth,
    Ticket,
    TicketOption,
    TicketReply,
    TicketStatusHistory,
} from '@/types';

type Props = {
    ticket: Ticket;
    availableStatuses: TicketOption[];
    history: {
        data: TicketStatusHistory[];
    };
    replies: {
        data: TicketReply[];
    };
};

type PageProps = {
    auth: Auth;
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

function DetailStat({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserRound;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-h-24 items-start gap-4 border-r border-border/70 px-5 py-5 last:border-r-0">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                <Icon className="size-4" />
            </span>
            <div className="min-w-0">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="mt-2 truncate text-sm font-semibold">
                    {value}
                </div>
            </div>
        </div>
    );
}

export default function TicketShow({
    ticket,
    availableStatuses,
    history,
    replies,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const canUpdateStatus =
        auth.user.role === 'agent' || auth.user.role === 'admin';
    const availableStatusOptions = availableStatuses ?? [];
    const ticketHistory = history?.data ?? [];
    const ticketReplies = replies?.data ?? [];

    return (
        <>
            <Head title={ticket.title} />

            <h1 className="sr-only">{ticket.title}</h1>

            <div className="min-h-[calc(100vh-5rem)] bg-[#f7f7fb] px-5 py-6 md:px-7">
                <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">
                            Ticket #{ticket.id}
                        </p>
                        <h2 className="mt-1 truncate text-2xl font-semibold tracking-normal text-foreground">
                            {ticket.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Assigned to{' '}
                            {ticket.assigned_agent?.user?.name ?? 'Unassigned'}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-3 py-1',
                                priorityTone(ticket.priority.value),
                            )}
                        >
                            {ticket.priority.label}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-3 py-1',
                                statusTone(ticket.status.value),
                            )}
                        >
                            {ticket.status.label}
                        </Badge>
                        <Button
                            variant="outline"
                            asChild
                            className="h-10 rounded-lg"
                        >
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
                    <div className="grid md:grid-cols-3">
                        <DetailStat
                            icon={UserRound}
                            label="Created by"
                            value={ticket.created_by?.name ?? 'System'}
                        />
                        <DetailStat
                            icon={TicketIcon}
                            label="Assigned agent"
                            value={
                                ticket.assigned_agent?.user?.name ??
                                'Unassigned'
                            }
                        />
                        <DetailStat
                            icon={CalendarClock}
                            label="Updated at"
                            value={formatDate(ticket.updated_at)}
                        />
                    </div>
                </section>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="space-y-6">
                        <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                            <CardHeader className="border-b border-border/70 px-6 py-5">
                                <CardTitle className="text-base">
                                    Description
                                </CardTitle>
                                <CardDescription>
                                    Full context submitted for this support
                                    request.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="rounded-lg border bg-muted/20 p-4 text-sm leading-6 whitespace-pre-wrap">
                                    {ticket.description}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                            <CardHeader className="border-b border-border/70 px-6 py-5">
                                <CardTitle className="text-base">
                                    Conversation
                                </CardTitle>
                                <CardDescription>
                                    User and support replies for this ticket.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 p-6">
                                <div className="space-y-4">
                                    {ticketReplies.map((reply) => {
                                        const isCurrentUser =
                                            reply.user?.id === auth.user.id;

                                        return (
                                            <div
                                                key={reply.id}
                                                className={cn(
                                                    'flex gap-3',
                                                    isCurrentUser &&
                                                        'justify-end',
                                                )}
                                            >
                                                {!isCurrentUser ? (
                                                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                                        <MessageSquareText className="size-4" />
                                                    </span>
                                                ) : null}
                                                <div
                                                    className={cn(
                                                        'max-w-[42rem] rounded-lg border bg-background p-4 shadow-xs',
                                                        isCurrentUser &&
                                                            'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-100',
                                                    )}
                                                >
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">
                                                            {reply.user?.name ??
                                                                'System'}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full px-2 py-0 text-[11px]"
                                                        >
                                                            {reply.user?.role ??
                                                                'system'}
                                                        </Badge>
                                                        <span>
                                                            {formatDate(
                                                                reply.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">
                                                        {reply.body}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {ticketReplies.length === 0 ? (
                                        <div className="rounded-lg border bg-muted/20 p-5 text-sm text-muted-foreground">
                                            No replies yet.
                                        </div>
                                    ) : null}
                                </div>

                                <Form
                                    {...storeReply.form(ticket.id)}
                                    resetOnSuccess
                                    className="space-y-4 rounded-lg border bg-muted/20 p-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="body">
                                                    Reply
                                                </Label>
                                                <textarea
                                                    id="body"
                                                    name="body"
                                                    rows={4}
                                                    placeholder="Write a reply, for example: Terima kasih, sudah bisa."
                                                    className="resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                />
                                                <InputError
                                                    message={errors.body}
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-10 rounded-lg"
                                                >
                                                    <Send className="size-4" />
                                                    Send reply
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                            <CardHeader className="border-b border-border/70 px-6 py-5">
                                <CardTitle className="text-base">
                                    History
                                </CardTitle>
                                <CardDescription>
                                    Recent status changes and operational notes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {ticketHistory.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="relative border-l border-border/70 pl-5"
                                        >
                                            <span className="absolute top-1 -left-[7px] flex size-3.5 rounded-full border border-background bg-blue-500" />
                                            <div className="flex flex-wrap items-center gap-2">
                                                {entry.from_status ? (
                                                    <>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full"
                                                        >
                                                            {
                                                                entry
                                                                    .from_status
                                                                    .label
                                                            }
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            to
                                                        </span>
                                                    </>
                                                ) : null}
                                                <Badge className="rounded-full">
                                                    {entry.to_status?.label ??
                                                        'Unknown'}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock3 className="size-4" />
                                                {entry.changed_by?.name ??
                                                    'System'}{' '}
                                                - {formatDate(entry.created_at)}
                                            </div>
                                            {entry.note ? (
                                                <p className="mt-2 rounded-lg bg-muted/40 p-3 text-sm">
                                                    {entry.note}
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}

                                    {ticketHistory.length === 0 ? (
                                        <div className="rounded-lg border bg-muted/20 p-5 text-sm text-muted-foreground">
                                            No status history recorded yet.
                                        </div>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                        <CardHeader className="border-b border-border/70 px-6 py-5">
                            <CardTitle className="text-base">
                                Status control
                            </CardTitle>
                            <CardDescription>
                                Move the ticket through the support workflow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {canUpdateStatus &&
                            availableStatusOptions.length > 0 ? (
                                <Form
                                    {...updateStatus.form(ticket.id)}
                                    className="space-y-5"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">
                                                    Next status
                                                </Label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    defaultValue={
                                                        availableStatusOptions[0]
                                                            ?.value
                                                    }
                                                >
                                                    {availableStatusOptions.map(
                                                        (status) => (
                                                            <option
                                                                key={
                                                                    status.value
                                                                }
                                                                value={
                                                                    status.value
                                                                }
                                                            >
                                                                {status.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <InputError
                                                    message={errors.status}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="note">
                                                    Note
                                                </Label>
                                                <textarea
                                                    id="note"
                                                    name="note"
                                                    rows={4}
                                                    placeholder="Add an internal status note."
                                                    className="resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                />
                                                <InputError
                                                    message={errors.note}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-10 w-full rounded-lg"
                                            >
                                                <Send className="size-4" />
                                                Update status
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            ) : (
                                <div className="rounded-lg border bg-muted/20 p-5 text-sm text-muted-foreground">
                                    {canUpdateStatus
                                        ? 'No further transitions are available.'
                                        : 'Status changes are available for agents and admins only.'}
                                </div>
                            )}

                            <div className="mt-5 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                                    <CheckCircle2 className="size-4 text-emerald-600" />
                                    Current workflow
                                </div>
                                Keep status notes short, factual, and tied to
                                the latest action.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

TicketShow.layout = {
    breadcrumbs: [
        {
            title: 'Tickets',
            href: index(),
        },
        {
            title: 'Ticket',
            href: '#',
        },
    ],
};

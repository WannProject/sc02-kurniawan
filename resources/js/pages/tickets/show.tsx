import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { index, show } from '@/routes/tickets';
import { update as updateStatus } from '@/routes/tickets/status';
import type { Ticket, TicketOption, TicketStatusHistory } from '@/types';

type Props = {
    ticket: Ticket;
    availableStatuses: TicketOption[];
    history: {
        data: TicketStatusHistory[];
    };
};

export default function TicketShow({
    ticket,
    availableStatuses,
    history,
}: Props) {
    return (
        <>
            <Head title={ticket.title} />

            <h1 className="sr-only">{ticket.title}</h1>

            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        variant="small"
                        title={ticket.title}
                        description={`Assigned to ${ticket.assigned_agent?.user?.name ?? 'Unassigned'}`}
                    />

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            {ticket.priority.label}
                        </Badge>
                        <Badge>{ticket.status.label}</Badge>
                    </div>
                </div>

                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Created by
                        </div>
                        <div className="mt-1 text-sm font-medium">
                            {ticket.created_by?.name ?? 'System'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Assigned to
                        </div>
                        <div className="mt-1 text-sm font-medium">
                            {ticket.assigned_agent?.user?.name ?? 'Unassigned'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Updated at
                        </div>
                        <div className="mt-1 text-sm font-medium">
                            {ticket.updated_at
                                ? new Date(ticket.updated_at).toLocaleString()
                                : 'Unknown'}
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-4">
                        <Heading variant="small" title="Description" />
                        <p className="whitespace-pre-wrap rounded-lg border p-4 text-sm leading-6">
                            {ticket.description}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <Heading variant="small" title="Status" />

                            {availableStatuses.length > 0 ? (
                                <Form
                                    {...updateStatus.form(ticket.id)}
                                    className="space-y-4"
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
                                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                                    defaultValue={
                                                        availableStatuses[0]
                                                            ?.value
                                                    }
                                                >
                                                    {availableStatuses.map(
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
                                                    rows={3}
                                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                />
                                                <InputError
                                                    message={errors.note}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Update status
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No further transitions are available.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Heading variant="small" title="History" />

                    <div className="space-y-3">
                        {history.data.map((entry) => (
                            <div
                                key={entry.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {entry.from_status ? (
                                        <>
                                            <Badge variant="secondary">
                                                {entry.from_status.label}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                to
                                            </span>
                                        </>
                                    ) : null}
                                    <Badge>{entry.to_status.label}</Badge>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {entry.changed_by?.name ?? 'System'} ·{' '}
                                    {entry.created_at
                                        ? new Date(
                                              entry.created_at,
                                          ).toLocaleString()
                                        : ''}
                                </div>
                                {entry.note ? (
                                    <p className="mt-2 text-sm">
                                        {entry.note}
                                    </p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="ghost" asChild>
                    <Link href={index()}>Back to tickets</Link>
                </Button>
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
            href: show(0),
        },
    ],
};

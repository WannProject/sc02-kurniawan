import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store } from '@/routes/tickets';
import type { TicketOption } from '@/types';

type Props = {
    priorities: TicketOption[];
};

export default function TicketCreate({ priorities }: Props) {
    return (
        <>
            <Head title="New Ticket" />

            <h1 className="sr-only">New Ticket</h1>

            <div className="max-w-3xl space-y-6">
                <Heading
                    variant="small"
                    title="New ticket"
                    description="Create a ticket and let the queue assign it"
                />

                <Form {...store.form()} className="space-y-6">
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    maxLength={255}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    name="priority"
                                    required
                                    defaultValue="medium"
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {priorities.map((priority) => (
                                        <option
                                            key={priority.value}
                                            value={priority.value}
                                        >
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.priority} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={8}
                                    className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create ticket
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

TicketCreate.layout = {
    breadcrumbs: [
        {
            title: 'Tickets',
            href: index(),
        },
        {
            title: 'New',
            href: '#',
        },
    ],
};

import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Send, TicketIcon } from 'lucide-react';
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

            <div className="min-h-[calc(100vh-5rem)] bg-[#f7f7fb] px-5 py-6 md:px-7">
                <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Support desk
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
                            New ticket
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a support request and route it into the queue.
                        </p>
                    </div>

                    <Button variant="outline" asChild className="h-10 rounded-lg">
                        <Link href={index()}>
                            <ArrowLeft className="size-4" />
                            Back to tickets
                        </Link>
                    </Button>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                        <CardHeader className="border-b border-border/70 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                                    <TicketIcon className="size-5" />
                                </span>
                                <div>
                                    <CardTitle className="text-base">
                                        Ticket information
                                    </CardTitle>
                                    <CardDescription>
                                        Use a clear subject and enough context for the agent.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <Form {...store.form()} className="contents">
                            {({ errors, processing }) => (
                                <>
                                    <CardContent className="grid gap-5 p-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Subject</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                required
                                                maxLength={255}
                                                placeholder="Example: Cannot access dashboard"
                                                className="h-11 rounded-lg bg-background"
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
                                                className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                required
                                                rows={9}
                                                placeholder="Describe what happened, what you expected, and any steps already tried."
                                                className="min-h-48 resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            />
                                            <InputError
                                                message={errors.description}
                                            />
                                        </div>
                                    </CardContent>

                                    <div className="flex flex-col-reverse gap-3 border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            asChild
                                            className="h-10 rounded-lg"
                                        >
                                            <Link href={index()}>Cancel</Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-10 rounded-lg"
                                        >
                                            <Send className="size-4" />
                                            Create ticket
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </Card>

                    <Card className="rounded-lg border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Submission checklist
                            </CardTitle>
                            <CardDescription>
                                Help the queue resolve your issue faster.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                'Use a specific subject',
                                'Choose the right priority',
                                'Include context and expected result',
                            ].map((item) => (
                                <div key={item} className="flex gap-3 text-sm">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    <span>{item}</span>
                                </div>
                            ))}
                            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Tickets are routed to the general support agent queue after submission.
                            </div>
                            <Badge variant="outline" className="rounded-full">
                                General support queue
                            </Badge>
                        </CardContent>
                    </Card>
                </div>
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

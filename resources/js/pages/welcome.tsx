import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Ticket,
    Users,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-svh bg-background px-6 py-6 md:px-8 lg:px-10">
                <div className="mx-auto grid min-h-[calc(100svh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="flex flex-col justify-between rounded-3xl border bg-muted/20 p-6 md:p-10">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-sm font-medium">
                                    Antrian Tiket
                                </div>
                                <Badge variant="secondary">
                                    Support operations
                                </Badge>
                            </div>

                            <div className="max-w-2xl space-y-5">
                                <Badge variant="outline" className="w-fit">
                                    Team-aware ticketing
                                </Badge>
                                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                    Kelola tiket, tim, dan status kerja dalam
                                    satu alur yang rapi.
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    Halaman login, registrasi, dan dashboard
                                    sekarang memakai komponen shadcn yang
                                    konsisten dengan aplikasi utama.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={dashboardUrl}>
                                            Open dashboard
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild>
                                            <Link href={login()}>
                                                Log in
                                                <ArrowRight />
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={register()}>
                                                Create account
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    {
                                        icon: Ticket,
                                        title: 'Ticket lifecycle',
                                        description:
                                            'Create, assign, transition, and audit tickets.',
                                    },
                                    {
                                        icon: Users,
                                        title: 'Team routing',
                                        description:
                                            'Teams stay separate and switching stays explicit.',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Controlled access',
                                        description:
                                            'Policies and requests guard sensitive actions.',
                                    },
                                ].map((item) => (
                                    <Card key={item.title} className="gap-3 py-4">
                                        <CardContent className="space-y-3 px-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                                <item.icon className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">
                                                    {item.title}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 space-y-4">
                            <Separator />
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="size-4" />
                                    Inertia React
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="size-4" />
                                    Fortify auth
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="size-4" />
                                    shadcn/ui
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="flex items-center">
                        <Card className="w-full shadow-sm">
                            <CardHeader className="space-y-2">
                                <Badge variant="outline" className="w-fit">
                                    What is live
                                </Badge>
                                <CardTitle className="text-2xl">
                                    Entry points already wired
                                </CardTitle>
                                <CardDescription>
                                    Login, registration, dashboard, and ticket
                                    flow all point to the same backend model.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    {[
                                        'Authenticated users land in the dashboard.',
                                        'Team invitations can be accepted from email.',
                                        'Ticket status changes are tracked in history.',
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-3 rounded-lg border p-3"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {auth.user ? (
                                    <Button className="w-full" asChild>
                                        <Link href={dashboardUrl}>
                                            Go to dashboard
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Button className="w-full" asChild>
                                            <Link href={login()}>
                                                Log in
                                            </Link>
                                        </Button>
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={register()}>
                                                Register
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}

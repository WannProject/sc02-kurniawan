import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Ticket,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const featureItems = [
    {
        icon: Ticket,
        title: 'Ticket flow',
        description: 'Buat, assign, dan ubah status dalam satu alur.',
    },
    {
        icon: Users,
        title: 'Team aware',
        description: 'Setiap pengguna tetap terikat ke tim aktifnya.',
    },
    {
        icon: ShieldCheck,
        title: 'Controlled access',
        description: 'Aksi sensitif tetap dibatasi oleh policy.',
    },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-background">
            <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
                <section className="flex flex-col justify-between border-b bg-muted/20 p-6 lg:border-b-0 lg:border-r lg:p-10">
                    <div className="space-y-10">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 self-start"
                        >
                            <AppLogoIcon className="size-9 fill-current text-foreground" />
                            <div className="space-y-0.5">
                                <div className="text-sm font-medium">
                                    Antrian Tiket
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Workflow operasional
                                </div>
                            </div>
                        </Link>

                        <div className="max-w-xl space-y-6">
                            <Badge variant="secondary" className="w-fit">
                                Queue management
                            </Badge>

                            <div className="space-y-3">
                                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                    Sistem tiket yang lebih rapi untuk tim
                                    operasional.
                                </h1>
                                <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                                    Login, registrasi, dashboard, dan alur tiket
                                    sekarang ditata dengan komponen shadcn yang
                                    konsisten.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline">Inertia React</Badge>
                                <Badge variant="outline">Fortify</Badge>
                                <Badge variant="outline">shadcn/ui</Badge>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {featureItems.map((item) => (
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
                                Ticket history
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="size-4" />
                                Team switching
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="size-4" />
                                Controlled access
                            </span>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center p-6 lg:p-10">
                    <div className="w-full max-w-md">
                        <Card className="shadow-sm">
                            <CardHeader className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">Secure access</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Headless auth
                                    </span>
                                </div>
                                <CardTitle className="text-2xl">
                                    {title}
                                </CardTitle>
                                {description ? (
                                    <CardDescription>
                                        {description}
                                    </CardDescription>
                                ) : null}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {children}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
}

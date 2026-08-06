import { Link } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck, Ticket, Users } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
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
            <div className="grid min-h-svh lg:grid-cols-[0.95fr_1.05fr]">
                <section className="flex flex-col justify-between border-b bg-muted/30 p-6 lg:border-r lg:border-b-0 lg:p-10">
                    <div className="space-y-12">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-4 self-start"
                        >
                            <AppLogoIcon className="h-16 w-24 shrink-0 sm:h-20 sm:w-32" />
                            <div className="space-y-1">
                                <div className="text-lg font-semibold">
                                    Antrian Tiket
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Queue support system
                                </div>
                            </div>
                        </Link>

                        <div className="max-w-xl space-y-6">
                            <Badge variant="secondary" className="w-fit">
                                Queue & state management
                            </Badge>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Kelola laporan support dengan assignment,
                                    status, dan audit trail yang jelas.
                                </h1>
                                <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                                    Tiket baru otomatis masuk ke agent aktif,
                                    setiap perubahan status tercatat, dan
                                    notifikasi email berjalan lewat queue.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline">Auto assignment</Badge>
                                <Badge variant="outline">Audit trail</Badge>
                                <Badge variant="outline">Queued email</Badge>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {featureItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="space-y-3 rounded-md border bg-background/60 p-4"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                        <item.icon className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            {item.title}
                                        </div>
                                        <p className="text-sm leading-5 text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
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

                <section className="flex items-center justify-center p-6 sm:p-8 lg:p-14">
                    <div className="w-full max-w-lg space-y-7">
                        <div className="space-y-4">
                            <Badge variant="outline" className="w-fit">
                                Secure access
                            </Badge>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    {title}
                                </h2>
                                {description ? (
                                    <p className="max-w-md text-base leading-7 text-muted-foreground">
                                        {description}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-7">{children}</div>
                    </div>
                </section>
            </div>
        </div>
    );
}

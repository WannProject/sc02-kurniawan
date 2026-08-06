import { Form, Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Lock,
    Mail,
    PauseCircle,
    ShieldCheck,
    User,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/agents';
import type { Agent } from '@/types';

type Props = {
    agents: Agent[];
};

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Belum pernah';
    }

    return new Date(value).toLocaleString('id-ID');
}

export default function AgentsIndex({ agents }: Props) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const stats = useMemo(
        () => ({
            total: agents.length,
            active: agents.filter((agent) => agent.is_active).length,
            load: agents.reduce(
                (total, agent) => total + agent.active_tickets_count,
                0,
            ),
        }),
        [agents],
    );

    const toggleAgent = (agent: Agent) => {
        router.visit(update(agent.id), {
            data: { is_active: !agent.is_active },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Agent Management" />

            <h1 className="sr-only">Agent Management</h1>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <div className="min-h-[calc(100vh-5rem)] bg-[#f7f7fb] px-5 py-6 md:px-7">
                    <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Admin operations
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
                                Agent Management
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Kelola agent yang bisa menerima assignment
                                ticket otomatis.
                            </p>
                        </div>
                        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
                            <Form
                                key={String(createDialogOpen)}
                                {...store.form()}
                                resetOnSuccess
                                onSuccess={() => setCreateDialogOpen(false)}
                                className="space-y-6"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Tambah agent baru
                                            </DialogTitle>
                                            <DialogDescription>
                                                Buat akun karyawan baru dengan
                                                role agent.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Nama agent
                                                </Label>
                                                <div className="relative">
                                                    <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        autoComplete="name"
                                                        placeholder="Nama lengkap"
                                                        className="h-11 rounded-lg bg-background pl-9"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email agent
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        required
                                                        autoComplete="email"
                                                        placeholder="agent@example.com"
                                                        className="h-11 rounded-lg bg-background pl-9"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">
                                                    Password
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        autoComplete="new-password"
                                                        className="h-11 rounded-lg bg-background pl-9"
                                                    />
                                                </div>
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">
                                                    Konfirmasi password
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        required
                                                        autoComplete="new-password"
                                                        className="h-11 rounded-lg bg-background pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <input
                                            type="hidden"
                                            name="is_active"
                                            value="1"
                                        />

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                >
                                                    Batal
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <UserPlus className="size-4" />
                                                Simpan agent
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border/70 bg-background p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total agent
                                </span>
                                <UsersRound className="size-4 text-muted-foreground" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold">
                                {stats.total}
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Agent aktif
                                </span>
                                <CheckCircle2 className="size-4 text-emerald-600" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold">
                                {stats.active}
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Beban ticket aktif
                                </span>
                                <ShieldCheck className="size-4 text-blue-600" />
                            </div>
                            <div className="mt-3 text-2xl font-semibold">
                                {stats.load}
                            </div>
                        </div>
                    </section>

                    <div className="mt-6">
                        <Card className="gap-0 overflow-hidden rounded-lg border-border/70 py-0 shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Daftar agent
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Agent aktif akan dipilih otomatis
                                        berdasarkan beban ticket paling ringan.
                                    </p>
                                </div>
                                <DialogTrigger asChild>
                                    <Button className="h-10 w-full rounded-lg sm:w-auto">
                                        <UserPlus className="size-4" />
                                        Tambah agent
                                    </Button>
                                </DialogTrigger>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="border-b border-border/70 bg-muted/40 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">
                                                Agent
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Ticket aktif
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Total ticket
                                            </th>
                                            <th className="px-6 py-3 font-medium">
                                                Assignment terakhir
                                            </th>
                                            <th className="px-6 py-3 text-right font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/70 bg-card">
                                        {agents.map((agent) => (
                                            <tr
                                                key={agent.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <Avatar className="size-10 rounded-lg">
                                                            <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                                                                {agent.user
                                                                    ? initials(
                                                                          agent
                                                                              .user
                                                                              .name,
                                                                      )
                                                                    : 'AG'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="truncate font-medium">
                                                                {agent.user
                                                                    ?.name ??
                                                                    'Unknown agent'}
                                                            </div>
                                                            <div className="truncate text-xs text-muted-foreground">
                                                                {agent.user
                                                                    ?.email ??
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'rounded-full px-2.5',
                                                            agent.is_active
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200'
                                                                : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200',
                                                        )}
                                                    >
                                                        {agent.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {agent.active_tickets_count}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {agent.total_tickets_count}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Clock3 className="size-4" />
                                                        {formatDate(
                                                            agent.last_assigned_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            agent.is_active
                                                                ? 'outline'
                                                                : 'default'
                                                        }
                                                        size="sm"
                                                        className="h-9 rounded-lg"
                                                        onClick={() =>
                                                            toggleAgent(agent)
                                                        }
                                                    >
                                                        {agent.is_active ? (
                                                            <PauseCircle className="size-4" />
                                                        ) : (
                                                            <CheckCircle2 className="size-4" />
                                                        )}
                                                        {agent.is_active
                                                            ? 'Nonaktifkan'
                                                            : 'Aktifkan'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}

                                        {agents.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center text-muted-foreground"
                                                >
                                                    Belum ada agent.
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            </Dialog>
        </>
    );
}

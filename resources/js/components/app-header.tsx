import { Link, usePage } from '@inertiajs/react';
import { Bell, LayoutGrid, Menu, Search, UserCog } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { index as agentsIndex } from '@/routes/agents';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth, name: appName } = usePage().props;
    const getInitials = useInitials();
    const dashboardUrl = dashboard();
    const canManageAgents = auth.user.role === 'admin';

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 items-center gap-3 px-4 md:max-w-7xl">
                    <div className="flex items-center gap-2">
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-lg"
                                    >
                                        <Menu className="size-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground"
                                >
                                    <SheetTitle className="sr-only">
                                        Navigation menu
                                    </SheetTitle>
                                    <SheetHeader className="border-b border-sidebar-border/70 px-4 py-4 text-left">
                                        <Link
                                            href={dashboardUrl}
                                            className="flex items-center gap-2"
                                        >
                                            <AppLogoIcon className="size-7 fill-current text-black dark:text-white" />
                                            <div className="grid leading-tight">
                                                <span className="text-sm font-semibold">
                                                    {appName}
                                                </span>
                                                <span className="text-xs text-sidebar-foreground/70">
                                                    Support queue
                                                </span>
                                            </div>
                                        </Link>
                                    </SheetHeader>
                                    <div className="flex flex-1 flex-col gap-4 p-4">
                                        <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 p-3">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full bg-background text-foreground"
                                            >
                                                Operations
                                            </Badge>
                                            <p className="mt-2 text-sm text-sidebar-foreground/80">
                                                Workspace navigation for ticket
                                                handling.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start rounded-lg"
                                                asChild
                                            >
                                                <Link href={dashboardUrl}>
                                                    <LayoutGrid className="size-4" />
                                                    Dashboard
                                                </Link>
                                            </Button>
                                            {canManageAgents ? (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start rounded-lg"
                                                    asChild
                                                >
                                                    <Link href={agentsIndex()}>
                                                        <UserCog className="size-4" />
                                                        Agents
                                                    </Link>
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link
                            href={dashboardUrl}
                            prefetch
                            className="flex items-center gap-2"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    <div className="hidden flex-1 justify-center px-4 lg:flex">
                        <div className="flex w-full max-w-2xl items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    aria-label="Search application"
                                    placeholder="Search tickets, agents, status..."
                                    className="h-10 rounded-lg border-border/70 bg-muted/30 pl-9"
                                />
                            </div>
                            {canManageAgents ? (
                                <Button
                                    variant="ghost"
                                    className="h-10 rounded-lg px-3"
                                    asChild
                                >
                                    <Link href={agentsIndex()}>
                                        <UserCog className="size-4" />
                                        Agents
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-lg"
                        >
                            <Bell className="size-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 gap-2 rounded-lg px-2"
                                >
                                    <Avatar className="size-7">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden text-left leading-tight sm:block">
                                        <div className="truncate text-sm font-medium">
                                            {auth.user.name}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {auth.user.role}
                                        </div>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {breadcrumbs.length > 1 ? (
                <div className="border-b border-border/70 bg-background/80">
                    <div className="mx-auto flex h-12 w-full items-center px-4 text-muted-foreground md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            ) : null}
        </>
    );
}

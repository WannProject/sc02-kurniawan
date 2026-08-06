import { usePage } from '@inertiajs/react';
import { ChevronRight, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

export function AppSidebarHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { state } = useSidebar();

    return (
        <header
            className={cn(
                'fixed left-0 right-0 top-0 z-50 flex min-h-20 shrink-0 flex-col gap-2 border-b border-border/70 bg-background px-5 py-4 shadow-sm transition-[left,width] duration-300 ease-in-out md:px-7',
                state === 'collapsed'
                    ? 'md:left-(--sidebar-width-icon) md:w-[calc(100%-var(--sidebar-width-icon))]'
                    : 'md:left-(--sidebar-width) md:w-[calc(100%-var(--sidebar-width))]',
            )}
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <SidebarTrigger className="-ml-1 rounded-md border border-border/70 bg-background shadow-sm" />
                    <div className="relative w-full max-w-xl">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            aria-label="Search tickets"
                            placeholder="Search tickets..."
                            className="h-10 rounded-lg border-border/70 bg-background pl-9 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 gap-1 rounded-lg px-2"
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
                                <ChevronRight className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

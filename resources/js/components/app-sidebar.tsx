import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Ticket } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as ticketsIndex } from '@/routes/tickets';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const dashboardUrl = dashboard();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Tickets',
            href: ticketsIndex(),
            icon: Ticket,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="h-20 justify-center border-b border-sidebar-border/70 bg-sidebar px-6 py-0 group-data-[collapsible=icon]:px-2">
                <Link
                    href={dashboardUrl}
                    prefetch
                    className="flex w-full items-center justify-center"
                >
                    <AppLogoIcon className="h-20 w-32 shrink-0" />
                </Link>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar px-3 py-5">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="gap-3 border-t border-sidebar-border/70 bg-sidebar px-3 py-5">
                <NavFooter items={footerNavItems} />
            </SidebarFooter>
        </Sidebar>
    );
}

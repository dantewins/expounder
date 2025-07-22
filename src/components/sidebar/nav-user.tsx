"use client"

import {
    IconChevronDown,
    IconLogout,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    useSidebar,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useClerk, useUser } from "@clerk/nextjs"
import { useCallback, useState } from "react"
import { clsx } from "clsx"

export function NavUser() {
    const { user, isLoaded } = useUser();
    const { isMobile } = useSidebar();

    const clerk = useClerk();
    const handleSignOut = useCallback(() => {
        clerk.signOut({ redirectUrl: "/" });
    }, [clerk]);

    const [open, setOpen] = useState(false);

    if (!isLoaded) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.emailAddresses[0].emailAddress}
                                </span>
                            </div>
                            <IconChevronDown 
                                className={clsx(
                                    "ml-auto size-4 transition-transform duration-200",
                                    open && "rotate-180"
                                )} 
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "top"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user?.emailAddresses[0].emailAddress}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
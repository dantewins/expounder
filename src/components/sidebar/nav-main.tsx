"use client"

import { type Icon } from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import clsx from "clsx"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: { title: string; url: string; icon?: Icon }[]
}) {
    const pathname = usePathname()
    const router = useRouter()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = '/dashboard' + item.url === pathname ? true : false

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    className={clsx(
                                        "flex w-full items-center gap-2",
                                        isActive && "bg-muted text-primary"
                                    )}
                                    onClick={() => router.push('/dashboard' + item.url)}
                                >
                                    {item.icon && <item.icon className="size-4" />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

"use client";

import {
    IconPlus,
    IconDotsVertical,
    IconTrash,
} from "@tabler/icons-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function NavMain() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [readmes, setReadmes] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/core/expound/fetch")
            .then((r) => r.json())
            .then(({ readmes = [] }) =>
                setReadmes(
                    readmes.sort(
                        (a: any, b: any) => Number(b.timestamp) - Number(a.timestamp),
                    ),
                ),
            )
            .catch((e) => console.error("Failed to fetch expounds:", e));
    }, []);

    const handleDelete = async (
        owner: string,
        repo: string,
        timestamp: string,
    ) => {
        try {
            const res = await fetch("/api/core/expound/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo, timestamp }),
            });
            if (!res.ok) throw new Error("Delete failed");
            setReadmes((prev) =>
                prev.filter(
                    (r) =>
                        r.owner !== owner ||
                        r.repo !== repo ||
                        r.timestamp !== timestamp,
                ),
            );
            toast.success(`Successfully deleted ${owner}/${repo}`);
        } catch (e) {
            console.error("Error deleting expound:", e);
            toast.error(`Failed to delete ${owner}/${repo}`);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center mb-3">
                        <SidebarMenuButton
                            variant="outline"
                            tooltip="Add new"
                            className={clsx(
                                "flex w-full items-center justify-center gap-2 bg-stone-950 text-white hover:text-white hover:bg-neutral-900 transition-colors",
                            )}
                            onClick={() => router.push("/dashboard/expounds")}
                        >
                            <IconPlus className="size-4" />
                            <span>Add</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarGroupLabel>Your expounds</SidebarGroupLabel>

                    {readmes.map((item) => {
                        const uri = `/dashboard/expounds/file?owner=${encodeURIComponent(item.owner)}&repo=${encodeURIComponent(item.repo)}&timestamp=${encodeURIComponent(item.timestamp)}`;

                        const isActive =
                            pathname === "/dashboard/expounds/file" &&
                            searchParams.get("owner") === item.owner &&
                            searchParams.get("repo") === item.repo &&
                            searchParams.get("timestamp") === item.timestamp;

                        return (
                            <SidebarMenuItem key={`${item.owner}-${item.repo}-${item.timestamp}`}>
                                <SidebarMenuButton
                                    className={`flex items-center justify-between ${isActive && "bg-muted text-primary"}`}
                                    onClick={() => router.push(uri)}
                                >
                                    <span>
                                        {item.owner}/{item.repo}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <span
                                                className="inline-flex size-6 items-center justify-center rounded-sm hover:bg-gray-200"
                                                onClick={(e) => e.stopPropagation()}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <IconDotsVertical className="size-4" />
                                            </span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(
                                                        item.owner,
                                                        item.repo,
                                                        item.timestamp,
                                                    );
                                                }}
                                            >
                                                <IconTrash className="mr-0.5 size-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
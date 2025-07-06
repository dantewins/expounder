import { cookies } from "next/headers";
import { Octokit } from "octokit";
import { ConnectGithubBanner } from "@/components/connect-github-banner";
import { AppSidebar } from "@/components/test/app-sidebar";
import { SiteHeader } from "@/components/test/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

async function isTokenValid(token?: string): Promise<boolean> {
    if (!token) return false;
    try {
        const octokit = new Octokit({ auth: token });
        await octokit.rest.users.getAuthenticated();
        return true;
    } catch {
        return false;
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("gh_token")?.value;
    const ok = await isTokenValid(token);

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {ok ? children : <ConnectGithubBanner />}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {

    return (
        <p>hello</p>
        // <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
        //     <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        //         <h1 className="text-3xl font-bold tracking-tight">My Release Notes</h1>
        //         <Button asChild>
        //             <Link href="/dashboard/new" className="flex items-center gap-1">
        //                 <Plus className="h-4 w-4" /> Generate notes
        //             </Link>
        //         </Button>
        //     </header>
        //     <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        //         You haven’t generated any release notes yet.<br />
        //         Click <span className="font-medium">Generate notes</span> to start!
        //     </div>
        // </div>
    );
}

"use client";

import Link from "next/link";
import { IconAlertCircle, IconBrandGithub} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConnectGithubBanner() {
    return (
        <Card className="border-dashed border-primary/40">
            <CardContent className="flex items-center gap-4 py-3">
                <IconAlertCircle className="h-6 w-6 text-primary" />
                <div className="flex-1 text-sm">
                    GitHub data is unavailable. Press **Connect GitHub** to authorise the
                    dashboard and unlock repository features.
                </div>
                <Button asChild size="sm">
                    <Link href="/connect/github">
                        <IconBrandGithub className="mr-1 h-4 w-4" /> Connect GitHub
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

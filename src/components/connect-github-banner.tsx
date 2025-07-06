"use client";

import { IconAlertCircle, IconBrandGithub} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConnectGithubBanner() {
    return (
        <Card className="">
            <CardContent className="flex items-center gap-4">
                <IconAlertCircle className="h-6 w-6" />
                <div className="flex-1 text-sm">
                    GitHub data is unavailable. Press Connect GitHub to authorize the
                    dashboard and unlock expounder.
                </div>
                <Button asChild size="sm">
                    <a href="/api/github/authorize">
                        <IconBrandGithub className="mr-1 h-4 w-4" /> Connect GitHub
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}

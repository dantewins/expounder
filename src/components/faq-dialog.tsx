"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function FaqDialog({ open, setOpen, isMobile = false }: { open: boolean; setOpen: (open: boolean) => void; isMobile?: boolean }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size={isMobile ? "lg": "sm"} className={isMobile ? "w-full text-lg mb-4" : ''}>
                    FAQ
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>FAQ</DialogTitle>
                    <DialogDescription>
                        Answers to common questions about Expounder.
                    </DialogDescription>
                </DialogHeader>
                <Accordion type="single" collapsible className="w-full space-y-1">
                    <AccordionItem value="q1">
                        <AccordionTrigger>Is Expounder free?</AccordionTrigger>
                        <AccordionContent>
                            Yes! The core features are free for personal projects. We may
                            add optional paid tiers in the future.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q2">
                        <AccordionTrigger>Do you store my code?</AccordionTrigger>
                        <AccordionContent>
                            We only keep minimal commit metadata to generate release notes.
                            No source code is ever stored on our servers.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="q3">
                        <AccordionTrigger>Which AI model do you use?</AccordionTrigger>
                        <AccordionContent>
                            We use OpenAI GPT‑4o for clustering and summarising commits.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </DialogContent>
        </Dialog>
    );
}

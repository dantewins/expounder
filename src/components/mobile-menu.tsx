"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconMenuDeep, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FaqDialog } from "@/components/faq-dialog";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

export function MobileMenu({ faqOpen, setFaqOpen }: { faqOpen: boolean; setFaqOpen: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const { signOut } = useClerk();

    const [portalNode, setPortalNode] = useState<Element | null>(null);
    useEffect(() => setPortalNode(document.body), []);

    useEffect(() => {
        if (!portalNode) return;
        portalNode.classList.toggle("overflow-hidden", open);
        return () => portalNode.classList.remove("overflow-hidden");
    }, [open, portalNode]);

    const fade = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } },
    };

    const HEADER_OFFSET = "top-20";
    const Z = "z-40";

    const drawer = (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        variants={fade}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        onClick={() => setOpen(false)}
                        className={`fixed inset-x-0 bottom-0 ${HEADER_OFFSET} ${Z} bg-black/50 backdrop-blur-sm`}
                    />
                    <motion.nav
                        key="panel"
                        variants={fade}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className={`fixed inset-x-0 bottom-0 ${HEADER_OFFSET} ${Z} flex flex-col bg-background p-8 overflow-y-auto`}
                    >
                        <div className="flex flex-col gap-4">
                            <p>About</p>
                            <p>Pricing</p>
                            <p>Contact</p>
                            <p>Features</p>
                        </div>
                        <div className="mt-auto flex flex-col gap-4">
                            <SignedOut>
                                <FaqDialog open={faqOpen} setOpen={setFaqOpen} isMobile={true} />
                                <Button asChild size="lg" className="w-full text-lg mb-6">
                                    <Link href="/signin" onClick={() => setOpen(false)}>
                                        Sign in
                                    </Link>
                                </Button>
                            </SignedOut>
                            <SignedIn>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    asChild
                                    className="w-full text-lg mb-4"
                                >
                                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                                        Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    className="w-full text-lg"
                                    onClick={() => {
                                        setOpen(false);
                                        signOut({ redirectUrl: "/" });
                                    }}
                                >
                                    Sign out
                                </Button>
                            </SignedIn>
                        </div>
                    </motion.nav>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle menu"
                className="sm:hidden relative z-50 p-2 rounded-md hover:bg-accent transition"
            >
                {open ? <IconX className="h-8 w-8" /> : <IconMenuDeep className="h-8 w-8" />}
            </button>
            {portalNode && ReactDOM.createPortal(drawer, portalNode)}
        </>
    );
}

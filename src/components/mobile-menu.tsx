"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconMenuDeep, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FaqDialog } from "@/components/faq-dialog";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import type { Variants } from "framer-motion";

export function MobileMenu({ faqOpen, setFaqOpen }: { faqOpen: boolean; setFaqOpen: (open: boolean) => void }) {
    const [open, setOpen] = useState(false);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const { signOut } = useClerk();

    useEffect(() => setPortalNode(document.body), []);

    useEffect(() => {
        if (!portalNode) return;
        portalNode.classList.toggle("overflow-hidden", open);
        return () => portalNode.classList.remove("overflow-hidden");
    }, [open, portalNode]);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 640px)");

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            if (e.matches) setOpen(false);
        };

        handleChange(mq);

        mq.addEventListener?.("change", handleChange);

        return () => {
            mq.removeEventListener?.("change", handleChange);
        };
    }, []);

    const slideIn: Variants = {
        show: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 },
        },
        exit: {
            opacity: 0,
            transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.4 },
        }
    };

    const iconSpin: Variants = {
        hidden: { rotate: 0 },
        show: { rotate: 360, transition: { duration: 0.3 } },
        exit: { rotate: 0, transition: { duration: 0.3 } },
    };

    const HEADER_OFFSET = "top-20";
    const Z = "z-40";

    const drawer = (
        <AnimatePresence>
            {open && (
                <>
                    <motion.nav
                        key="panel"
                        variants={slideIn}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className={`fixed inset-x-0 bottom-0 ${HEADER_OFFSET} ${Z} flex flex-col bg-background p-8 overflow-y-auto`}
                    >
                        <div className="flex flex-col gap-4">
                            {["About", "Pricing", "Contact", "Features"].map((item, index) => (
                                <motion.p
                                    key={item}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {item}
                                </motion.p>
                            ))}
                        </div>
                        <div className="mt-auto flex flex-col gap-1 mb-6">
                            <SignedOut>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <FaqDialog open={faqOpen} setOpen={setFaqOpen} isMobile={true} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button asChild size="lg" className="w-full text-lg mb-6">
                                        <Link href="/signin" onClick={() => setOpen(false)}>
                                            Sign in
                                        </Link>
                                    </Button>
                                </motion.div>
                            </SignedOut>
                            <SignedIn>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.4 }}
                                >
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
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.5 }}
                                >
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
                                </motion.div>
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
                <AnimatePresence initial={false} mode="wait">
                    {open ? (
                        <motion.div
                            key="close"
                            variants={iconSpin}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                        >
                            <IconX className="h-8 w-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            variants={iconSpin}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                        >
                            <IconMenuDeep className="h-8 w-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
            {portalNode && ReactDOM.createPortal(drawer, portalNode)}
        </>
    );
}
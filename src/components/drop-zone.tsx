"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // assumes shadcn util fn exists; replace if not
import { Button } from "@/components/ui/button";

interface DropzoneProps {
    onText: (text: string) => void;
    accept?: string;
    className?: string;
}

export function Dropzone({ onText, accept = ".md,.txt", className }: DropzoneProps) {
    const [highlight, setHighlight] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const readFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            if (typeof e.target?.result === "string") onText(e.target.result);
        };
        reader.readAsText(file);
    }, [onText]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setHighlight(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
    };

    return (
        <div
            onDragEnter={e => {
                e.preventDefault();
                setHighlight(true);
            }}
            onDragOver={e => e.preventDefault()}
            onDragLeave={() => setHighlight(false)}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-10 text-center",
                highlight ? "border-primary/60 bg-primary/5" : "border-muted"
                , className)}
        >
            <p className="text-sm text-muted-foreground">
                Drag & drop your <span className="font-medium">CHANGELOG.md</span> or
                click to choose a file
            </p>
            <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => inputRef.current?.click()}
            >
                Browse files
            </Button>
            <input
                type="file"
                ref={inputRef}
                accept={accept}
                hidden
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) readFile(file);
                }}
            />
        </div>
    );
}

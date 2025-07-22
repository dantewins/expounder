"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ExpoundContextType {
    readmes: any[];
    refresh: () => void;
}

const ExpoundContext = createContext<ExpoundContextType | undefined>(undefined);

export function ExpoundProvider({ children }: { children: ReactNode }) {
    const [readmes, setReadmes] = useState<any[]>([]);

    const refresh = () => {
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
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <ExpoundContext.Provider value={{ readmes, refresh }}>
            {children}
        </ExpoundContext.Provider>
    );
}

export function useExpounds() {
    const context = useContext(ExpoundContext);
    if (undefined === context) {
        throw new Error("useExpounds must be used within a ExpoundProvider");
    }
    return context;
}
export const readmeSchema = {
    type: "object",
    properties: {
        blocks: {
            type: "array",
            minItems: 1,
            items: {
                oneOf: [
                    {
                        type: "object",
                        properties: {
                            type: { const: "heading" },
                            level: { type: "integer", minimum: 1, maximum: 6 },
                            text: { type: "string" },
                        },
                        required: ["type", "level", "text"],
                    },
                    {
                        type: "object",
                        properties: {
                            type: { const: "paragraph" },
                            text: { type: "string" },
                        },
                        required: ["type", "text"],
                    },
                    {
                        type: "object",
                        properties: {
                            type: { const: "list" },
                            ordered: { type: "boolean", default: false },
                            items: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                        required: ["type", "items"],
                    },
                    {
                        type: "object",
                        properties: {
                            type: { const: "code" },
                            language: { type: "string", default: "" },
                            code: { type: "string" },
                        },
                        required: ["type", "code"],
                    },
                    {
                        type: "object",
                        properties: {
                            type: { const: "image" },
                            url: { type: "string", format: "uri" },
                            alt: { type: "string", default: "" },
                        },
                        required: ["type", "url"],
                    },

                    {
                        type: "object",
                        properties: {
                            type: { const: "table" },
                            headers: {
                                type: "array",
                                items: { type: "string" },
                            },
                            rows: {
                                type: "array",
                                items: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                            },
                        },
                        required: ["type", "headers", "rows"],
                    },
                ],
            },
        },
    },
    required: ["blocks"],
} as const;

type HeadingBlock = { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string };
type ParagraphBlock = { type: "paragraph"; text: string };
type ListBlock = { type: "list"; ordered?: boolean; items: string[] };
type CodeBlock = { type: "code"; language?: string; code: string };
type ImageBlock = { type: "image"; url: string; alt?: string };
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };

export type ReadmeBlock = | HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | ImageBlock | TableBlock;
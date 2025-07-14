export const readmeSchema = {
    "type": "json_schema",
    "name": "readme",
    "schema": {
        "type": "object",
        "properties": {
            "blocks": {
                "type": "array",
                "description": "Array of blocks that make up the README document. Each block may be a heading, paragraph, list, code, image, or table.",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "description": "A content block in the README",
                    "properties": {
                        "type": {
                            "type": "string",
                            "description": "Type of content block",
                            "enum": [
                                "heading",
                                "paragraph",
                                "list",
                                "code",
                                "image",
                                "table"
                            ]
                        },
                        "level": {
                            "type": "integer",
                            "description": "Heading level (used if type is 'heading', 1-6)",
                            "minimum": 1,
                            "maximum": 6
                        },
                        "text": {
                            "type": "string",
                            "description": "Textual content (used by paragraphs and headings)"
                        },
                        "ordered": {
                            "type": "boolean",
                            "description": "Whether the list is ordered (true) or unordered (false); used for list blocks"
                        },
                        "items": {
                            "type": "array",
                            "description": "List of list items (used if type is 'list')",
                            "items": {
                                "type": "string",
                                "description": "A list item"
                            }
                        },
                        "language": {
                            "type": "string",
                            "description": "Programming language identifier for the code block"
                        },
                        "code": {
                            "type": "string",
                            "description": "Source code for code block"
                        },
                        "url": {
                            "type": "string",
                            "description": "URL of the image (used if type is 'image')"
                        },
                        "alt": {
                            "type": "string",
                            "description": "Alternative text for the image"
                        },
                        "headers": {
                            "type": "array",
                            "description": "Array of table header labels (used for table blocks)",
                            "items": {
                                "type": "string",
                                "description": "Header label"
                            }
                        },
                        "rows": {
                            "type": "array",
                            "description": "Table rows, each as an array of cell values (used for table blocks)",
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "description": "Table cell value"
                                }
                            }
                        }
                    },
                    "required": [
                        "type",
                        "level",
                        "text",
                        "ordered",
                        "items",
                        "language",
                        "code",
                        "url",
                        "alt",
                        "headers",
                        "rows"
                    ],
                    "additionalProperties": false
                }
            }
        },
        "required": [
            "blocks"
        ],
        "additionalProperties": false
    },
    "strict": true
} as const;

type HeadingBlock = { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string };
type ParagraphBlock = { type: "paragraph"; text: string };
type ListBlock = { type: "list"; ordered?: boolean; items: string[] };
type CodeBlock = { type: "code"; language?: string; code: string };
type ImageBlock = { type: "image"; url: string; alt?: string };
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };

export type ReadmeBlock = | HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | ImageBlock | TableBlock;
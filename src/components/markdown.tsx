import { ReadmeBlock } from "@/lib/schemas";

export function Markdown(blocks: ReadmeBlock[]): string {
  return (
    blocks
      .map((b) => {
        switch (b.type) {
          case "heading":
            return `${"#".repeat(b.level)} ${b.text}\n`;
          case "paragraph":
            return `${b.text}\n`;
          case "list":
            return (
              b.items
                .map((li, i) => `${b.ordered ? `${i + 1}.` : "-"} ${li}`)
                .join("\n") + "\n"
            );
          case "code":
            return `\n\u0060\u0060\u0060${b.language ?? ""}\n${b.code}\n\u0060\u0060\u0060\n`;
          case "image":
            return `![${b.alt ?? ""}](${b.url})\n`;
          case "table": {
            const header = `| ${b.headers.join(" | ")} |\n`;
            const sep = `| ${b.headers.map(() => "---").join(" | ")} |\n`;
            const rows =
              b.rows.map((r) => `| ${r.join(" | ")} |`).join("\n") + "\n";
            return header + sep + rows;
          }
          default:
            return "";
        }
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
  );
}
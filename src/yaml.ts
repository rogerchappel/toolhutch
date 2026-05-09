import { ToolhutchError } from "./errors.js";

type Container = Record<string, unknown> | unknown[];

interface StackFrame {
  indent: number;
  value: Container;
}

export function parseSimpleYaml(source: string): unknown {
  const root: Record<string, unknown> = {};
  const stack: StackFrame[] = [{ indent: -1, value: root }];
  const lines = source.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const withoutComment = stripComment(lines[lineIndex]!);
    if (!withoutComment.trim()) continue;
    const indent = withoutComment.match(/^ */)?.[0].length ?? 0;
    const line = withoutComment.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1]!.indent) stack.pop();
    const parent = stack[stack.length - 1]!.value;

    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) throw new ToolhutchError("YAML list item found where parent is not a list", "YAML_PARSE_ERROR");
      const itemText = line.slice(2).trim();
      if (itemText.includes(":")) {
        const [key, ...rest] = itemText.split(":");
        const obj: Record<string, unknown> = {};
        const valueText = rest.join(":").trim();
        const child = valueText ? parseScalar(valueText) : nextContainer(lines, lineIndex, indent);
        obj[key!.trim()] = child;
        parent.push(obj);
        if (!valueText && isContainer(child)) stack.push({ indent, value: child });
      } else {
        parent.push(parseScalar(itemText));
      }
      continue;
    }

    const colon = line.indexOf(":");
    if (colon === -1) throw new ToolhutchError(`Unsupported YAML line: ${line}`, "YAML_PARSE_ERROR");
    const key = line.slice(0, colon).trim();
    const valueText = line.slice(colon + 1).trim();
    if (Array.isArray(parent)) throw new ToolhutchError("Mapping entry found inside list without object item", "YAML_PARSE_ERROR");

    if (valueText) {
      parent[key] = parseScalar(valueText);
      continue;
    }

    const child = nextContainer(lines, lineIndex, indent);
    parent[key] = child;
    stack.push({ indent, value: child });
  }

  return root;
}

function nextContainer(lines: string[], currentIndex: number, currentIndent: number): Container {
  for (let index = currentIndex + 1; index < lines.length; index += 1) {
    const clean = stripComment(lines[index]!);
    if (!clean.trim()) continue;
    const indent = clean.match(/^ */)?.[0].length ?? 0;
    if (indent <= currentIndent) return {};
    return clean.trim().startsWith("- ") ? [] : {};
  }
  return {};
}

function isContainer(value: unknown): value is Container {
  return Boolean(value) && typeof value === "object";
}

function stripComment(line: string): string {
  let quoted = false;
  let quote = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      if (!quoted) {
        quoted = true;
        quote = char;
      } else if (quote === char) {
        quoted = false;
      }
    }
    if (char === "#" && !quoted) return line.slice(0, index).trimEnd();
  }
  return line;
}

function parseScalar(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => parseScalar(item.trim()))
      .filter((item) => item !== "");
  }
  return value;
}

import { ToolhutchError } from "./errors.js";

type Container = Record<string, unknown> | unknown[];

interface StackFrame {
  indent: number;
  value: Container;
}

export function parseSimpleYaml(source: string): unknown {
  const root: Record<string, unknown> = {};
  const stack: StackFrame[] = [{ indent: -1, value: root }];

  for (const rawLine of source.split(/\r?\n/)) {
    const withoutComment = stripComment(rawLine);
    if (!withoutComment.trim()) continue;
    const indent = withoutComment.match(/^ */)?.[0].length ?? 0;
    const line = withoutComment.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1]!.indent) stack.pop();
    const parent = stack[stack.length - 1]!.value;

    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) {
        throw new ToolhutchError("YAML list item found where parent is not a list", "YAML_PARSE_ERROR");
      }
      const itemText = line.slice(2).trim();
      if (itemText.includes(":")) {
        const [key, ...rest] = itemText.split(":");
        const obj: Record<string, unknown> = {};
        const valueText = rest.join(":").trim();
        obj[key!.trim()] = valueText ? parseScalar(valueText) : {};
        parent.push(obj);
        if (!valueText) stack.push({ indent, value: obj[key!.trim()] as Container });
        else stack.push({ indent, value: obj });
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

    const nextIsList = source.split(/\r?\n/).some((candidate) => {
      const clean = stripComment(candidate);
      return clean.match(/^ */)![0].length > indent && clean.trim().startsWith("- ");
    });
    const child: Container = nextIsList ? [] : {};
    parent[key] = child;
    stack.push({ indent, value: child });
  }

  return root;
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
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => parseScalar(item.trim()))
      .filter((item) => item !== "");
  }
  return value;
}

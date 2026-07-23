import { parseDocument } from "yaml";
import { ToolhutchError } from "./errors.js";

export function parseSimpleYaml(source: string): unknown {
  const document = parseDocument(source, {
    prettyErrors: false,
    strict: true,
    uniqueKeys: true,
  });

  const error = document.errors[0];
  if (error) {
    const { line, column } = sourcePosition(source, error.pos[0]);
    throw new ToolhutchError(`Invalid YAML at line ${line}, column ${column} (${error.code})`, "YAML_PARSE_ERROR");
  }

  return document.toJS({ maxAliasCount: 100 });
}

function sourcePosition(source: string, offset: number): { line: number; column: number } {
  const prefix = source.slice(0, Math.max(0, Math.min(offset, source.length)));
  const lines = prefix.split(/\r?\n/);
  return {
    line: lines.length,
    column: lines[lines.length - 1]!.length + 1,
  };
}

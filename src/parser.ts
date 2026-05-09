import path from "node:path";
import { readText } from "./fs.js";
import { parseSimpleYaml } from "./yaml.js";
import { ToolhutchError } from "./errors.js";
import type { ParsedManifest } from "./types.js";

export async function parseManifest(filePath: string): Promise<ParsedManifest> {
  const ext = path.extname(filePath).toLowerCase();
  const source = await readText(filePath);
  try {
    if (ext === ".json") {
      return { filePath, format: "json", document: JSON.parse(source) as unknown };
    }
    if (ext === ".yaml" || ext === ".yml") {
      return { filePath, format: "yaml", document: parseSimpleYaml(source) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ToolhutchError(`Could not parse ${filePath}: ${message}`, "PARSE_ERROR");
  }
  throw new ToolhutchError(`Unsupported manifest extension: ${filePath}`, "UNSUPPORTED_FILE");
}

export async function parseManifests(filePaths: string[]): Promise<ParsedManifest[]> {
  return Promise.all(filePaths.map((filePath) => parseManifest(filePath)));
}

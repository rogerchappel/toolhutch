import { promises as fs } from "node:fs";
import path from "node:path";
import { ToolhutchError } from "./errors.js";

const SUPPORTED = new Set([".json", ".yaml", ".yml"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "coverage"]);

export async function collectManifestFiles(target: string): Promise<string[]> {
  const resolved = path.resolve(target);
  const stat = await fs.stat(resolved).catch(() => undefined);
  if (!stat) throw new ToolhutchError(`Path does not exist: ${target}`, "PATH_NOT_FOUND");
  if (stat.isFile()) {
    if (!SUPPORTED.has(path.extname(resolved).toLowerCase())) {
      throw new ToolhutchError(`Unsupported file type: ${target}`, "UNSUPPORTED_FILE");
    }
    return [resolved];
  }
  if (!stat.isDirectory()) throw new ToolhutchError(`Path is not a file or directory: ${target}`, "UNSUPPORTED_PATH");
  const files: string[] = [];
  await walk(resolved, files);
  return files.sort();
}

async function walk(directory: string, files: string[]): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".toolhutch.json") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, files);
      continue;
    }
    if (entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export function normalizePath(filePath: string): string {
  return path.relative(process.cwd(), filePath) || ".";
}

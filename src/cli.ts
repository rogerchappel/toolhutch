#!/usr/bin/env node
import { scan, scanToString, VERSION } from "./index.js";
import { asErrorMessage, ToolhutchError } from "./errors.js";
import type { OutputFormat } from "./types.js";

interface ParsedArgs {
  command: string;
  target?: string | undefined;
  format: OutputFormat;
  policyPath?: string | undefined;
  json: boolean;
}

async function main(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  if (args.command === "--help" || args.command === "help") {
    process.stdout.write(help());
    return 0;
  }
  if (args.command === "--version" || args.command === "version") {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (!args.target) throw new ToolhutchError(`Missing path for ${args.command}`, "USAGE");
  const format = args.json ? "json" : args.format;
  if (args.command === "scan") {
    process.stdout.write(await scanToString(args.target, { format, policyPath: args.policyPath }));
    return 0;
  }
  if (args.command === "explain") {
    const report = await scan(args.target, { policyPath: args.policyPath });
    process.stdout.write(await scanToString(args.target, { format, policyPath: args.policyPath, includeLow: true }));
    return report.summary.highestRisk === "critical" ? 2 : 0;
  }
  if (args.command === "policy") {
    const report = await scan(args.target, { format, policyPath: args.policyPath });
    process.stdout.write(await scanToString(args.target, { format, policyPath: args.policyPath }));
    return report.summary.denied > 0 ? 3 : 0;
  }
  throw new ToolhutchError(`Unknown command: ${args.command}`, "USAGE");
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "--help", target, ...rest] = argv;
  const parsed: ParsedArgs = { command, target, format: "markdown", json: false };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]!;
    if (arg === "--json") parsed.json = true;
    else if (arg === "--format") {
      const value = rest[++index];
      if (value !== "json" && value !== "markdown") throw new ToolhutchError("--format must be json or markdown", "USAGE");
      parsed.format = value;
    } else if (arg === "--policy") {
      parsed.policyPath = rest[++index];
      if (!parsed.policyPath) throw new ToolhutchError("--policy requires a path", "USAGE");
    } else if (arg === "--help") {
      parsed.command = "help";
    } else {
      throw new ToolhutchError(`Unknown option: ${arg}`, "USAGE");
    }
  }
  return parsed;
}

function help(): string {
  return `toolhutch ${VERSION}\n\nUsage:\n  toolhutch scan <path> [--format markdown|json] [--policy policy.json]\n  toolhutch explain <path> [--json]\n  toolhutch policy <path> --policy policy.json [--json]\n\nCommands:\n  scan      Emit a risk brief for JSON/YAML tool manifests.\n  explain   Emit all evidence and exit 2 when critical capabilities are present.\n  policy    Apply allow/warn/deny rules and exit 3 on deny.\n\nNo command performs network calls.\n`;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  process.stderr.write(`toolhutch: ${asErrorMessage(error)}\n`);
  process.exitCode = error instanceof ToolhutchError && error.code === "USAGE" ? 64 : 1;
});

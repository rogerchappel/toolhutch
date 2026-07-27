#!/usr/bin/env node
import { scan, scanToString, VERSION } from "./index.js";
import { asErrorMessage, ToolhutchError } from "./errors.js";
import { riskRank } from "./capabilities.js";
import type { OutputFormat, RiskLevel } from "./types.js";

interface ParsedArgs {
  command: string;
  target?: string | undefined;
  format: OutputFormat;
  policyPath?: string | undefined;
  failOn?: RiskLevel | undefined;
  json: boolean;
}

type CommandOption = "--fail-on" | "--format" | "--json" | "--policy";

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
    const report = await scan(args.target, { format, policyPath: args.policyPath });
    process.stdout.write(await scanToString(args.target, { format, policyPath: args.policyPath }));
    return args.failOn && riskRank(report.summary.highestRisk) >= riskRank(args.failOn) ? 2 : 0;
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
  const parsed: ParsedArgs = { command: "--help", format: "markdown", json: false };
  const positionals: string[] = [];
  const suppliedOptions = new Set<CommandOption>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === "--help" || arg === "-h") {
      parsed.command = "help";
      continue;
    }
    if (arg === "--version" || arg === "-v") {
      parsed.command = "version";
      continue;
    }
    if (arg === "--json") {
      suppliedOptions.add(arg);
      parsed.json = true;
    } else if (arg === "--format") {
      suppliedOptions.add(arg);
      const value = argv[++index];
      if (value !== "json" && value !== "markdown") throw new ToolhutchError("--format must be json or markdown", "USAGE");
      parsed.format = value;
    } else if (arg === "--policy") {
      suppliedOptions.add(arg);
      parsed.policyPath = argv[++index];
      if (!parsed.policyPath || parsed.policyPath.startsWith("--")) throw new ToolhutchError("--policy requires a path", "USAGE");
    } else if (arg === "--fail-on") {
      suppliedOptions.add(arg);
      parsed.failOn = parseRisk(argv[++index]);
    } else if (arg.startsWith("--")) {
      throw new ToolhutchError(`Unknown option: ${arg}`, "USAGE");
    } else {
      positionals.push(arg);
    }
  }
  if (parsed.command !== "help" && parsed.command !== "version") {
    parsed.command = positionals[0] ?? "--help";
    parsed.target = positionals[1];
    if (positionals.length > 2) throw new ToolhutchError(`Unexpected argument: ${positionals[2]}`, "USAGE");
    validateCommandOptions(parsed, suppliedOptions);
  }
  return parsed;
}

function validateCommandOptions(parsed: ParsedArgs, suppliedOptions: Set<CommandOption>): void {
  const supportedOptions: Partial<Record<string, ReadonlySet<CommandOption>>> = {
    scan: new Set(["--fail-on", "--format", "--json", "--policy"]),
    explain: new Set(["--json"]),
    policy: new Set(["--json", "--policy"]),
  };
  const supported = supportedOptions[parsed.command];
  if (!supported) return;
  for (const option of suppliedOptions) {
    if (!supported.has(option)) {
      throw new ToolhutchError(`${option} is not supported by the ${parsed.command} command`, "USAGE");
    }
  }
  if (parsed.command === "policy" && !parsed.policyPath) {
    throw new ToolhutchError("policy requires --policy <path>", "USAGE");
  }
}

function parseRisk(value: string | undefined): RiskLevel {
  if (value === "low" || value === "medium" || value === "high" || value === "critical") return value;
  throw new ToolhutchError("--fail-on must be low, medium, high, or critical", "USAGE");
}

function help(): string {
  return `toolhutch ${VERSION}\n\nUsage:\n  toolhutch scan <path> [--format markdown|json] [--policy policy.json] [--fail-on high]\n  toolhutch explain <path> [--json]\n  toolhutch policy <path> --policy policy.json [--json]\n  toolhutch --help | --version\n\nCommands:\n  scan      Emit a risk brief for JSON/YAML tool manifests; exit 2 when --fail-on is reached.\n  explain   Emit all evidence and exit 2 when critical capabilities are present.\n  policy    Apply allow/warn/deny rules and exit 3 on deny.\n\nNo command performs network calls.\n`;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  process.stderr.write(`toolhutch: ${asErrorMessage(error)}\n`);
  process.exitCode = error instanceof ToolhutchError && error.code === "USAGE" ? 64 : 1;
});

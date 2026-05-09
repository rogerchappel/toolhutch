import type { CapabilityClass, Evidence, RiskLevel } from "./types.js";

interface CapabilityRule {
  capability: CapabilityClass;
  risk: RiskLevel;
  patterns: RegExp[];
  mitigations: string[];
}

export const CAPABILITY_RULES: CapabilityRule[] = [
  {
    capability: "shell",
    risk: "critical",
    patterns: [/\bshell\b/i, /exec/i, /spawn/i, /command/i, /terminal/i, /bash|zsh|powershell|cmd\.exe/i],
    mitigations: ["Require explicit user approval for command execution.", "Constrain working directories and environment variables.", "Log command, arguments, and exit status."],
  },
  {
    capability: "filesystem-write",
    risk: "high",
    patterns: [/write.*file/i, /file.*write/i, /save/i, /delete/i, /remove/i, /rename/i, /overwrite/i, /allowWritePaths/i],
    mitigations: ["Limit writes to a dedicated workspace.", "Refuse symlink traversal and destructive overwrites by default."],
  },
  {
    capability: "filesystem-read",
    risk: "medium",
    patterns: [/read.*file/i, /file.*read/i, /dir\.list/i, /dir\.fetch/i, /glob/i, /allowReadPaths/i, /filesystem/i],
    mitigations: ["Use path allowlists.", "Exclude secrets, home directories, and credential stores unless reviewed."],
  },
  {
    capability: "browser",
    risk: "high",
    patterns: [/browser/i, /playwright/i, /chrom(e|ium)/i, /cookies?/i, /logged.?in/i],
    mitigations: ["Use isolated browser profiles for untrusted tasks.", "Avoid logged-in sessions unless the workflow requires them."],
  },
  {
    capability: "network",
    risk: "medium",
    patterns: [/http/i, /fetch/i, /web_search/i, /web_fetch/i, /request/i, /url/i, /socket/i, /network/i],
    mitigations: ["Document outbound domains.", "Disable network access in default offline review commands."],
  },
  {
    capability: "messaging",
    risk: "high",
    patterns: [/message/i, /send/i, /post/i, /slack/i, /discord/i, /telegram/i, /email/i, /tweet/i],
    mitigations: ["Require confirmation before external posting.", "Separate read-only chat access from send/delete actions."],
  },
  {
    capability: "secrets",
    risk: "critical",
    patterns: [/secret/i, /token/i, /apikey|api_key/i, /credential/i, /password/i, /oauth/i, /keychain/i, /env/i],
    mitigations: ["Never print secret values.", "Prefer scoped tokens and environment-variable name allowlists."],
  },
  {
    capability: "database",
    risk: "high",
    patterns: [/database/i, /postgres/i, /mysql/i, /sqlite/i, /redis/i, /mongo/i, /query/i],
    mitigations: ["Use read-only users for inspection.", "Require review for write, migration, or destructive query tools."],
  },
  {
    capability: "package-manager",
    risk: "high",
    patterns: [/npm|pnpm|yarn|pip|uv|cargo|brew/i, /install/i, /package.?manager/i],
    mitigations: ["Pin package sources and lockfiles.", "Review lifecycle scripts before install commands."],
  },
];

export function riskRank(risk: RiskLevel): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[risk];
}

export function mergeEvidence(evidence: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  return evidence.filter((item) => {
    const key = `${item.path}\u0000${item.value}\u0000${item.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

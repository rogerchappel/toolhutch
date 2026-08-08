import { promises as fs } from "node:fs";
import { parseSimpleYaml } from "./yaml.js";
import type { CapabilityClass, CapabilityFinding, PolicyAction, ToolhutchPolicy } from "./types.js";
import { ToolhutchError } from "./errors.js";

const ACTION_RANK: Record<PolicyAction, number> = { allow: 1, warn: 2, deny: 3 };

export async function loadPolicy(policyPath?: string): Promise<ToolhutchPolicy | undefined> {
  if (!policyPath) return undefined;
  const source = await fs.readFile(policyPath, "utf8");
  const parsed = policyPath.endsWith(".json") ? (JSON.parse(source) as unknown) : parseSimpleYaml(source);
  if (!isPolicy(parsed)) throw new ToolhutchError(`Invalid policy file: ${policyPath}`, "INVALID_POLICY");
  return parsed;
}

export function applyPolicy(findings: CapabilityFinding[], policy?: ToolhutchPolicy): CapabilityFinding[] {
  if (!policy) return findings;
  return findings.map((finding) => {
    const matches = policy.rules.filter((rule) => {
      const capabilityMatches = !rule.capability || rule.capability === finding.capability;
      const text = `${finding.capability} ${finding.label} ${finding.evidence.map((item) => `${item.path} ${item.value}`).join(" ")}`;
      const textMatches = !rule.match || text.toLowerCase().includes(rule.match.toLowerCase());
      return capabilityMatches && textMatches;
    });
    if (matches.length === 0) return finding;
    const strongest = matches.sort((a, b) => ACTION_RANK[b.action] - ACTION_RANK[a.action])[0]!;
    return { ...finding, policyAction: strongest.action, policyReason: strongest.reason ?? `policy matched ${strongest.capability ?? strongest.match ?? "rule"}` };
  });
}

function isPolicy(value: unknown): value is ToolhutchPolicy {
  if (!value || typeof value !== "object" || !Array.isArray((value as { rules?: unknown }).rules)) return false;
  return (value as { rules: unknown[] }).rules.every(isPolicyRule);
}

const CAPABILITIES = new Set<CapabilityClass>([
  "shell", "filesystem-read", "filesystem-write", "browser", "network", "messaging", "secrets", "database", "package-manager", "unknown",
]);
const ACTIONS = new Set<PolicyAction>(["allow", "warn", "deny"]);
const RULE_FIELDS = new Set(["capability", "match", "action", "reason"]);

function isPolicyRule(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rule = value as Record<string, unknown>;
  if (Object.keys(rule).some((field) => !RULE_FIELDS.has(field))) return false;
  if (!ACTIONS.has(rule.action as PolicyAction)) return false;
  if (rule.capability !== undefined && (typeof rule.capability !== "string" || !CAPABILITIES.has(rule.capability as CapabilityClass))) return false;
  if (rule.match !== undefined && typeof rule.match !== "string") return false;
  if (rule.reason !== undefined && typeof rule.reason !== "string") return false;
  return true;
}

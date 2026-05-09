import { promises as fs } from "node:fs";
import { parseSimpleYaml } from "./yaml.js";
import type { CapabilityFinding, PolicyAction, ToolhutchPolicy } from "./types.js";
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
  return (value as ToolhutchPolicy).rules.every((rule) => ["allow", "warn", "deny"].includes(rule.action));
}

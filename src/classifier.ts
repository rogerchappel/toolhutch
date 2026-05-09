import { CAPABILITY_RULES, mergeEvidence, riskRank } from "./capabilities.js";
import { flatten, stringifyValue } from "./walk.js";
import type { CapabilityClass, CapabilityFinding, Evidence, ParsedManifest, RiskLevel } from "./types.js";

export function classifyManifest(manifest: ParsedManifest): CapabilityFinding[] {
  const entries = flatten(manifest.document);
  const byCapability = new Map<CapabilityClass, { risk: RiskLevel; evidence: Evidence[]; mitigations: Set<string> }>();

  for (const entry of entries) {
    const text = stringifyValue(entry.value);
    const haystack = `${entry.path} ${text}`;
    if (!text && entry.path === "$") continue;
    for (const rule of CAPABILITY_RULES) {
      const matched = rule.patterns.find((pattern) => pattern.test(haystack));
      if (!matched) continue;
      const existing = byCapability.get(rule.capability);
      const evidence = {
        path: `${manifest.filePath}:${entry.path}`,
        value: truncate(text || entry.path),
        reason: `matched ${matched.source}`,
      };
      if (existing) {
        existing.evidence.push(evidence);
        for (const mitigation of rule.mitigations) existing.mitigations.add(mitigation);
        if (riskRank(rule.risk) > riskRank(existing.risk)) existing.risk = rule.risk;
      } else {
        byCapability.set(rule.capability, { risk: rule.risk, evidence: [evidence], mitigations: new Set(rule.mitigations) });
      }
    }
  }

  return [...byCapability.entries()]
    .map(([capability, detail]) => ({
      capability,
      risk: detail.risk,
      label: labelFor(capability),
      evidence: mergeEvidence(detail.evidence).slice(0, 12),
      mitigations: [...detail.mitigations],
    }))
    .sort((a, b) => riskRank(b.risk) - riskRank(a.risk) || a.capability.localeCompare(b.capability));
}

function labelFor(capability: CapabilityClass): string {
  return capability
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

function truncate(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

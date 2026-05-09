import type { CapabilityFinding, RiskLevel } from "./types.js";

export function recommendedReviewMode(findings: CapabilityFinding[]): string {
  const risks = new Set(findings.map((finding) => finding.risk));
  if (risks.has("critical")) return "block until explicit approval and sandbox review";
  if (risks.has("high")) return "require human review before enabling";
  if (risks.has("medium")) return "review allowlists and scope before routine use";
  return "routine review";
}

export function riskEmoji(risk: RiskLevel): string {
  return { low: "🟢", medium: "🟡", high: "🟠", critical: "🔴" }[risk];
}

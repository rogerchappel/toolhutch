import { riskRank } from "./capabilities.js";
import { buildApprovalPlan } from "./approval.js";
import { recommendedReviewMode, riskEmoji } from "./severity.js";
import type { CapabilityClass, CapabilityFinding, OutputFormat, RiskLevel, ScanReport } from "./types.js";

const RISKS: RiskLevel[] = ["low", "medium", "high", "critical"];

export function buildReport(input: {
  target: string;
  files: string[];
  findings: CapabilityFinding[];
  policyPath?: string | undefined;
  policyRules?: number | undefined;
  version: string;
}): ScanReport {
  const byRisk = Object.fromEntries(RISKS.map((risk) => [risk, 0])) as Record<RiskLevel, number>;
  const byCapability: Partial<Record<CapabilityClass, number>> = {};
  for (const finding of input.findings) {
    byRisk[finding.risk] += 1;
    byCapability[finding.capability] = (byCapability[finding.capability] ?? 0) + 1;
  }
  const highestRisk = input.findings.reduce<RiskLevel>((highest, finding) => (riskRank(finding.risk) > riskRank(highest) ? finding.risk : highest), "low");
  const report: ScanReport = {
    tool: "toolhutch",
    version: input.version,
    scannedAt: new Date(0).toISOString(),
    target: input.target,
    files: input.files,
    summary: {
      files: input.files.length,
      findings: input.findings.length,
      highestRisk,
      byRisk,
      byCapability,
      denied: input.findings.filter((finding) => finding.policyAction === "deny").length,
      warned: input.findings.filter((finding) => finding.policyAction === "warn").length,
    },
    findings: input.findings,
    approvalPlan: buildApprovalPlan(input.findings),
  };
  if (input.policyPath) report.policy = { path: input.policyPath, rules: input.policyRules ?? 0 };
  return report;
}

export function renderReport(report: ScanReport, format: OutputFormat): string {
  return format === "json" ? `${JSON.stringify(report, null, 2)}\n` : renderMarkdown(report);
}

export function renderMarkdown(report: ScanReport): string {
  const lines = [
    `# toolhutch risk brief`,
    "",
    `- Target: \`${report.target}\``,
    `- Files scanned: ${report.summary.files}`,
    `- Findings: ${report.summary.findings}`,
    `- Highest risk: ${riskEmoji(report.summary.highestRisk)} **${report.summary.highestRisk}**`,
    `- Recommended review: ${recommendedReviewMode(report.findings)}`,
    `- Policy denies: ${report.summary.denied}`,
    `- Policy warnings: ${report.summary.warned}`,
    "",
  ];
  if (report.findings.length === 0) {
    lines.push("No risky tool capabilities were detected by the current heuristics.", "");
    return `${lines.join("\n")}\n`;
  }
  lines.push("## Approval plan", "");
  for (const step of report.approvalPlan) {
    lines.push(`- **${step.action}** ${step.title}: ${step.reason} (${step.evidenceCount} evidence item${step.evidenceCount === 1 ? "" : "s"})`);
  }
  lines.push("", "## Findings", "");
  for (const finding of report.findings) {
    lines.push(`### ${finding.label} (${finding.risk})`, "");
    if (finding.policyAction) lines.push(`Policy: **${finding.policyAction}** — ${finding.policyReason ?? "matched rule"}`, "");
    lines.push("Evidence:");
    for (const evidence of finding.evidence) lines.push(`- \`${evidence.path}\`: ${escapeMarkdown(evidence.value)} (${evidence.reason})`);
    lines.push("", "Mitigations:");
    for (const mitigation of finding.mitigations) lines.push(`- ${mitigation}`);
    lines.push("");
  }
  lines.push("## Files", "");
  for (const file of report.files) lines.push(`- \`${file}\``);
  return `${lines.join("\n")}\n`;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|");
}

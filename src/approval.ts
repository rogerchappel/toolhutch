import { riskRank } from "./capabilities.js";
import type { ApprovalStep, CapabilityFinding, RiskLevel } from "./types.js";

const RISK_ORDER: RiskLevel[] = ["critical", "high", "medium", "low"];

export function buildApprovalPlan(findings: CapabilityFinding[]): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  for (const risk of RISK_ORDER) {
    const matching = findings.filter((finding) => finding.risk === risk);
    if (matching.length === 0) continue;
    steps.push({
      id: `${risk}-capability-review`,
      title: titleForRisk(risk),
      requiredFor: risk,
      action: actionForRisk(risk),
      reason: reasonForRisk(risk),
      evidenceCount: matching.reduce((total, finding) => total + finding.evidence.length, 0),
    });
  }
  if (findings.some((finding) => finding.policyAction === "deny")) {
    steps.unshift({
      id: "policy-deny-block",
      title: "Resolve denied policy matches",
      requiredFor: "critical",
      action: "block",
      reason: "At least one local policy rule denied a detected capability.",
      evidenceCount: findings.filter((finding) => finding.policyAction === "deny").length,
    });
  }
  return steps.sort((a, b) => riskRank(b.requiredFor) - riskRank(a.requiredFor) || a.id.localeCompare(b.id));
}

function actionForRisk(risk: RiskLevel): ApprovalStep["action"] {
  if (risk === "critical") return "block";
  if (risk === "high") return "approve";
  return "document";
}

function titleForRisk(risk: RiskLevel): string {
  if (risk === "critical") return "Block until explicit owner approval";
  if (risk === "high") return "Require maintainer approval";
  if (risk === "medium") return "Document intended use";
  return "Record low-risk rationale";
}

function reasonForRisk(risk: RiskLevel): string {
  if (risk === "critical") return "Critical capabilities can execute commands, expose secrets, or write externally.";
  if (risk === "high") return "High-risk capabilities need a named owner and scoped purpose.";
  if (risk === "medium") return "Medium-risk capabilities should be tied to a local workflow.";
  return "Low-risk findings are informational but should remain visible.";
}

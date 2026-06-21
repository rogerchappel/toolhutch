export type CapabilityClass =
  | "shell"
  | "filesystem-read"
  | "filesystem-write"
  | "browser"
  | "network"
  | "messaging"
  | "secrets"
  | "database"
  | "package-manager"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PolicyAction = "allow" | "warn" | "deny";
export type OutputFormat = "markdown" | "json";

export interface Evidence {
  path: string;
  value: string;
  reason: string;
}

export interface CapabilityFinding {
  capability: CapabilityClass;
  risk: RiskLevel;
  label: string;
  evidence: Evidence[];
  mitigations: string[];
  policyAction?: PolicyAction | undefined;
  policyReason?: string | undefined;
}

export interface ApprovalStep {
  id: string;
  title: string;
  requiredFor: RiskLevel;
  action: "document" | "approve" | "block";
  reason: string;
  evidenceCount: number;
}

export interface ParsedManifest {
  filePath: string;
  format: "json" | "yaml";
  document: unknown;
}

export interface PolicyRule {
  capability?: CapabilityClass;
  match?: string;
  action: PolicyAction;
  reason?: string;
}

export interface ToolhutchPolicy {
  rules: PolicyRule[];
}

export interface ScanOptions {
  format?: OutputFormat;
  policyPath?: string | undefined;
  includeLow?: boolean | undefined;
}

export interface ScanReport {
  tool: "toolhutch";
  version: string;
  scannedAt: string;
  target: string;
  files: string[];
  summary: {
    files: number;
    findings: number;
    highestRisk: RiskLevel;
    byRisk: Record<RiskLevel, number>;
    byCapability: Partial<Record<CapabilityClass, number>>;
    denied: number;
    warned: number;
  };
  findings: CapabilityFinding[];
  approvalPlan: ApprovalStep[];
  policy?: {
    path: string;
    rules: number;
  };
}

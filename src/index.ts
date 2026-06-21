import { collectManifestFiles, normalizePath } from "./fs.js";
import { parseManifests } from "./parser.js";
import { classifyManifest } from "./classifier.js";
import { applyPolicy, loadPolicy } from "./policy.js";
import { buildReport, renderReport } from "./report.js";
import type { OutputFormat, ScanOptions, ScanReport } from "./types.js";

export type * from "./types.js";
export { parseManifest, parseManifests } from "./parser.js";
export { classifyManifest } from "./classifier.js";
export { buildApprovalPlan } from "./approval.js";
export { applyPolicy, loadPolicy } from "./policy.js";
export { renderMarkdown, renderReport } from "./report.js";
export { recommendedReviewMode, riskEmoji } from "./severity.js";

export const VERSION = "0.1.0";

export async function scan(target: string, options: ScanOptions = {}): Promise<ScanReport> {
  const files = await collectManifestFiles(target);
  const manifests = await parseManifests(files);
  const policy = await loadPolicy(options.policyPath);
  const findings = applyPolicy(
    manifests.flatMap((manifest) => classifyManifest(manifest)),
    policy,
  ).filter((finding) => options.includeLow || finding.risk !== "low");

  return buildReport({
    target: normalizePath(target),
    files: files.map(normalizePath),
    findings,
    policyPath: options.policyPath,
    policyRules: policy?.rules.length,
    version: VERSION,
  });
}

export async function scanToString(target: string, options: ScanOptions = {}): Promise<string> {
  const format: OutputFormat = options.format ?? "markdown";
  return renderReport(await scan(target, options), format);
}

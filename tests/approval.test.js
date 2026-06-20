import assert from "node:assert/strict";
import test from "node:test";
import { buildApprovalPlan } from "../dist/approval.js";

test("buildApprovalPlan blocks critical findings", () => {
  const plan = buildApprovalPlan([
    {
      capability: "shell",
      risk: "critical",
      label: "Shell",
      evidence: [{ path: "mcp.json:$.tools[0]", value: "exec", reason: "matched exec" }],
      mitigations: ["Require approval."],
    },
  ]);
  assert.equal(plan[0].action, "block");
  assert.equal(plan[0].requiredFor, "critical");
  assert.equal(plan[0].evidenceCount, 1);
});

test("buildApprovalPlan puts policy denies first", () => {
  const plan = buildApprovalPlan([
    {
      capability: "network",
      risk: "high",
      label: "Network",
      evidence: [{ path: "mcp.json:$.tools[0]", value: "fetch", reason: "matched fetch" }],
      mitigations: ["Restrict domains."],
      policyAction: "deny",
    },
  ]);
  assert.equal(plan[0].id, "policy-deny-block");
  assert.equal(plan[0].action, "block");
});

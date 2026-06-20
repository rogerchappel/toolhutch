# Report shape

`toolhutch scan --format json` emits a stable JSON object:

- `tool` and `version` identify the producer.
- `scannedAt` is fixed for deterministic output.
- `target` and `files` show local inputs.
- `summary` contains counts by risk and capability plus policy counts.
- `approvalPlan` contains deterministic review gates for policy denies and risky capabilities.
- `findings` contains capability, risk, evidence, mitigations, and optional policy outcome.

Evidence paths use a file path followed by a JSONPath-like location, for example:

```text
fixtures/risky-openclaw-tools.json:$.tools[0].description
```

The schema is intentionally compact so reports can be pasted into pull requests or stored as CI artifacts.

Approval plan entries contain:

- `id`, a stable machine-readable gate name.
- `title`, a human-readable review prompt.
- `requiredFor`, the risk level that triggered the gate.
- `action`, one of `document`, `approve`, or `block`.
- `reason`, the reviewer-facing rationale.
- `evidenceCount`, the number of evidence items or policy deny matches behind the gate.

# PRD: toolhutch

Status: in-progress
Decision: selected for OSS factory build on 2026-05-10

## Scorecard

Total: 84/100
Band: build now
Last scored: 2026-05-07
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Agent users connect MCP servers, shell tools, browser tools, and credentialed integrations without a compact local way to audit what powers are exposed. |
| Demand signal | 16/20 | The growth of MCP/tooling ecosystems, local agents, and permission manifests creates recurring safety review work. |
| V1 buildability | 18/20 | A fixture-backed CLI can inspect JSON/YAML tool manifests, infer risk classes, and emit Markdown/JSON reports without any network calls. |
| Differentiation | 13/15 | Focuses on agent-tool permission posture and human-readable review packs, not generic secret scanning or SBOMs. |
| Agentic workflow leverage | 15/15 | Gives agents and humans a shared evidence pack before enabling tools in a workspace. |
| Distribution potential | 4/10 | Niche but useful for MCP/server maintainers, local-agent users, and security-minded OSS teams. |

## Pitch

A local-first permission auditor for agent tool manifests: point `toolhutch` at MCP configs, OpenClaw-style tool manifests, or JSON/YAML fixtures and get a practical risk brief before an agent gets sharp tools. 🛠️

## Why It Matters

Agent tools are capabilities, not just dependencies. A harmless-looking config can expose shell execution, browser control, filesystem reads, file writes, tokens, or external posting actions. Humans need a fast way to see “what could this agent do?” before they enable a server or share a workspace.

`toolhutch` should produce small, auditable reports that make permission review boring and repeatable. No cloud service, no hidden telemetry, no magic claims — just deterministic parsing, explicit heuristics, and fixture-backed checks.

## Attribution / Inspiration

Inspired by the rapid growth of the Model Context Protocol ecosystem, local coding agents, and repeated community discussion around tool permissions and least-privilege review. This is a renamed/reframed original utility, not a copy of any one project.

## V1 Scope

- CLI: `toolhutch scan <path>`, `toolhutch explain <path>`, `toolhutch policy <path>`.
- Parse JSON and YAML files containing tool/server definitions.
- Recognize common capability classes: shell, filesystem read/write, browser, network, messaging/posting, secrets, databases, and package managers.
- Emit Markdown and JSON reports with risk labels, evidence paths, and suggested mitigations.
- Include a tiny local policy file format for allow/deny/warn rules.
- Fixture-backed tests for benign, risky, and mixed manifests.
- No network calls in default commands.

## Out of Scope

- Enforcing permissions at runtime.
- Reading private credentials or secret values.
- Claiming complete security coverage.
- Uploading manifests to any hosted service.

## CLI/API Sketch

```bash
toolhutch scan ./fixtures/openclaw-tools.json
toolhutch scan . --format markdown --policy toolhutch.policy.json
toolhutch explain ./mcp.json --json
```

## Verification

- Unit tests for parsers, capability classification, risk scoring, policy application, and report rendering.
- CLI smoke tests against local fixtures.
- README with examples, safety boundaries, limitations, and practical review workflow.

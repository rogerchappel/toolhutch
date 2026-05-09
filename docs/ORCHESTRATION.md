# Orchestration

`toolhutch` is intentionally safe for agent orchestration because default commands are local and deterministic.

## Commands

- `npm run check` — TypeScript verification without emitting build artifacts.
- `npm test` — build and run fixture-backed Node tests.
- `npm run build` — emit `dist/`.
- `npm run smoke` — run real CLI commands against fixtures.
- `bash scripts/validate.sh` — StackForge validation wrapper for CI and agents.

## Agent contract

Agents may run scan commands against repository-local JSON/YAML manifests. Agents must not treat findings as complete security proof; reports are review packs that help humans decide whether to enable tools.

## Determinism

- `scannedAt` is fixed to Unix epoch in reports.
- File traversal is sorted.
- No scan, explain, or policy command opens a network connection.
- Policy outcomes are derived from local rules only.

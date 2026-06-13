# Release Candidate Notes

## Candidate

- Package: `toolhutch@0.1.0`
- Branch: `release-candidate/toolhutch`
- Classification: ship

## Included

- Local scanner for JSON and YAML tool manifests.
- Capability detection for shell, filesystem, browser, network, messaging, secrets, database, and package-manager surfaces.
- Markdown and JSON report renderers with evidence paths and mitigations.
- Local policy rules with `allow`, `warn`, and `deny` actions.
- Fixture-backed tests for benign, risky, mixed MCP, database, and package-manager manifests.

## Verification

```sh
npm install
npm run release:check
```

Expected result: tests, TypeScript check, build, smoke script, and package dry run all pass.

## Limits

- No runtime enforcement.
- No complete security guarantees.
- No network access in default commands.
- Secret detection is name/path/description based and does not intentionally read credential values.

## Release Gate

Before tagging or publishing, review package contents from `npm run package:smoke` and run `toolhutch policy` against at least one local policy file.

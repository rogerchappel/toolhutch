# toolhutch

Local-first permission auditor for agent tool manifests. Point `toolhutch` at MCP configs, OpenClaw-style tool manifests, or JSON/YAML fixtures and get a practical risk brief before an agent gets sharp tools.

## Install

```sh
npm install
npm run build
```

For local CLI use from this repository:

```sh
node dist/cli.js --help
```

## Use

```sh
toolhutch scan ./fixtures/risky-openclaw-tools.json
toolhutch scan ./fixtures/mcp-mixed.yaml --format json
toolhutch explain ./fixtures/risky-openclaw-tools.json --json
toolhutch policy ./fixtures/risky-openclaw-tools.json --policy ./examples/toolhutch.policy.json
```

Example output includes capability labels, risk levels, evidence paths, mitigations, and an approval plan for the risky capabilities found.

## Approval plans

Every report includes local review gates derived from the highest detected risks:

- critical findings block until an owner approves the tool surface
- high-risk findings require maintainer approval
- medium and low findings are documented for later review
- policy denies are listed first and cause `toolhutch policy` to exit `3`

Approval plans are deterministic and are not external approval workflow automation. They are meant to be copied into an issue, pull request, or run log before enabling new agent tools.

## Capabilities detected

- shell execution
- filesystem read and write access
- browser automation and logged-in browser contexts
- network access
- messaging or external posting
- secrets and credential surfaces
- database access
- package manager execution

## Policy files

Policies are tiny local JSON/YAML files:

```json
{
  "rules": [
    { "capability": "shell", "action": "deny", "reason": "Requires approval." },
    { "capability": "messaging", "action": "warn" }
  ]
}
```

Actions are `allow`, `warn`, and `deny`. `toolhutch policy` exits `3` when any finding is denied.

## Local-first safety model

- No default command performs network calls.
- The scanner does not read credential values intentionally; it flags names, paths, and descriptions that imply secret access.
- Reports are deterministic: sorted file traversal and fixed timestamps.
- This is review support, not runtime enforcement or a complete security scanner.

## Verify

```sh
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Documentation

See [`docs/PRD.md`](docs/PRD.md), [`docs/TASKS.md`](docs/TASKS.md), [`docs/ORCHESTRATION.md`](docs/ORCHESTRATION.md), [`docs/SKILL.md`](docs/SKILL.md), and [`docs/limitations.md`](docs/limitations.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, local-first, fixture-backed, and deterministic.

## Security

See [SECURITY.md](SECURITY.md). Please do not include real secrets in reports, fixtures, issues, or pull requests.

## License

MIT

# Contributing

Thanks for helping improve `toolhutch`.

## Principles

- Keep the CLI local-first and deterministic.
- Add fixtures for every new capability heuristic or parser behavior.
- Prefer clear evidence and mitigations over scary wording.
- Do not add telemetry, hosted dependencies, or hidden network behavior to default commands.

## Setup

```sh
npm install
npm run build
```

## Verification

Run before opening a pull request:

```sh
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## Pull requests

Good PRs are small and explain:

- what manifest shape changed
- what evidence appears in reports
- what fixtures/tests were added
- any false-positive or false-negative tradeoff

Please never commit real secrets or private tool manifests. Use reduced fixtures under `fixtures/`.

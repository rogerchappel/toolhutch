# Report shape

`toolhutch scan --format json` emits a stable JSON object:

- `tool` and `version` identify the producer.
- `scannedAt` is fixed for deterministic output.
- `target` and `files` show local inputs.
- `summary` contains counts by risk and capability plus policy counts.
- `findings` contains capability, risk, evidence, mitigations, and optional policy outcome.

Evidence paths use a file path followed by a JSONPath-like location, for example:

```text
fixtures/risky-openclaw-tools.json:$.tools[0].description
```

The schema is intentionally compact so reports can be pasted into pull requests or stored as CI artifacts.

# Policy format

Policy files are local JSON or simple YAML documents with one `rules` array.

```json
{
  "rules": [
    {
      "capability": "shell",
      "action": "deny",
      "reason": "Shell tools require explicit approval."
    },
    {
      "match": "logged-in cookies",
      "action": "warn"
    }
  ]
}
```

## Fields

- `capability` optionally targets one detected capability class.
- `match` optionally matches evidence text case-insensitively.
- `action` is required and must be `allow`, `warn`, or `deny`.
- `reason` is optional human-readable context.

If multiple rules match, the strongest action wins: `deny` over `warn` over `allow`.

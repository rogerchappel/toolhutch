# Examples

Run a policy-backed review:

```sh
npm run build
node dist/cli.js policy fixtures/risky-openclaw-tools.json --policy examples/toolhutch.policy.json
```

The sample policy denies shell access and warns on external messaging or logged-in browser evidence.

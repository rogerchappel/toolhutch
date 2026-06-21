# toolhutch skill

Use this skill when an agent is asked to review MCP, OpenClaw, or similar tool manifests before enabling them in a workspace.

## Inputs

- A local JSON or YAML manifest path, or a directory containing manifests.
- Optional local policy file with `allow`, `warn`, and `deny` rules.
- No live credentials or private secret values.

## Side effects

`toolhutch` reads local files and prints reports. It does not call networks, post messages, mutate manifests, or enforce permissions at runtime.

## Workflow

1. Run `toolhutch scan <path>` for a Markdown brief.
2. Run `toolhutch scan <path> --format json` when another tool needs structured output.
3. Run `toolhutch policy <path> --policy <policy-file>` before enabling tools in a shared or credentialed workspace.
4. Copy the approval plan and highest-risk findings into the issue, pull request, or run log.

## Approval boundaries

- Treat policy denies and critical findings as blocked until a human owner approves.
- Treat high-risk findings as requiring maintainer approval and a named purpose.
- Keep medium and low findings visible in the review record.

## Validation

```sh
npm run check
npm test
npm run smoke
```

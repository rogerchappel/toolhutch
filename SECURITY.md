# Security Policy

`toolhutch` is a local-first review utility. It helps identify risky agent-tool capabilities in JSON/YAML manifests, but it is not a sandbox, policy enforcement layer, or complete security scanner.

## Supported versions

Security fixes target the current `main` branch until the first tagged release. After `1.0`, supported release lines will be listed here.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub Security Advisories when available, or contact the maintainer without posting exploit details publicly.

Include:

- affected version or commit
- manifest/policy shape needed to reproduce the issue
- expected and actual behavior
- whether the issue can expose secrets, suppress critical findings, or cause unsafe output

Do not include real credentials, tokens, private manifests, or customer data.

## Boundaries

`toolhutch` should not perform hidden network calls during scan, explain, or policy commands. If you observe unexpected network access, treat it as a security bug.

`toolhutch` flags secret-related capability surfaces by names and descriptions. It should not print secret values intentionally.

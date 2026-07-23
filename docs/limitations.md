# Limitations

`toolhutch` uses transparent heuristics. That makes reports easy to inspect, but it also means findings can be incomplete.

Known limits:

- YAML input is parsed with the maintained `yaml` package in strict YAML 1.2 mode. Duplicate mapping keys are rejected, and alias expansion is capped to avoid excessive resource use. The parser is a local, pure-JavaScript dependency with no transitive packages; parsing does not fetch schemas or other network resources.
- Capability detection is name/description/path based and can miss unusual naming.
- Secret findings identify secret surfaces, not secret values.
- Reports do not enforce runtime permissions.
- Network safety means default commands do not fetch remote schemas or enrich findings online.

When in doubt, treat `toolhutch` output as a starting review pack and inspect the underlying tool server manually.

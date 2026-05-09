# Limitations

`toolhutch` uses transparent heuristics. That makes reports easy to inspect, but it also means findings can be incomplete.

Known limits:

- The YAML parser supports common manifest-shaped YAML, not the entire YAML 1.2 specification.
- Capability detection is name/description/path based and can miss unusual naming.
- Secret findings identify secret surfaces, not secret values.
- Reports do not enforce runtime permissions.
- Network safety means default commands do not fetch remote schemas or enrich findings online.

When in doubt, treat `toolhutch` output as a starting review pack and inspect the underlying tool server manually.

# OminiLab Progress

Static status site for the four OminiLab systems:

1. Base scene construction & inspection
2. Automatic scene construction
3. Papers → protocols → orchestrated tasks
4. Orchestrated execution in a complete lab

Plus a **Debug window** tab that embeds the live Isaac Sim stream from a local SSH tunnel
(`127.0.0.1` only — no public control port), and a milestone timeline.

All content lives in `data/status.json` (`data/status.js` is generated from it).
Published content is sanitised: no hosts, IPs, paths, ids or credentials.

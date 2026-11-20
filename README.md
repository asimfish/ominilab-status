# OminiLab Progress

Static status site for OminiLab: from real papers to policies evaluated on whole experiments.

- **`agents.html` — Project map.** The three steps, every stage in them, which agent works on it, how the stages feed
  each other, and each stage's progress. Start here.
- **`index.html` — Step pages.** Detailed progress per step, with stage cards, every scene / plan / task as a list,
  snapshots, and the live Isaac Sim view (via your own SSH tunnel to `127.0.0.1`). Links look like
  `index.html#base/legacy_l0` (`#<group>/<item>`), `index.html#step2`, or `index.html#summary`.

| Step | Stages | Detail groups |
|---|---|---|
| 1 · Scenes | Auto scene builder · Base scenes · Multi-lab building | `base`, `auto` |
| 2 · Papers → plans → tasks | Paper → synthesis plan · Instruments → scene · Orchestrated tasks · Scripted task run | `papers`, `lab` |
| 3 · Manipulation | Object annotation · Grasp sampling & stabilising · Atomic tasks in carved scenes · Full-lab evaluation | `annot`, `grasp`, `atomic`, `eval` |

## Updating

All content lives in `data/status.json`; `data/status.js` is generated from it by the build check, which refuses to
build if hosts, IPs, paths, job ids, conversation ids or credentials appear.

- **Items** (`groups[].items[]`): `id`, `title`, `tag`, `live`, `status`, `line`, `details`, optional `img`, `scene`,
  and optional `metrics` — a list of `{"label", "value", "total"?}`; numbers with a `total` draw a progress bar.
- **Pipeline** (`pipeline`): `steps` (which groups belong to which step), `stages` (one card each: `status`,
  `agent`, `agent_state` = running / idle / stalled, `progress`, `metrics`, `next`, grid `col`/`row`, and the
  `group`/`item` it links to), `links` between stages (`route` = down / right / gutter / top / bottom / back,
  `kind` = flow / feed / broken), the top `flow` strip, `mentors` and `decisions`.
- **Status values:** `pass`, `partial`, `running`, `blocked`, `fail`, `pending`.

When a stage reaches a milestone, update its card's numbers and `next` in `pipeline.stages`, and bump
`pipeline.updated`. Run `git pull --rebase` before every push: several sessions publish here.

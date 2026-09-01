---
name: design-sync
description: Sync the hoobi-design catalog to the "Hoobi Design" Claude Design project (claude.ai/design) via the DesignSync tool. Run after a library release (npm version + tag push), or when asked to "sync the design system", "update Claude Design", or "push the catalog to claude.ai". Diffs by hash manifest, so re-running is a no-op.
---

# design-sync

Push the static design-system bundle to the Claude Design project so Claude generates
Hoobi-shaped UI from the real components, rules and tokens.

- **Project:** "Hoobi Design", projectId `<project-id>`.
- **When:** after a release (`npm version` + `git push --follow-tags`), once the publish
  pipeline is green. The design system shows what consumers can `npm install`, so never
  sync unreleased `main` unless explicitly asked to preview.
- **Auth:** DesignSync needs an interactive claude.ai login (`/design-login`). If it errors
  on auth, ask the user to run that — it cannot happen headless, which is why this is a
  skill and not a pipeline step.

## Procedure

1. Build the bundle (library dist first — the catalog consumes `../` via `file:`):

   ```bash
   npm run build && cd catalog && npm run build:ds
   ```

   Output: `catalog/design-system/` — one standalone HTML card per page from
   `catalog/src/pages.tsx`, plus `tokens.json` and `_hashes.json`.

2. Diff against the remote:
   - `DesignSync get_file` on `_hashes.json` (the one small file; cards are ~400KB and
     `get_file` caps at 256KiB, so never try to read a card back).
   - Compare with the local `_hashes.json`: changed/new paths → writes, remote paths
     absent locally → deletes. If nothing differs, say so and stop.
   - If the remote has no `_hashes.json` (fresh project), everything is a write.

3. `finalize_plan` with exactly those writes and deletes,
   `localDir: <repo>/catalog/design-system`, then `write_files` (use `localPath` for
   every file) and `delete_files`. No `register_assets` — the `@dsCard` comment on each
   card's first line is the registration.

## Notes

- Every card is stamped with the library version, so a version bump changes every hash
  and a release syncs all ~34 files (~13MB). Expected and fine — the diff only saves
  work when re-running or iterating.
- A page removed from `pages.tsx` must end up in `deletes` — the hash diff catches this;
  do not skip the delete or the stale card lingers in the pane.
- Never wholesale-replace the project by deleting everything first; the plan is always
  the minimal diff.

## Auth recovery (when write_files refuses)

The design authorization is per-session-ish state: a crashed or headless session loses it, and
the failure mode is asymmetric - `list_files`/`get_file`/`finalize_plan` may still WORK while
`write_files` errors with "DesignSync needs design-system authorization". `/design-consent` can
also 403 when the claude.ai login itself is stale.

- The fix is `/design-login`, and it ONLY runs in an interactive Claude Code session - not in
  print mode, not via a driven TUI (there is no CLI subcommand for it either).
- It must run under the account that owns the design projects: **user@example.com**, i.e. with
  `CLAUDE_CONFIG_DIR=C:\Users\<user>\.claude-personal`. The work config's login
  cannot see these projects; a 403 from /design-consent is usually this.
- Hoobi runs it themselves in their own terminal. Do NOT try to type into their windows with
  SendKeys - it lands in whatever has focus (it has typed into their browser).
- After the login, the sync itself needs no re-run of anything else: re-issue finalize_plan +
  write_files and the hash diff carries on where it stopped.
